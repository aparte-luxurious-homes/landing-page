import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import Footer from "@/sections/Footer";
import Header from "@/sections/Header";
import { API_BASE } from "@/lib/links/api";
import { toJsonLd } from "@/lib/seo/jsonLd";
import {
  SHORTLET_CITIES,
  getShortletCity,
  type ShortletCity,
} from "@/lib/seo/cities";
import { breadcrumbSchema, faqPageSchema } from "@/lib/seo/schema";
import { absoluteUrl } from "@/lib/seo/config";

/**
 * City landing pages — /shortlets/lagos, /shortlets/abuja, …
 *
 * The indexable, linkable target for "shortlet in {city}" queries, which are
 * the platform's highest commercial intent. Query-param search can't serve
 * this role: its canonical collapses variants and deep filters are noindexed
 * by design. Everything here renders server-side — copy, listings, FAQs and
 * structured data are all in the raw HTML for non-JS crawlers and AI answer
 * engines.
 */

export const revalidate = 3600;
export const dynamicParams = false;

interface PageProps {
  params: Promise<{ city: string }>;
}

interface ListedProperty {
  id?: string;
  name?: string;
  city?: string | null;
  state?: string | null;
  property_type?: string | null;
  average_rating?: number;
  total_reviews?: number;
  media?: Array<{ media_url?: string; is_featured?: boolean }>;
  units?: Array<{ price_per_night?: number | string }>;
}

export function generateStaticParams() {
  return SHORTLET_CITIES.map((city) => ({ city: city.slug }));
}

async function fetchCityProperties(city: ShortletCity): Promise<ListedProperty[]> {
  try {
    const params = new URLSearchParams({
      limit: "8",
      is_verified: "true",
      ...city.apiParams,
    });
    const res = await fetch(`${API_BASE}/api/v1/properties?${params}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const body = await res.json();
    const rows = body?.data?.data?.data ?? body?.data?.data ?? [];
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

const heroOf = (p: ListedProperty): string | undefined => {
  const media = p.media ?? [];
  return (media.find((m) => m?.is_featured) ?? media[0])?.media_url;
};

const priceFromOf = (p: ListedProperty): number | null => {
  const prices = (p.units ?? [])
    .map((u) => parseFloat(String(u?.price_per_night)))
    .filter((n) => Number.isFinite(n) && n > 0);
  return prices.length ? Math.min(...prices) : null;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city: slug } = await params;
  const city = getShortletCity(slug);
  if (!city) return { title: "Shortlet apartments in Nigeria" };

  const title = `Shortlet Apartments in ${city.name}, Verified Serviced Stays`;
  const description = `Book verified shortlet apartments in ${city.name}, Nigeria. ${city.tagline} Real-time availability, NGN pricing, instant booking on Aparte.`;
  return {
    title,
    description,
    alternates: { canonical: `/shortlets/${slug}` },
    openGraph: {
      type: "website",
      title,
      description,
      url: `/shortlets/${slug}`,
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { city: slug } = await params;
  const city = getShortletCity(slug);
  if (!city) notFound();

  const properties = (await fetchCityProperties(city)).filter(
    (p) => p.id && p.name
  );

  const crumbs = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Shortlets", path: "/shortlets" },
    { name: city.name, path: `/shortlets/${slug}` },
  ]);
  const faqJsonLd = faqPageSchema(city.faqs);
  const itemList =
    properties.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `Shortlet apartments in ${city.name}`,
          numberOfItems: properties.length,
          itemListElement: properties.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: p.name,
            url: absoluteUrl(`/property-details/${p.id}`),
          })),
        }
      : null;

  const searchHref = `/search-results?location=${encodeURIComponent(city.name)}`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(crumbs) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLd(faqJsonLd) }}
        />
      )}
      {itemList && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLd(itemList) }}
        />
      )}

      <Header />
      {/* pb must stay >= the Footer's -mt-28 / lg:-mt-40 pull, or its
          angled wedge paints over the last block of content. */}
      <main className="bg-white pt-24 pb-32 lg:pb-48 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <nav className="mb-6 text-sm text-gray-500" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-teal">
              Home
            </Link>{" "}
            <span aria-hidden>›</span>{" "}
            <Link href="/shortlets" className="hover:text-teal">
              Shortlets
            </Link>{" "}
            <span aria-hidden>›</span> <span>{city.name}</span>
          </nav>

          <header className="mb-8 max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-wider text-teal mb-2">
              {city.state === city.name ? "Nigeria" : `${city.state}, Nigeria`}
            </p>
            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-ink leading-tight">
              Shortlet apartments in {city.name}
            </h1>
            <p className="mt-4 text-gray-700 leading-relaxed">{city.intro}</p>
          </header>

          <section className="mb-10" aria-label="Popular areas">
            <h2 className="font-serif text-xl font-semibold text-ink mb-3">
              Popular areas in {city.name}
            </h2>
            <ul className="flex flex-wrap gap-2">
              {city.areas.map((area) => (
                <li key={area}>
                  <Link
                    href={`/search-results?location=${encodeURIComponent(area)}`}
                    className="inline-block px-3 py-1.5 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    {area}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {properties.length > 0 && (
            <section className="mb-12" aria-label="Featured listings">
              <h2 className="font-serif text-xl font-semibold text-ink mb-4">
                Featured stays in {city.name}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {properties.map((p) => {
                  const hero = heroOf(p);
                  const priceFrom = priceFromOf(p);
                  return (
                    <Link
                      key={p.id}
                      href={`/property-details/${p.id}`}
                      className="group block rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition"
                    >
                      <span className="block aspect-[4/3] bg-gray-100 overflow-hidden">
                        {hero && (
                          // Plain <img>: listing hosts vary and an
                          // unconfigured next/image host throws at runtime.
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={hero}
                            alt={`${p.name} — shortlet apartment in ${city.name}`}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                        )}
                      </span>
                      <span className="block p-3">
                        <span className="block font-semibold text-ink text-sm truncate">
                          {p.name}
                        </span>
                        <span className="block text-xs text-gray-500 mt-0.5">
                          {[p.city, p.state].filter(Boolean).join(", ")}
                        </span>
                        {priceFrom != null && (
                          <span className="block text-sm text-teal font-semibold mt-1">
                            From ₦{Math.round(priceFrom).toLocaleString("en-NG")}
                            /night
                          </span>
                        )}
                      </span>
                    </Link>
                  );
                })}
              </div>
              <p className="mt-5">
                <Link
                  href={searchHref}
                  className="inline-block rounded-lg bg-teal px-4 py-2 text-white font-semibold hover:opacity-90"
                >
                  See all {city.name} apartments
                </Link>
              </p>
            </section>
          )}

          {properties.length === 0 && (
            <section className="mb-12">
              <p className="text-gray-600">
                New {city.name} listings are being verified.{" "}
                <Link href={searchHref} className="text-teal font-semibold hover:underline">
                  Search current availability
                </Link>{" "}
                or check back soon.
              </p>
            </section>
          )}

          <section className="mb-12 max-w-3xl" aria-label="Good to know">
            <h2 className="font-serif text-xl font-semibold text-ink mb-4">
              Good to know
            </h2>
            <dl className="space-y-5">
              {city.faqs.map((faq) => (
                <div key={faq.question}>
                  <dt className="font-semibold text-ink">{faq.question}</dt>
                  <dd className="mt-1 text-gray-700 leading-relaxed">
                    {faq.answer}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="max-w-3xl" aria-label="Other destinations">
            <h2 className="font-serif text-xl font-semibold text-ink mb-3">
              Other destinations
            </h2>
            <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {SHORTLET_CITIES.filter((c) => c.slug !== city.slug).map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/shortlets/${c.slug}`}
                    className="text-teal font-semibold hover:underline"
                  >
                    Shortlets in {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
