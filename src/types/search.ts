export interface SearchFilters {
  locations: string[];
  startDate: Date | null;
  endDate: Date | null;
  propertyTypes: string[];
  guestCount: number;
  bedroomCount?: number;
  livingRoomCount?: number;
  page?: number;
  sortBy?: 'price_asc' | 'price_desc';
}

export interface Pagination {
  currentPage: number;
  total: number;
  perPage: number;
}

export interface Apartment {
  id: string;
  name: string;
  city: string;
  state: string;
  media: Array<{ mediaUrl: string }>;
  units: Array<{ pricePerNight: number }>;
  meta: {
    average_rating: number;
    total_reviews: number;
  };
}

export interface FilterContentProps {
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
  handleSearch: () => void;
  handleAddGuest: () => void;
  handleRemoveGuest: () => void;
  isFetching: boolean;
} 