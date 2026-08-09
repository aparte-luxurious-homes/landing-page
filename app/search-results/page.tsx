import type { Metadata } from "next";

import SearchResults from "@/views/SearchResults";

export const metadata: Metadata = {
  title: "Search results",
  alternates: { canonical: "/search-results" },
};

export default function Page() {
  return <SearchResults />;
}
