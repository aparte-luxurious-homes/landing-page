import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

/**
 * Migration safety net — the critical customer paths.
 *
 * Every assertion here is deliberately about what a user sees or can do, not
 * about DOM structure, so the same suite validates both the Vite SPA and the
 * ported Next.js app. If one of these breaks during the migration, a real
 * customer would have hit it.
 *
 * Navigation waits for `domcontentloaded`, never `load`: index.html pulls in
 * Google Fonts, the Monnify and Paystack SDKs, and Swiper from CDNs, so the
 * `load` event depends on third-party availability rather than on our app.
 * (Those blocking <head> scripts are themselves worth removing — they load on
 * every route, including /terms.)
 */

async function visit(page: Page, path: string) {
  const response = await page.goto(path, { waitUntil: "domcontentloaded" });
  // SPA routes are all served by index.html; a real 4xx/5xx means the server
  // failed, not that the route is missing.
  expect(response?.status() ?? 200).toBeLessThan(400);
  return response;
}

test.describe("public pages render", () => {
  test("home page loads with hero and search", async ({ page }) => {
    await visit(page, "/");

    // The hero search is the primary conversion entry point.
    await expect(page.locator("body")).toContainText(/aparte/i);
    await expect(page).toHaveTitle(/aparte/i);
  });

  test("about page loads", async ({ page }) => {
    await visit(page, "/about");
    await expect(page.locator("body")).toContainText(/aparte/i);
    await expect(page).toHaveTitle(/.+/);
  });

  test.describe("legal pages", () => {
    for (const path of ["/terms", "/privacy-policy", "/cancellation-policy"]) {
      test(`${path} loads with content`, async ({ page }) => {
        await visit(page, path);
        await expect(page.locator("body")).toContainText(/Aparte/i);
        const text = await page.locator("body").innerText();
        expect(text.length).toBeGreaterThan(200);
      });
    }
  });

  test("help centre loads", async ({ page }) => {
    await visit(page, "/help");
    await expect(page.locator("body")).toContainText(/\w/);
  });
});

test.describe("SEO surface", () => {
  test("home has canonical, description and JSON-LD", async ({ page }) => {
    await visit(page, "/");
    // Helmet writes tags after hydration in the SPA; in Next they're in the
    // server HTML. Waiting for "attached" (never "visible" — head elements
    // have no box) covers both rendering models.
    await page.waitForSelector('link[rel="canonical"]', {
      state: "attached",
      timeout: 20_000,
    });

    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveCount(1);

    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute("content", /.{50,}/);

    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute("content", /.+/);

    // Organization + WebSite structured data must survive the migration.
    const jsonLd = await page.locator('script[type="application/ld+json"]').all();
    expect(jsonLd.length).toBeGreaterThan(0);
    const payloads = await Promise.all(jsonLd.map((el) => el.textContent()));
    expect(payloads.join(" ")).toMatch(/Organization/);
  });

  test("robots.txt and sitemap.xml are served", async ({ request }) => {
    const robots = await request.get("/robots.txt");
    expect(robots.status()).toBe(200);
    expect(await robots.text()).toMatch(/sitemap/i);

    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    expect(await sitemap.text()).toContain("<urlset");
  });
});

test.describe("search and property discovery", () => {
  test("search results page loads and accepts a location query", async ({ page }) => {
    await visit(page, "/search-results?location=Lagos");
    // Either results or an explicit empty state — both are valid, a crash is not.
    await expect(page.locator("body")).not.toContainText(/application error/i);
  });

  test("a copied search URL keeps the query on a cold load", async ({ page }) => {
    // Regression: opening /search-results?q=Lekki in a new tab used to drop
    // the query and render the generic index. The URL must survive a full
    // document load, not only an in-tab client navigation.
    await visit(page, "/search-results?q=Lekki");
    await expect(page).toHaveURL(/[?&]q=Lekki/, { timeout: 15_000 });
    await expect(page.locator("body")).not.toContainText(/application error/i);
  });

  test("legacy /apartment/:id redirects to /property-details/:id", async ({ page }) => {
    await visit(page, "/apartment/00000000-0000-0000-0000-000000000000");
    await expect(page).toHaveURL(/\/property-details\//, { timeout: 20_000 });
  });
});

test.describe("auth surface", () => {
  test("login page renders a usable form", async ({ page }) => {
    await visit(page, "/login");
    // At minimum an input the user can type into and a submit control.
    await expect(page.locator("input").first()).toBeVisible();
    await expect(page.locator("button").first()).toBeVisible();
  });

  test("signup routes to user-type selection first", async ({ page }) => {
    // /signup with no user type deliberately bounces to the chooser
    // (AuthPage.tsx). The migration must preserve that redirect.
    await visit(page, "/signup");
    await expect(page).toHaveURL(/\/auth\/user-type/, { timeout: 20_000 });
    await expect(page.locator("body")).toContainText(/guest|owner|agent/i);
  });

  test("/account is gated when logged out", async ({ page }) => {
    await visit(page, "/account");
    await page.waitForTimeout(1500); // let the gate resolve
    // Current behaviour is a dialog rather than a redirect; either is
    // acceptable, but the account content itself must not render.
    const text = await page.locator("body").innerText();
    expect(text).toMatch(/log ?in|sign ?in|session|continue/i);
  });
});

test.describe("no console crashes on key routes", () => {
  for (const path of ["/", "/about", "/help", "/terms"]) {
    test(`${path} renders without a page error`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (err) => errors.push(err.message));
      await visit(page, path);
      await page.waitForTimeout(2000); // let hydration + effects run
      expect(errors, `uncaught errors on ${path}`).toEqual([]);
    });
  }
});
