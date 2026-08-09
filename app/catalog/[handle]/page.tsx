import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import Beacon from "@/components/links/Beacon";
import PropertyCard from "@/components/links/PropertyCard";
import { getCatalog } from "@/lib/links/api";

/**
 * Agent/owner catalog — public URL is aparte.ng/@{handle}, rewritten here by
 * next.config.ts because Next cannot have an "@" folder segment.
 */

interface PageProps {
  params: Promise<{ handle: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const catalog = await getCatalog(handle).catch(() => null);
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

  return {
    title: catalog.display_name,
    description,
    alternates: { canonical: `/@${catalog.handle}` },
    openGraph: {
      type: "profile",
      title: `${catalog.display_name} — Aparte`,
      description,
      url: `/@${catalog.handle}`,
      images: catalog.profile_image ? [{ url: catalog.profile_image }] : undefined,
    },
    twitter: { card: "summary" },
  };
}

export default async function CatalogPage({ params }: PageProps) {
  const { handle } = await params;
  const catalog = await getCatalog(handle).catch(() => null);
  if (!catalog) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
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
          <h1 className="flex flex-wrap items-center gap-2 text-2xl font-bold leading-tight">
            {catalog.display_name}
            {catalog.is_verified ? (
              <span
                className="rounded-full bg-teal/10 px-2 py-0.5 text-xs font-semibold text-teal"
                title="KYC verified"
              >
                ✓ Verified
              </span>
            ) : (
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">
                Identity verification pending
              </span>
            )}
            {catalog.tier && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold capitalize text-neutral-700">
                {catalog.tier.toLowerCase()}
              </span>
            )}
          </h1>
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {catalog.properties.map((card) => (
              <PropertyCard key={card.slug} card={card} handle={catalog.handle} />
            ))}
          </div>
        ) : (
          <p className="rounded-xl bg-neutral-50 px-4 py-8 text-center text-neutral-500">
            No published listings yet — check back soon.
          </p>
        )}
      </section>

      <p className="mt-8 text-center text-xs text-neutral-400">
        All bookings and payments on these pages are processed securely by
        Aparte, not by {catalog.display_name} directly.
      </p>
    </div>
  );
}
