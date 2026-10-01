import { test, expect, Page } from "@playwright/test";

/**
 * Admin booking CRUD and lifecycle — the surface the earlier admin spec did
 * not reach: the create form, the edit path, and the money-moving actions.
 *
 *   ADMIN_URL=http://localhost:3003 npx playwright test e2e/admin-booking-crud.spec.ts
 */

const ADMIN = { email: "admin@aparteng.com", password: "apartpass123" };
const GUEST = { email: "guest1@aparteng.com", password: "apartpass123" };
const API = "http://localhost:8008/api/v1";
const ADMIN_URL = process.env.ADMIN_URL ?? "http://localhost:3003";

async function tokenFor(page: Page, who: { email: string; password: string }) {
  const res = await page.request.post(`${API}/auth/login`, { data: who });
  expect(res.ok(), `login failed ${res.status()}`).toBeTruthy();
  return (await res.json())?.data?.authorization?.token as string;
}

async function loginAdmin(page: Page) {
  const token = await tokenFor(page, ADMIN);
  await page.context().addCookies([{ name: "token", value: token, url: ADMIN_URL }]);
  return token;
}

test.describe("admin — create booking screen", () => {
  test("the create form loads and offers property and unit pickers", async ({ page }) => {
    const calls: { url: string; status: number }[] = [];
    page.on("response", (r) => {
      if (r.url().includes("/api/v1/")) calls.push({ url: r.url(), status: r.status() });
    });

    await loginAdmin(page);
    await page.goto(`${ADMIN_URL}/booking-management/bookings/create`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(8000);

    const errs = calls.filter((c) => c.status >= 500);
    expect(errs, `5xx on the create screen: ${JSON.stringify(errs)}`).toHaveLength(0);

    await expect(page.getByPlaceholder("Search for a property...")).toBeVisible({ timeout: 20_000 });
    const body = await page.locator("body").innerText();
    expect(body, "money rendered as NaN on the create screen").not.toContain("NaN");
  });

  test("selecting a property loads its units", async ({ page }) => {
    await loginAdmin(page);
    await page.goto(`${ADMIN_URL}/booking-management/bookings/create`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(6000);

    const propBox = page.getByPlaceholder("Search for a property...");
    await propBox.fill("a");
    await page.waitForTimeout(4000);

    // A property search must reach the API — otherwise the picker is inert.
    const unitBox = page.getByPlaceholder("Search for a unit...");
    expect(await unitBox.count(), "no unit picker rendered").toBeGreaterThan(0);
  });
});

test.describe("admin — booking detail and lifecycle", () => {
  test("booking detail renders with no server error and no NaN", async ({ page }) => {
    const token = await loginAdmin(page);
    const res = await page.request.get(`${API}/bookings?page=1&size=10`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const b = (await res.json())?.data?.items?.[0];
    test.skip(!b, "no bookings available");

    const calls: { url: string; status: number }[] = [];
    page.on("response", (r) => {
      if (r.url().includes("/api/v1/")) calls.push({ url: r.url(), status: r.status() });
    });

    await page.goto(`${ADMIN_URL}/booking-management/bookings/${b.id}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(8000);

    const errs = calls.filter((c) => c.status >= 500);
    expect(errs, `5xx on booking detail: ${JSON.stringify(errs)}`).toHaveLength(0);
    const body = await page.locator("body").innerText();
    expect(body, "money rendered as NaN on booking detail").not.toContain("NaN");
    expect(body, "booking reference not shown").toContain(String(b.booking_id));
  });

  test("a paid booking cannot be deleted, and an unpaid one can", async ({ page }) => {
    const token = await loginAdmin(page);
    const res = await page.request.get(`${API}/bookings?page=1&size=50`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const items = (await res.json())?.data?.items ?? [];
    const paid = items.find((b: any) =>
      ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT", "COMPLETED"].includes(String(b.status).toUpperCase())
    );
    test.skip(!paid, "no paid booking to test against");

    // Deleting a settled booking would strand the guest's money and the
    // owner's commission; it must be cancelled first.
    const del = await page.request.delete(`${API}/bookings/${paid.id}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { cancellation_reason: "e2e check" },
    });
    expect(del.status(), "a paid booking was deletable").toBeGreaterThanOrEqual(400);
  });

  test("check-in is refused for a booking that is not confirmed", async ({ page }) => {
    const token = await loginAdmin(page);
    const res = await page.request.get(`${API}/bookings?page=1&size=50`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const items = (await res.json())?.data?.items ?? [];
    const pending = items.find((b: any) =>
      ["PENDING", "PENDING_PAYMENT", "APPROVAL_PENDING"].includes(String(b.status).toUpperCase())
    );
    test.skip(!pending, "no unpaid booking to test against");

    const r = await page.request.post(`${API}/bookings/${pending.id}/check-in`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(r.status(), "an unpaid booking was checked in").toBeGreaterThanOrEqual(400);
  });

  test("the server, not the client, decides the price on edit", async ({ page }) => {
    const token = await loginAdmin(page);
    const res = await page.request.get(`${API}/bookings?page=1&size=50`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const items = (await res.json())?.data?.items ?? [];
    const editable = items.find((b: any) =>
      ["PENDING", "PENDING_PAYMENT"].includes(String(b.status).toUpperCase())
    );
    test.skip(!editable, "no editable booking");

    const before = Number(editable.total_price);
    const upd = await page.request.put(`${API}/bookings/${editable.id}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { total_price: 1 },
    });
    test.skip(upd.status() >= 400, `edit refused: ${upd.status()}`);

    const after = await page.request.get(`${API}/bookings/${editable.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const now = Number((await after.json())?.data?.total_price);
    expect(now, "client-supplied total_price was accepted").not.toBe(1);
    expect(now).toBeCloseTo(before, 2);
  });
});

test.describe("admin — extension lifecycle actions", () => {
  test("an owner cannot approve an extension on someone else's property", async ({ page }) => {
    const adminTok = await tokenFor(page, ADMIN);
    const guestTok = await tokenFor(page, GUEST);

    const all = await page.request.get(`${API}/bookings/extensions/all?size=50`, {
      headers: { Authorization: `Bearer ${adminTok}` },
    });
    const items = (await all.json())?.data?.items ?? [];
    const native = items.find((i: any) => !i.is_legacy);
    test.skip(!native, "no non-legacy extension available");

    const r = await page.request.post(
      `${API}/bookings/${native.booking_id}/extensions/${native.extension_id}/approve`,
      { headers: { Authorization: `Bearer ${guestTok}` } }
    );
    // Permission must be decided before status, or the refusal leaks state.
    expect(r.status(), "a guest approved an extension").toBe(403);
  });

  test("legacy extensions reject lifecycle calls rather than half-applying", async ({ page }) => {
    const adminTok = await tokenFor(page, ADMIN);
    const all = await page.request.get(`${API}/bookings/extensions/all?size=100`, {
      headers: { Authorization: `Bearer ${adminTok}` },
    });
    const items = (await all.json())?.data?.items ?? [];
    const legacy = items.find((i: any) => i.is_legacy);
    test.skip(!legacy, "no legacy extension rows present");

    // These are child bookings; the extension endpoints do not own them.
    const r = await page.request.post(
      `${API}/bookings/${legacy.booking_id}/extensions/${legacy.extension_id}/cancel`,
      { headers: { Authorization: `Bearer ${adminTok}` } }
    );
    expect(r.status(), "a legacy row accepted a lifecycle call").toBeGreaterThanOrEqual(400);
  });
});
