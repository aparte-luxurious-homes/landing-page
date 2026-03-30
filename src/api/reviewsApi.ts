import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../app/store';

export interface Review {
  id: string;
  booking_id: string;
  property_id: string;
  user_id: string;
  rating: number;
  comment: string;
  is_flagged: boolean;
  is_removed: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReviewResponse {
  id: string;
  booking_id: string;
  property_id: string;
  user_id: string;
  rating: number;
  comment: string;
  is_flagged: boolean;
  is_removed: boolean;
  created_at: string;
  updated_at: string;
}

export interface RatingSummary {
  average_rating: number;
  total_reviews: number;
}

export interface SubmitReviewRequest {
  booking_id: string;
  rating: number;
  comment: string;
}

export const reviewsApi = createApi({
  reducerPath: 'reviewsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).root.auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Reviews', 'RatingSummary'],
  endpoints: (builder) => ({
    submitReview: builder.mutation<ReviewResponse, SubmitReviewRequest>({
      query: (body) => ({
        url: '/api/v1/reviews',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Reviews', 'RatingSummary'],
    }),
    getPropertyReviews: builder.query<ReviewResponse[], { property_id: string; page?: number; size?: number }>({
      query: ({ property_id, ...params }) => ({
        url: `/api/v1/properties/${property_id}/reviews`,
        params,
      }),
      providesTags: ['Reviews'],
    }),
    getPropertyRatingSummary: builder.query<RatingSummary, string>({
      query: (property_id) => `/api/v1/properties/${property_id}/reviews/summary`,
      providesTags: ['RatingSummary'],
    }),
    // Admin endpoints
    getAdminReviews: builder.query<ReviewResponse[], { property_id?: string; page?: number; size?: number }>({
      query: (params) => ({
        url: '/api/v1/admin/reviews',
        params,
      }),
      providesTags: ['Reviews'],
    }),
    flagReview: builder.mutation<ReviewResponse, string>({
      query: (review_id) => ({
        url: `/api/v1/admin/reviews/${review_id}/flag`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Reviews'],
    }),
    removeReview: builder.mutation<ReviewResponse, string>({
      query: (review_id) => ({
        url: `/api/v1/admin/reviews/${review_id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Reviews'],
    }),
  }),
});

export const {
  useSubmitReviewMutation,
  useGetPropertyReviewsQuery,
  useLazyGetPropertyReviewsQuery,
  useGetPropertyRatingSummaryQuery,
  useGetAdminReviewsQuery,
  useFlagReviewMutation,
  useRemoveReviewMutation,
} = reviewsApi;
