import type { Metadata } from "next";
import Link from "next/link";

import Footer from "@/sections/Footer";
import Header from "@/sections/Header";
import { SHORTLET_CITIES } from "@/lib/seo/cities";
import { PROPERTY_TYPE_PAGES } from "@/lib/seo/propertyTypePages";
import { toJsonLd } from "@/lib/seo/jsonLd";
import { breadcrumbSchema } from "@/lib/seo/schema";

/**
 * Hub linking every landing page under /shortlets — one crawlable index for
 * both the city set and the property-type set.
 *
 * The type list matters more than it looks: the homepage category row is a
 * set of `<button>`s that filter in place, so before this there was no `<a>`
 * anywhere on the site carrying a property type. The type pages would have
 * been reachable only from the sitemap.
 */

export const metadata: Metadata = {
  title: "Shortlet Apartments in Nigeria, by City and Property Type",
  description:
    "Verified shortlet apartments across Nigeria: Lagos, Lekki, " +
    "Victoria Island, Ikoyi, Ikeja, Abuja and Port Harcourt. Browse by " +
    "apartment, duplex, bungalow, villa, hotel room or event centre.",
  alternates: { canonical: "/shortlets" },
};

export default function Page() {
  const crumbs = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Shortlets", path: "/shortlets" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(crumbs) }}
      />
      <Header />
      {/* pb must stay >= the Footer's -mt-28 / lg:-mt-40 pull, or its
          angled wedge paints over the last block of content. */}
      <main className="bg-white pt-24 pb-32 lg:pb-48 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <header className="mb-8">
            <p className="text-xs font-bold uppercase tracking-wider text-teal mb-2">
              Destinations
            </p>
            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-ink leading-tight">
              Shortlet apartments across Nigeria
            </h1>
            <p className="mt-4 text-gray-700 leading-relaxed">
              Aparte verifies every listing before it goes live. Browse
              short-stay apartments, homes and hotels by city or by property
              type, with real-time availability and pricing in NGN.
            </p>
          </header>

          <h2 className="font-serif text-xl font-semibold text-ink mb-3">
            By city
          </h2>
          <ul className="space-y-4">
            {SHORTLET_CITIES.map((city) => (
              <li key={city.slug} className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition">
                <Link
                  href={`/shortlets/${city.slug}`}
                  className="font-serif text-lg font-semibold text-teal hover:underline"
                >
                  Shortlets in {city.name}
                </Link>
                <p className="mt-1 text-sm text-gray-600">{city.tagline}</p>
              </li>
            ))}
          </ul>

          <h2 className="font-serif text-xl font-semibold text-ink mt-10 mb-3">
            By property type
          </h2>
          <ul className="space-y-4">
            {PROPERTY_TYPE_PAGES.map((type) => (
              <li
                key={type.slug}
                className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition"
              >
                <Link
                  href={`/shortlets/${type.slug}`}
                  className="font-serif text-lg font-semibold text-teal hover:underline"
                >
                  Verified {type.plural} in Nigeria
                </Link>
                <p className="mt-1 text-sm text-gray-600">{type.tagline}</p>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <Footer />
    </>
  );
}
