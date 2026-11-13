/**
 * Flexible-payments API slice — the ONLY module that knows how payment-plan
 * data is fetched or changed.
 *
 * The backend contract for payment plans hasn't been agreed, so no endpoint
 * here touches the network: each one answers with `FLEX_NOT_CONNECTED`, which
 * the screens show as an "unavailable" state. Nothing is invented — no URLs,
 * no sample data.
 *
 * When the spec arrives: give this slice a `fetchBaseQuery` (see
 * bookingsApi.ts for the token header), replace each `queryFn` with a `query`
 * plus a `transformResponse` onto the types in `types/flexPayments.ts`, and
 * flip `FLEX_PAYMENTS_API_CONNECTED` in `lib/flexPayments.ts`. The hooks and
 * the components that call them don't change.
 */
import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';

import type {
  ContributionInvite,
  PaymentPlan,
  PaymentPlanChoice,
  SplitMode,
} from '../types/flexPayments';

export const FLEX_NOT_CONNECTED = 'FLEX_NOT_CONNECTED';

export interface FlexApiError {
  status: typeof FLEX_NOT_CONNECTED;
  data: { message: string };
}

const notConnected = (): { error: FlexApiError } => ({
  error: {
    status: FLEX_NOT_CONNECTED,
    data: { message: "Flexible payments aren't available yet." },
  },
});

export function isFlexNotConnected(error: unknown): boolean {
  return (error as FlexApiError | undefined)?.status === FLEX_NOT_CONNECTED;
}

/** What the gateway SDK needs to take one payment; the server owns every figure. */
export interface FlexPaymentInit {
  reference: string;
  /** Naira, as the existing Monnify/Paystack checkout expects. */
  amount: number;
  provider: 'MONNIFY' | 'PAYSTACK';
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
  provider: string;
  /** Invite friends only. Index 0 of the shares is the initiator. */
  invite?: {
    mode: SplitMode;
    ownShareKobo: number;
    contributors: Array<{ contact: string; shareKobo: number }>;
  };
}

export const flexPaymentsApi = createApi({
  reducerPath: 'flexPaymentsApi',
  baseQuery: fakeBaseQuery<FlexApiError>(),
  tagTypes: ['PaymentPlan'],
  endpoints: (builder) => ({
    /** The plan on one of the signed-in guest's bookings; null for an ordinary booking. */
    getBookingPaymentPlan: builder.query<PaymentPlan | null, string>({
      queryFn: () => notConnected(),
      providesTags: (_result, _error, bookingId) => [{ type: 'PaymentPlan', id: bookingId }],
    }),
    /** Create the plan and get the first payment (initial amount / own share) to take. */
    startPaymentPlan: builder.mutation<FlexPaymentInit, StartPlanRequest>({
      queryFn: () => notConnected(),
      invalidatesTags: (_result, _error, { bookingId }) => [{ type: 'PaymentPlan', id: bookingId }],
    }),
    /** Instalment: start the balance payment from the guest's dashboard. */
    payPlanBalance: builder.mutation<FlexPaymentInit, { bookingId: string; provider: string }>({
      queryFn: () => notConnected(),
      invalidatesTags: (_result, _error, { bookingId }) => [{ type: 'PaymentPlan', id: bookingId }],
    }),
    /** Invite friends: send a contributor their payment link again. */
    resendContributorInvite: builder.mutation<void, { bookingId: string; contributorId: string }>({
      queryFn: () => notConnected(),
      invalidatesTags: (_result, _error, { bookingId }) => [{ type: 'PaymentPlan', id: bookingId }],
    }),
    /** Public: what a contributor sees behind their payment-link token. */
    getContributionInvite: builder.query<ContributionInvite, string>({
      queryFn: () => notConnected(),
    }),
    /** Public: start a contributor's payment for their share. */
    startContributionPayment: builder.mutation<FlexPaymentInit, { token: string; provider: string }>({
      queryFn: () => notConnected(),
    }),
  }),
});

export const {
  useGetBookingPaymentPlanQuery,
  useStartPaymentPlanMutation,
  usePayPlanBalanceMutation,
  useResendContributorInviteMutation,
  useGetContributionInviteQuery,
  useStartContributionPaymentMutation,
} = flexPaymentsApi;
