/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Which city pages have verified listings — server-side only.
 *
 * A city page with nothing to book is hidden from every place that links to
 * it: the /shortlets index, the other city pages, the homepage destinations
 * rail, the footer and the sitemap. The page itself stays reachable and
 * `noindex`es itself while empty (app/shortlets/[segment]/page.tsx), so it
 * comes back on its own once stock appears, with no 404-then-200 flip.
 *
 * One request per city, identical to the homepage rail's, so the Next Data
 * Cache serves both from the same hourly entry: no extra upstream calls.
 *
 * A count we could not read is `null`, and `null` counts as live. An API blip
 * must never empty the site's navigation; a page wrongly shown for an hour is
 * a far smaller harm than every city vanishing at once.
 */

import { API_BASE } from "@/lib/links/api";
import { SHORTLET_CITIES, type ShortletCity } from "@/lib/seo/cities";
import { PROPERTY_TYPE_PAGES, type PropertyTypePage } from "@/lib/seo/propertyTypePages";

const CITY_REVALIDATE_SECONDS = 3600;
/** Rows per city: the rail scans these for one with a usable photo. */
export const CITY_SCAN_LIMIT = 6;

export interface CityRows {
  /** Verified listings in the city, or null when the API did not answer. */
  count: number | null;
  rows: any[];
}

/** One city's verified listings (first CITY_SCAN_LIMIT rows + the total). */
export async function fetchCityRows(city: ShortletCity): Promise<CityRows> {
  try {
    const params = new URLSearchParams({
      limit: String(CITY_SCAN_LIMIT),
      is_verified: "true",
      ...city.apiParams,
    });
    const res = await fetch(`${API_BASE}/api/v1/properties?${params}`, {
      next: { revalidate: CITY_REVALIDATE_SECONDS },
    });
    if (!res.ok) return { count: null, rows: [] };

    const body = await res.json();
    const rows: any[] = body?.data?.data?.data ?? body?.data?.data ?? [];
    if (!Array.isArray(rows)) return { count: null, rows: [] };

    // meta.total is the match count for THIS filtered query; stats
    // .totalIsVerified is the same number while is_verified=true is set.
    const total = Number(
      body?.data?.data?.meta?.total ?? body?.data?.stats?.totalIsVerified ?? rows.length
    );
    return { count: Number.isFinite(total) ? total : rows.length, rows };
  } catch {
    return { count: null, rows: [] };
  }
}

/** slug -> verified listing count (null = unknown). */
export type CityStock = Record<string, number | null>;

export async function fetchCityStock(): Promise<CityStock> {
  const entries = await Promise.all(
    SHORTLET_CITIES.map(async (city) => [city.slug, (await fetchCityRows(city)).count] as const)
  );
  return Object.fromEntries(entries);
}

/** Shown unless we positively know the city has no verified listing. */
export const isCityLive = (stock: CityStock, slug: string): boolean => stock[slug] !== 0;

/** SHORTLET_CITIES minus the ones known to be empty, in their usual order. */
export async function fetchLiveCities(): Promise<ShortletCity[]> {
  const stock = await fetchCityStock();
  return SHORTLET_CITIES.filter((c) => isCityLive(stock, c.slug));
}

// ---------------------------------------------------------------------------
// Property-type pages: the same rule, for /shortlets/apartments and friends.
// ---------------------------------------------------------------------------

/** Verified listings of one property type nationally (null = unknown). */
async function fetchTypeCount(type: PropertyTypePage): Promise<number | null> {
  try {
    const params = new URLSearchParams({ limit: "1", is_verified: "true", property_type: type.value });
    const res = await fetch(`${API_BASE}/api/v1/properties?${params}`, {
      next: { revalidate: CITY_REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;
    const body = await res.json();
    const total = Number(body?.data?.data?.meta?.total);
    return Number.isFinite(total) ? total : null;
  } catch {
    return null;
  }
}

/** type slug -> verified listing count (null = unknown). */
export async function fetchTypeStock(): Promise<CityStock> {
  const entries = await Promise.all(
    PROPERTY_TYPE_PAGES.map(async (t) => [t.slug, await fetchTypeCount(t)] as const)
  );
  return Object.fromEntries(entries);
}

/** PROPERTY_TYPE_PAGES minus the ones known to be empty. */
export async function fetchLiveTypes(): Promise<PropertyTypePage[]> {
  const stock = await fetchTypeStock();
  return PROPERTY_TYPE_PAGES.filter((t) => isCityLive(stock, t.slug));
}
