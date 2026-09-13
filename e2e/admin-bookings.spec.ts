import { test, expect, Page } from "@playwright/test";

/**
 * Admin / owner booking + extension coverage.
 *
 * Lives in the landing page's e2e folder purely because that is where
 * Playwright is installed — nothing is added to the admin repo. Point it at a
 * PRODUCTION build of the dashboard:
 *
 *   ADMIN_URL=http://localhost:3003 npx playwright test e2e/admin-bookings.spec.ts
 *
 * Needs the API on localhost:8008 and the seeded admin account.
 */

const ADMIN = { email: "admin@aparteng.com", password: "apartpass123" };
const API = "http://localhost:8008/api/v1";
const ADMIN_URL = process.env.ADMIN_URL ?? "http://localhost:3003";

type Call = { method: string; url: string; status: number };

function recordApi(page: Page): Call[] {
  const calls: Call[] = [];
  page.on("response", (r) => {
    if (r.url().includes("/api/v1/")) {
      calls.push({ method: r.request().method(), url: r.url(), status: r.status() });
    }
  });
  return calls;
}

async function apiToken(page: Page) {
  const res = await page.request.post(`${API}/auth/login`, {
    data: { email: ADMIN.email, password: ADMIN.password },
  });
  expect(res.ok(), `admin login failed: ${res.status()}`).toBeTruthy();
  return (await res.json())?.data?.authorization?.token as string;
}

/** The dashboard reads its JWT from a cookie, not Redux. */
async function loginAdmin(page: Page) {
  const token = await apiToken(page);
  await page.context().addCookies([
    { name: "token", value: token, url: ADMIN_URL },
  ]);
  return token;
}

test.describe("admin — bookings list", () => {
  test("loads with no server error and asks for a page", async ({ page }) => {
    const calls = recordApi(page);
    await loginAdmin(page);
    await page.goto(`${ADMIN_URL}/booking-management/bookings`, { waitUntil: "domcontentloaded" });
    await page.waitForResponse((r) => r.url().includes("/api/v1/bookings"), { timeout: 60_000 });
    await page.waitForTimeout(3000);

    const booking = calls.filter((c) => c.url.includes("/bookings"));
    expect(booking.length, "never requested bookings").toBeGreaterThan(0);
    const errs = booking.filter((c) => c.status >= 500);
    expect(errs, `5xx: ${JSON.stringify(errs)}`).toHaveLength(0);

    const list = booking.find((c) => /\/bookings\?/.test(c.url));
    expect(list?.url, "list call missing paging").toContain("page=");
  });

  test("search issues a filtered request", async ({ page }) => {
    const urls: string[] = [];
    page.on("request", (r) => {
      if (r.url().includes("/api/v1/bookings?")) urls.push(r.url());
    });
    await loginAdmin(page);
    await page.goto(`${ADMIN_URL}/booking-management/bookings`, { waitUntil: "domcontentloaded" });
    await page.waitForResponse((r) => r.url().includes("/api/v1/bookings"), { timeout: 60_000 });

    const box = page.getByPlaceholder(/search/i).first();
    test.skip((await box.count()) === 0, "no search box on this screen");
    await box.fill("APRT");
    await page.waitForTimeout(4000);

    expect(
      urls.some((u) => u.includes("search=")),
      `search never reached the API: ${JSON.stringify(urls.slice(-3))}`
    ).toBeTruthy();
  });
});

test.describe("admin — extensions panel", () => {
  test("the price quote renders real figures, not NaN", async ({ page }) => {
    const token = await apiToken(page);
    const res = await page.request.get(`${API}/bookings?page=1&size=50`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const items = (await res.json())?.data?.items ?? [];
    const target = items.find((b: any) =>
      ["CONFIRMED", "CHECKED_IN"].includes(String(b.status).toUpperCase())
    );
    test.skip(!target, "no extendable booking");

    await loginAdmin(page);
    await page.goto(`${ADMIN_URL}/booking-management/bookings/${target.id}`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForTimeout(6000);

    const body = await page.locator("body").innerText();
    // The panel read base_amount / total_amount, which the API does not return,
    // so both figures rendered as ₦NaN once the endpoint was reachable.
    expect(body, "a money field rendered as NaN").not.toContain("NaN");
  });

  test("extension quote endpoint resolves for an admin", async ({ page }) => {
    const token = await apiToken(page);
    const res = await page.request.get(`${API}/bookings?page=1&size=50`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const items = (await res.json())?.data?.items ?? [];
    const target = items.find((b: any) =>
      ["CONFIRMED", "CHECKED_IN"].includes(String(b.status).toUpperCase())
    );
    test.skip(!target, "no extendable booking");

    const end = new Date(target.end_date);
    end.setDate(end.getDate() + 2);
    const q = await page.request.get(
      `${API}/bookings/${target.id}/extension-quote?new_end_date=${end.toISOString().slice(0, 10)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    // The dashboard pointed this at /extensions/quote, which does not exist.
    expect(q.status(), "extension-quote should resolve for staff").toBe(200);
    const quote = (await q.json())?.data;
    expect(quote).toHaveProperty("base_price");
    expect(quote).toHaveProperty("total_price");
  });

  test("legacy extensions are flagged so the UI can withhold actions", async ({ page }) => {
    const token = await apiToken(page);
    const all = await page.request.get(`${API}/bookings/extensions/all?size=100`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(all.status()).toBe(200);
    const items = (await all.json())?.data?.items ?? [];
    test.skip(items.length === 0, "no extensions on the platform");

    // Every row must carry the flag, so a client can decide whether the
    // lifecycle endpoints apply to it.
    for (const it of items.slice(0, 20)) {
      expect(it, "extension row missing is_legacy").toHaveProperty("is_legacy");
    }
    const legacy = items.filter((i: any) => i.is_legacy);
    test.info().annotations.push({
      type: "note",
      description: `${legacy.length} of ${items.length} extensions are legacy child bookings`,
    });
  });
});

test.describe("admin — booking lifecycle authorisation", () => {
  test("a guest cannot drive admin-only booking actions", async ({ page }) => {
    const guestRes = await page.request.post(`${API}/auth/login`, {
      data: { email: "guest1@aparteng.com", password: "apartpass123" },
    });
    const guest = (await guestRes.json())?.data?.authorization?.token;
    const adminTok = await apiToken(page);

    const res = await page.request.get(`${API}/bookings?page=1&size=5`, {
      headers: { Authorization: `Bearer ${adminTok}` },
    });
    const b = (await res.json())?.data?.items?.[0];
    test.skip(!b, "no booking available");

    for (const path of [
      `/bookings/${b.id}/approve-cancellation`,
      `/bookings/${b.id}/refund-caution`,
    ]) {
      const r = await page.request.post(`${API}${path}`, {
        headers: { Authorization: `Bearer ${guest}` },
        data: { should_refund: false },
      });
      expect(r.status(), `${path} was reachable by a guest`).toBeGreaterThanOrEqual(400);
    }
  });
});

test.describe("admin — stay extensions queue", () => {
  test("the queue renders and shows no NaN money", async ({ page }) => {
    const calls = recordApi(page);
    await loginAdmin(page);
    await page.goto(`${ADMIN_URL}/booking-management/stay-extensions`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(8000);

    const errs = calls.filter((c) => c.status >= 500);
    expect(errs, `5xx on the extensions queue: ${JSON.stringify(errs)}`).toHaveLength(0);

    const body = await page.locator("body").innerText();
    expect(body, "a money field rendered as NaN").not.toContain("NaN");
  });
});
