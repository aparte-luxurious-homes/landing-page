import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../app/store";

interface BookingResponse {
    success: boolean;
    message: string;
    data?: any;
}

interface BookingPayload {
    unit_id: string;
    start_date: string;
    end_date: string;
    guests_count: number;
    unit_count: number;
    total_price: number;
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
    booking_id: string;
    reference: string;
    gateway?: string;
}
interface bookingTransactionResponse {
    success: boolean;
    message: string;
    data?: any;
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
                url: "bookings",
                method: "PATCH",
                body: bookingtransaction,
            }),
        }),
    }),
});

export const { useCreateBookingMutation, useUpdateBookingStatusMutation, useUpdateBookingTransactionMutation } = bookingApi;
