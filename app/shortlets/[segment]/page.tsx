import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  Breadcrumb,
  EmptyState,
  FaqList,
  JsonLdScripts,
  ListingGrid,
  PageShell,
} from "../_components";
import {
  SHORTLET_CITIES,
  getShortletCity,
  type ShortletCity,
} from "@/lib/seo/cities";
import {
  PROPERTY_TYPE_PAGES,
  getPropertyTypePage,
  type PropertyTypePage,
} from "@/lib/seo/propertyTypePages";
import { fetchListings, type ListingFetch } from "@/lib/seo/listingPages";
import {
  PROPERTY_TYPE_TO_SCHEMA,
  breadcrumbSchema,
  faqPageSchema,
  itemListSchema,
} from "@/lib/seo/schema";

/**
 * Landing pages under /shortlets — both kinds.
 *
 *   /shortlets/lagos        a city      (SHORTLET_CITIES)
 *   /shortlets/apartments   a type      (PROPERTY_TYPE_PAGES)
 *
 * One dynamic segment resolving against two vocabularies, rather than two
 * sibling dynamic segments — Next allows only one per level, and nesting types
 * under a literal (/shortlets/type/apartments) buys nothing but a longer URL.
 * The slug namespaces are asserted disjoint by a test; a future city called
 * "Villas" would otherwise silently shadow a type page.
 *
 * These are the indexable, linkable targets for "shortlet apartments in Lagos"
 * style queries. Query-param search cannot serve that role: its canonical
 * collapses filter variants and deep filters are noindexed by design.
 * Everything renders server-side, so the copy, listings, FAQs and structured
 * data are all in the raw HTML for non-JS crawlers and AI answer engines.
 */

export const revalidate = 3600;
export const dynamicParams = false;

interface PageProps {
  params: Promise<{ segment: string }>;
}

export function generateStaticParams() {
  return [
    ...SHORTLET_CITIES.map((city) => ({ segment: city.slug })),
    ...PROPERTY_TYPE_PAGES.map((type) => ({ segment: type.slug })),
  ];
}

/**
 * `noindex` while a page has nothing to show.
 *
 * Only four of the seven property types have any inventory, and a page whose
 * body is an empty state is thin content. It flips back to indexable on its
 * own once stock appears, because `revalidate` re-runs this — which is why
 * this is a noindex rather than a 404 from generateStaticParams. A 404 that
 * later becomes a 200 is a worse signal to a crawler than a page that was
 * always reachable and simply asked not to be listed yet.
 */
const robotsFor = (total: number) =>
  total > 0 ? undefined : { index: false, follow: true };

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { segment } = await params;

  const city = getShortletCity(segment);
  if (city) {
    const { total } = await fetchListings({ ...city.apiParams });
    const title = `Shortlet Apartments in ${city.name}, Verified Serviced Stays`;
    const description = `Book verified shortlet apartments in ${city.name}, Nigeria. ${city.tagline} Real-time availability, NGN pricing, instant booking on Aparte.`;
    return {
      title,
      description,
      robots: robotsFor(total),
      alternates: { canonical: `/shortlets/${segment}` },
      openGraph: { type: "website", title, description, url: `/shortlets/${segment}` },
    };
  }

  const type = getPropertyTypePage(segment);
  if (type) {
    const { total } = await fetchListings({ property_type: type.value });
    const title = `Verified ${type.name} Short-Lets in Nigeria`;
    const description = `Book verified ${type.plural} across Nigeria. ${type.tagline} Transparent NGN pricing, payment held until check-in.`;
    return {
      title,
      description,
      robots: robotsFor(total),
      alternates: { canonical: `/shortlets/${segment}` },
      openGraph: { type: "website", title, description, url: `/shortlets/${segment}` },
    };
  }

  return { title: "Shortlet apartments in Nigeria" };
}

// ---------------------------------------------------------------------------
// Dispatch
// ---------------------------------------------------------------------------

export default async function Page({ params }: PageProps) {
  const { segment } = await params;

  const city = getShortletCity(segment);
  if (city) return <CityView city={city} listing={await fetchListings({ ...city.apiParams })} />;

  const type = getPropertyTypePage(segment);
  if (type) {
    return (
      <TypeView type={type} listing={await fetchListings({ property_type: type.value })} />
    );
  }

  notFound();
}

// ---------------------------------------------------------------------------
// City
// ---------------------------------------------------------------------------

function CityView({ city, listing }: { city: ShortletCity; listing: ListingFetch }) {
  const { properties } = listing;
  const searchHref = `/search-results?location=${encodeURIComponent(city.name)}`;

  return (
    <>
      <JsonLdScripts
        blocks={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Shortlets", path: "/shortlets" },
            { name: city.name, path: `/shortlets/${city.slug}` },
          ]),
          faqPageSchema(city.faqs),
          itemListSchema(`Shortlet apartments in ${city.name}`, properties),
        ]}
      />

      <PageShell>
        <Breadcrumb trail={[{ name: city.name }]} />

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

        {properties.length > 0 ? (
          <section className="mb-12" aria-label="Featured listings">
            <h2 className="font-serif text-xl font-semibold text-ink mb-4">
              Featured stays in {city.name}
            </h2>
            <ListingGrid
              properties={properties}
              altSuffix={`shortlet apartment in ${city.name}`}
            />
            <p className="mt-5">
              <Link
                href={searchHref}
                className="inline-block rounded-lg bg-teal px-4 py-2 text-white font-semibold hover:opacity-90"
              >
                See all {city.name} apartments
              </Link>
            </p>
          </section>
        ) : (
          <EmptyState subject={`${city.name} listings`} searchHref={searchHref} />
        )}

        {/* Every type, scoped to this city — the long-tail pages, linked from
            the place they are most relevant to. */}
        <section className="mb-12" aria-label="Property types">
          <h2 className="font-serif text-xl font-semibold text-ink mb-3">
            Browse {city.name} by property type
          </h2>
          <ul className="flex flex-wrap gap-2">
            {PROPERTY_TYPE_PAGES.map((type) => (
              <li key={type.slug}>
                <Link
                  href={`/shortlets/${city.slug}/${type.slug}`}
                  className="inline-block px-3 py-1.5 rounded-full text-sm font-semibold bg-teal-soft text-teal hover:opacity-80"
                >
                  {type.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <FaqList faqs={city.faqs} />

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
      </PageShell>
    </>
  );
}

// ---------------------------------------------------------------------------
// Type
// ---------------------------------------------------------------------------

function TypeView({ type, listing }: { type: PropertyTypePage; listing: ListingFetch }) {
  const { properties, total } = listing;
  const searchHref = `/search-results?property_type=${encodeURIComponent(type.value)}`;

  const collection = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Verified ${type.plural} in Nigeria`,
    description: type.tagline,
    about: {
      "@type": PROPERTY_TYPE_TO_SCHEMA[type.value.toLowerCase()] ?? "LodgingBusiness",
      name: type.name,
    },
  };

  return (
    <>
      <JsonLdScripts
        blocks={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Shortlets", path: "/shortlets" },
            { name: type.name, path: `/shortlets/${type.slug}` },
          ]),
          collection,
          faqPageSchema(type.faqs),
          itemListSchema(`Verified ${type.plural} in Nigeria`, properties),
        ]}
      />

      <PageShell>
        <Breadcrumb trail={[{ name: type.name }]} />

        <header className="mb-8 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-wider text-teal mb-2">
            Nigeria
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-ink leading-tight">
            Verified {type.plural} in Nigeria
          </h1>
          <p className="mt-4 text-gray-700 leading-relaxed">{type.intro}</p>
        </header>

        {properties.length > 0 ? (
          <section className="mb-12" aria-label="Listings">
            <h2 className="font-serif text-xl font-semibold text-ink mb-4">
              {total === 1 ? "1 verified listing" : `${total} verified listings`}
            </h2>
            <ListingGrid properties={properties} altSuffix={`${type.name} on Aparte`} />
            <p className="mt-5">
              <Link
                href={searchHref}
                className="inline-block rounded-lg bg-teal px-4 py-2 text-white font-semibold hover:opacity-90"
              >
                See all {type.plural}
              </Link>
            </p>
          </section>
        ) : (
          <EmptyState subject={type.plural} searchHref={searchHref} />
        )}

        <section className="mb-12" aria-label="Cities">
          <h2 className="font-serif text-xl font-semibold text-ink mb-3">
            {type.name} by city
          </h2>
          <ul className="flex flex-wrap gap-2">
            {SHORTLET_CITIES.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/shortlets/${c.slug}/${type.slug}`}
                  className="inline-block px-3 py-1.5 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  {type.plural} in {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <FaqList faqs={type.faqs} />

        <section className="max-w-3xl" aria-label="Other property types">
          <h2 className="font-serif text-xl font-semibold text-ink mb-3">
            Other property types
          </h2>
          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {PROPERTY_TYPE_PAGES.filter((t) => t.slug !== type.slug).map((t) => (
              <li key={t.slug}>
                <Link
                  href={`/shortlets/${t.slug}`}
                  className="text-teal font-semibold hover:underline"
                >
                  Verified {t.plural}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </PageShell>
    </>
  );
}
