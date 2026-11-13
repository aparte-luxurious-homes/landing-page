import type { Metadata } from "next";

import HelpSearchPage from "@/views/help/Search";

// noindex matches the client view's <Seo noindex> intent — an internal search
// tool, not a landing page. The server directive is the one crawlers act on;
// previously metadata here implied indexable while the client said noindex.
export const metadata: Metadata = {
  title: "Search help",
  alternates: { canonical: "/help/search" },
  robots: { index: false, follow: true },
};

export default function Page() {
  return <HelpSearchPage />;
}
