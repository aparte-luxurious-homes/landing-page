/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Listing row → <ApartmentCard> props.
 *
 * The home grid and the search-results grid each built these props with their
 * own inline IIFE, and the two had already drifted: the rating fallback chain
 * differed and only one handled `fileUrl`. One helper means a card fix lands
 * on every surface at once.
 */

import SampleImg from '~/assets/images/Apartment/Bigimg.png';
import { galleryImagesOf } from '@/lib/listings/media';
import { aggregateUnitStats, type PropertyAggregates } from './propertyAggregates';
import { discountBadge, discountLabel, type DiscountSummary } from './discounts';
import { headlineUnitWord } from './eventCentre';

export interface ApartmentCardData {
  /** Every still image, featured first. Never empty — falls back to the sample. */
  images: string[];
  title: string;
  location: string;
  rating: number;
  reviews: number;
  hasUnits: boolean;
  minPrice: number;
  maxPrice: number;
  propertylink: string;
  aggregates: PropertyAggregates;
  /** Earned from guest reviews — see the thresholds below. */
  isTopRated: boolean;
  /** API enum. The card reads it only to tell a venue from a stay. */
  propertyType?: string;
  /** What the "from" price is per: "night" for a stay; "day", "session" or
   *  "hour" for a venue, from the hall the lowest price belongs to. */
  rateUnit: string;
  /** e.g. "₦5,000/night off". Null when the listing has no long-stay offer. */
  discountBadge: string | null;
  /** The same offer spelled out, for the badge's tooltip. */
  discountLabel: string | null;
}

/*
 * "Top rated" replaced a "Verified" badge that appeared on every card.
 *
 * PropertyService.list_properties filters `is_verified == True` unless the
 * caller is authenticated staff, and that flag comes from the session, never
 * from a query param — so no guest-facing surface, search included, can
 * return an unverified row. A badge on 100% of cards carried no signal and
 * implied the list held unverified stock this one had passed.
 *
 * These thresholds are the tuning dials. Deliberately strict: a badge most
 * listings carry is worth as little as the one it replaced. Expect it to be
 * rare until review volume builds.
 */
export const TOP_RATED_MIN_RATING = 4.8;
export const TOP_RATED_MIN_REVIEWS = 5;

/** Nightly prices across a listing's units, ignoring unpriced/zero rows. */
const priceRange = (units?: any[] | null): [number, number] => {
  const prices = (units ?? [])
    .map((u) => Number(u?.price_per_night))
    .filter((p) => Number.isFinite(p) && p > 0);
  if (!prices.length) return [0, 0];
  return [Math.min(...prices), Math.max(...prices)];
};

/** The cheapest hall's unit, so "from ₦50,000 / hour" names the right unit. */
const venueRateUnit = (units?: any[] | null): string => {
  const priced = (units ?? []).filter((u) => Number(u?.price_per_night) > 0);
  if (!priced.length) return 'day';
  const cheapest = priced.reduce((a, b) =>
    Number(b.price_per_night) < Number(a.price_per_night) ? b : a
  );
  return headlineUnitWord(cheapest);
};

export function toCardProps(property: any): ApartmentCardData {
  const [minPrice, maxPrice] = priceRange(property?.units);
  const images = galleryImagesOf(property?.media);

  // Long-stay only. An extension discount is meaningless to someone who has
  // not booked yet, and two badges on one card is one badge too many —
  // the extension offer belongs on the property page and in the extension
  // flow, where it can actually be acted on.
  const longStay: DiscountSummary | null =
    property?.discount_summary?.long_stay ?? null;

  // `average_rating` sits at the top level on some endpoints and under `meta`
  // on others; both shapes reach these grids. Resolved once here so the badge
  // rule and the displayed rating can never disagree.
  const rating = Number(
    property?.average_rating ?? property?.meta?.average_rating ?? 0
  );
  const reviews = Number(
    property?.total_reviews ?? property?.meta?.total_reviews ?? 0
  );

  return {
    images: images.length ? images : [SampleImg.src],
    title: property?.name ?? '',
    // `distance_label` is attached by the results page on a "near me"
    // search only, so a landmark search's distance never reads as "from you".
    location: [
      [property?.city, property?.state].filter(Boolean).join(', '),
      property?.distance_label,
    ].filter(Boolean).join(' · '),
    rating,
    reviews,
    hasUnits: Boolean(property?.units?.length),
    minPrice,
    maxPrice,
    propertylink: `/property-details/${property?.id}`,
    aggregates: aggregateUnitStats(property?.units),
    isTopRated:
      rating >= TOP_RATED_MIN_RATING && reviews >= TOP_RATED_MIN_REVIEWS,
    // Resolved here rather than at each call site: both grids spread this
    // helper, so a card that has to distinguish a venue from a stay gets the
    // type for free instead of two grids remembering to pass it.
    propertyType: property?.property_type,
    rateUnit:
      property?.property_type === 'EVENT_CENTRE'
        ? venueRateUnit(property?.units)
        : 'night',
    discountBadge: discountBadge(longStay),
    discountLabel: discountLabel(longStay, 'long_stay'),
  };
}
