import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../app/store';

export type DisputeCategory = 'PROPERTY_MISMATCH' | 'CLEANLINESS' | 'MISSING_AMENITIES' | 'UNAVAILABLE_CHECKIN' | 'SAFETY_CONCERNS' | 'GUEST_DAMAGE' | 'RULE_VIOLATION' | 'UNAUTHORIZED_GUEST' | 'OVERSTAYING';
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
    baseUrl: import.meta.env.VITE_API_BASE_URL,
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
      query: (body) => ({
        url: '/api/v1/disputes',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Disputes'],
    }),
    getMyDisputes: builder.query<DisputeResponse[], void>({
      query: () => '/api/v1/disputes/my',
      providesTags: ['Disputes'],
    }),
    uploadDisputeEvidence: builder.mutation<Evidence, { dispute_id: string; evidence: Evidence }>({
      query: ({ dispute_id, evidence }) => ({
        url: `/api/v1/disputes/${dispute_id}/evidence`,
        method: 'POST',
        body: evidence,
      }),
      invalidatesTags: ['Disputes'],
    }),
    // Admin endpoints
    getAdminDisputes: builder.query<DisputeResponse[], { status?: DisputeStatus; property_id?: string; user_id?: string; start_date?: string; end_date?: string; page?: number; size?: number }>({
      query: (params) => ({
        url: '/api/v1/admin/disputes',
        params,
      }),
      providesTags: ['Disputes'],
    }),
    updateDisputeStatus: builder.mutation<DisputeResponse, { dispute_id: string; body: { status: DisputeStatus; admin_notes?: string } }>({
      query: ({ dispute_id, body }) => ({
        url: `/api/v1/admin/disputes/${dispute_id}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Disputes'],
    }),
    requestEvidence: builder.mutation<any, { dispute_id: string; reason: string }>({
      query: ({ dispute_id, reason }) => ({
        url: `/api/v1/admin/disputes/${dispute_id}/request-evidence`,
        method: 'POST',
        body: { reason },
      }),
    }),
    resolveDispute: builder.mutation<any, { dispute_id: string; body: { outcome: DisputeOutcome; admin_notes?: string } }>({
      query: ({ dispute_id, body }) => ({
        url: `/api/v1/admin/disputes/${dispute_id}/resolve`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Disputes'],
    }),
    reopenDispute: builder.mutation<any, { dispute_id: string; reason: string }>({
      query: ({ dispute_id, reason }) => ({
        url: `/api/v1/admin/disputes/${dispute_id}/reopen`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['Disputes'],
    }),
  }),
});

export const {
  useRaiseDisputeMutation,
  useGetMyDisputesQuery,
  useUploadDisputeEvidenceMutation,
  useGetAdminDisputesQuery,
  useUpdateDisputeStatusMutation,
  useRequestEvidenceMutation,
  useResolveDisputeMutation,
  useReopenDisputeMutation,
} = disputesApi;
