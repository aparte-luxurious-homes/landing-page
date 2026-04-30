export interface SearchFilters {
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