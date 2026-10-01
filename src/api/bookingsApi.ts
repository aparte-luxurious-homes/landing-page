import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../app/store';

interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
}

interface Unit {
  id: string;
  property_id?: string;
  name: string;
  description: string;
  pricePerNight?: number;
  price_per_night?: number | string;
  cautionFee?: number;
  caution_fee?: number | string;
}

interface Booking {
  id: string;
  booking_id: string;
  start_date: string;
  end_date: string;
  guests_count: number;
  total_price: number;
  // gateway_fee is added on top of total_price (guest pays the inbound gateway fee).
  // total_payable is what the gateway actually charges = total_price + gateway_fee.
  // Both are returned by the backend on every BookingResponse.
  gateway_fee?: number;
  total_payable?: number;
  status: 'APPROVAL_PENDING' | 'PENDING' | 'PENDING_PAYMENT' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCEL_REQUESTED' | 'CANCELLED' | 'COMPLETED';
  unit_id?: string;
  unit_count?: number;
  caution_fee?: number;
  createdAt: string;
  unit: Unit;
  property?: Property;
  unitCount: number;
  transaction_ref?: string;
  has_dispute?: boolean;
  has_review?: boolean;
  checkin_time?: string;
  checkout_time?: string;
  review_window_expires_at?: string;
  is_reviewable?: boolean;
  rejection_reason?: string;
  cancellation_reason?: string;
}

export type ExtensionStatus = 'AWAITING_OWNER_APPROVAL' | 'APPROVED' | 'PENDING_PAYMENT' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'EXPIRED';

export interface BookingExtension {
  id: string;
  extension_id: string;
  booking_id: string;
  requested_by: string;
  original_end_date: string;
  new_end_date: string;
  extra_nights: number;
  pricePerNight?: number;
  price_per_night?: number;
  extension_amount: number;
  extensionAmount?: number;
  status: ExtensionStatus;
  payment_method: string;
  transaction_ref?: string;
  transaction_id?: string;
  created_at: string;
  updated_at: string;
}

interface ExtensionsResponse {
  items: BookingExtension[];
  total: number;
  message?: string;
  status?: string;
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

/** Unwraps common API envelopes: `{ data: Booking }`, nested `data.data`, or raw booking. */
function unwrapBookingPayload(response: unknown): Booking | undefined {
  if (!response || typeof response !== 'object') return undefined;
  const root = response as Record<string, unknown>;
  const inner = root.data;
  if (inner && typeof inner === 'object') {
    const d = inner as Record<string, unknown>;
    if (d.id != null && d.booking_id != null) {
      return inner as unknown as Booking;
    }
    const nested = d.data;
    if (nested && typeof nested === 'object') {
      const n = nested as Record<string, unknown>;
      if (n.id != null && n.booking_id != null) {
        return nested as unknown as Booking;
      }
    }
  }
  if (root.id != null && root.booking_id != null) {
    return root as unknown as Booking;
  }
  return undefined;
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
    // Paginated. This took no arguments and so always fetched the backend's
    // default first page of 10, while the UI rendered whatever came back with
    // no way to ask for more — an eleventh booking silently hid the oldest one.
    // `page`/`size` are optional so any existing caller keeps working.
    getUserBookings: builder.query<BookingsResponse, { page?: number; size?: number } | void>({
      query: (args) => {
        const { page = 1, size = 10 } = args ?? {};
        return `bookings?page=${page}&size=${size}`;
      },
      providesTags: ['Bookings'],
    }),
    getBookingById: builder.query<Booking, string>({
      query: (bookingId) => `bookings/${bookingId}`,
      transformResponse: (response: unknown) => {
        const booking = unwrapBookingPayload(response);
        if (!booking) {
          throw new Error('Unexpected booking response shape');
        }
        return booking;
      },
      providesTags: (_result, _error, id) => [{ type: 'Bookings' as const, id }],
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
      providesTags: (_result, _error, bookingId) => [{ type: 'Bookings' as const, id: 'EXT' + bookingId }],
      async onQueryStarted(_bookingId, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err) {
          console.error('Error fetching extensions:', err);
        }
      },
    }),
    // Creates a BookingExtension — the system the extension list, the cancel
    // action and the admin Stay Extensions queue all read from.
    //
    // This used to POST to `bookings/{id}/extend`, the platform's OTHER
    // extension implementation, which records an extension as a child Booking.
    // So the app wrote to one system and read from another: a guest's extension
    // never appeared in their own list, could not be cancelled, and was
    // invisible to admins. Asking a second time then hit the duplicate guard
    // with nothing on screen to explain the 409.
    //
    // Payment differs between the two and moves with it — the transaction is
    // keyed on `extension_id`, not `booking_id`. See ExtendStayModal.
    requestStayExtension: builder.mutation<{ data: BookingExtension }, { bookingId: string, new_end_date: string, payment_method?: string, mark_as_paid?: boolean }>({
      query: ({ bookingId, ...body }) => ({
        url: `bookings/${bookingId}/extensions`,
        method: 'POST',
        body: {
          payment_method: 'online',
          mark_as_paid: false,
          ...body
        },
      }),
      invalidatesTags: (_result, _error, { bookingId }) => [
        { type: 'Bookings' as const, id: 'EXT' + bookingId },
        { type: 'Bookings' as const },
      ],
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
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
      invalidatesTags: (_result, _error, { bookingId }) => [
        { type: 'Bookings' as const, id: 'EXT' + bookingId },
        { type: 'Bookings' as const },
      ],
    }),
    getExtensionQuote: builder.query<any, { bookingId: string, new_end_date: string }>({
      query: ({ bookingId, new_end_date }) => `bookings/${bookingId}/extension-quote?new_end_date=${new_end_date}`,
    }),
  }),
});

export const {
  useGetUserBookingsQuery,
  useGetBookingByIdQuery,
  useRetryBookingPaymentMutation,
  useCheckInBookingMutation,
  useCheckOutBookingMutation,
  useRequestCancellationMutation,
  useGetBookingExtensionsQuery,
  useRequestStayExtensionMutation,
  useCancelExtensionRequestMutation,
  useGetExtensionQuoteQuery,
} = bookingsApi;
export type { BookingsResponse, Booking, Unit, Property, Meta }; 
