export interface SearchFilters {
  /**
   * The guest's natural-language query, verbatim.
   *
   * This is what the search bars now emit. It used to be collected as
   * `searchTerm`, dropped on the floor, and *also* copied into `locations` —
   * which meant "2 bedroom flat in Lekki" was matched as a literal city name
   * and could only ever return zero results.
   */
  q?: string;
  locations?: string[];
  state?: string[];
  startDate: Date | null;
  endDate: Date | null;
  propertyTypes?: string[];
  propertyType?: string[];
  guestCount: number;
  bedroomCount?: number;
  livingRoomCount?: number;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  isPetAllowed?: boolean;
  isPartyAllowed?: boolean;
  page?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | string;
  /** Constraint kinds the guest dismissed via a chip. */
  drop?: string[];
}

/** One interpreted constraint, as reported by the search endpoint. */
export interface ConstraintReport {
  kind: string;
  label: string;
  value: unknown;
  original_value?: unknown;
  /** The public URL param this constraint maps to — never a backend-only name. */
  param: string;
  status: 'applied' | 'relaxed' | 'dropped';
  source?: 'parsed' | 'user';
  /** True when the constraint ranks results rather than filtering them. */
  scored_only?: boolean;
  /** Human-readable explanation, present only when status is "relaxed". */
  reason?: string;
}

export interface SearchInterpretation {
  query: string;
  interpreted: Record<string, unknown>;
  applied: ConstraintReport[];
  relaxed: ConstraintReport[];
  message: string;
  relax_steps: number;
  /** True SQL match count — may exceed meta.total when the candidate cap bit. */
  total_matched: number;
  capped: boolean;
  source: 'rules' | 'llm' | 'hybrid' | 'disabled' | 'price_sort' | string;
  cached: boolean;
  took_ms: number;
  llm: {
    used: boolean;
    model: string | null;
    ms: number | null;
    error: string | null;
  };
}

export interface LocationSuggestion {
  name: string;
  count: number;
}

export interface LocationSuggestionsData {
  cities: LocationSuggestion[];
  states: LocationSuggestion[];
}

export interface Pagination {
  currentPage: number;
  total: number;
  perPage: number;
  lastPage: number
}

export interface Apartment {
  id: string;
  name: string;
  city: string;
  state: string;
  media: Array<{ mediaUrl: string }>;
  units: Array<{ price_per_night: string | number }>;
  meta: {
    average_rating: number;
    total_reviews: number;
  };
}
export interface FilterContentProps {
  filters: SearchFilters;
  setFilters: React.Dispatch<React.SetStateAction<SearchFilters>>;
  handleSearch: () => void;
  handleAddGuest: () => void;
  handleRemoveGuest: () => void;
  isFetching: boolean;
  onLocationChange?: (locations: string[]) => void;
}