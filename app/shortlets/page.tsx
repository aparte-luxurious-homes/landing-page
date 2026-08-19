import type { Metadata } from "next";
import Link from "next/link";

import Footer from "@/sections/Footer";
import Header from "@/sections/Header";
import { SHORTLET_CITIES } from "@/lib/seo/cities";
import { toJsonLd } from "@/lib/seo/jsonLd";
import { breadcrumbSchema } from "@/lib/seo/schema";

/** Hub linking every city landing page — one crawlable index for the set. */

export const metadata: Metadata = {
  title: "Shortlet Apartments in Nigeria — by City",
  description:
    "Verified luxury shortlet apartments across Nigeria: Lagos, Lekki, " +
    "Victoria Island, Ikoyi, Ikeja, Abuja and Port Harcourt. Real-time " +
    "availability, Naira pricing, instant booking on Aparte.",
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
      <main className="bg-white pt-24 pb-32 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <header className="mb-8">
            <p className="text-xs font-bold uppercase tracking-wider text-teal mb-2">
              Destinations
            </p>
            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-ink leading-tight">
              Shortlet apartments across Nigeria
            </h1>
            <p className="mt-4 text-gray-700 leading-relaxed">
              Aparte verifies every listing before it goes live — browse
              luxury short-stay apartments, homes and hotels by city, with
              real-time availability and pricing in Naira.
            </p>
          </header>
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
        </div>
      </main>
      <Footer />
    </>
  );
}
