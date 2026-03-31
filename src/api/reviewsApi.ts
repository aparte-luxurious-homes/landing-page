import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../app/store';
import { BASE_API_URL } from '../utils/url';


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
  user?: {
    first_name: string;
    last_name?: string;
    name?: string;
    avatar_url?: string;
  };
  reviewer_name?: string;
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
    baseUrl: BASE_API_URL,
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
        url: 'reviews',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Reviews', 'RatingSummary'],
    }),
    getPropertyReviews: builder.query<ReviewResponse[], { property_id: string; page?: number; size?: number }>({
      query: ({ property_id, ...params }) => ({
        url: `properties/${property_id}/reviews`,
        params,
      }),
      transformResponse: (response: { items: ReviewResponse[] } | ReviewResponse[]) => {
        return Array.isArray(response) ? response : (response?.items || []);
      },
      providesTags: ['Reviews'],
    }),
    getPropertyRatingSummary: builder.query<RatingSummary, string>({
      query: (property_id) => `properties/${property_id}/reviews/summary`,
      providesTags: ['RatingSummary'],
    }),
  }),
});

export const {
  useSubmitReviewMutation,
  useGetPropertyReviewsQuery,
  useLazyGetPropertyReviewsQuery,
  useGetPropertyRatingSummaryQuery,
} = reviewsApi;

