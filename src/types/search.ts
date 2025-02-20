export interface SearchFilters {
  location: string;
  startDate: Date;
  endDate: Date;
  propertyType: string;
  guestCount: number;
  page?: number;
  searchTerm?: string;
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