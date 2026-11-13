import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

/**
 * Search, end to end against a real API.
 *
 * The contract these hold the stack to: a guest can always reword their
 * search from the results page, and while the catalogue has any verified
 * listing, no search ends on an empty page. When the API has to widen a
 * search it says so ("Closest matches") rather than presenting near-misses
 * as exact hits.
 *
 * Needs an API that includes the relax-ladder tail (api-v1
 * search_demand_gaps_001 or later). Point BASE_URL at a preview whose
 * NEXT_PUBLIC_API_BASE_URL serves it.
 */

async function visit(page: Page, path: string) {
  const response = await page.goto(path, { waitUntil: "domcontentloaded" });
  expect(response?.status() ?? 200).toBeLessThan(400);
}

const searchBox = (page: Page) => page.getByRole("searchbox", { name: "Search stays" });
const firstListing = (page: Page) => page.locator('a[href*="/property-details/"]').first();

test.describe("search results", () => {
  test("the query can be reworded from the results page", async ({ page }) => {
    await visit(page, "/search-results?q=Lekki");
    await expect(searchBox(page)).toHaveValue("Lekki");

    await searchBox(page).fill("2 bedroom in Ikeja");
    await searchBox(page).press("Enter");
    await expect(page).toHaveURL(/[?&]q=2\+bedroom\+in\+Ikeja/);
  });

  for (const q of ["Ibadan", "hotel in Ibadan", "flat in Lekki under 2000", "qqq zzz"]) {
    test(`"${q}" never leaves the guest with nothing`, async ({ page }) => {
      await visit(page, `/search-results?q=${encodeURIComponent(q)}`);
      await expect(firstListing(page)).toBeVisible({ timeout: 30_000 });
      await expect(page.getByText("No Properties Found")).toHaveCount(0);
    });
  }

  test("a place with no stays is explained, not hidden", async ({ page }) => {
    await visit(page, "/search-results?q=Ibadan");
    await expect(firstListing(page)).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Closest matches for “Ibadan”",
    );
    await expect(page.getByText(/closest match/).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "List it on Aparte" })).toHaveAttribute(
      "href",
      "/list",
    );
  });
});
