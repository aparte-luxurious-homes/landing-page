/**
 * Translation between the search URL, component state, and API params.
 *
 * Three separate functions on purpose. The URL is a product surface —
 * shareable, bookmarkable, indexable — so it uses friendly names (`guests`,
 * `amenities`) and must never leak backend-only ones like `amenities_input`.
 */

import { format } from 'date-fns';
import type { SearchFilters } from '../types/search';

/** Every parameter the search URL is allowed to carry. */
export const URL_KEYS = [
  'q', 'location', 'start_date', 'end_date', 'guests', 'bedrooms',
  'living_rooms', 'min_price', 'max_price', 'property_type', 'amenities',
  'event_types', 'pets', 'party', 'sort', 'page', 'drop',
] as const;

export const DEFAULT_GUESTS = 2;

/**
 * Format a Date as YYYY-MM-DD in the *local* timezone.
 *
 * `toISOString().split('T')[0]` converts to UTC first, so for a WAT user
 * (UTC+1) any date picked before 01:00 local comes out as the previous day —
 * a guest picking "tonight" would silently search yesterday.
 */
export const toApiDate = (value: Date | null | undefined): string | undefined => {
  if (!value) return undefined;
  const time = value.getTime();
  if (Number.isNaN(time)) return undefined;
  return format(value, 'yyyy-MM-dd');
};

const parseDate = (value: string | null): Date | null => {
  if (!value) return null;
  // Parse as local midnight, mirroring toApiDate — `new Date("2026-08-14")`
  // parses as UTC and would shift backwards for negative offsets.
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  const parsed = new Date(year, month - 1, day);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const parseNumber = (value: string | null): number | undefined => {
  if (value == null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const parseCsv = (value: string | null): string[] | undefined => {
  if (!value) return undefined;
  const items = value.split(',').map((s) => s.trim()).filter(Boolean);
  return items.length ? items : undefined;
};

/** URL → component state. The URL is the single source of truth. */
export function searchParamsToState(sp: URLSearchParams): SearchFilters {
  return {
    q: sp.get('q') || undefined,
    locations: parseCsv(sp.get('location')) ?? [],
    startDate: parseDate(sp.get('start_date')),
    endDate: parseDate(sp.get('end_date')),
    propertyTypes: parseCsv(sp.get('property_type')) ?? [],
    guestCount: parseNumber(sp.get('guests')) ?? DEFAULT_GUESTS,
    bedroomCount: parseNumber(sp.get('bedrooms')),
    livingRoomCount: parseNumber(sp.get('living_rooms')),
    minPrice: parseNumber(sp.get('min_price')),
    maxPrice: parseNumber(sp.get('max_price')),
    amenities: parseCsv(sp.get('amenities')),
    eventTypes: parseCsv(sp.get('event_types')),
    isPetAllowed: sp.get('pets') === 'true' || undefined,
    isPartyAllowed: sp.get('party') === 'true' || undefined,
    sortBy: sp.get('sort') || undefined,
    page: parseNumber(sp.get('page')),
    drop: parseCsv(sp.get('drop')),
  };
}

/**
 * Component state → URL.
 *
 * Defaults and empties are omitted so the same search always produces the
 * same canonical URL — otherwise every phrasing becomes a distinct URL and
 * the page self-competes in search results.
 */
export function filtersToSearchParams(filters: SearchFilters): URLSearchParams {
  const sp = new URLSearchParams();
  const set = (key: string, value: unknown) => {
    if (value === undefined || value === null || value === '') return;
    sp.set(key, String(value));
  };

  set('q', filters.q?.trim());
  if (filters.locations?.length) set('location', filters.locations.join(','));
  set('start_date', toApiDate(filters.startDate));
  set('end_date', toApiDate(filters.endDate));
  if (filters.propertyTypes?.length) set('property_type', filters.propertyTypes.join(','));
  if (filters.guestCount && filters.guestCount !== DEFAULT_GUESTS) {
    set('guests', filters.guestCount);
  }
  set('bedrooms', filters.bedroomCount);
  set('living_rooms', filters.livingRoomCount);
  set('min_price', filters.minPrice);
  set('max_price', filters.maxPrice);
  if (filters.amenities?.length) set('amenities', filters.amenities.join(','));
  if (filters.eventTypes?.length) set('event_types', filters.eventTypes.join(','));
  if (filters.isPetAllowed) set('pets', 'true');
  if (filters.isPartyAllowed) set('party', 'true');
  set('sort', filters.sortBy);
  if (filters.page && filters.page > 1) set('page', filters.page);
  if (filters.drop?.length) set('drop', filters.drop.join(','));

  return sp;
}

/**
 * Component state → API params for `GET /properties/search`.
 *
 * This is where public names become backend names (`guests` → `guest_count`,
 * `amenities` → `amenities_input`).
 */
export function stateToApiParams(filters: SearchFilters): Record<string, unknown> {
  const params: Record<string, unknown> = {
    // `q` is required by the endpoint; a filters-only search still needs a
    // query string, so fall back to the location the guest picked.
    q: filters.q?.trim() || filters.locations?.join(', ') || 'stays in Nigeria',
  };

  if (filters.locations?.length) params.location = filters.locations.join(',');
  params.start_date = toApiDate(filters.startDate);
  params.end_date = toApiDate(filters.endDate);
  if (filters.propertyTypes?.length) params.property_type = filters.propertyTypes.join(',');
  if (filters.guestCount) params.guest_count = filters.guestCount;
  if (filters.bedroomCount) params.bedroom_count = filters.bedroomCount;
  if (filters.livingRoomCount) params.living_room_count = filters.livingRoomCount;
  if (filters.minPrice != null) params.min_price = filters.minPrice;
  if (filters.maxPrice != null) params.max_price = filters.maxPrice;
  if (filters.amenities?.length) params.amenities_input = filters.amenities.join(',');
  if (filters.eventTypes?.length) params.event_types_input = filters.eventTypes.join(',');
  if (filters.isPetAllowed) params.is_pet_allowed = true;
  if (filters.isPartyAllowed) params.is_party_allowed = true;
  if (filters.sortBy) params.sort_by = filters.sortBy;
  if (filters.page && filters.page > 1) params.page = filters.page;
  if (filters.drop?.length) params.drop = filters.drop.join(',');

  return params;
}

/**
 * The canonical URL for a search — a normalised subset of the live one.
 *
 * Drops `q` (many phrasings, one result set), `page`, `drop`, and any
 * constraint that had to be relaxed, then sorts what's left. Without this,
 * every rewording of the same search is a separate indexable URL competing
 * with the others.
 */
export function canonicalSearchPath(
  filters: SearchFilters,
  relaxedParams: string[] = [],
): string {
  const sp = filtersToSearchParams({ ...filters, q: undefined, page: undefined, drop: undefined });
  relaxedParams.forEach((param) => sp.delete(param));

  const sorted = new URLSearchParams();
  Array.from(sp.keys()).sort().forEach((key) => sorted.set(key, sp.get(key)!));

  const query = sorted.toString();
  return query ? `/search-results?${query}` : '/search-results';
}
