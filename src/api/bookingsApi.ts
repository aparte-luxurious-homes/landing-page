import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';

interface Property {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
}

interface Unit {
  id: number;
  name: string;
  description: string;
  pricePerNight: string;
  property: Property;
}

interface Booking {
  id: number;
  bookingId: string;
  startDate: string;
  endDate: string;
  guestsCount: number;
  totalPrice: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  createdAt: string;
  unit: Unit;
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
    meta: Meta;
    data: Booking[];
  };
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
    getUserBookings: builder.query<BookingsResponse, { userId: string }>({
      query: ({ userId }) => `bookings/${userId}`,
    }),
  }),
});

export const { useGetUserBookingsQuery } = bookingsApi;
export type { BookingsResponse, Booking, Unit, Property, Meta }; 