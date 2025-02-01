import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface PaymentsResponse {
    data: {
        data: Payments[];
    };
}

interface Payments {
    userId: string;
    status: string;
    provider: string;
    currency: string;
    email: string;
    walletId: string;
}

export const paymentsApi = createApi({
    reducerPath: "paymentsApi",
    baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_API_BASE_URL }),
    endpoints: (builder) => ({
        getPayments: builder.query<PaymentsResponse, void>({
            query: () => "payments",
        }),
    }),
});

export const { useGetPaymentsQuery } = paymentsApi;
