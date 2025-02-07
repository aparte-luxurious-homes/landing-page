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
    }),
});

export const { useCreateBookingMutation } = bookingApi;
