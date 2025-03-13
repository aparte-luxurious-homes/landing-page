import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../app/store';

interface Dispute {
  id: string;
  user_id: string;
  body: string;
  status: string;
  type: string;
  created_at: string;
}

interface GetDisputesResponse {
  message: string;
  data: Array<Dispute>;
}

export interface DisputeRequest {
    type: string;
}

export const disputeApi = createApi({
  reducerPath: 'disputeApi',
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
  tagTypes: ['disputes'],
  endpoints: (builder) => ({
    getAllDisputes: builder.query<GetDisputesResponse, void>({
      query: () => '/disputes',
      providesTags: ['disputes'],
    }),
    getSingleDispute: builder.query<any, string>({
        query: (id) => `/disputes/${id}`,
        providesTags: ['disputes'],
      }),
    submitDispute: builder.mutation<
      { message: string },
      FormData
    >({
      query: (data) => ({
        url: `/disputes`,
        method: 'POST',
        body: data,
        formData: true
    }),
      invalidatesTags: ['disputes'],
    }),
  }),
});

export const {
  useGetAllDisputesQuery,
  useGetSingleDisputeQuery,
  useSubmitDisputeMutation,
} = disputeApi;
