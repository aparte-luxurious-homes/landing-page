import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../app/store';
import { BASE_API_URL } from '../utils/url';

export type DisputeCategory = 'PROPERTY_MISMATCH' | 'CLEANLINESS' | 'MISSING_AMENITIES' | 'UNAVAILABLE_CHECKIN' | 'SAFETY_CONCERNS' | 'GUEST_DAMAGE' | 'RULE_VIOLATION' | 'UNAUTHORIZED_GUEST' | 'OVERSTAYING' | 'OTHER';
export type DisputeStatus = 'OPEN' | 'UNDER_REVIEW' | 'AWAITING_EVIDENCE' | 'RESOLVED' | 'CLOSED';
export type DisputeOutcome = 'NO_ACTION' | 'PARTIAL_REFUND' | 'PARTIAL_COMPENSATION' | 'FULL_COMPENSATION';

export interface Evidence {
  media_url: string;
  media_type: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
}

export interface DisputeResponse {
  id: string;
  dispute_id: string;
  booking_id: string;
  raised_by: string;
  category: DisputeCategory;
  description: string;
  status: DisputeStatus;
  outcome: DisputeOutcome | null;
  admin_notes: string | null;
  evidence: Evidence[];
  logs: any[];
  created_at: string;
  updated_at: string;
}

export interface RaiseDisputeRequest {
  booking_id: string;
  category: DisputeCategory;
  description: string;
  evidence?: Evidence[];
}

export const disputesApi = createApi({
  reducerPath: 'disputesApi',
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
  tagTypes: ['Disputes'],
  endpoints: (builder) => ({
    raiseDispute: builder.mutation<DisputeResponse, RaiseDisputeRequest>({
      query: (body) => {
        const formData = new FormData();
        formData.append('booking_id', body.booking_id);
        formData.append('category', body.category);
        formData.append('description', body.description);
        // Note: evidence is usually uploaded via the separate evidence endpoint after creation
        return {
          url: 'disputes',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Disputes'],
    }),
    getMyDisputes: builder.query<DisputeResponse[], void>({
      query: () => 'disputes/my',
      transformResponse: (response: any) => {
        // The API might return data directly, in an 'items' array, or wrapped in a 'data' object
        if (Array.isArray(response)) return response;
        if (response?.data?.items) return response.data.items;
        if (response?.items) return response.items;
        return [];
      },
      providesTags: ['Disputes'],
    }),
    uploadDisputeEvidence: builder.mutation<any, { dispute_id: string; mediaType: string; files: File[] }>({
      query: ({ dispute_id, mediaType, files }) => {
        const formData = new FormData();
        formData.append('media_type', mediaType.toLowerCase());
        // Supports multiple files under the key media_file
        files.forEach((file) => {
          formData.append('media_file', file);
        });
        return {
          url: `disputes/${dispute_id}/evidence`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Disputes'],
    }),
  }),
});

export const {
  useRaiseDisputeMutation,
  useGetMyDisputesQuery,
  useUploadDisputeEvidenceMutation,
} = disputesApi;

