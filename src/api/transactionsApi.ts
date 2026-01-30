import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';

interface Transaction {
  id: string;
  walletId: string;
  userId: number;
  action: 'CREDIT' | 'DEBIT';
  comment: string;
  reference: string;
  paymentReference: string | null;
  amount: string;
  currency: string;
  description: string;
  status: 'PENDING' | 'SUCCESSFUL' | 'FAILED';
  created_at: string;
  updated_at: string;
  transaction_type: 'PAYMENT' | 'BOOKING';
}

interface TransactionsResponse {
  message: string;
  data: {
    items: Transaction[];
    total: number;
    page: number;
    size: number;
    pages: number;
  };
}

import { BASE_API_URL } from '../utils/url';

export const transactionsApi = createApi({
  reducerPath: 'transactionsApi',
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
  tagTypes: ['Transactions'],
  endpoints: (builder) => ({
    getUserTransactions: builder.query<TransactionsResponse, void>({
      query: () => 'transactions',
      providesTags: ['Transactions']
    }),
  }),
});

export const { useGetUserTransactionsQuery } = transactionsApi;
export type { TransactionsResponse, Transaction }; 