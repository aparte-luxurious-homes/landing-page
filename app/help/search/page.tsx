import type { Metadata } from "next";

import HelpSearchPage from "@/views/help/Search";

export const metadata: Metadata = {
  title: "Search help",
  alternates: { canonical: "/help/search" },
};

export default function Page() {
  return <HelpSearchPage />;
}
