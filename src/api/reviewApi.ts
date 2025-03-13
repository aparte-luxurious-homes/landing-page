import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../app/store';

export interface GetReviewsResponse {
  message: string;
  data: {
    id: string;
    userId: string;
    rating: string;
    review: string;
    bookingId: string;
    createdAt: string;
    user: {
      id: number;
      email: string;
      profile: {
        id: number;
        "firstName": string;
      };
    };
  }[];
}

export interface CreateReviewRequest {
  property_id: string;
  formData: FormData;
  /* unit_id: string;
  booking_id: string;
  rating: number;
  review: string;
  */
  } 

export interface CreateReviewResponse {
  message: string;
  data: { review_id: string };
}

export interface GuestReviewsResponse {
  message: string;
  data: {
    review_id: string;
    owner_id: string;
    rating: number;
    review: string;
    created_at: string;
  }[];
}

export interface CreateGuestReviewRequest {
  guest_id: string;
  booking_id: string;
  rating: number;
  review: string;
}

export const reviewApi = createApi({
  reducerPath: 'reviewApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_ADDONS_API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState)?.root?.auth?.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Profile'],
  endpoints: (builder) => ({
    getPropertyReviews: builder.query<
      GetReviewsResponse,
      { property_id: string; unit_id: string }
    >({
      query: ({ property_id, unit_id }) =>
        `/properties/${property_id}/units/${unit_id}/reviews`,
    }),
    createPropertyReview: builder.mutation<
      CreateReviewResponse,
      CreateReviewRequest
    >({
      query: (params) => {
        const { property_id, formData } = params;
        return {
          url: `/properties/${property_id}/units/${formData.get('unit_id')}/reviews`,
          method: 'POST',
          body: formData,
          formData: true
        };
      },
    }),
    getGuestReviews: builder.query<GuestReviewsResponse, void>({
      query: () => `/guest/guest_id/reviews`,
    }),
    createGuestReview: builder.mutation<
      CreateReviewResponse,
      CreateGuestReviewRequest
    >({
      query: (params) => {
        return {
          url: `/guest/guest_id/reviews`,
          method: 'POST',
          body: params,
        };
      },
    }),
  }),
});

export const {
  useGetPropertyReviewsQuery,
  useCreatePropertyReviewMutation,
  useGetGuestReviewsQuery,
  useCreateGuestReviewMutation,
} = reviewApi;
