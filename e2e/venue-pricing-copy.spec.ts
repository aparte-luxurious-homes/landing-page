import type { Locator, Page, Route } from "@playwright/test";
import { expect, test } from "@playwright/test";

/**
 * Venue pricing copy — what the merge of the search-usability hotfix (#165)
 * into the venue flow (#168) must not undo.
 *
 * Two contracts, each of which the pre-merge code broke:
 *
 * 1. The price slider on a venues-only search says what the API actually
 *    compares. api-venue filters halls on a DAY-EQUIVALENT price (an hourly
 *    hall at its full-day cost), so "headline rate" — the hotfix's wording —
 *    promised a per-hour/per-session comparison that is no longer made.
 *    Stubbed: the label is pure client state, so no API is needed.
 *
 * 2. A hall's mobile booking sheet offers the VenueHirePicker (the picker
 *    PropertyDetails shares with the desktop sidebar), never the retired
 *    Day/Hour/Half-day select, and its fixed bar counts days, sessions or
 *    hours — never "Day/Event". The property page is server-fetched for its
 *    SEO head, so a stubbed id would 404 before the view mounts; this one
 *    runs against a real hall when E2E_VENUE_PROPERTY_ID names it (the same
 *    gating catalog.spec.ts uses for E2E_CATALOG_HANDLE).
 */

const json = (route: Route, body: unknown, status = 200) =>
  route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });

/** An empty, well-formed search envelope: the page renders its filter panel
 *  and empty state and asks nothing else of the API. The globs carry no
 *  /api/v1 prefix on purpose — the dev server may form the URL either way. */
async function stubEmptySearch(page: Page) {
  await page.route("**/properties/search**", (route) => {
    if (route.request().url().includes("/search/external")) {
      return json(route, { message: "ok", data: { items: [], total: 0 } });
    }
    return json(route, {
      message: "ok",
      data: {
        stats: { total: "0", totalIsVerified: "0" },
        data: {
          meta: {
            total: 0,
            perPage: 10,
            currentPage: 1,
            lastPage: 1,
            firstPage: 1,
            firstPageUrl: "",
            lastPageUrl: "",
            nextPageUrl: null,
            previousPageUrl: null,
          },
          data: [],
        },
        search: {
          query: "",
          interpreted: {},
          applied: [],
          relaxed: [],
          message: "",
          relax_steps: 0,
          total_matched: 0,
          capped: false,
          source: "rules",
          cached: false,
          took_ms: 1,
          llm: { used: false },
        },
      },
    });
  });
  await page.route("**/properties/locations**", (route) =>
    json(route, { message: "ok", data: { cities: [], states: [] } }),
  );
  await page.route("**/amenities**", (route) => json(route, { message: "ok", data: [] }));
  await page.route("**/event-types**", (route) => json(route, { message: "ok", data: [] }));
}

/**
 * Opens the filters and returns the ONE panel the viewer can see.
 *
 * SearchResults renders FilterContent twice: the sidebar `<aside>` stays in
 * the DOM at every width (Tailwind `hidden md:block`, md = 768px), and on a
 * phone the "Filters" button mounts a second copy inside the MUI Drawer. A
 * page-wide `getByText(label)` therefore resolves to two headings on the
 * `mobile` project and trips strict mode, so every label assertion is scoped
 * to the panel returned here: the drawer on phones, the aside on desktop.
 */
async function openFilters(page: Page): Promise<Locator> {
  if ((page.viewportSize()?.width ?? 1280) < 768) {
    // `exact`: the role name match is a substring by default, and the empty
    // result set renders a "Clear filters" button that arrives while the
    // click is still waiting out the loading overlay — a second match mid-
    // retry is a strict-mode violation.
    await page.getByRole("button", { name: "Filters", exact: true }).click();
    return page.locator(".MuiDrawer-root");
  }
  return page.getByRole("complementary");
}

test.describe("price filter label", () => {
  test("a venues-only search prices per day (day-equivalent), not by headline rate", async ({
    page,
  }) => {
    await stubEmptySearch(page);
    await page.goto("/search-results?property_type=EVENT_CENTRE", {
      waitUntil: "domcontentloaded",
    });
    const panel = await openFilters(page);

    await expect(
      panel.getByText("Price range (₦ per day, day-equivalent for venues)"),
    ).toBeVisible();
    // Page-wide on purpose: the retired wording must be gone from BOTH copies.
    await expect(page.getByText(/headline rate/i)).toHaveCount(0);
  });

  test("a stays search still prices per night", async ({ page }) => {
    await stubEmptySearch(page);
    await page.goto("/search-results?property_type=APARTMENT", {
      waitUntil: "domcontentloaded",
    });
    const panel = await openFilters(page);

    await expect(panel.getByText("Price range (₦ per night)")).toBeVisible();
    await expect(page.getByText(/day-equivalent/i)).toHaveCount(0);
  });
});

const VENUE_ID = process.env.E2E_VENUE_PROPERTY_ID;

test.describe("a hall's mobile booking sheet", () => {
  test.skip(!VENUE_ID, "set E2E_VENUE_PROPERTY_ID to a live event-centre property id");

  test("offers the hire picker and counts the hire, not Day/Events", async ({ page }) => {
    // MobileBookingSummary returns null above 600px; only the phone project
    // can see it.
    test.skip((page.viewportSize()?.width ?? 1280) > 600, "phone viewport only");

    await page.goto(`/property-details/${VENUE_ID}`, { waitUntil: "domcontentloaded" });

    const bar = page.getByText("Tap for details").locator("..");
    await expect(bar).toBeVisible({ timeout: 30_000 });
    // One of each hire unit before a date is picked: "1 day", "1 session" or
    // "1 hour" — and a hall, not a unit.
    await expect(bar).toHaveText(/1 (day|session|hour) · 1 guest · 1 hall/);
    await expect(page.getByText(/Day\/Event/)).toHaveCount(0);

    // Tapping the price opens the sheet; the picker (or its "not bookable
    // online yet" notice) replaces the retired "Billing Unit" select.
    //
    // The picker is a MUI outlined `<TextField select label=…>`, which paints
    // its label twice — the `<label>` and the fieldset notch's `<legend>` —
    // so a getByText on the label is a strict-mode violation for every hall
    // that offers a billing unit. Address the control by its accessible name
    // instead; only the "not online yet" notice is plain text.
    await bar.click();
    const picker = page.getByRole("combobox", { name: /How do you want to hire it\?/ });
    const notYetOnline = page.getByText(/isn't taking bookings online yet/);
    await expect(picker.or(notYetOnline)).toBeVisible();
    await expect(page.getByText("Billing Unit")).toHaveCount(0);
  });
});
