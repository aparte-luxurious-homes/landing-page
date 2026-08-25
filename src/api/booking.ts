import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../app/store";

/** POST /bookings — `should_show_payout_nudge` may be on the envelope or inside `data` */
export interface CreateBookingResponse {
    success: boolean;
    message: string;
    should_show_payout_nudge?: boolean;
    data?: {
        booking_id?: string | number;
        status?: string;
        should_show_payout_nudge?: boolean;
        [key: string]: unknown;
    };
}

type BookingResponse = CreateBookingResponse;

export interface BookingPayload {
    unit_id: string;
    start_date: string;
    end_date: string;
    guests_count: number;
    unit_count: number;
    total_price: number;
    referral_code?: string;
}

interface UpdateBookingStatusPayload {
    transaction_id: string;
    transaction_ref: string;
    transaction_status: string;
}

interface UpdateBookingStatusResponse {
    status: number;
    success: boolean;
    message: string;
    data?: any;
}

interface bookingTransactionPayload {
    booking_id: string | null;
    reference: string;
    gateway?: string;
}
interface bookingTransactionResponse {
    success: boolean;
    message: string;
    data?: any;
}

export interface BookingQuotePayload {
    unit_id: string;
    start_date: string;
    end_date: string;
    guests_count: number;
    unit_count: number;
    referral_code?: string;
}

export interface BookingQuoteResponse {
    nights: number;
    base_price: number;
    discount_amount: number;
    discount_policy?: {
        policy: any;
        nights: number;
        discount_amount: string;
    };
    total_price: number;
    caution_fee: number;
    gateway: string;
    gateway_fee: string | number;
    total_payable: string | number;
    upsell_message?: string;
}

import { BASE_API_URL } from '../utils/url';

export const bookingApi = createApi({
    reducerPath: "bookingApi",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_API_URL,
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState)?.root?.auth?.token;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        createBooking: builder.mutation<BookingResponse, BookingPayload>({
            query: (bookingData) => ({
                url: "bookings",
                method: "POST",
                body: bookingData,
            }),
        }),
        updateBookingStatus: builder.mutation<UpdateBookingStatusResponse, { bookingId: string; bookingStatusPayload: UpdateBookingStatusPayload }>({
            query: ({ bookingId, bookingStatusPayload }) => ({
                url: `bookings/${bookingId}/status`,
                method: "PUT",
                body: bookingStatusPayload,
            }),
        }),
        updateBookingTransaction: builder.mutation<bookingTransactionResponse, bookingTransactionPayload>({
            query: (bookingtransaction) => ({
                url: "bookings/validate",
                method: "PATCH",
                body: bookingtransaction,
            }),
        }),
        getBookingQuote: builder.mutation<{ message: string; data: BookingQuoteResponse }, BookingQuotePayload>({
            query: (quotePayload) => ({
                url: "bookings/quote",
                method: "POST",
                body: quotePayload,
            }),
        }),
    }),
});

export const { useCreateBookingMutation, useUpdateBookingStatusMutation, useUpdateBookingTransactionMutation, useGetBookingQuoteMutation } = bookingApi;
