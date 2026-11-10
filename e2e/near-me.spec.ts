import type { Page, Route } from "@playwright/test";
import { expect, test } from "@playwright/test";

/**
 * "Near me" search.
 *
 * The API is stubbed, so this needs no backend and holds the frontend to its
 * half of the contract: the position goes to the API and NOWHERE else (never
 * the page URL, which GA records as page_location), the browser is never
 * asked for a position without a click, and every way it can fail says so.
 */

// Lekki Phase 1. The client rounds to 3dp before it sends or stores anything.
const LEKKI = { latitude: 6.44741, longitude: 3.47063 };

function searchStub(near: Record<string, unknown> | null, distance = 1200) {
  return {
    message: "Search completed",
    data: {
      stats: { total: 1, totalIsVerified: 1 },
      search: {
        query: "stays near me",
        interpreted: {},
        applied: near
          ? [{ kind: "near", label: "Within 5km of you", value: 5000, param: "near",
               status: "applied", source: "user" }]
          : [],
        relaxed: [],
        message: "1 stays near you.",
        relax_steps: 0,
        total_matched: 1,
        clusters: [],
        near,
        capped: false,
        source: "rules",
        cached: false,
        took_ms: 5,
        llm: { used: false, model: null, ms: null, error: null },
      },
      data: {
        meta: { total: 1, perPage: 10, currentPage: 1, lastPage: 1 },
        data: [{
          id: "00000000-0000-0000-0000-000000000001",
          name: "Admiralty Court",
          city: "Lekki",
          state: "Lagos",
          latitude: 6.45,
          longitude: 3.47,
          media: [],
          units: [{ price_per_night: 85000 }],
          meta: { average_rating: 0, total_reviews: 0 },
          relevance: { score: 0.8, matched: [], missing: [], distance_m: distance },
        }],
      },
    },
  };
}

const APPLIED = { status: "applied", radius_m: 5000, place: "Lekki Phase 1", state: null,
                  label: "Within 5km of you" };

interface SearchCall {
  url: URL;
  /** The X-Near-Point header (Playwright lowercases names), if sent. */
  point: string | undefined;
}

/** Every search request the page makes, answered with `body`. */
async function stubSearch(page: Page, body: unknown) {
  const calls: SearchCall[] = [];
  await page.route("**/properties/search?**", (route: Route) => {
    const request = route.request();
    // The custom header makes this a non-simple cross-origin request, so the
    // browser preflights it. Answer that too, the way the API's CORS does.
    if (request.method() === "OPTIONS") {
      return route.fulfill({
        status: 200,
        headers: {
          "access-control-allow-origin": request.headers()["origin"] ?? "*",
          "access-control-allow-credentials": "true",
          "access-control-allow-methods": "GET, OPTIONS",
          "access-control-allow-headers":
            request.headers()["access-control-request-headers"] ?? "*",
        },
      });
    }
    calls.push({ url: new URL(request.url()), point: request.headers()["x-near-point"] });
    return route.fulfill({ json: body });
  });
  return calls;
}

/** Any trace of the guest's position, raw or rounded. */
const COORDS = /6\.44|3\.47|near_lat|near_lng/;

test.describe("near me - location granted", () => {
  test.use({ geolocation: LEKKI, permissions: ["geolocation"] });

  test("results search from the position, which never reaches the page URL", async ({ page }) => {
    const calls = await stubSearch(page, searchStub(APPLIED));
    await page.goto("/search-results?near=1", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/near you$/i);
    await expect(page.getByText("About 1.2 km away")).toBeVisible();

    const sent = calls.find((c) => c.point);
    expect(sent, "no search carried the position").toBeTruthy();
    expect(sent!.point).toBe("6.447,3.471");
    expect(sent!.url.searchParams.get("sort_by")).toBe("distance");
    // Held until the position arrived: no country-wide search first.
    expect(calls.every((c) => c.point === "6.447,3.471")).toBe(true);
    // The position is in the header only: never in a request URL, which the
    // API's access log records, and never in the page URL, which GA records.
    for (const call of calls) expect(call.url.href).not.toMatch(COORDS);

    expect(page.url()).toContain("near=1");
    expect(page.url()).not.toMatch(COORDS);
  });

  test("removing the chip leaves near-me", async ({ page }) => {
    await stubSearch(page, searchStub(APPLIED));
    await page.goto("/search-results?near=1", { waitUntil: "domcontentloaded" });

    const chip = page.locator(".MuiChip-root", { hasText: "Within 5km of you" });
    await chip.locator(".MuiChip-deleteIcon").click();
    await expect(page).not.toHaveURL(/near=1/);
  });

  test("the homepage shows stays near you", async ({ page }) => {
    const calls = await stubSearch(page, searchStub(APPLIED));
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const rail = page.getByRole("region", { name: "Stays near you" });
    await expect(rail).toBeVisible({ timeout: 30_000 });
    await expect(rail.getByText("Admiralty Court")).toBeVisible();
    await expect(rail.getByRole("link", { name: "See all" })).toHaveAttribute(
      "href", "/search-results?near=1");

    const sent = calls.filter((c) => c.point);
    expect(sent.length, "the rail's search carried no position").toBeGreaterThan(0);
    expect(sent.every((c) => c.point === "6.447,3.471")).toBe(true);
    for (const call of calls) expect(call.url.href).not.toMatch(COORDS);
    expect(page.url()).not.toMatch(COORDS);
  });

  test("an API that ignores the position gets no rail", async ({ page }) => {
    // An older API answers without `search.near`; "near you" would be a lie.
    await stubSearch(page, searchStub(null));
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000);
    await expect(page.getByRole("region", { name: "Stays near you" })).toHaveCount(0);
  });
});

test.describe("near me - location not yet granted", () => {
  test("a shared link asks, and never prompts on its own", async ({ page }) => {
    const calls = await stubSearch(page, searchStub(null));
    await page.goto("/search-results?near=1", { waitUntil: "domcontentloaded" });

    await expect(page.getByText("Allow your location to see stays near you.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Use my current location" })).toBeVisible();
    expect(calls.some((c) => c.point || COORDS.test(c.url.href))).toBe(false);

    await page.getByRole("button", { name: "Search all of Nigeria" }).click();
    await expect(page).not.toHaveURL(/near=1/);
  });

  test("the homepage has no rail and asks for nothing", async ({ page }) => {
    const calls = await stubSearch(page, searchStub(APPLIED));
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000);
    await expect(page.getByRole("region", { name: "Stays near you" })).toHaveCount(0);
    expect(calls.some((c) => c.point || COORDS.test(c.url.href))).toBe(false);
  });
});

test.describe("near me - mobile sheet", () => {
  test.use({ geolocation: LEKKI, permissions: ["geolocation"] });

  test("tapping use-my-location searches near the guest", async ({ page, isMobile }) => {
    test.skip(!isMobile, "the sheet is the phone search");
    await stubSearch(page, searchStub(APPLIED));
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await page.getByRole("button", { name: /Where to\?|Near you/ }).click();
    await page.getByRole("button", { name: "Use my current location" }).click();
    await expect(page.getByText("Current location")).toBeVisible();

    await page.getByRole("button", { name: "Search Aparte" }).last().click();
    await expect(page).toHaveURL(/\/search-results\?near=1$/);
  });
});
