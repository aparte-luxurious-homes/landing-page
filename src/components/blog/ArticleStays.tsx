import Link from "next/link";

import type { BlogArticle } from "@/lib/blog/api";

/**
 * Listings at the end of an article: the ones the admin picked, else up to
 * three in a place the article names, else a "Browse stays" button.
 */
export default function ArticleStays({ properties }: { properties: BlogArticle["properties"] }) {
  const items = properties?.items ?? [];

  if (!items.length) {
    return (
      <section className="mt-12 rounded-2xl bg-teal-soft p-6 md:p-8 text-center" aria-label="Find a stay">
        <h2 className="font-serif text-2xl font-semibold text-ink">Ready to book?</h2>
        <p className="mt-2 text-gray-700">
          Every home on Aparte is verified, so what you book is what you get.
        </p>
        <Link
          href="/search-results"
          className="mt-5 inline-block rounded-lg bg-teal px-5 py-2.5 text-white font-semibold hover:opacity-90"
        >
          Browse stays
        </Link>
      </section>
    );
  }

  const heading = properties.place ? `Stays in ${properties.place}` : "Stays on Aparte";
  const moreHref = properties.place
    ? `/search-results?location=${encodeURIComponent(properties.place)}`
    : "/search-results";

  return (
    <section className="mt-12" aria-label={heading}>
      <div className="flex items-end justify-between gap-3 mb-4">
        <h2 className="font-serif text-2xl font-semibold text-ink">{heading}</h2>
        <Link href={moreHref} className="text-sm font-semibold text-teal hover:underline whitespace-nowrap">
          See more
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {items.map((p) => (
          <Link
            key={p.id}
            href={`/property-details/${p.id}`}
            className="group block rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition"
          >
            <span className="block aspect-[4/3] bg-gray-100 overflow-hidden">
              {p.image_url && (
                <img
                  src={p.image_url}
                  alt={`${p.name}, ${[p.city, p.state].filter(Boolean).join(", ")}`}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />
              )}
            </span>
            <span className="block p-3">
              <span className="block font-semibold text-ink text-sm truncate">{p.name}</span>
              <span className="block text-xs text-gray-500 mt-0.5">
                {[p.city, p.state].filter(Boolean).join(", ")}
              </span>
              {p.price_from != null && (
                <span className="block text-sm text-teal font-semibold mt-1">
                  From NGN {Math.round(p.price_from).toLocaleString("en-NG")}/night
                </span>
              )}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
