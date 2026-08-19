'use client';

import { useSearchParams } from '@/lib/router';
import Header from "@/sections/Header";
import Footer from "@/sections/Footer";
import { SearchInput } from "@/components/help/SearchInput";
import { ArticleCard } from "@/components/help/ArticleCard";
import { searchGuides } from "@/lib/help/search";
import { useEffect, useState } from "react";
import { trackHelpEvent } from "@/lib/help/analytics";

export default function HelpSearchPage() {
  const [params, setParams] = useSearchParams();
  const initialQuery = params.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);

  const results = query ? searchGuides(query) : [];

  // Keep URL in sync.
  useEffect(() => {
    if (query) {
      setParams({ q: query }, { replace: true });
      trackHelpEvent("help_searched", {
        query,
        results_count: results.length,
        surface: "page",
      });
    } else {
      setParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <>
      {/* Title + noindex now come from app/help/search/page.tsx metadata. */}
      <Header />
      <main className="bg-white pt-24 pb-32 lg:pb-44 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <header className="mb-6">
            <h1 className="font-serif text-2xl md:text-3xl font-semibold text-ink mb-3">
              Search the help center
            </h1>
            <SearchInput value={query} onChange={setQuery} />
          </header>
          <div className="space-y-3">
            {query && results.length === 0 && (
              <p className="text-gray-500 text-sm py-8 text-center">
                No matches for "{query}". Try different keywords or{" "}
                <a href="mailto:support@aparte.ng" className="text-teal font-semibold hover:underline">
                  contact support
                </a>
                .
              </p>
            )}
            {results.map((hit) => (
              <ArticleCard key={hit.guide.id} guide={hit.guide} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
