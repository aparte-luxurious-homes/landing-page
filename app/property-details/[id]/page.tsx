import type { Metadata } from "next";

import { toJsonLd } from "@/lib/seo/jsonLd";
import { lodgingPropertySchema } from "@/lib/seo/schema";
import { fetchPropertyForSeo, heroImageOf } from "@/lib/seo/serverFetch";
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
  const property = await fetchPropertyForSeo(id);
  if (!property) {
    return { title: "Property Details" };
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
  const property = await fetchPropertyForSeo(id);

  // Structured data is emitted in the server HTML so AI answer engines and
  // rich-result parsers see it without executing the app.
  const jsonLd = property
    ? lodgingPropertySchema(property, {
        canonicalPath: `/property-details/${property.id}`,
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
