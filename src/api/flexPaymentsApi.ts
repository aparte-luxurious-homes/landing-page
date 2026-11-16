/**
 * Flexible-payments API slice: the ONLY module that knows how payment-plan
 * data is fetched or changed (api-v1 services/payment_plans).
 *
 * Every amount comes from the server. Checkout previews the split, but the
 * server re-derives it and charges what it says, so nothing the browser sends
 * can change what a payment costs.
 */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { RootState } from '../app/store';
import { BASE_API_URL } from '../utils/url';
import type {
  ContributionInvite,
  PaymentPlan,
  PaymentPlanChoice,
  SplitMode,
} from '../types/flexPayments';

/** Kept so screens written against the placeholder keep compiling. */
export const FLEX_NOT_CONNECTED = 'FLEX_NOT_CONNECTED';

export function isFlexNotConnected(error: unknown): boolean {
  return (error as { status?: unknown } | undefined)?.status === FLEX_NOT_CONNECTED;
}

/** What the gateway SDK needs to take one payment; the server owns every figure. */
export interface FlexPaymentInit {
  reference: string;
  /** Naira, as the Monnify/Paystack checkout expects: the share plus the gateway's fee. */
  amount: number;
  amountKobo: number;
  feeKobo: number;
  chargeKobo: number;
  provider: 'MONNIFY' | 'PAYSTACK' | 'WALLET';
  /** SUCCESSFUL when a wallet payment settled on the spot. */
  status: 'PENDING' | 'SUCCESSFUL';
  /**
   * Contributor links only: the address the gateway should send its receipt
   * to. The browser never holds a contributor's contact details otherwise.
   */
  payerEmail?: string;
}

/** Checkout hands this over once the booking exists. */
export interface StartPlanRequest {
  bookingId: string;
  plan: Exclude<PaymentPlanChoice, 'FULL'>;
  /** 'MONNIFY' | 'PAYSTACK', or 'WALLET' to pay from the Aparte wallet. */
  provider: string;
  /** Invite friends only. */
  invite?: {
    mode: SplitMode;
    ownShareKobo: number;
    contributors: Array<{ contact: string; shareKobo: number }>;
  };
}

interface Envelope<T> {
  message?: string;
  data: T;
}

export const flexPaymentsApi = createApi({
  reducerPath: 'flexPaymentsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState)?.root?.auth?.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['PaymentPlan', 'Contribution'],
  endpoints: (builder) => ({
    /** The plan on one of the signed-in guest's bookings; null for an ordinary booking. */
    getBookingPaymentPlan: builder.query<PaymentPlan | null, string>({
      query: (bookingId) => `bookings/${encodeURIComponent(bookingId)}/payment-plan`,
      transformResponse: (res: Envelope<PaymentPlan | null>) => res.data ?? null,
      providesTags: (_result, _error, bookingId) => [{ type: 'PaymentPlan', id: bookingId }],
    }),
    /** Create the plan and get the first payment (initial amount / own share) to take. */
    startPaymentPlan: builder.mutation<FlexPaymentInit, StartPlanRequest>({
      query: ({ bookingId, plan, provider, invite }) => ({
        url: `bookings/${encodeURIComponent(bookingId)}/payment-plan`,
        method: 'POST',
        body: {
          plan,
          provider,
          ...(invite && {
            invite: {
              mode: invite.mode,
              own_share_kobo: invite.ownShareKobo,
              contributors: invite.contributors.map((c) => ({ contact: c.contact, share_kobo: c.shareKobo })),
            },
          }),
        },
      }),
      transformResponse: (res: Envelope<FlexPaymentInit>) => res.data,
      invalidatesTags: (_result, _error, { bookingId }) => [{ type: 'PaymentPlan', id: bookingId }],
    }),
    /** Instalment: start the balance payment from the guest's dashboard. */
    payPlanBalance: builder.mutation<FlexPaymentInit, { bookingId: string; provider: string }>({
      query: ({ bookingId, provider }) => ({
        url: `bookings/${encodeURIComponent(bookingId)}/payment-plan/balance`,
        method: 'POST',
        body: { provider },
      }),
      transformResponse: (res: Envelope<FlexPaymentInit>) => res.data,
      invalidatesTags: (_result, _error, { bookingId }) => [{ type: 'PaymentPlan', id: bookingId }],
    }),
    /** Ask the gateway about the guest's own in-flight plan payments, then return the plan. */
    verifyBookingPaymentPlan: builder.mutation<PaymentPlan | null, string>({
      query: (bookingId) => ({
        url: `bookings/${encodeURIComponent(bookingId)}/payment-plan/verify`,
        method: 'POST',
      }),
      transformResponse: (res: Envelope<PaymentPlan | null>) => res.data ?? null,
      invalidatesTags: (_result, _error, bookingId) => [{ type: 'PaymentPlan', id: bookingId }],
    }),
    /** Invite friends: send a contributor their payment link again. */
    resendContributorInvite: builder.mutation<void, { bookingId: string; contributorId: string }>({
      query: ({ bookingId, contributorId }) => ({
        url: `bookings/${encodeURIComponent(bookingId)}/payment-plan/contributors/${encodeURIComponent(contributorId)}/resend`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { bookingId }) => [{ type: 'PaymentPlan', id: bookingId }],
    }),
    /** Public: what a contributor sees behind their payment-link token. */
    getContributionInvite: builder.query<ContributionInvite, string>({
      query: (token) => `payment-plans/contributions/${encodeURIComponent(token)}`,
      transformResponse: (res: Envelope<ContributionInvite>) => res.data,
      providesTags: (_result, _error, token) => [{ type: 'Contribution', id: token }],
    }),
    /** Public: start a contributor's payment for their share. */
    startContributionPayment: builder.mutation<FlexPaymentInit, { token: string; provider: string }>({
      query: ({ token, provider }) => ({
        url: `payment-plans/contributions/${encodeURIComponent(token)}/pay`,
        method: 'POST',
        body: { provider },
      }),
      transformResponse: (res: Envelope<FlexPaymentInit>) => res.data,
    }),
    /** Public: check the contributor's payment with the gateway; returns the link's state. */
    verifyContributionPayment: builder.mutation<ContributionInvite, string>({
      query: (token) => ({
        url: `payment-plans/contributions/${encodeURIComponent(token)}/verify`,
        method: 'POST',
      }),
      transformResponse: (res: Envelope<ContributionInvite>) => res.data,
      invalidatesTags: (_result, _error, token) => [{ type: 'Contribution', id: token }],
    }),
  }),
});

export const {
  useGetBookingPaymentPlanQuery,
  useStartPaymentPlanMutation,
  usePayPlanBalanceMutation,
  useVerifyBookingPaymentPlanMutation,
  useResendContributorInviteMutation,
  useGetContributionInviteQuery,
  useStartContributionPaymentMutation,
  useVerifyContributionPaymentMutation,
} = flexPaymentsApi;
