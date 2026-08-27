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
  isVerified: boolean;
}

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

  return {
    images: images.length ? images : [SampleImg.src],
    title: property?.name ?? '',
    location: [property?.city, property?.state].filter(Boolean).join(', '),
    // `average_rating` sits at the top level on some endpoints and under
    // `meta` on others; both shapes reach these grids.
    rating: Number(property?.average_rating ?? property?.meta?.average_rating ?? 0),
    reviews: Number(property?.total_reviews ?? property?.meta?.total_reviews ?? 0),
    hasUnits: Boolean(property?.units?.length),
    minPrice,
    maxPrice,
    propertylink: `/property-details/${property?.id}`,
    aggregates: aggregateUnitStats(property?.units),
    isVerified: Boolean(property?.is_verified),
  };
}
