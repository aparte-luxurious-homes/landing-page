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

import { BASE_API_URL } from '../utils/url';

export const paymentApi = createApi({
  reducerPath: "paymentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_API_URL,
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
    getGatewayConfig: builder.query<{ data: { apiKey: string, contractCode: string, isTestMode: boolean } }, string>({
      query: (provider) => `wallets/config/${provider}`,
    }),
    verifyTransaction: builder.mutation<any, string>({
      query: (reference) => ({
        url: `wallets/transactions/${reference}/verify`,
        method: "POST",
      }),
    }),
  }),
});

export const { usePostPaymentMutation, useGetGatewayConfigQuery, useVerifyTransactionMutation } = paymentApi;
