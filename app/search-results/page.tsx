import type { Metadata } from "next";

import {
  canonicalSearchPath,
  searchParamsToState,
} from "@/utils/searchParams";
import SearchResults from "@/views/SearchResults";

/**
 * Search results — the head is computed server-side from the URL params, so
 * crawlers that never execute JS (GPTBot, ClaudeBot, PerplexityBot, social
 * unfurlers) get the same title/canonical/noindex logic the client view used
 * to inject via helmet:
 *
 * - canonical drops q/page/drop and sorts what's left, collapsing every
 *   phrasing of one search onto a single indexable URL;
 * - page > 1 and heavily-filtered permutations are noindexed — crawl budget
 *   without upside.
 *
 * The one client-only signal we lose is "noindex on zero results", which
 * needed the API response; an acceptable trade for the head existing at all
 * in the raw HTML.
 */

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function toURLSearchParams(
  raw: Record<string, string | string[] | undefined>
): URLSearchParams {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string") sp.set(key, value);
    else if (Array.isArray(value) && value.length) sp.set(key, value[0]);
  }
  return sp;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const sp = toURLSearchParams(await searchParams);
  const filters = searchParamsToState(sp);

  const locationLabel = filters.locations?.length
    ? filters.locations.join(", ")
    : "";
  const bedroomLabel = filters.bedroomCount
    ? `${filters.bedroomCount}-bedroom `
    : "";
  const typeLabel = filters.propertyTypes?.length
    ? `${String(filters.propertyTypes[0]).toLowerCase()}s`
    : "apartments & homes";
  const title = locationLabel
    ? `${bedroomLabel}${typeLabel} in ${locationLabel}`.replace(/^./, (c) =>
        c.toUpperCase()
      )
    : filters.q
      ? `Search results for “${filters.q}”`
      : "Search apartments & homes";

  const description = locationLabel
    ? `Browse verified luxury short-stay apartments and homes for rent in ${locationLabel}, Nigeria. Compare prices, amenities and availability, and book instantly on Aparte.`
    : "Search verified luxury short-stay apartments and homes across Nigeria. Filter by location, dates, guests and price, and book instantly on Aparte.";

  const activeFilterCount = [
    filters.locations?.length,
    filters.propertyTypes?.length,
    filters.bedroomCount,
    filters.minPrice,
    filters.maxPrice,
    filters.amenities?.length,
    filters.startDate,
    filters.isPetAllowed,
    filters.isPartyAllowed,
  ].filter(Boolean).length;
  const noindex = (filters.page ?? 1) > 1 || activeFilterCount > 3;

  return {
    title,
    description,
    alternates: { canonical: canonicalSearchPath(filters) },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

export default function Page() {
  return <SearchResults />;
}
