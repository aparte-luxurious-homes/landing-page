import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../app/store';
import { BASE_API_URL } from '../utils/url';

/**
 * GET /utils/email-check — what the browser cannot work out on its own about
 * an address: whether its domain accepts mail at all, and whether we have
 * already seen this exact address bounce.
 *
 * Auth is optional on the endpoint; the token is attached when there is one
 * so the server can rate-limit per user rather than per IP.
 */
export interface EmailCheckResult {
  email: string;
  valid_format: boolean;
  /** Full corrected address when a typo is likely, e.g. "tolu@gmail.com". */
  suggestion: string | null;
  /**
   * false = the domain has no mail server. null = the lookup failed or timed
   * out, which means "unknown" and must never be shown as a problem.
   */
  domain_accepts_mail: boolean | null;
  /** This exact address is suppressed / already marked undeliverable. */
  known_undeliverable: boolean;
}

export const utilsApi = createApi({
  reducerPath: 'utilsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState)?.root?.auth?.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    checkEmail: builder.query<EmailCheckResult, string>({
      query: (email) => ({ url: 'utils/email-check', params: { email } }),
      // Accept both a bare body and the API's usual { message, data } wrapper.
      transformResponse: (response: EmailCheckResult | { data?: EmailCheckResult }) =>
        ((response as { data?: EmailCheckResult })?.data ?? response) as EmailCheckResult,
      // Answers are stable for a session; don't re-ask on every blur.
      keepUnusedDataFor: 600,
    }),
  }),
});

export const { useLazyCheckEmailQuery } = utilsApi;
