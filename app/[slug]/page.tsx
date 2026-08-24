import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Beacon from "@/components/links/Beacon";
import PropertyView from "@/components/links/PropertyView";
import { formatNgn, getProperty } from "@/lib/links/api";
import { toJsonLd } from "@/lib/seo/jsonLd";
import { lodgingPropertySchema } from "@/lib/seo/schema";

/**
 * Aparte Link property page — aparte.ng/{slug}.
 *
 * This is a root-level catch-all, but static segments always win in Next's
 * matcher, so /about, /help, /login etc. are unaffected. The backend's
 * reserved-slug list (services/links/reserved.py) additionally blocks anyone
 * from claiming those words as a property slug.
 *
 * Server-rendered on purpose: WhatsApp, Instagram and Facebook crawlers read
 * the initial HTML for OG tags, which is the entire point of a shareable link.
 */

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = await getProperty(slug).catch(() => null);
  if (!property) return { title: "Property not found" };

  const prices = property.units.map((u) => u.price_per_night).filter(Boolean);
  const priceFrom = prices.length ? Math.min(...prices) : null;

  // Shared-link meta template (api-v1/docs/seo-luxury-strip-spec.md, Task 5).
  // Every clause is a checkable fact, not an adjective: this string is the
  // whole preview a WhatsApp recipient sees before deciding to tap.
  //
  // The booking clause is derived rather than hardcoded to "Instant booking":
  // REQUEST_TO_BOOK listings need the host to approve first, so promising
  // instant booking on those would be the same defect as a luxury claim,
  // only more expensive because the guest finds out at checkout.
  const bookingClause =
    property.booking_mode === "REQUEST_TO_BOOK"
      ? "Request to book"
      : "Instant booking";
  const description = [
    `${property.name}, ${property.city}.`,
    priceFrom !== null
      ? `Verified listing, from ${formatNgn(priceFrom)}/night.`
      : "Verified listing.",
    `${bookingClause}, refundable caution fee, payment secured by Aparte.`,
  ].join(" ");
  const hero =
    property.media.find((m) => m.is_featured)?.media_url ??
    property.media[0]?.media_url;

  return {
    title: property.name,
    description,
    alternates: { canonical: `/${property.slug}` },
    openGraph: {
      type: "website",
      title: property.name,
      description,
      url: `/${property.slug}`,
      images: hero ? [{ url: hero, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: property.name,
      description,
      images: hero ? [hero] : undefined,
    },
  };
}

export default async function PropertyLinkPage({ params }: PageProps) {
  const { slug } = await params;
  const property = await getProperty(slug).catch(() => null);
  if (!property) notFound();

  // Same LodgingBusiness JSON-LD the /property-details route emits — this is
  // the most-shared surface on the platform and previously carried none.
  // Videos are filtered out of `media` so schema.org `image` stays images.
  const jsonLd = lodgingPropertySchema(
    { ...property, media: property.media.filter((m) => m.media_type !== "VIDEO") },
    { canonicalPath: `/${property.slug}` }
  );

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          // Owner-supplied text flows through toJsonLd, which neutralises
          // </script> breakout and U+2028/29 — same hardening as the
          // property-details route.
          dangerouslySetInnerHTML={{ __html: toJsonLd(jsonLd) }}
        />
      )}
      <Beacon page="property" target={property.slug} />
      <PropertyView property={property} bookHref={`/${property.slug}/book`} />
    </>
  );
}
