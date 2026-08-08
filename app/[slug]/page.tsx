import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Beacon from "@/components/links/Beacon";
import PropertyView from "@/components/links/PropertyView";
import { formatNaira, getProperty } from "@/lib/links/api";

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
  const description = [
    property.property_type,
    `${property.city}, ${property.state}`,
    priceFrom !== null ? `from ${formatNaira(priceFrom)} / night` : null,
    "Book direct on Aparte.",
  ]
    .filter(Boolean)
    .join(" · ");
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

  return (
    <>
      <Beacon page="property" target={property.slug} />
      <PropertyView property={property} bookHref={`/${property.slug}/book`} />
    </>
  );
}
