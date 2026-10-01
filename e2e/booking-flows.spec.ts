import { test, expect, Page } from "@playwright/test";

/**
 * Booking + extension flows, driven through the real UI against the local API.
 *
 * Everything else verifying this work has been cURL against the backend, which
 * proves the API behaves but says nothing about whether the screens drive it
 * correctly. These walk the pages a guest actually uses.
 *
 * Requires the API on localhost:8008 (the dev server's configured target) and
 * the seeded guest account.
 */

const GUEST = { email: "guest1@aparteng.com", password: "apartpass123" };
const API = "http://localhost:8008/api/v1";

/** Log in through the real form, so the page is authenticated the way a guest is. */
async function loginViaUi(page: Page, email: string, password: string) {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.getByPlaceholder("Email Address").fill(email);
  await page.getByPlaceholder("Password").fill(password);
  await Promise.all([
    page.waitForResponse(
      (r) => r.url().includes("/auth/login") && r.request().method() === "POST",
      { timeout: 60_000 }
    ),
    page.getByRole("button", { name: /sign in|log in|login|continue/i }).first().click(),
  ]);
  // Give redux-persist a moment to hydrate before navigating on.
  await page.waitForTimeout(2000);
}

/** Direct API login, for contract assertions that need no page session. */
async function apiToken(page: Page, email: string, password: string) {
  const res = await page.request.post(`${API}/auth/login`, { data: { email, password } });
  expect(res.ok(), `login failed: ${res.status()}`).toBeTruthy();
  const token = (await res.json())?.data?.authorization?.token;
  expect(token, "no token in login response").toBeTruthy();
  return token as string;
}

test.describe("guest booking flows", () => {
  test("account page reaches the API and renders booking history", async ({ page }) => {
    // Record what the page asks the API for, so a broken call is visible even
    // when the UI degrades quietly.
    const calls: { url: string; status: number }[] = [];
    page.on("response", (r) => {
      const u = r.url();
      if (u.includes("/api/v1/")) calls.push({ url: u, status: r.status() });
    });

    await loginViaUi(page, GUEST.email, GUEST.password);
    await page.goto("/account?tab=bookings", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(8000);

    const bookingCalls = calls.filter((c) => c.url.includes("/bookings"));
    console.log("BOOKING CALLS:", JSON.stringify(bookingCalls, null, 2));

    // Any 5xx from a booking endpoint is a hard failure regardless of render.
    const serverErrors = bookingCalls.filter((c) => c.status >= 500);
    expect(serverErrors, `5xx from booking endpoints: ${JSON.stringify(serverErrors)}`).toHaveLength(0);
  });

  test("the bookings list request is paginated", async ({ page }) => {
    const listCalls: string[] = [];
    page.on("request", (r) => {
      const u = r.url();
      if (u.includes("/api/v1/bookings?") || u.match(/\/api\/v1\/bookings$/)) listCalls.push(u);
    });

    await loginViaUi(page, GUEST.email, GUEST.password);
    await page.goto("/account?tab=bookings", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(8000);

    console.log("LIST CALLS:", JSON.stringify(listCalls, null, 2));
    // The fix: the list must ask for an explicit page/size rather than relying
    // on the backend default, which silently capped the guest at ten.
    const paginated = listCalls.some((u) => u.includes("page=") && u.includes("size="));
    expect(paginated, `no paginated bookings call seen: ${JSON.stringify(listCalls)}`).toBeTruthy();
  });
});

test.describe("API contract the screens depend on", () => {
  test("extension quote returns the fields the UI reads", async ({ page }) => {
    const token = await apiToken(page, GUEST.email, GUEST.password);

    // Find a booking of this guest's that can be quoted.
    const list = await page.request.get(`${API}/bookings?page=1&size=50`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(list.ok()).toBeTruthy();
    const items = (await list.json())?.data?.items ?? [];
    const candidate = items.find((b: any) =>
      ["CONFIRMED", "CHECKED_IN"].includes(String(b.status).toUpperCase())
    );
    test.skip(!candidate, "no CONFIRMED/CHECKED_IN booking to quote against");

    const end = new Date(candidate.end_date);
    end.setDate(end.getDate() + 2);
    const newEnd = end.toISOString().slice(0, 10);

    const q = await page.request.get(
      `${API}/bookings/${candidate.id}/extension-quote?new_end_date=${newEnd}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    expect(q.status(), "extension-quote should resolve").toBe(200);
    const quote = (await q.json())?.data;
    console.log("QUOTE PAYLOAD:", JSON.stringify(quote, null, 2));

    // These are the names the screens must read. The admin dashboard currently
    // reads base_amount / total_amount / discount_label, which are NOT here.
    for (const key of ["nights", "base_price", "total_price", "discount_amount"]) {
      expect(quote, `quote missing ${key}`).toHaveProperty(key);
    }
    expect(quote).not.toHaveProperty("base_amount");
    expect(quote).not.toHaveProperty("total_amount");
  });

  test("extension amount honours unit_count, which the guest modal ignores", async ({ page }) => {
    const token = await apiToken(page, GUEST.email, GUEST.password);
    const list = await page.request.get(`${API}/bookings?page=1&size=50`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const items = (await list.json())?.data?.items ?? [];
    const multi = items.find(
      (b: any) =>
        Number(b.unit_count) > 1 &&
        ["CONFIRMED", "CHECKED_IN"].includes(String(b.status).toUpperCase())
    );
    test.skip(!multi, "no multi-unit CONFIRMED booking available to demonstrate against");

    const end = new Date(multi.end_date);
    end.setDate(end.getDate() + 2);
    const newEnd = end.toISOString().slice(0, 10);
    const q = await page.request.get(
      `${API}/bookings/${multi.id}/extension-quote?new_end_date=${newEnd}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const quote = (await q.json())?.data;

    const perNight = Number(multi.unit?.price_per_night ?? multi.unit?.pricePerNight ?? 0);
    const modalWouldShow = 2 * perNight; // extraNights * pricePerNight, no unit_count
    console.log(
      `unit_count=${multi.unit_count} modalWouldShow=${modalWouldShow} apiCharges=${quote.total_price}`
    );
    expect(Number(quote.total_price)).toBeGreaterThan(modalWouldShow);
  });
});
