import type { Metadata } from "next";
import SearchResults from "@/views/SearchResults";
import {
  canonicalSearchPath,
  filtersToSearchParams,
  fromNextSearchParams,
  searchParamsToState,
} from "@/utils/searchParams";

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

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const filters = searchParamsToState(fromNextSearchParams(await searchParams));
  const shareQuery = filtersToSearchParams(filters).toString();
  const sharePath = shareQuery
    ? `/search-results?${shareQuery}`
    : "/search-results";

  const locationLabel = filters.locations?.join(", ");
  const title = locationLabel
    ? `Stays in ${locationLabel}`
    : filters.q
      ? `Search results for “${filters.q}”`
      : "Search results";

  return {
    title,
    // og:url is what WhatsApp / iMessage unfurlers send the recipient to.
    // It must reproduce the search, not collapse to the generic index.
    alternates: { canonical: canonicalSearchPath(filters) },
    openGraph: { url: sharePath },
  };
}

export default async function Page({ searchParams }: PageProps) {
  // Awaiting opts the route into dynamic rendering so `useSearchParams()`
  // sees the same query the visitor (and the crawler) requested.
  await searchParams;
  return <SearchResults />;
}
