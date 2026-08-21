import type { Metadata } from "next";

import SearchResults from "@/views/SearchResults";
import {
  canonicalSearchPath,
  filtersToSearchParams,
  fromNextSearchParams,
  searchParamsToState,
} from "@/utils/searchParams";

/**
 * Query-string searches must be rendered per request. A static shell of
 * `/search-results` is why a copied `?q=Lekki` link used to open the generic
 * index after a cold load — Next never handed the query to the client hook.
 */
export const dynamic = "force-dynamic";

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
