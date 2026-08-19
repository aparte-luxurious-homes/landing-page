import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { toJsonLd } from "@/lib/seo/jsonLd";
import { lodgingPropertySchema } from "@/lib/seo/schema";
import {
  fetchPropertyForSeo,
  fetchReviewsForSeo,
  heroImageOf,
} from "@/lib/seo/serverFetch";
import PropertyDetails from "@/views/PropertyDetails";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Property detail.
 *
 * The view itself stays client-rendered (RTK Query, Google Maps, the booking
 * sidebar), but title/description/OG and the LodgingBusiness JSON-LD are now
 * produced server-side. Previously these came from the client <Seo>
 * component, so they only existed after hydration — invisible to social
 * unfurlers and to any crawler that doesn't run JS, which is exactly the
 * audience that matters for a shared property link.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  // undefined = transient API failure (degrade to bare metadata);
  // null = property doesn't exist (the page component will 404).
  const property = await fetchPropertyForSeo(id).catch(() => undefined);
  if (!property) {
    return { title: "Property Details", robots: { index: false, follow: false } };
  }

  const location = [property.city, property.state].filter(Boolean).join(", ");
  const description =
    property.description?.trim()?.slice(0, 160) ||
    `Book ${property.name}${location ? ` in ${location}` : ""} on Aparte — verified luxury short-stay accommodation.`;
  const image = heroImageOf(property);
  const canonical = `/property-details/${property.id}`;

  return {
    title: property.name,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title: property.name,
      description,
      url: canonical,
      images: image ? [{ url: image, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: property.name,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  // Distinguish "doesn't exist" (null → real 404, closing the soft-200 hole
  // this route had) from "API hiccup" (throw → render without JSON-LD and let
  // the client view handle its own error state).
  const property = await fetchPropertyForSeo(id).catch(() => undefined);
  if (property === null) notFound();

  // Structured data is emitted in the server HTML so AI answer engines and
  // rich-result parsers see it without executing the app. Reviews ride along
  // so the Review/AggregateRating branches actually emit.
  const reviews = property ? await fetchReviewsForSeo(property.id) : [];
  const jsonLd = property
    ? lodgingPropertySchema(property, {
        canonicalPath: `/property-details/${property.id}`,
        reviews,
      })
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          // This payload carries owner-supplied text (property name and
          // description), so escaping is load-bearing, not ceremonial:
          // toJsonLd neutralises `</script>` breakout and the U+2028/U+2029
          // separators. Added by the A1 audit fix — see lib/seo/jsonLd.ts.
          dangerouslySetInnerHTML={{ __html: toJsonLd(jsonLd) }}
        />
      )}
      <PropertyDetails />
    </>
  );
}
