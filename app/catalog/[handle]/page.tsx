import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import Beacon from "@/components/links/Beacon";
import Footer from "@/sections/Footer";
import Header from "@/sections/Header";
import PropertyCard from "@/components/links/PropertyCard";
import { getCatalog } from "@/lib/links/api";
import { toJsonLd } from "@/lib/seo/jsonLd";
import { catalogSchema } from "@/lib/seo/schema";

/**
 * Agent/owner catalog — public URL is aparte.ng/@{handle}, rewritten here by
 * next.config.ts because Next cannot have an "@" folder segment.
 */

interface PageProps {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ page?: string }>;
}

export const revalidate = 60;

/** Clamp a ?page= value to something sane before it reaches the API. */
function pageFrom(raw: string | undefined): number {
  const n = Number.parseInt(raw ?? "1", 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const page = pageFrom((await searchParams).page);
  const catalog = await getCatalog(handle, page).catch(() => null);
  if (!catalog) return { title: "Catalog not found" };

  const areas = [
    ...new Set(catalog.properties.map((p) => p.city).filter(Boolean)),
  ].slice(0, 3);
  const description = [
    catalog.headline,
    `${catalog.stats.properties_listed} verified short-let${
      catalog.stats.properties_listed === 1 ? "" : "s"
    }${areas.length ? ` in ${areas.join(", ")}` : ""}`,
    "Book direct on Aparte.",
  ]
    .filter(Boolean)
    .join(" · ");

  // A catalog with nothing on it is thin content, and every handle on the
  // platform is a live URL — without this the index fills with near-empty
  // profile pages that compete with the listings they were meant to feed.
  // Paged views are noindex'd too: page 2 is the same profile, and only page 1
  // should ever be the search result.
  const isThin = catalog.stats.properties_listed === 0;
  const canonical = `/@${catalog.handle}`;

  return {
    title: catalog.display_name,
    description,
    alternates: { canonical },
    robots:
      isThin || page > 1
        ? { index: false, follow: true }
        : { index: true, follow: true },
    openGraph: {
      type: "profile",
      title: `${catalog.display_name} on Aparte`,
      description,
      url: canonical,
      images: catalog.profile_image ? [{ url: catalog.profile_image }] : undefined,
    },
    // large_image, not summary: this page leads with listings, and a summary
    // card renders the avatar as a thumbnail nobody can read.
    twitter: { card: "summary_large_image" },
  };
}

export default async function CatalogPage({ params, searchParams }: PageProps) {
  const { handle } = await params;
  const page = pageFrom((await searchParams).page);
  const catalog = await getCatalog(handle, page).catch(() => null);
  if (!catalog) notFound();

  const { total_pages: totalPages, page: currentPage } = catalog.pagination;
  const pageHref = (n: number) => (n <= 1 ? `/@${handle}` : `/@${handle}?page=${n}`);

  return (
    <>
      <Header />
      {/*
        `pt-24` clears the fixed AppBar; `pb-32 lg:pb-48` must stay >= the
        Footer's own `-mt-28 / lg:-mt-40` pull or the footer's background
        rides up over the content — which is exactly what happened when this
        page wrapped its content in a bare div. `min-h-screen` keeps a short
        catalog from letting the 586px footer swallow the viewport.
        Same contract as app/shortlets/page.tsx, which documents it.
      */}
      <main className="bg-white pt-24 pb-32 lg:pb-48 min-h-screen">
        {/* max-w-3xl matches the rest of the site; this was max-w-5xl, which
            only looked right while the page had no chrome to be measured
            against. */}
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
          {/* ProfilePage + ItemList: names the agent/owner as an entity and
              lets crawlers walk from the shared catalog to every listing.
              Sharer text is hardened by toJsonLd. */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: toJsonLd(
                catalogSchema({ ...catalog, total_properties: catalog.stats.properties_listed })
              ),
            }}
          />
          <Beacon
            page="catalog"
            target={catalog.handle}
            sharerCode={catalog.referral_code}
          />

          <section className="flex items-start gap-4">
            <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-neutral-200">
              {catalog.profile_image && (
                <Image
                  src={catalog.profile_image}
                  alt={catalog.display_name}
                  fill
                  priority
                  sizes="80px"
                  className="object-cover"
                />
              )}
            </span>
            <div className="min-w-0">
              {/* Badges sit OUTSIDE the h1. Inside it, a screen reader
                  announced the page heading as "Ada Obi ✓ Verified silver". */}
              <h1 className="text-2xl font-bold leading-tight">
                {catalog.display_name}
              </h1>

              {/* Only the positive is stated. This is the page an agent sends
                  to win business; rendering "identity verification pending"
                  on it published an accusation about them to their own
                  prospects. Absence says the same thing without the sentence.
                  The agent tier badge is gone for a related reason: "silver"
                  is internal network standing, and a guest reads it as a
                  rating of the property. */}
              {catalog.is_verified && (
                <span
                  className="mt-1 inline-flex items-center gap-1 rounded-full bg-teal/10 px-2 py-0.5 text-xs font-semibold text-teal"
                  title="Aparte has confirmed this host's identity"
                >
                  <span aria-hidden>✓</span> Verified
                </span>
              )}

              {catalog.headline && (
                <p className="mt-1 text-neutral-600">{catalog.headline}</p>
              )}
              <p className="mt-1 text-sm text-neutral-500">
                {catalog.stats.properties_listed} listing
                {catalog.stats.properties_listed === 1 ? "" : "s"}
                {catalog.stats.review_count > 0 &&
                  ` · ★ ${catalog.stats.average_rating.toFixed(1)} (${catalog.stats.review_count})`}
                {catalog.member_since && ` · on Aparte since ${catalog.member_since}`}
              </p>
              {catalog.whatsapp_url && (
                <a
                  href={catalog.whatsapp_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block rounded-lg border border-teal px-3 py-1.5 text-sm font-medium text-teal hover:bg-teal/5"
                >
                  Chat on WhatsApp
                </a>
              )}
            </div>
          </section>

          {catalog.bio && (
            <p className="mt-4 whitespace-pre-line text-sm text-neutral-700">
              {catalog.bio}
            </p>
          )}

          <section className="mt-8">
            {catalog.properties.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {catalog.properties.map((card) => (
                  // Keyed on id, not slug: slug is nullable, so two unslugged
                  // properties collided and React dropped one of them.
                  <PropertyCard key={card.id} card={card} handle={catalog.handle} />
                ))}
              </div>
            ) : (
              <p className="rounded-xl bg-neutral-50 px-4 py-8 text-center text-neutral-500">
                {/* "No published listings" was the old cause. Publication is on
                    by default now, so an empty page almost always means the
                    listings are still in verification. */}
                No listings to show yet — new places appear here once they&apos;ve
                been verified.
              </p>
            )}
          </section>

          {/* Pagination. The API caps a page at 24 and returns total_pages;
              nothing rendered it, so listing 25 onward was unreachable — no
              link, no control, no indication more existed. That was survivable
              only while every catalog was empty. */}
          {totalPages > 1 && (
            <nav
              aria-label="Catalog pages"
              className="mt-8 flex items-center justify-center gap-3 text-sm"
            >
              {currentPage > 1 ? (
                <Link
                  href={pageHref(currentPage - 1)}
                  rel="prev"
                  className="rounded-lg border border-neutral-300 px-3 py-1.5 font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  ← Previous
                </Link>
              ) : (
                <span className="rounded-lg border border-neutral-200 px-3 py-1.5 text-neutral-300">
                  ← Previous
                </span>
              )}
              <span className="text-neutral-500" aria-current="page">
                Page {currentPage} of {totalPages}
              </span>
              {currentPage < totalPages ? (
                <Link
                  href={pageHref(currentPage + 1)}
                  rel="next"
                  className="rounded-lg border border-neutral-300 px-3 py-1.5 font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Next →
                </Link>
              ) : (
                <span className="rounded-lg border border-neutral-200 px-3 py-1.5 text-neutral-300">
                  Next →
                </span>
              )}
            </nav>
          )}

          <p className="mt-8 text-center text-xs text-neutral-400">
            All bookings and payments on these pages are processed securely by
            Aparte, not by {catalog.display_name} directly.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
