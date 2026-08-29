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
  SITE_ALTERNATE_NAME,
  SITE_REGISTERED_NAME,
  SITE_RC_NUMBER,
  SITE_DESCRIPTION,
  ORG_LOGO_URL,
  SUPPORT_EMAIL,
  SOCIAL_LINKS,
  absoluteUrl,
} from './config';

type JsonLd = Record<string, unknown>;

/**
 * Map the platform's property_type enum to the closest Schema.org type.
 *
 * Exported because the type landing pages need the same mapping for their
 * CollectionPage `about`, and two copies would drift.
 *
 * Keys are lower-cased enum values. An event centre is deliberately not a
 * lodging type at all - it is hired for a session, not slept in - so it maps
 * to EventVenue rather than to anything under LodgingBusiness.
 */
export const PROPERTY_TYPE_TO_SCHEMA: Record<string, string> = {
  apartment: 'Apartment',
  duplex: 'House',
  bungalow: 'House',
  villa: 'House',
  hotel: 'Hotel',
  event_centre: 'EventVenue',
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

/**
 * Organization node. Emit once (home). Referenced by @id elsewhere.
 *
 * `name` is the trading brand (what users search for); `alternateName` carries
 * the other written form, AparteNG; `legalName` carries the registered CAC
 * entity and `identifier` the RC number, so search engines and AI answer
 * engines can resolve "who legally operates Aparte?".
 *
 * The retired precursor name "Aparte Luxurious Homes" must never be emitted
 * here. This node is the platform's canonical machine-readable identity, so a
 * wrong name here propagates to every engine that reads the site.
 */
export function organizationSchema(): JsonLd {
  const node: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    legalName: SITE_REGISTERED_NAME,
    alternateName: [SITE_ALTERNATE_NAME, SITE_REGISTERED_NAME],
    identifier: {
      '@type': 'PropertyValue',
      propertyID: 'RC Number',
      name: 'Corporate Affairs Commission (Nigeria) registration number',
      value: SITE_RC_NUMBER,
    },
    url: SITE_URL,
    logo: ORG_LOGO_URL,
    email: SUPPORT_EMAIL,
    description: SITE_DESCRIPTION,
    address: { '@type': 'PostalAddress', addressCountry: 'NG' },
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
 * ItemList of listings, linking each to its property page.
 *
 * The same object was written inline in the city landing page and again on
 * the homepage; the type pages would have been a third copy, so it lives
 * here now. Returns null when empty - an ItemList advertising zero items is
 * worse than no ItemList.
 */
export function itemListSchema(
  name: string,
  items: { id?: string; name?: string }[],
): JsonLd | null {
  const usable = (items ?? []).filter((p) => p.id && p.name);
  if (!usable.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: usable.length,
    itemListElement: usable.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.name,
      url: absoluteUrl(`/property-details/${p.id}`),
    })),
  };
}

/**
 * ProfilePage + ItemList for an Aparte Link catalog (aparte.ng/@handle).
 * The mainEntity is the agent/owner; the ItemList links each published
 * listing so crawlers and AI engines can walk from a shared catalog to
 * every property without executing the app.
 */
export function catalogSchema(catalog: {
  handle: string;
  owner_type?: string;
  display_name: string;
  headline?: string | null;
  bio?: string | null;
  profile_image?: string | null;
  stats?: { properties_listed?: number; average_rating?: number; review_count?: number };
  properties?: { slug: string; name: string }[];
}): JsonLd {
  const url = absoluteUrl(`/@${catalog.handle}`);
  const mainEntity: JsonLd = {
    '@type':
      String(catalog.owner_type || '').toUpperCase() === 'AGENT'
        ? 'RealEstateAgent'
        : 'Person',
    '@id': `${url}#owner`,
    name: catalog.display_name,
    url,
  };
  if (catalog.profile_image) mainEntity.image = catalog.profile_image;
  const about = catalog.headline || catalog.bio;
  if (about) mainEntity.description = about;
  const avg = Number(catalog.stats?.average_rating);
  const count = Number(catalog.stats?.review_count);
  if (count > 0 && Number.isFinite(avg) && avg > 0) {
    mainEntity.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: avg.toFixed(1),
      reviewCount: count,
      bestRating: 5,
      worstRating: 1,
    };
  }

  const node: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': url,
    url,
    name: `${catalog.display_name} — Aparte`,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    mainEntity,
  };

  const items = (catalog.properties ?? []).filter((p) => p?.slug && p?.name);
  if (items.length) {
    node.hasPart = {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: p.name,
        url: absoluteUrl(`/${p.slug}`),
      })),
    };
  }
  return node;
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
    node.priceRange = `From NGN ${Math.round(minPrice).toLocaleString('en-NG')}/night`;
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

  // The API serialises ratings flat on the property object
  // (services/properties/serializers.py), but older payload shapes nested
  // them under `meta` — read both so neither shape silently drops the stars.
  const avg = Number(
    property?.average_rating ?? property?.meta?.average_rating,
  );
  const count = Number(
    property?.total_reviews ?? property?.meta?.total_reviews,
  );
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
