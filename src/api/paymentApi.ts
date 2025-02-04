import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../app/store";

interface PaymentsResponse {
    success: boolean;
    message: string;
    transactionId: string;
    data?: any;
  }
  
  interface PostPaymentPayload {
    comment: string;
    userId: number;
    action: string;
    amount: string;
    currency: string;
    description: string;
    type: string;
    email: string;
    provider: string;
    propertyId: number;
  }

export const paymentsApi = createApi({
    reducerPath: "paymentsApi",
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_BASE_URL,
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState)?.root?.auth?.token; 
            // If token exists, attach it to the Authorization header
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        postPayment: builder.mutation<PaymentsResponse, { id: string; payload: PostPaymentPayload }>({
          query: ({ id, payload }) => ({
            url: `wallets/${id}/transactions`,
            method: "POST",
            body: payload,
          }),
        }),
      }),
});

export const { usePostPaymentMutation  } = paymentsApi;
