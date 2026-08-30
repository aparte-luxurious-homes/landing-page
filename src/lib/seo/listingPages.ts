/**
 * Shared plumbing for the indexable listing pages under /shortlets.
 *
 * Extracted from `app/shortlets/[city]/page.tsx` when type pages arrived, so
 * the city, type and city-x-type variants fetch and render listings the same
 * way rather than drifting into three near-copies.
 *
 * Server-only by construction: no React, no MUI, no browser globals. The
 * pages that use it render a bespoke server-side card rather than importing
 * ApartmentCard, which is a client component — keeping these pages out of the
 * client bundle entirely is the point of them.
 */

import { API_BASE } from "@/lib/links/api";

export interface ListedProperty {
  id?: string;
  name?: string;
  city?: string | null;
  state?: string | null;
  property_type?: string | null;
  average_rating?: number;
  total_reviews?: number;
  media?: Array<{ media_url?: string; is_featured?: boolean }>;
  units?: Array<{ price_per_night?: number | string }>;
}

export interface ListingFetch {
  /** Listings for the page, already filtered to ones safe to render. */
  properties: ListedProperty[];
  /**
   * Total matches for the query, not the page.
   *
   * This is what decides whether a page is indexable: a type or combination
   * with no inventory is thin content, so `generateMetadata` marks it
   * `noindex` until stock appears. Reading the page length instead would give
   * the same answer here only because the limit exceeds any real page.
   */
  total: number;
}

export const LISTING_REVALIDATE_SECONDS = 3600;

/** How many listings a landing page shows before deferring to search. */
export const LISTING_LIMIT = 8;

/**
 * Fetch verified listings for an arbitrary filter.
 *
 * Every failure mode degrades to an empty result: these pages must render
 * their copy, FAQs and structured data even with the API down. A page that
 * 500s because a listing feed hiccupped is worse than one showing an empty
 * state.
 */
export async function fetchListings(
  filters: Record<string, string>
): Promise<ListingFetch> {
  const empty: ListingFetch = { properties: [], total: 0 };
  try {
    const params = new URLSearchParams({
      limit: String(LISTING_LIMIT),
      is_verified: "true",
      ...filters,
    });
    const res = await fetch(`${API_BASE}/api/v1/properties?${params}`, {
      next: { revalidate: LISTING_REVALIDATE_SECONDS },
    });
    if (!res.ok) return empty;
    const body = await res.json();
    const rows = body?.data?.data?.data ?? body?.data?.data ?? [];
    if (!Array.isArray(rows)) return empty;

    const total = Number(
      body?.data?.data?.meta?.total ?? body?.data?.stats?.totalIsVerified ?? rows.length
    );

    return {
      properties: (rows as ListedProperty[]).filter((p) => p.id && p.name),
      total: Number.isFinite(total) ? total : rows.length,
    };
  } catch {
    return empty;
  }
}

export const heroOf = (p: ListedProperty): string | undefined => {
  const media = p.media ?? [];
  return (media.find((m) => m?.is_featured) ?? media[0])?.media_url;
};

export const priceFromOf = (p: ListedProperty): number | null => {
  const prices = (p.units ?? [])
    .map((u) => parseFloat(String(u?.price_per_night)))
    .filter((n) => Number.isFinite(n) && n > 0);
  return prices.length ? Math.min(...prices) : null;
};
