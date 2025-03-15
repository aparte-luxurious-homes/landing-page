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
  createdAt: string;
  updatedAt: string;
  transactionType: 'PAYMENT' | 'BOOKING';
}

interface Meta {
  total: number;
  perPage: number;
  currentPage: number;
  lastPage: number;
  firstPage: number;
  firstPageUrl: string;
  lastPageUrl: string;
  nextPageUrl: string | null;
  previousPageUrl: string | null;
}

interface TransactionsResponse {
  message: string;
  meta: Meta;
  data: Transaction[];
  code: number;
}

export const transactionsApi = createApi({
  reducerPath: 'transactionsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
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
    getUserTransactions: builder.query<TransactionsResponse, { userId: string }>({
      query: ({ userId }) => `transactions/${userId}`,
      providesTags: ['Transactions']
    }),
  }),
});

export const { useGetUserTransactionsQuery } = transactionsApi;
export type { TransactionsResponse, Transaction, Meta }; 