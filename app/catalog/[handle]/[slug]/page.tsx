import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Beacon from "@/components/links/Beacon";
import PropertyView from "@/components/links/PropertyView";
import { getPropertyInCatalogContext } from "@/lib/links/api";

/**
 * Property viewed through someone's catalog link — aparte.ng/@{handle}/{slug}.
 *
 * Same content as the plain property page plus a "shared by" strip; the
 * sharer's referral code is seeded into the session by the beacon. The API
 * resolves this even when the sharer has no relationship to the property,
 * which is deliberate (spec §6.1.4c): sharing other people's inventory is how
 * referral credit gets earned on new guests.
 */

interface PageProps {
  params: Promise<{ handle: string; slug: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle, slug } = await params;
  const property = await getPropertyInCatalogContext(handle, slug).catch(
    () => null
  );
  if (!property) return { title: "Property not found" };

  const hero =
    property.media.find((m) => m.is_featured)?.media_url ??
    property.media[0]?.media_url;
  // Same trust template as the plain /{slug} page, with the sharer attribution
  // kept: this variant exists so a host's share gets credited.
  const bookingClause =
    property.booking_mode === "REQUEST_TO_BOOK"
      ? "Request to book"
      : "Instant booking";
  const description =
    `${property.name}, ${property.city}. Verified listing, shared by ` +
    `${property.shared_by?.display_name ?? "an Aparte host"}. ` +
    `${bookingClause}, refundable caution fee, payment secured by Aparte.`;

  return {
    title: property.name,
    description,
    // Canonical points at the plain property URL: the catalog context is an
    // attribution variant, not separate content.
    alternates: { canonical: `/${property.slug}` },
    openGraph: {
      type: "website",
      title: property.name,
      description,
      images: hero ? [{ url: hero, width: 1200, height: 630 }] : undefined,
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function CatalogPropertyPage({ params }: PageProps) {
  const { handle, slug } = await params;
  const property = await getPropertyInCatalogContext(handle, slug).catch(
    () => null
  );
  if (!property) notFound();

  return (
    <>
      <Beacon
        page="property"
        target={property.slug}
        sharerCode={property.shared_by?.referral_code}
      />
      <PropertyView property={property} bookHref={`/${property.slug}/book`} />
    </>
  );
}
