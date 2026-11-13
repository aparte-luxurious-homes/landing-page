import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../app/store';
import { BASE_API_URL } from '../utils/url';

export interface ReferralCodeInfo {
  code: string;
  link: string;
}

export interface ReferralStats {
  total_referrals: number;
  active_referrals: number;
  total_bookings: number;
}

export interface ReferralItem {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface ReferralsListResponse {
  items: ReferralItem[];
  total: number;
}

export const referralsApi = createApi({
  reducerPath: 'referralsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).root.auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Referrals'],
  endpoints: (builder) => ({
    getMyReferralCode: builder.query<{ message: string; data: ReferralCodeInfo }, void>({
      query: () => 'referrals/my-code',
      providesTags: ['Referrals'],
    }),
    getAgentStats: builder.query<{ message: string; data: ReferralStats }, void>({
      query: () => 'referrals/stats',
      providesTags: ['Referrals'],
    }),
    getMyReferrals: builder.query<{ message: string; data: ReferralsListResponse }, void>({
      query: () => 'referrals/list',
      providesTags: ['Referrals'],
    }),
  }),
});

export const {
  useGetMyReferralCodeQuery,
  useGetAgentStatsQuery,
  useGetMyReferralsQuery,
} = referralsApi;

