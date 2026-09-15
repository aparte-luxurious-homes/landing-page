import { test, expect, Page } from "@playwright/test";

/**
 * The guest's extension lifecycle beyond the quote: actually submitting a
 * request, seeing it listed, and cancelling it.
 *
 * This is the flow the unification changed — the app used to write to /extend
 * and read from /extensions, so a request vanished the moment it was made.
 *
 *   BASE_URL=http://localhost:3002 npx playwright test e2e/guest-extension-lifecycle.spec.ts
 */

const GUEST = { email: "guest1@aparteng.com", password: "apartpass123" };
const API = "http://localhost:8008/api/v1";

async function apiToken(page: Page) {
  const res = await page.request.post(`${API}/auth/login`, {
    data: { email: GUEST.email, password: GUEST.password },
  });
  expect(res.ok()).toBeTruthy();
  return (await res.json())?.data?.authorization?.token as string;
}

async function login(page: Page) {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.getByRole("textbox", { name: "Email Address" }).fill(GUEST.email);
  await page.getByRole("textbox", { name: "Password" }).fill(GUEST.password);
  await Promise.all([
    page.waitForResponse(
      (r) => r.url().includes("/auth/login") && r.request().method() === "POST",
      { timeout: 60_000 }
    ),
    page.getByRole("button", { name: "Login", exact: true }).first().click(),
  ]);
  await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 60_000 });
  await page.waitForTimeout(1500);
}

/** A booking of this guest's that can currently be extended. */
async function extendable(page: Page, token: string) {
  const res = await page.request.get(`${API}/bookings?page=1&size=50`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const items = (await res.json())?.data?.items ?? [];
  return items.find((b: any) =>
    ["CONFIRMED", "CHECKED_IN"].includes(String(b.status).toUpperCase())
  );
}

/** Clear any in-flight extension so the duplicate guard does not mask a result. */
async function clearActive(page: Page, token: string, bookingId: string) {
  const res = await page.request.get(`${API}/bookings/${bookingId}/extensions`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const items = (await res.json())?.data?.items ?? [];
  for (const e of items) {
    if (e.is_legacy) continue;
    if (["PENDING_PAYMENT", "AWAITING_OWNER_APPROVAL", "APPROVED"].includes(String(e.status))) {
      await page.request.post(
        `${API}/bookings/${bookingId}/extensions/${e.extension_id}/cancel`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }
  }
}

test.describe("guest — extension lifecycle", () => {
  test("a submitted extension is stored where the app reads it", async ({ page }) => {
    const token = await apiToken(page);
    const b = await extendable(page, token);
    test.skip(!b, "no extendable booking");
    await clearActive(page, token, b.id);

    const newEnd = new Date(b.end_date);
    newEnd.setDate(newEnd.getDate() + 2);
    const iso = newEnd.toISOString().slice(0, 10);

    const created = await page.request.post(`${API}/bookings/${b.id}/extensions`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { new_end_date: iso, payment_method: "online" },
    });
    expect(created.status(), `extension request refused: ${await created.text()}`).toBe(201);
    const extId = (await created.json())?.data?.extension_id;
    expect(extId).toBeTruthy();

    // The whole point of the unification: what was written must be readable
    // from the endpoint the guest app lists from.
    const list = await page.request.get(`${API}/bookings/${b.id}/extensions`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const items = (await list.json())?.data?.items ?? [];
    expect(
      items.some((e: any) => e.extension_id === extId),
      "the extension just created is not in the guest's own list"
    ).toBeTruthy();

    // And it must be cancellable by the guest who made it.
    const cancelled = await page.request.post(
      `${API}/bookings/${b.id}/extensions/${extId}/cancel`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    expect(cancelled.status(), "the guest could not cancel their own request").toBeLessThan(400);
  });

  test("the pending extension is visible in the account UI", async ({ page }) => {
    const token = await apiToken(page);
    const b = await extendable(page, token);
    test.skip(!b, "no extendable booking");
    await clearActive(page, token, b.id);

    const newEnd = new Date(b.end_date);
    newEnd.setDate(newEnd.getDate() + 2);
    const created = await page.request.post(`${API}/bookings/${b.id}/extensions`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { new_end_date: newEnd.toISOString().slice(0, 10), payment_method: "online" },
    });
    test.skip(created.status() !== 201, `could not create extension: ${created.status()}`);
    const extId = (await created.json())?.data?.extension_id;

    await login(page);
    await page.goto("/account?tab=bookings", { waitUntil: "domcontentloaded" });
    await page.waitForResponse(
      (r) => r.url().includes("/api/v1/bookings") && r.request().method() === "GET",
      { timeout: 45_000 }
    );
    await page.waitForTimeout(6000);

    const body = await page.locator("body").innerText();
    // The card shows an extension banner once one is in flight.
    expect(
      /extension/i.test(body),
      "no extension state surfaced on the bookings screen"
    ).toBeTruthy();

    await page.request.post(`${API}/bookings/${b.id}/extensions/${extId}/cancel`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  });

  test("a second concurrent extension is refused, not silently swallowed", async ({ page }) => {
    const token = await apiToken(page);
    const b = await extendable(page, token);
    test.skip(!b, "no extendable booking");
    await clearActive(page, token, b.id);

    const newEnd = new Date(b.end_date);
    newEnd.setDate(newEnd.getDate() + 2);
    const iso = newEnd.toISOString().slice(0, 10);

    const first = await page.request.post(`${API}/bookings/${b.id}/extensions`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { new_end_date: iso, payment_method: "online" },
    });
    test.skip(first.status() !== 201, "first request did not succeed");
    const extId = (await first.json())?.data?.extension_id;

    const second = await page.request.post(`${API}/bookings/${b.id}/extensions`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { new_end_date: iso, payment_method: "online" },
    });
    expect(second.status(), "a duplicate extension was accepted").toBe(409);

    await page.request.post(`${API}/bookings/${b.id}/extensions/${extId}/cancel`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  });

  test("an extension beyond the cap is refused quickly", async ({ page }) => {
    const token = await apiToken(page);
    const b = await extendable(page, token);
    test.skip(!b, "no extendable booking");
    await clearActive(page, token, b.id);

    const started = Date.now();
    const res = await page.request.post(`${API}/bookings/${b.id}/extensions`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { new_end_date: "3061-01-01", payment_method: "online" },
    });
    const elapsed = Date.now() - started;
    expect(res.status(), "a 1000-year extension was accepted").toBeGreaterThanOrEqual(400);
    // Unbounded date walking used to hold a worker for ~40s.
    expect(elapsed, `refusal took ${elapsed}ms`).toBeLessThan(15_000);
  });
});
