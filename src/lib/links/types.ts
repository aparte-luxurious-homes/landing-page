/** Shapes returned by the api-v1 public endpoints (/api/v1/public/*). */

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

export interface CatalogCard {
  slug: string;
  name: string;
  city: string;
  state: string;
  property_type: string;
  hero_image: string | null;
  price_from: string | null;
  average_rating: number;
  review_count: number;
  max_guests: number;
  bedroom_count: number;
}

export interface PublicCatalog {
  handle: string;
  owner_type: "AGENT" | "OWNER";
  display_name: string;
  headline: string | null;
  bio: string | null;
  profile_image: string | null;
  tier: string | null;
  is_verified: boolean;
  member_since: number | null;
  referral_code: string | null;
  whatsapp_url: string | null;
  stats: {
    properties_listed: number;
    average_rating: number;
    review_count: number;
  };
  properties: CatalogCard[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
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
