import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../app/store";

interface BookingResponse {
    success: boolean;
    message: string;
    data?: any;
}

interface BookingPayload {
    unit_id: number;
    start_date: string;
    end_date: string;
    guests_count: number;
    unit_count: number;
    total_price: number;
}

interface UpdateBookingStatusPayload {
    transactionId: string;
    transactionRef: string;
    transactionStatus: string;
}

interface UpdateBookingStatusResponse {
    status: number;
    success: boolean;
    message: string;
    updatedStatus: string;
}
interface bookingTransactionPayload {
    transaction_ref: string;
}
interface bookingTransactionResponse {
    success: boolean;
    message: string;
    data?: any;
}

export const bookingApi = createApi({
    reducerPath: "bookingApi",
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_BASE_URL,
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

export const { useCreateBookingMutation, useUpdateBookingStatusMutation, useUpdateBookingTransactionMutation  } = bookingApi;
