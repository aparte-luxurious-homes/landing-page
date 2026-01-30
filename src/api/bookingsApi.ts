import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';

interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
}

interface Unit {
  id: string;
  name: string;
  description: string;
  price_per_night: string;
}

interface Booking {
  id: string;
  booking_id: string;
  start_date: string;
  end_date: string;
  guests_count: number;
  total_price: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  createdAt: string;
  unit: Unit;
  property?: Property;
  unitCount: number;
}

interface Meta {
  total: number;
  perPage: number;
  currentPage: number;
  lastPage: number;
  firstPage: number;
}

interface BookingsResponse {
  message: string;
  data: {
    items: Booking[];
    total: number;
    page: number;
    size: number;
    pages: number;
  };
}

import { BASE_API_URL } from '../utils/url';

export const bookingsApi = createApi({
  reducerPath: 'bookingsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState)?.root?.auth?.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getUserBookings: builder.query<BookingsResponse, void>({
      query: () => 'bookings',
    }),
  }),
});

export const { useGetUserBookingsQuery } = bookingsApi;
export type { BookingsResponse, Booking, Unit, Property, Meta }; 