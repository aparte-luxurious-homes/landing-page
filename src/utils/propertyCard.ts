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

export function toCardProps(property: any): ApartmentCardData {
  const [minPrice, maxPrice] = priceRange(property?.units);
  const images = galleryImagesOf(property?.media);

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
    location: [property?.city, property?.state].filter(Boolean).join(', '),
    rating,
    reviews,
    hasUnits: Boolean(property?.units?.length),
    minPrice,
    maxPrice,
    propertylink: `/property-details/${property?.id}`,
    aggregates: aggregateUnitStats(property?.units),
    isTopRated:
      rating >= TOP_RATED_MIN_RATING && reviews >= TOP_RATED_MIN_REVIEWS,
  };
}
