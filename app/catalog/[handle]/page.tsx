import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import Beacon from "@/components/links/Beacon";
import CoverBand from "@/components/links/catalog/CoverBand";
import FilterBar from "@/components/links/catalog/FilterBar";
import HostHeader from "@/components/links/catalog/HostHeader";
import MobileActionBar from "@/components/links/catalog/MobileActionBar";
import PropertyCard from "@/components/links/PropertyCard";
import Footer from "@/sections/Footer";
import Header from "@/sections/Header";
import { SITE_URL } from "@/config/env";
import { getCatalog } from "@/lib/links/api";
import { catalogHref, humaniseType } from "@/lib/links/catalogUrl";
import type { CatalogSort } from "@/lib/links/types";
import { toJsonLd } from "@/lib/seo/jsonLd";
import { catalogSchema } from "@/lib/seo/schema";

/**
 * A host's page — public URL is aparte.ng/@{handle}, rewritten here by
 * next.config.ts because Next cannot have an "@" folder segment.
 *
 * Server-rendered end to end. The listings, the facets and the host block
 * are in the HTML; the only JavaScript on the page is the view beacon, the
 * share button and a "Read more" on long bios. Most visits arrive from a
 * WhatsApp message on a phone, and this page is judged by how fast it shows
 * a photo there.
 */

interface PageProps {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ page?: string; city?: string; type?: string; sort?: string }>;
}

export const revalidate = 60;

const SORTS = new Set<CatalogSort>(["NEWEST", "PRICE_ASC", "PRICE_DESC", "RATING"]);

/** Clamp the URL state to something the API accepts. */
function queryFrom(raw: { page?: string; city?: string; type?: string; sort?: string }) {
  const n = Number.parseInt(raw.page ?? "1", 10);
  const sort = raw.sort && SORTS.has(raw.sort as CatalogSort) ? (raw.sort as CatalogSort) : undefined;
  return {
    page: Number.isFinite(n) && n > 0 ? n : 1,
    city: raw.city?.trim().slice(0, 60) || undefined,
    type: raw.type?.trim().slice(0, 40) || undefined,
    sort,
  };
}

function describe(catalog: NonNullable<Awaited<ReturnType<typeof getCatalog>>>): string {
  const areas = catalog.cities.slice(0, 3).map((c) => c.name);
  const count = catalog.stats.properties_listed;
  return [
    catalog.headline,
    `${count} verified short-let${count === 1 ? "" : "s"}${areas.length ? ` in ${areas.join(", ")}` : ""}`,
    "Book direct on Aparte. Payment is held until you check in.",
  ]
    .filter(Boolean)
    .join(" · ");
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const query = queryFrom(await searchParams);
  const catalog = await getCatalog(handle, query).catch(() => null);
  // notFound() here, not only in the page body: metadata resolves first and
  // the response shell streams with it, so a notFound() thrown later in the
  // body could no longer change the status — an unknown handle answered 200
  // with the not-found UI, and crawlers indexed the miss.
  if (!catalog) notFound();

  // A page with nothing on it is thin content, and every handle on the
  // platform is a live URL — without this the index fills with near-empty
  // profile pages that compete with the listings they were meant to feed.
  // Paged and filtered views are noindex'd too: they are the same profile,
  // and only the plain page-1 URL should ever be the search result.
  const isThin = catalog.stats.properties_listed === 0;
  const isVariant = query.page > 1 || Boolean(query.city || query.type || query.sort);
  const canonical = `/@${catalog.handle}`;
  const description = describe(catalog);

  return {
    title: catalog.display_name,
    description,
    alternates: { canonical },
    robots: isThin || isVariant ? { index: false, follow: true } : { index: true, follow: true },
    // og:image is supplied by ./opengraph-image.tsx — a composed card, not
    // the raw avatar, which unfurled as a stretched face at 1200×630.
    openGraph: {
      type: "profile",
      title: `${catalog.display_name} on Aparte`,
      description,
      url: canonical,
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function CatalogPage({ params, searchParams }: PageProps) {
  const { handle } = await params;
  const query = queryFrom(await searchParams);
  const catalog = await getCatalog(handle, query).catch(() => null);
  if (!catalog) notFound();

  const { total_pages: totalPages, page: currentPage } = catalog.pagination;
  const applied = catalog.filters_applied;
  const filtering = Boolean(applied.city || applied.property_type);
  const pageUrl = `${(SITE_URL || "https://aparte.ng").replace(/\/+$/, "")}/@${catalog.handle}`;

  // Pinned listings get their own row only on the unfiltered first page —
  // inside a filter they take their place in the grid like everything else.
  const showFeaturedRow = currentPage === 1 && !filtering && !applied.sort;
  const featured = showFeaturedRow ? catalog.properties.filter((c) => c.is_featured) : [];
  const rest = showFeaturedRow ? catalog.properties.filter((c) => !c.is_featured) : catalog.properties;

  const listingsTitle = filtering
    ? [
        applied.property_type ? humaniseType(applied.property_type) : "Places",
        applied.city ? `in ${applied.city}` : "",
      ]
        .filter(Boolean)
        .join(" ")
    : "Places to stay";

  return (
    <>
      <Header />
      {/*
        `pt-24` clears the fixed AppBar; `pb-32 lg:pb-48` must stay >= the
        Footer's own `-mt-28 / lg:-mt-40` pull or the footer's background
        rides up over the content. `min-h-screen` keeps a short page from
        letting the 586px footer swallow the viewport. Same contract as
        app/shortlets/page.tsx, which documents it.
      */}
      <main className="bg-white pt-24 pb-32 lg:pb-48 min-h-screen">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          {/* ProfilePage + ItemList: names the host as an entity and lets
              crawlers walk from the shared page to every listing. Host text
              is hardened by toJsonLd. */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: toJsonLd(
                catalogSchema({ ...catalog, total_properties: catalog.stats.properties_listed })
              ),
            }}
          />
          <Beacon page="catalog" target={catalog.handle} sharerCode={catalog.referral_code} />

          <CoverBand
            displayName={catalog.display_name}
            coverImage={catalog.cover_image}
            mosaic={catalog.cover_mosaic}
            profileImage={catalog.profile_image}
          />

          <HostHeader catalog={catalog} pageUrl={pageUrl} />

          <section className="mt-10" aria-labelledby="listings-heading">
            <div className="flex items-baseline justify-between gap-4">
              <h2 id="listings-heading" className="font-serif text-2xl font-semibold text-ink">
                {listingsTitle}
              </h2>
              {catalog.pagination.total > 0 && (
                <span className="text-sm text-neutral-500">
                  {catalog.pagination.total} {catalog.pagination.total === 1 ? "place" : "places"}
                </span>
              )}
            </div>

            <FilterBar handle={catalog.handle} catalog={catalog} />

            {featured.length > 0 && (
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5">
                {featured.map((card, i) => (
                  <PropertyCard
                    key={card.id}
                    card={card}
                    handle={catalog.handle}
                    referralCode={catalog.referral_code}
                    size="featured"
                    priority={i === 0}
                  />
                ))}
              </div>
            )}

            {rest.length > 0 ? (
              <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-5 ${featured.length ? "mt-5" : "mt-6"}`}>
                {rest.map((card, i) => (
                  // Keyed on id, not slug: slug is nullable, so two unslugged
                  // properties collided and React dropped one of them.
                  <PropertyCard
                    key={card.id}
                    card={card}
                    handle={catalog.handle}
                    referralCode={catalog.referral_code}
                    priority={!featured.length && i === 0}
                  />
                ))}
              </div>
            ) : featured.length === 0 ? (
              <div className="mt-6 rounded-2xl bg-neutral-50 px-6 py-10 text-center">
                {filtering ? (
                  <>
                    <p className="text-neutral-700">Nothing matches that filter yet.</p>
                    <Link
                      href={`/@${catalog.handle}`}
                      className="mt-3 inline-flex min-h-[44px] items-center font-semibold text-teal hover:underline"
                    >
                      Show every place
                    </Link>
                  </>
                ) : (
                  // Publication is on by default now, so an empty page almost
                  // always means the listings are still in verification.
                  <p className="text-neutral-600">
                    New places appear here once Aparte has verified them.
                  </p>
                )}
              </div>
            ) : null}
          </section>

          {/* The API caps a page at 24; without this, listing 25 onward was
              unreachable. */}
          {totalPages > 1 && (
            <nav aria-label="More places" className="mt-8 flex items-center justify-center gap-3 text-sm">
              {currentPage > 1 ? (
                <Link
                  href={catalogHref(catalog.handle, applied, { page: currentPage - 1 })}
                  rel="prev"
                  className="inline-flex min-h-[44px] items-center rounded-xl border border-neutral-300 px-4 font-medium text-neutral-700 hover:border-teal hover:text-teal"
                >
                  Previous
                </Link>
              ) : (
                <span className="inline-flex min-h-[44px] items-center rounded-xl border border-neutral-200 px-4 text-neutral-300">
                  Previous
                </span>
              )}
              <span className="text-neutral-500" aria-current="page">
                Page {currentPage} of {totalPages}
              </span>
              {currentPage < totalPages ? (
                <Link
                  href={catalogHref(catalog.handle, applied, { page: currentPage + 1 })}
                  rel="next"
                  className="inline-flex min-h-[44px] items-center rounded-xl border border-neutral-300 px-4 font-medium text-neutral-700 hover:border-teal hover:text-teal"
                >
                  Next
                </Link>
              ) : (
                <span className="inline-flex min-h-[44px] items-center rounded-xl border border-neutral-200 px-4 text-neutral-300">
                  Next
                </span>
              )}
            </nav>
          )}

          <p className="mt-10 text-center text-xs text-neutral-400">
            Every booking and payment on this page is processed by Aparte, not by{" "}
            {catalog.display_name} directly. Your caution fee is refundable.
          </p>
        </div>
      </main>
      <MobileActionBar
        displayName={catalog.display_name}
        whatsappUrl={catalog.whatsapp_url}
        pageUrl={pageUrl}
      />
      <Footer />
    </>
  );
}
