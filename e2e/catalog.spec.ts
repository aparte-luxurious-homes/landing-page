import { expect, test } from "@playwright/test";

/**
 * A host's page (aparte.ng/@handle).
 *
 * The catalog is fetched inside the Next server (RSC), not the browser, so
 * page.route() cannot stub it. The always-on checks are therefore about the
 * routing contract; the content checks run against a real handle when
 * E2E_CATALOG_HANDLE names one on the API the dev server points at.
 */

test("an unknown handle is a 404", async ({ page }) => {
  const res = await page.goto("/@not-a-real-handle-xyz");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("the internal /catalog path redirects to the @ form", async ({ request }) => {
  const res = await request.get("/catalog/somebody", { maxRedirects: 0 });
  expect(res.status()).toBe(308);
  expect(res.headers()["location"]).toMatch(/\/@somebody$/);
});

test("the generated og:image is not caught by the slug redirect", async ({ request }) => {
  // Anything else under /catalog/:handle/ is a 308; the image must not be,
  // or WhatsApp is handed a redirect to a property page instead of a PNG.
  const res = await request.get("/catalog/somebody/opengraph-image", { maxRedirects: 0 });
  expect(res.status()).not.toBe(308);
  expect(res.status()).not.toBe(307);
});

const HANDLE = process.env.E2E_CATALOG_HANDLE;

test.describe("a live host page", () => {
  test.skip(!HANDLE, "set E2E_CATALOG_HANDLE to a published handle");

  test("renders the host, the listings and the share metadata in HTML", async ({ page }) => {
    const res = await page.goto(`/@${HANDLE}`);
    expect(res?.status()).toBe(200);

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`/@${HANDLE}$`));
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /opengraph-image/);

    const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(jsonLd.some((t) => t.includes('"ProfilePage"'))).toBe(true);

    // The first card carries the sharer AND their referral code.
    const first = page.locator('a[href^="/property-details/"]').first();
    await expect(first).toHaveAttribute("href", new RegExp(`rs=%40${HANDLE}.*ref=`));
  });

  test("a phone gets the thumb-reach action bar", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile project only");
    await page.goto(`/@${HANDLE}`);
    await expect(page.getByRole("button", { name: "Share this page" })).toBeVisible();
  });

  test("a listing opened from the page says who shared it", async ({ page }) => {
    await page.goto(`/@${HANDLE}`);
    const first = page.locator('a[href^="/property-details/"]').first();
    await first.click();
    await expect(page).toHaveURL(/\/property-details\//);
    await expect(page.getByText(/Shared by/)).toBeVisible();
    // ...and the referral code reached the store the booking form reads.
    const stored = await page.evaluate(() => window.localStorage.getItem("aparte_referral_code"));
    expect(stored).toBeTruthy();
  });
});
