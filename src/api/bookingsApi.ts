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
  has_dispute?: boolean;
  has_review?: boolean;
  checkin_time?: string;
  checkout_time?: string;
}

export type ExtensionStatus = 'AWAITING_OWNER_APPROVAL' | 'PENDING_PAYMENT' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'EXPIRED';

export interface BookingExtension {
  id: string;
  extension_id: string;
  booking_id: string;
  requested_by: string;
  original_end_date: string;
  new_end_date: string;
  extra_nights: number;
  price_per_night: number;
  extension_amount: number;
  status: ExtensionStatus;
  payment_method: string;
  transaction_ref?: string;
  created_at: string;
  updated_at: string;
}

interface ExtensionsResponse {
  status: string;
  message: string;
  data: {
    items: BookingExtension[];
    total: number;
    page: number;
    size: number;
  };
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
        headers.set('Authorization', `Bearer ${token}`);
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
    getBookingExtensions: builder.query<ExtensionsResponse, string>({
      query: (bookingId) => `bookings/${bookingId}/extensions`,
      providesTags: (result, error, bookingId) => [{ type: 'Bookings' as const, id: 'EXT' + bookingId }],
      async onQueryStarted(bookingId, { queryFulfilled }) {
        console.log('Fetching extensions for booking:', bookingId);
        try {
          const { data } = await queryFulfilled;
          console.log('Extensions fetched successfully:', data);
        } catch (err) {
          console.error('Error fetching extensions:', err);
        }
      },
    }),
    requestStayExtension: builder.mutation<any, { bookingId: string, new_end_date: string, payment_method?: string, mark_as_paid?: boolean }>({
      query: ({ bookingId, ...body }) => ({
        url: `bookings/${bookingId}/extensions`,
        method: 'POST',
        body: {
          payment_method: 'online',
          mark_as_paid: false,
          ...body
        },
      }),
      invalidatesTags: (result, error, { bookingId }) => [
        { type: 'Bookings' as const, id: 'EXT' + bookingId },
        { type: 'Bookings' as const },
      ],
      async onQueryStarted({ bookingId }, { queryFulfilled }) {
        console.log('Requesting stay extension for booking:', bookingId);
        try {
          const { data } = await queryFulfilled;
          console.log('Stay extension requested successfully:', data);
        } catch (err) {
          console.error('Error requesting stay extension:', err);
        }
      },
    }),
    cancelExtensionRequest: builder.mutation<any, { bookingId: string, extensionId: string }>({
      query: ({ bookingId, extensionId }) => ({
        url: `bookings/${bookingId}/extensions/${extensionId}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, { bookingId }) => [
        { type: 'Bookings' as const, id: 'EXT' + bookingId },
        { type: 'Bookings' as const },
      ],
    }),
  }),
});

export const {
  useGetUserBookingsQuery,
  useRetryBookingPaymentMutation,
  useCheckInBookingMutation,
  useCheckOutBookingMutation,
  useRequestCancellationMutation,
  useGetBookingExtensionsQuery,
  useRequestStayExtensionMutation,
  useCancelExtensionRequestMutation,
} = bookingsApi;
export type { BookingsResponse, Booking, Unit, Property, Meta }; 