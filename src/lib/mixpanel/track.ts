import { trackEvent } from '@/components/MixpanelInit';
import { toApiDate } from '@/utils/searchParams';
import type { SearchFilters } from '@/types/search';

/** Event names from the Aparte Mixpanel Tracking Plan (frontend rows). */
export const MixpanelEvents = {
  PROPERTY_SEARCHED: 'Property Searched',
  PROPERTY_VIEWED: 'Property Viewed',
  BOOKING_STARTED: 'Booking Started',
  BOOKING_DETAILS_SUBMITTED: 'Booking Details Submitted',
} as const;

function compact(record: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    if (value === undefined || value === null || value === '') continue;
    out[key] = value;
  }
  return out;
}

const viewedProperties = new Set<string>();
const submittedBookings = new Set<string>();

export function trackPropertySearched(filters: SearchFilters): void {
  trackEvent(
    MixpanelEvents.PROPERTY_SEARCHED,
    compact({
      search_location: filters.locations?.join(', ') || filters.q,
      check_in: toApiDate(filters.startDate),
      check_out: toApiDate(filters.endDate),
      guests: filters.guestCount,
      property_type: filters.propertyTypes?.join(',') || undefined,
      min_price: filters.minPrice,
      max_price: filters.maxPrice,
    }),
  );
}

export function trackPropertyViewed(input: {
  property_id?: string;
  user_id?: string;
  property_type?: string;
  location?: string;
  nightly_price?: number;
  agent_id?: string;
}): void {
  const propertyId = input.property_id;
  if (!propertyId || viewedProperties.has(propertyId)) return;
  viewedProperties.add(propertyId);
  trackEvent(MixpanelEvents.PROPERTY_VIEWED, compact(input));
}

export function trackBookingStarted(input: {
  booking_id?: string;
  property_id?: string;
  check_in?: string;
  check_out?: string;
  guests?: number;
  total_amount?: number;
}): void {
  trackEvent(MixpanelEvents.BOOKING_STARTED, compact(input));
}

export function trackBookingDetailsSubmitted(input: {
  booking_id?: string;
  property_id?: string;
  check_in?: string;
  check_out?: string;
  guests?: number;
  number_of_nights?: number;
  user_id?: string;
  user_name?: string;
  unit_id?: string;
  guest_id?: string;
  booked_by_id?: string;
  referrer_id?: string;
  start_date?: string;
  end_date?: string;
  guests_count?: number;
  unit_count?: number;
  total_price?: number;
  caution_fee?: number;
  payment_method?: string;
  status?: string;
  is_extension?: boolean;
  discount_amount?: number;
  has_referral?: boolean;
  has_referral_code?: boolean;
  created_at?: string;
}): void {
  const key = input.booking_id || `${input.property_id}:${input.start_date}`;
  if (key && submittedBookings.has(key)) return;
  if (key) submittedBookings.add(key);
  trackEvent(MixpanelEvents.BOOKING_DETAILS_SUBMITTED, compact(input));
}
