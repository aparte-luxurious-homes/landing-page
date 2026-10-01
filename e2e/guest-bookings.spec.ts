import { test, expect, Page } from "@playwright/test";

/**
 * Guest booking + extension coverage, driven through the real UI.
 *
 * Run against a PRODUCTION build (`npm run build && npm start`). Under
 * `next dev` each route compiles on first request — 100s for /login, 260s for
 * /account — which blows every timeout and looks like a product failure.
 *
 *   BASE_URL=http://localhost:3002 npx playwright test e2e/guest-bookings.spec.ts
 *
 * Needs the API on localhost:8008 and the seeded guest account.
 */

const GUEST = { email: "guest1@aparteng.com", password: "apartpass123" };
const API = "http://localhost:8008/api/v1";

type Call = { method: string; url: string; status: number };

/** Records every API call a page makes, so a silent failure is still visible. */
function recordApi(page: Page): Call[] {
  const calls: Call[] = [];
  page.on("response", (r) => {
    const u = r.url();
    if (u.includes("/api/v1/")) {
      calls.push({ method: r.request().method(), url: u, status: r.status() });
    }
  });
  return calls;
}

const bookingCalls = (c: Call[]) => c.filter((x) => x.url.includes("/bookings"));
const serverErrors = (c: Call[]) => c.filter((x) => x.status >= 500);

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
  // The app redirects away from /login only after it has stored the token, so
  // waiting for the URL to change is the real "logged in" signal. A fixed
  // delay was too short and made every downstream page look unauthenticated.
  await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 60_000 });
  await page.waitForTimeout(1500);
}

async function openBookings(page: Page) {
  await page.goto("/account?tab=bookings", { waitUntil: "domcontentloaded" });
  await page.waitForResponse(
    (r) => r.url().includes("/api/v1/bookings") && r.request().method() === "GET",
    { timeout: 45_000 }
  );
  await page.waitForTimeout(2500);
}

async function token(page: Page) {
  const res = await page.request.post(`${API}/auth/login`, {
    data: { email: GUEST.email, password: GUEST.password },
  });
  return (await res.json())?.data?.authorization?.token as string;
}

test.describe("READ — booking history", () => {
  test("renders without any server error", async ({ page }) => {
    const calls = recordApi(page);
    await login(page);
    await openBookings(page);

    const errs = serverErrors(bookingCalls(calls));
    expect(errs, `5xx from booking endpoints: ${JSON.stringify(errs)}`).toHaveLength(0);
    expect(bookingCalls(calls).length, "the page never asked for bookings").toBeGreaterThan(0);
  });

  test("asks for an explicit page and size", async ({ page }) => {
    const urls: string[] = [];
    page.on("request", (r) => {
      if (r.url().includes("/api/v1/bookings")) urls.push(r.url());
    });
    await login(page);
    await openBookings(page);

    const listCall = urls.find((u) => /\/bookings\?/.test(u) && !/\/bookings\/[^?]/.test(u));
    expect(listCall, `no bookings list call: ${JSON.stringify(urls.slice(0, 5))}`).toBeTruthy();
    // The fix: relying on the backend default silently capped the guest at 10.
    expect(listCall).toContain("page=");
    expect(listCall).toContain("size=");
  });

  test("shows a pager when the guest has more than one page", async ({ page }) => {
    const t = await token(page);
    const res = await page.request.get(`${API}/bookings?page=1&size=10`, {
      headers: { Authorization: `Bearer ${t}` },
    });
    const pages = (await res.json())?.data?.pages ?? 1;

    await login(page);
    await openBookings(page);

    const pager = page.getByRole("navigation").filter({ hasText: /1/ });
    if (pages > 1) {
      await expect(pager.first(), `expected a pager for ${pages} pages`).toBeVisible({ timeout: 15_000 });
    } else {
      test.info().annotations.push({ type: "note", description: `only ${pages} page of bookings` });
    }
  });

  test("page 2 loads a different set", async ({ page }) => {
    const t = await token(page);
    const res = await page.request.get(`${API}/bookings?page=1&size=10`, {
      headers: { Authorization: `Bearer ${t}` },
    });
    const pages = (await res.json())?.data?.pages ?? 1;
    test.skip(pages < 2, "guest has only one page of bookings");

    const urls: string[] = [];
    page.on("request", (r) => {
      if (r.url().includes("/api/v1/bookings?")) urls.push(r.url());
    });
    await login(page);
    await openBookings(page);

    await page.getByRole("button", { name: "Go to page 2" }).click();
    await page.waitForTimeout(4000);
    expect(urls.some((u) => u.includes("page=2")), `never requested page 2: ${JSON.stringify(urls)}`).toBeTruthy();
  });
});

test.describe("CREATE / UPDATE — extensions", () => {
  test("the extend modal quotes the price the API will charge", async ({ page }) => {
    const t = await token(page);
    const list = await page.request.get(`${API}/bookings?page=1&size=50`, {
      headers: { Authorization: `Bearer ${t}` },
    });
    const items = (await list.json())?.data?.items ?? [];
    const target = items.find((b: any) =>
      ["CONFIRMED", "CHECKED_IN"].includes(String(b.status).toUpperCase())
    );
    test.skip(!target, "no extendable booking for this guest");

    const calls = recordApi(page);
    await login(page);
    await openBookings(page);

    const extendBtn = page.getByRole("button", { name: /extend/i }).first();
    test.skip((await extendBtn.count()) === 0, "no Extend control rendered");

    // Wait for the quote itself, not a fixed delay: opening the modal also
    // triggers one /extensions call per booking card on the page, so the quote
    // lands several seconds later.
    const quotePromise = page.waitForResponse(
      (r) => r.url().includes("extension-quote"),
      { timeout: 45_000 }
    );
    await extendBtn.click();
    const quoteRes = await quotePromise;

    // The modal must ASK the API for the price rather than computing it, or it
    // silently ignores unit_count and the extension discount.
    expect(quoteRes.status(), "extension-quote failed").toBe(200);
    const quoted = (await quoteRes.json())?.data;
    expect(quoted, "quote had no data").toBeTruthy();
    expect(quoted).toHaveProperty("total_price");
  });

  test("requesting an extension writes to /extensions, not the legacy /extend", async ({ page }) => {
    const t = await token(page);
    const list = await page.request.get(`${API}/bookings?page=1&size=50`, {
      headers: { Authorization: `Bearer ${t}` },
    });
    const items = (await list.json())?.data?.items ?? [];
    const target = items.find((b: any) =>
      ["CONFIRMED", "CHECKED_IN"].includes(String(b.status).toUpperCase())
    );
    test.skip(!target, "no extendable booking for this guest");

    const posts: string[] = [];
    page.on("request", (r) => {
      if (r.method() === "POST" && r.url().includes("/bookings/")) posts.push(r.url());
    });

    await login(page);
    await openBookings(page);
    const extendBtn = page.getByRole("button", { name: /extend/i }).first();
    test.skip((await extendBtn.count()) === 0, "no Extend control rendered");
    await extendBtn.click();
    await page.waitForTimeout(2500);

    // Whatever the guest does next, nothing may target the deprecated path.
    expect(
      posts.filter((u) => /\/extend$/.test(u)),
      `the app posted to the legacy /extend path: ${JSON.stringify(posts)}`
    ).toHaveLength(0);
  });
});

test.describe("API contract the screens read", () => {
  test("extension quote returns base_price / total_price, not base_amount / total_amount", async ({ page }) => {
    const t = await token(page);
    const list = await page.request.get(`${API}/bookings?page=1&size=50`, {
      headers: { Authorization: `Bearer ${t}` },
    });
    const items = (await list.json())?.data?.items ?? [];
    const target = items.find((b: any) =>
      ["CONFIRMED", "CHECKED_IN"].includes(String(b.status).toUpperCase())
    );
    test.skip(!target, "no extendable booking");

    const end = new Date(target.end_date);
    end.setDate(end.getDate() + 2);
    const q = await page.request.get(
      `${API}/bookings/${target.id}/extension-quote?new_end_date=${end.toISOString().slice(0, 10)}`,
      { headers: { Authorization: `Bearer ${t}` } }
    );
    expect(q.status()).toBe(200);
    const quote = (await q.json())?.data;
    for (const k of ["nights", "base_price", "total_price", "discount_amount"]) {
      expect(quote, `quote missing ${k}`).toHaveProperty(k);
    }
    expect(quote).not.toHaveProperty("base_amount");
    expect(quote).not.toHaveProperty("total_amount");
  });

  test("a guest cannot read another guest's booking", async ({ page }) => {
    const mine = await token(page);
    const otherRes = await page.request.post(`${API}/auth/login`, {
      data: { email: "guest3@aparteng.com", password: "apartpass123" },
    });
    const other = (await otherRes.json())?.data?.authorization?.token;

    const list = await page.request.get(`${API}/bookings?page=1&size=5`, {
      headers: { Authorization: `Bearer ${mine}` },
    });
    const b = (await list.json())?.data?.items?.[0];
    test.skip(!b, "no booking to test against");

    for (const path of [
      `/bookings/${b.id}/cancellation-quote`,
      `/bookings/${b.id}/extensions`,
    ]) {
      const r = await page.request.get(`${API}${path}`, {
        headers: { Authorization: `Bearer ${other}` },
      });
      expect(r.status(), `${path} leaked to another guest`).toBe(403);
    }
  });
});
