import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';

interface Booking {
  id: string;
  unit: {
    id: string;
    propertyId: string;
    property: {
      id: number;
      ownerId: number;
    name: string;
  };
  };
  startDate: string;
  endDate: string;
  check_in: string;
  check_out: string;
  guestsCount: number;
  nights: number;
  totalPrice: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  created_at: string;
}

interface BookingsResponse {
  data: {
    meta: {
      total: number;
      perPage: number;
      currentPage: number;
      lastPage: number;
      firstPage: number;
    };
    data: Booking[];
  };
  message: string;
}

export const bookingsApi = createApi({
  reducerPath: 'bookingsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
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
