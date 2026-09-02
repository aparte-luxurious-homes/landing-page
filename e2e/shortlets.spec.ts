import { expect, test } from "@playwright/test";

import { SHORTLET_CITIES } from "../src/lib/seo/cities";
import { PROPERTY_TYPE_PAGES } from "../src/lib/seo/propertyTypePages";
import { PROPERTY_TYPES } from "../src/lib/propertyTypes";

/**
 * The indexable /shortlets surface.
 *
 * Cities and property types share one dynamic segment, so the guard that
 * matters most is that their slug namespaces never collide — a city called
 * "Villas" would silently shadow a type page and nothing else would notice.
 */

test.describe("landing page vocabularies", () => {
  test("city and type slugs never collide", () => {
    const cities = new Set(SHORTLET_CITIES.map((c) => c.slug));
    const clashes = PROPERTY_TYPE_PAGES.filter((t) => cities.has(t.slug));
    expect(clashes.map((t) => t.slug)).toEqual([]);
  });

  test("every type page names a real API enum value", () => {
    // The label and the slug are never derived from the value and the value is
    // never derived from them — "Hotel Room".toUpperCase() is "HOTEL ROOM",
    // which matches no row. This pins the values to the shared vocabulary.
    const known = new Set(PROPERTY_TYPES.map((t) => t.value));
    for (const page of PROPERTY_TYPE_PAGES) {
      expect(known, `${page.slug} -> ${page.value}`).toContain(page.value);
    }
  });

  test("every API property type has a landing page", () => {
    const covered = new Set(PROPERTY_TYPE_PAGES.map((t) => t.value));
    for (const type of PROPERTY_TYPES) {
      expect(covered, `no page for ${type.value}`).toContain(type.value);
    }
  });

  test("slugs are url-safe and plural-looking", () => {
    for (const page of PROPERTY_TYPE_PAGES) {
      expect(page.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(page.slug).not.toBe(encodeURIComponent(page.slug) + "-");
    }
  });
});

test.describe("routes resolve", () => {
  test("the hub lists both cities and types", async ({ page }) => {
    await page.goto("/shortlets", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /by city/i })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /by property type/i })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /verified apartments in nigeria/i })
    ).toBeVisible();
  });

  test("a type page renders", async ({ page }) => {
    const res = await page.goto("/shortlets/apartments", {
      waitUntil: "domcontentloaded",
    });
    expect(res?.status()).toBeLessThan(400);
    await expect(
      page.getByRole("heading", { level: 1, name: /apartments in nigeria/i })
    ).toBeVisible();
  });

  test("a city page still renders after the segment rename", async ({ page }) => {
    const res = await page.goto("/shortlets/lagos", {
      waitUntil: "domcontentloaded",
    });
    expect(res?.status()).toBeLessThan(400);
    await expect(
      page.getByRole("heading", { level: 1, name: /shortlet apartments in lagos/i })
    ).toBeVisible();
  });

  test("a city x type page renders", async ({ page }) => {
    const res = await page.goto("/shortlets/lekki/apartments", {
      waitUntil: "domcontentloaded",
    });
    expect(res?.status()).toBeLessThan(400);
    await expect(
      page.getByRole("heading", { level: 1, name: /apartments in lekki/i })
    ).toBeVisible();
  });

  test("an unknown segment 404s", async ({ page }) => {
    const res = await page.goto("/shortlets/not-a-place", {
      waitUntil: "domcontentloaded",
    });
    expect(res?.status()).toBe(404);
  });

  test("a type cannot stand in for a city", async ({ page }) => {
    // /shortlets/apartments/villas is not a thing — the parent segment of a
    // combo page must be a city.
    const res = await page.goto("/shortlets/apartments/villas", {
      waitUntil: "domcontentloaded",
    });
    expect(res?.status()).toBe(404);
  });
});

test.describe("crawlability", () => {
  test("type pages carry a self-canonical", async ({ page }) => {
    await page.goto("/shortlets/apartments", { waitUntil: "domcontentloaded" });
    const canonical = await page
      .locator('link[rel="canonical"]')
      .getAttribute("href");
    expect(canonical).toContain("/shortlets/apartments");
  });

  test("type pages emit breadcrumb and collection structured data", async ({
    page,
  }) => {
    await page.goto("/shortlets/apartments", { waitUntil: "domcontentloaded" });
    const blocks = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    const types = blocks.map((b) => JSON.parse(b)["@type"]);
    expect(types).toContain("BreadcrumbList");
    expect(types).toContain("CollectionPage");
  });

  test("the sitemap lists every type page and combination", async ({ request }) => {
    const body = await (await request.get("/sitemap.xml")).text();
    for (const type of PROPERTY_TYPE_PAGES) {
      expect(body, `missing /shortlets/${type.slug}`).toContain(
        `/shortlets/${type.slug}`
      );
      for (const city of SHORTLET_CITIES) {
        expect(body).toContain(`/shortlets/${city.slug}/${type.slug}`);
      }
    }
  });

  test("llms-full.txt describes the property types", async ({ request }) => {
    const body = await (await request.get("/llms-full.txt")).text();
    expect(body).toContain("## Property types");
    expect(body).toContain("/shortlets/event-centres");
  });

  test("the footer links a type page from every route", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(
      page.locator('a[href="/shortlets/apartments"]').first()
    ).toHaveCount(1);
  });
});
