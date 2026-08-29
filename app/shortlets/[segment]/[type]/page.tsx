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
import { SHORTLET_CITIES, getShortletCity } from "@/lib/seo/cities";
import {
  PROPERTY_TYPE_PAGES,
  getPropertyTypePage,
} from "@/lib/seo/propertyTypePages";
import { fetchListings } from "@/lib/seo/listingPages";
import { breadcrumbSchema, itemListSchema } from "@/lib/seo/schema";

/**
 * City x type landing pages — /shortlets/lekki/apartments.
 *
 * The highest-intent query shape the platform has ("shortlet apartments in
 * Lekki") and the reason the type pages exist at all: a bare type page
 * competes nationally, this one competes for the search people actually run.
 *
 * The parent segment must be a city here. `/shortlets/apartments/villas` is
 * not a thing, so a type in the first position 404s.
 *
 * Most of these combinations have no inventory — seven cities times seven
 * types, against four types that exist at all — so `noindex` until stocked is
 * doing more work on this route than on any other. See `robotsFor`.
 */

export const revalidate = 3600;
export const dynamicParams = false;

interface PageProps {
  params: Promise<{ segment: string; type: string }>;
}

export function generateStaticParams() {
  return SHORTLET_CITIES.flatMap((city) =>
    PROPERTY_TYPE_PAGES.map((type) => ({
      segment: city.slug,
      type: type.slug,
    }))
  );
}

const robotsFor = (total: number) =>
  total > 0 ? undefined : { index: false, follow: true };

function resolve(segment: string, typeSlug: string) {
  const city = getShortletCity(segment);
  const type = getPropertyTypePage(typeSlug);
  return city && type ? { city, type } : null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { segment, type: typeSlug } = await params;
  const match = resolve(segment, typeSlug);
  if (!match) return { title: "Shortlet apartments in Nigeria" };
  const { city, type } = match;

  const { total } = await fetchListings({
    ...city.apiParams,
    property_type: type.value,
  });

  const title = `Verified ${type.plural} in ${city.name}`;
  const description = `Book verified ${type.plural} in ${city.name}, ${city.state}. ${type.tagline} Transparent NGN pricing, payment held until check-in.`;

  return {
    title,
    description,
    robots: robotsFor(total),
    alternates: { canonical: `/shortlets/${city.slug}/${type.slug}` },
    openGraph: {
      type: "website",
      title,
      description,
      url: `/shortlets/${city.slug}/${type.slug}`,
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { segment, type: typeSlug } = await params;
  const match = resolve(segment, typeSlug);
  if (!match) notFound();
  const { city, type } = match;

  const { properties, total } = await fetchListings({
    ...city.apiParams,
    property_type: type.value,
  });

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
            {city.state === city.name ? "Nigeria" : `${city.state}, Nigeria`}
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
