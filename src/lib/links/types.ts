/** Shapes returned by the api-v1 public endpoints (/api/v1/public/*). */

import type { DiscountPolicy, DiscountSummary } from '@/utils/discounts';

export interface Media {
  id: string;
  media_url: string;
  media_type: "IMAGE" | "VIDEO" | "VR" | null;
  is_featured: boolean;
}

export interface Amenity {
  id: string;
  name: string;
}

export interface Unit {
  id: string;
  property_id: string;
  name: string | null;
  description: string | null;
  price_per_night: number;
  caution_fee: number;
  max_guests: number;
  count: number;
  is_whole_property: boolean;
  bedroom_count: number | null;
  living_room_count: number | null;
  kitchen_count: number | null;
  bathroom_count: number | null;
  amenities: Amenity[];
  media: Media[];
  seating_capacity?: number;
  standing_capacity?: number;
  car_park_spaces?: number;
  power_supply_provision?: string;
  additional_fees?: Array<{ id: string; fee_name: string; fee_amount: number | string; is_mandatory: boolean }>;
  /** This unit's own override; null when it inherits the property's. */
  long_stay_discount_policy?: DiscountPolicy | null;
  extension_discount_policy?: DiscountPolicy | null;
  /** What will actually price this unit. Display this one. */
  effective_long_stay_discount_policy?: DiscountPolicy | null;
  effective_extension_discount_policy?: DiscountPolicy | null;
}

export interface Host {
  display_name: string;
  profile_image: string | null;
  joined_year: number | null;
}

export interface SharedBy {
  handle: string;
  display_name: string;
  profile_image: string | null;
  tier: string | null;
  is_verified: boolean;
  referral_code: string | null;
  catalog_url: string;
}

export interface PublicProperty {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string;
  state: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  property_type: string;
  booking_mode: "INSTANT" | "REQUEST_TO_BOOK";
  is_pet_allowed: boolean;
  is_party_allowed: boolean;
  rules: string | null;
  average_rating: number;
  total_reviews: number;
  location_visibility: "FULL" | "APPROXIMATE";
  units: Unit[];
  amenities: Amenity[];
  media: Media[];
  // The listing's own policies plus the best offer across its units. The
  // `proposed_*` columns are deliberately NOT served here — a recommendation
  // the owner has not accepted is not an offer to advertise.
  long_stay_discount_policy?: DiscountPolicy | null;
  extension_discount_policy?: DiscountPolicy | null;
  discount_summary?: {
    long_stay: DiscountSummary | null;
    extension: DiscountSummary | null;
  };
  host: Host | null;
  link_config: Record<string, unknown>;
  shared_by?: SharedBy;
}

export interface CalendarDay {
  date: string;
  available: boolean;
  price: string | null;
}

export interface UnitCalendar {
  unit_id: string;
  calendar: CalendarDay[];
}

export interface CatalogFacet {
  name: string;
  count: number;
}

export interface CatalogTypeFacet {
  type: string;
  count: number;
}

export interface CatalogCard {
  /** Links at the real property page; the slug is kept for legacy URLs. */
  id: string;
  slug: string | null;
  name: string;
  city: string;
  state: string;
  lga: string | null;
  property_type: string;
  booking_mode: "INSTANT" | "REQUEST_TO_BOOK";
  hero_image: string | null;
  /** Still images, featured first, videos excluded. Up to five. */
  media: string[];
  price_from: string | null;
  average_rating: number;
  review_count: number;
  max_guests: number;
  bedroom_count: number;
  bathroom_count: number;
  unit_count: number;
  discount_summary: {
    long_stay: DiscountSummary | null;
    extension: DiscountSummary | null;
  };
  /** Pinned by the host; sorts first under every sort. */
  is_featured: boolean;
}

export type CatalogSort = "NEWEST" | "PRICE_ASC" | "PRICE_DESC" | "RATING";

export interface PublicCatalog {
  handle: string;
  owner_type: "AGENT" | "OWNER";
  display_name: string;
  headline: string | null;
  bio: string | null;
  profile_image: string | null;
  /** Host-uploaded banner, or null — then `cover_mosaic` is the banner. */
  cover_image: string | null;
  /** Up to six listing photos, each listing's lead photo before any second. */
  cover_mosaic: string[];
  tier: string | null;
  is_verified: boolean;
  member_since: number | null;
  referral_code: string | null;
  whatsapp_url: string | null;
  /** Whole-catalog facets, most listings first. */
  cities: CatalogFacet[];
  property_types: CatalogTypeFacet[];
  featured_property_ids: string[];
  stats: {
    properties_listed: number;
    average_rating: number;
    review_count: number;
    cities_count: number;
  };
  properties: CatalogCard[];
  pagination: {
    page: number;
    per_page: number;
    /** Rows in the filtered view; `stats.properties_listed` is the whole page. */
    total: number;
    total_pages: number;
  };
  filters_applied: {
    city: string | null;
    property_type: string | null;
    sort: CatalogSort | null;
  };
}

/** GET /public/catalogs/{handle}/card — the "Shared by" strip. */
export interface CatalogCardInfo {
  handle: string;
  display_name: string;
  profile_image: string | null;
  tier: string | null;
  is_verified: boolean;
  referral_code: string | null;
  catalog_url: string;
  properties_listed: number;
}

export interface PublishedCatalogRow {
  handle: string;
  updated_at: string | null;
}

export interface ShortLinkTarget {
  target_type: "PROPERTY" | "CATALOG";
  property_slug?: string | null;
  catalog_handle?: string | null;
  referrer_source: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  code: string;
}

export interface CheckoutResult {
  booking_id: string;
  id: string;
  status: string;
  total_price: string;
  caution_fee: string;
  gateway_fee: string;
  payment: {
    payment_link: string | null;
    provider: string | null;
    charge_amount: string | null;
    sdk_config: Record<string, string> | null;
  };
  guest: {
    was_auto_created: boolean;
    claim_available: boolean;
  };
}
