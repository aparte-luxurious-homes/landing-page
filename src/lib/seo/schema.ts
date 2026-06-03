/**
 * Schema.org JSON-LD builders. Pure functions returning plain objects to feed
 * into <Seo jsonLd={...}>. Inputs are loosely typed because the RTK Query
 * property/review shapes use `any[]` for media/reviews — every accessor here is
 * defensive.
 *
 * NOTE: client-injected JSON-LD only reaches JS-rendering crawlers (Google's
 * renderer) until Phase 2 serves it in raw HTML for AI/social bots.
 */
import {
  SITE_URL,
  SITE_NAME,
  SITE_LEGAL_NAME,
  SITE_DESCRIPTION,
  ORG_LOGO_URL,
  SUPPORT_EMAIL,
  SOCIAL_LINKS,
  absoluteUrl,
} from './config';

type JsonLd = Record<string, unknown>;

/** Map the platform's property_type enum to the closest Schema.org type. */
const PROPERTY_TYPE_TO_SCHEMA: Record<string, string> = {
  apartment: 'Apartment',
  duplex: 'House',
  bungalow: 'House',
  villa: 'House',
  hotel: 'Hotel',
  others: 'LodgingBusiness',
};

const mediaUrls = (media: unknown): string[] => {
  if (!Array.isArray(media)) return [];
  return media
    .map((m) =>
      typeof m === 'string'
        ? m
        : m?.fileUrl || m?.mediaUrl || m?.media_url || m?.url || null,
    )
    .filter((u): u is string => Boolean(u));
};

const amenityNames = (amenities: unknown): string[] => {
  if (!Array.isArray(amenities)) return [];
  return amenities
    .map((a) => a?.amenity?.name || a?.name || null)
    .filter((n): n is string => Boolean(n));
};

const minNightlyPrice = (units: unknown): number | null => {
  if (!Array.isArray(units) || units.length === 0) return null;
  const prices = units
    .map((u) => parseFloat(u?.price_per_night))
    .filter((n) => Number.isFinite(n) && n > 0);
  return prices.length ? Math.min(...prices) : null;
};

/** Organization node — emit once (home). Referenced by @id elsewhere. */
export function organizationSchema(): JsonLd {
  const node: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_LEGAL_NAME,
    alternateName: SITE_NAME,
    url: SITE_URL,
    logo: ORG_LOGO_URL,
    email: SUPPORT_EMAIL,
    description: SITE_DESCRIPTION,
    areaServed: { '@type': 'Country', name: 'Nigeria' },
  };
  if (SOCIAL_LINKS.length) node.sameAs = SOCIAL_LINKS;
  return node;
}

/** WebSite node with a SearchAction pointing at the query-param search page. */
export function websiteSchema(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    publisher: { '@id': `${SITE_URL}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search-results?location={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/** BreadcrumbList from an ordered list of crumbs. */
export function breadcrumbSchema(
  items: { name: string; path?: string }[],
): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      ...(it.path ? { item: absoluteUrl(it.path) } : {}),
    })),
  };
}

/** FAQPage from question/answer pairs. Returns null when empty. */
export function faqPageSchema(
  faqs: { question: string; answer: string }[],
): JsonLd | null {
  if (!faqs?.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

/**
 * LodgingBusiness/Apartment/House/Hotel for a property page.
 * Respects location_visibility: APPROXIMATE listings omit streetAddress + geo.
 * Omits AggregateRating entirely when there are no reviews.
 */
export function lodgingPropertySchema(
  property: any,
  opts: { canonicalPath: string; reviews?: any[] },
): JsonLd | null {
  if (!property?.name) return null;

  const url = absoluteUrl(opts.canonicalPath);
  const schemaType =
    PROPERTY_TYPE_TO_SCHEMA[String(property.property_type || '').toLowerCase()] ||
    'LodgingBusiness';
  const isApproximate = property.location_visibility === 'APPROXIMATE';
  const images = mediaUrls(property.media);
  const amenities = amenityNames(property.amenities);
  const minPrice = minNightlyPrice(property.units);

  const address: JsonLd = {
    '@type': 'PostalAddress',
    addressCountry: 'NG',
  };
  if (property.city) address.addressLocality = property.city;
  if (property.state) address.addressRegion = property.state;
  if (!isApproximate && property.address) address.streetAddress = property.address;

  const node: JsonLd = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    '@id': `${url}#lodging`,
    name: property.name,
    url,
    address,
  };

  if (property.description) node.description = property.description;
  if (images.length) node.image = images;
  if (amenities.length) {
    node.amenityFeature = amenities.map((name) => ({
      '@type': 'LocationFeatureSpecification',
      name,
      value: true,
    }));
  }
  if (typeof property.is_pet_allowed === 'boolean') {
    node.petsAllowed = property.is_pet_allowed;
  }
  if (!isApproximate && property.latitude != null && property.longitude != null) {
    node.geo = {
      '@type': 'GeoCoordinates',
      latitude: property.latitude,
      longitude: property.longitude,
    };
  }

  if (minPrice != null) {
    node.priceRange = `From ₦${Math.round(minPrice).toLocaleString('en-NG')}/night`;
    const offers = (Array.isArray(property.units) ? property.units : [])
      .map((u: any) => {
        const price = parseFloat(u?.price_per_night);
        if (!Number.isFinite(price) || price <= 0) return null;
        return {
          '@type': 'Offer',
          name: u?.name || property.name,
          price,
          priceCurrency: 'NGN',
          availability: 'https://schema.org/InStock',
          url,
        };
      })
      .filter(Boolean);
    if (offers.length) node.makesOffer = offers;
  }

  const avg = Number(property?.meta?.average_rating);
  const count = Number(property?.meta?.total_reviews);
  if (count > 0 && Number.isFinite(avg) && avg > 0) {
    node.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: avg.toFixed(1),
      reviewCount: count,
      bestRating: 5,
      worstRating: 1,
    };
  }

  const reviews = (Array.isArray(opts.reviews) ? opts.reviews : [])
    .filter((r) => r && !r.is_removed && Number(r.rating) > 0)
    .slice(0, 10)
    .map((r: any) => {
      const authorName =
        r?.reviewer_name ||
        r?.user?.name ||
        [r?.user?.first_name, r?.user?.last_name].filter(Boolean).join(' ') ||
        'Guest';
      const review: JsonLd = {
        '@type': 'Review',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: Number(r.rating),
          bestRating: 5,
          worstRating: 1,
        },
        author: { '@type': 'Person', name: authorName },
      };
      if (r?.comment) review.reviewBody = r.comment;
      if (r?.created_at) review.datePublished = String(r.created_at).slice(0, 10);
      return review;
    });
  if (reviews.length) node.review = reviews;

  return node;
}
