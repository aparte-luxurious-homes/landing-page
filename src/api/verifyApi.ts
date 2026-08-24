import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_API_URL } from '../utils/url';

export type CredentialStatus =
  | 'PENDING'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'REVOKED'
  | 'EXPIRED';

export interface VerifyResponse {
  agent_code: string;
  holder_name: string;
  zone: string;
  status: CredentialStatus;
  valid_through: string; // ISO date
  is_valid: boolean;
  message: string;
}

/**
 * Public agent-credential verification (Aparte Verify).
 *
 * The endpoint is unauthenticated — this is the QR-scan hot path — so no token
 * is attached. The server resolves an `AP-XXXXX` code to a live authorisation
 * verdict; the card itself carries no authority.
 */
export const verifyApi = createApi({
  reducerPath: 'verifyApi',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_API_URL }),
  endpoints: (builder) => ({
    verifyCredential: builder.query<VerifyResponse, string>({
      query: (agentCode) => `verify/${encodeURIComponent(agentCode)}`,
    }),
  }),
});

export const { useVerifyCredentialQuery } = verifyApi;
