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
  status: 'APPROVAL_PENDING' | 'PENDING' | 'PENDING_PAYMENT' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCEL_REQUESTED' | 'CANCELLED' | 'COMPLETED';
  unit_id?: string;
  unit_count?: number;
  caution_fee?: string;
  createdAt: string;
  unit: Unit;
  property?: Property;
  unitCount: number;
  transaction_ref?: string;
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
  tagTypes: ['Bookings'],
  endpoints: (builder) => ({
    getUserBookings: builder.query<BookingsResponse, void>({
      query: () => 'bookings',
      providesTags: ['Bookings'],
    }),
    retryBookingPayment: builder.mutation<any, string>({
      query: (bookingId) => ({
        url: `bookings/${bookingId}/retry-payment`,
        method: 'POST',
      }),
      invalidatesTags: ['Bookings'],
    }),
    checkInBooking: builder.mutation<any, string>({
      query: (bookingId) => ({
        url: `bookings/${bookingId}/check-in`,
        method: 'POST',
      }),
      invalidatesTags: ['Bookings'],
    }),
    checkOutBooking: builder.mutation<any, string>({
      query: (bookingId) => ({
        url: `bookings/${bookingId}/check-out`,
        method: 'POST',
      }),
      invalidatesTags: ['Bookings'],
    }),
    requestCancellation: builder.mutation<any, { bookingId: string, cancellation_reason: string }>({
      query: ({ bookingId, cancellation_reason }) => ({
        url: `bookings/${bookingId}/request-cancellation`,
        method: 'POST',
        body: { cancellation_reason },
      }),
      invalidatesTags: ['Bookings'],
    }),
  }),
});

export const {
  useGetUserBookingsQuery,
  useRetryBookingPaymentMutation,
  useCheckInBookingMutation,
  useCheckOutBookingMutation,
  useRequestCancellationMutation
} = bookingsApi;
export type { BookingsResponse, Booking, Unit, Property, Meta }; 