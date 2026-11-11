import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  Breadcrumb,
  EmptyState,
  JsonLdScripts,
  ListingGrid,
  PageShell,
} from "../../_components";
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
import {
  BEDROOM_PAGES,
  bedroomIntro,
  getBedroomPage,
  type BedroomPage,
} from "@/lib/seo/bedroomPages";
import { fetchListings, type ListingFetch } from "@/lib/seo/listingPages";
import { breadcrumbSchema, itemListSchema } from "@/lib/seo/schema";

/**
 * City-scoped long-tail pages, both kinds:
 *
 *   /shortlets/lekki/apartments   a property type in a city  (PROPERTY_TYPE_PAGES)
 *   /shortlets/lekki/2-bedroom    a bedroom size in a city   (BEDROOM_PAGES)
 *
 * One dynamic segment resolving against two vocabularies, for the same reason
 * the parent segment resolves cities and types: Next allows one dynamic
 * segment per level. The slug namespaces are asserted disjoint by a test.
 *
 * These are the highest-intent query shapes the platform has ("shortlet
 * apartments in Lekki", "2 bedroom shortlet in Lekki"). A bare type page
 * competes nationally; these compete for the search people actually run.
 *
 * The parent segment must be a city. `/shortlets/apartments/villas` is not a
 * thing, so a type in the first position 404s.
 *
 * Most combinations have no inventory, so `noindex` until stocked is doing
 * more work on this route than on any other. See `robotsFor`.
 */

export const revalidate = 3600;
export const dynamicParams = false;

interface PageProps {
  params: Promise<{ segment: string; facet: string }>;
}

export function generateStaticParams() {
  return SHORTLET_CITIES.flatMap((city) => [
    ...PROPERTY_TYPE_PAGES.map((type) => ({ segment: city.slug, facet: type.slug })),
    ...BEDROOM_PAGES.map((size) => ({ segment: city.slug, facet: size.slug })),
  ]);
}

const robotsFor = (total: number) =>
  total > 0 ? undefined : { index: false, follow: true };

type Match =
  | { kind: "type"; city: ShortletCity; type: PropertyTypePage }
  | { kind: "size"; city: ShortletCity; size: BedroomPage };

function resolve(segment: string, facet: string): Match | null {
  const city = getShortletCity(segment);
  if (!city) return null;
  const type = getPropertyTypePage(facet);
  if (type) return { kind: "type", city, type };
  const size = getBedroomPage(facet);
  if (size) return { kind: "size", city, size };
  return null;
}

/** API filters for a match: the city's own params plus the facet. */
const filtersFor = (m: Match): Record<string, string> =>
  m.kind === "type"
    ? { ...m.city.apiParams, property_type: m.type.value }
    : { ...m.city.apiParams, bedroom_count: String(m.size.count) };

const regionLine = (city: ShortletCity) =>
  city.state === city.name ? "Nigeria" : `${city.state}, Nigeria`;

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { segment, facet } = await params;
  const match = resolve(segment, facet);
  if (!match) return { title: "Shortlet apartments in Nigeria" };

  const { city } = match;
  const { total } = await fetchListings(filtersFor(match));
  const path = `/shortlets/${city.slug}/${facet}`;

  const title =
    match.kind === "type"
      ? `Verified ${match.type.plural} in ${city.name}`
      : `${match.size.label} shortlets in ${city.name}, verified`;
  const description =
    match.kind === "type"
      ? `Book verified ${match.type.plural} in ${city.name}, ${city.state}. ${match.type.tagline} Transparent NGN pricing, payment held until check-in.`
      : `Book verified shortlets in ${city.name} with ${match.size.words} or more bedrooms. Bedroom and guest counts listed per unit, transparent NGN pricing, payment held until check-in.`;

  return {
    title,
    description,
    robots: robotsFor(total),
    alternates: { canonical: path },
    openGraph: { type: "website", title, description, url: path },
  };
}

// ---------------------------------------------------------------------------
// Dispatch
// ---------------------------------------------------------------------------

export default async function Page({ params }: PageProps) {
  const { segment, facet } = await params;
  const match = resolve(segment, facet);
  if (!match) notFound();

  const listing = await fetchListings(filtersFor(match));
  return match.kind === "type" ? (
    <CityTypeView city={match.city} type={match.type} listing={listing} />
  ) : (
    <CitySizeView city={match.city} size={match.size} listing={listing} />
  );
}

// ---------------------------------------------------------------------------
// City x type
// ---------------------------------------------------------------------------

function CityTypeView({
  city,
  type,
  listing,
}: {
  city: ShortletCity;
  type: PropertyTypePage;
  listing: ListingFetch;
}) {
  const { properties, total } = listing;
  const searchHref =
    `/search-results?location=${encodeURIComponent(city.name)}` +
    `&property_type=${encodeURIComponent(type.value)}`;

  return (
    <>
      <JsonLdScripts
        blocks={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Shortlets", path: "/shortlets" },
            { name: city.name, path: `/shortlets/${city.slug}` },
            { name: type.name, path: `/shortlets/${city.slug}/${type.slug}` },
          ]),
          itemListSchema(`${type.name} listings in ${city.name}`, properties),
        ]}
      />

      <PageShell>
        <Breadcrumb
          trail={[
            { name: city.name, href: `/shortlets/${city.slug}` },
            { name: type.name },
          ]}
        />

        <header className="mb-8 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-wider text-teal mb-2">
            {regionLine(city)}
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-ink leading-tight">
            Verified {type.plural} in {city.name}
          </h1>
          <p className="mt-4 text-gray-700 leading-relaxed">{type.intro}</p>
        </header>

        {properties.length > 0 ? (
          <section className="mb-12" aria-label="Listings">
            <h2 className="font-serif text-xl font-semibold text-ink mb-4">
              {total === 1
                ? `1 verified listing in ${city.name}`
                : `${total} verified listings in ${city.name}`}
            </h2>
            <ListingGrid
              properties={properties}
              altSuffix={`${type.name} in ${city.name}`}
            />
            <p className="mt-5">
              <Link
                href={searchHref}
                className="inline-block rounded-lg bg-teal px-4 py-2 text-white font-semibold hover:opacity-90"
              >
                See all {type.plural} in {city.name}
              </Link>
            </p>
          </section>
        ) : (
          <EmptyState
            subject={`${type.plural} in ${city.name}`}
            searchHref={searchHref}
          />
        )}

        <section className="mb-12" aria-label="Other property types">
          <h2 className="font-serif text-xl font-semibold text-ink mb-3">
            Other property types in {city.name}
          </h2>
          <ul className="flex flex-wrap gap-2">
            {PROPERTY_TYPE_PAGES.filter((t) => t.slug !== type.slug).map((t) => (
              <li key={t.slug}>
                <Link
                  href={`/shortlets/${city.slug}/${t.slug}`}
                  className="inline-block px-3 py-1.5 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  {t.plural}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <SizeLinks city={city} />

        <section className="max-w-3xl" aria-label="Same type elsewhere">
          <h2 className="font-serif text-xl font-semibold text-ink mb-3">
            {type.name} in other cities
          </h2>
          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {SHORTLET_CITIES.filter((c) => c.slug !== city.slug).map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/shortlets/${c.slug}/${type.slug}`}
                  className="text-teal font-semibold hover:underline"
                >
                  {type.plural} in {c.name}
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
// City x bedroom size
// ---------------------------------------------------------------------------

function CitySizeView({
  city,
  size,
  listing,
}: {
  city: ShortletCity;
  size: BedroomPage;
  listing: ListingFetch;
}) {
  const { properties, total } = listing;
  // `bedrooms` is the search page's own URL param (utils/searchParams.ts), so
  // the hand-off lands with the "2+ bedrooms" filter already applied.
  const searchHref =
    `/search-results?location=${encodeURIComponent(city.name)}` +
    `&bedrooms=${size.count}`;
  const heading = `${size.label} shortlets in ${city.name}`;

  return (
    <>
      <JsonLdScripts
        blocks={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Shortlets", path: "/shortlets" },
            { name: city.name, path: `/shortlets/${city.slug}` },
            { name: size.label, path: `/shortlets/${city.slug}/${size.slug}` },
          ]),
          itemListSchema(heading, properties),
        ]}
      />

      <PageShell>
        <Breadcrumb
          trail={[
            { name: city.name, href: `/shortlets/${city.slug}` },
            { name: size.label },
          ]}
        />

        <header className="mb-8 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-wider text-teal mb-2">
            {regionLine(city)}
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-ink leading-tight">
            {heading.replace(/^./, (c) => c.toUpperCase())}
          </h1>
          <p className="mt-4 text-gray-700 leading-relaxed">
            {bedroomIntro(size, city.name)}
          </p>
        </header>

        {properties.length > 0 ? (
          <section className="mb-12" aria-label="Listings">
            <h2 className="font-serif text-xl font-semibold text-ink mb-4">
              {total === 1
                ? `1 verified listing in ${city.name}`
                : `${total} verified listings in ${city.name}`}
            </h2>
            <ListingGrid
              properties={properties}
              altSuffix={`${size.label} shortlet in ${city.name}`}
              minBedrooms={size.count}
            />
            <p className="mt-5">
              <Link
                href={searchHref}
                className="inline-block rounded-lg bg-teal px-4 py-2 text-white font-semibold hover:opacity-90"
              >
                See all {size.label} stays in {city.name}
              </Link>
            </p>
          </section>
        ) : (
          <EmptyState
            subject={`${size.label} listings in ${city.name}`}
            searchHref={searchHref}
          />
        )}

        <SizeLinks city={city} current={size.slug} />

        <section className="mb-12" aria-label="Property types">
          <h2 className="font-serif text-xl font-semibold text-ink mb-3">
            {city.name} by property type
          </h2>
          <ul className="flex flex-wrap gap-2">
            {PROPERTY_TYPE_PAGES.map((t) => (
              <li key={t.slug}>
                <Link
                  href={`/shortlets/${city.slug}/${t.slug}`}
                  className="inline-block px-3 py-1.5 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  {t.plural}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="max-w-3xl" aria-label="Same size elsewhere">
          <h2 className="font-serif text-xl font-semibold text-ink mb-3">
            {size.label} shortlets in other cities
          </h2>
          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {SHORTLET_CITIES.filter((c) => c.slug !== city.slug).map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/shortlets/${c.slug}/${size.slug}`}
                  className="text-teal font-semibold hover:underline"
                >
                  {size.label} in {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </PageShell>
    </>
  );
}

/** "Browse Lekki by size" — every bedroom page for a city, minus the current. */
function SizeLinks({ city, current }: { city: ShortletCity; current?: string }) {
  const sizes = BEDROOM_PAGES.filter((b) => b.slug !== current);
  return (
    <section className="mb-12" aria-label="Bedroom sizes">
      <h2 className="font-serif text-xl font-semibold text-ink mb-3">
        {current ? `Other sizes in ${city.name}` : `${city.name} by number of bedrooms`}
      </h2>
      <ul className="flex flex-wrap gap-2">
        {sizes.map((b) => (
          <li key={b.slug}>
            <Link
              href={`/shortlets/${city.slug}/${b.slug}`}
              className="inline-block px-3 py-1.5 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              {b.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
