'use client';

import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';

import GatewayPicker from './GatewayPicker';
import {
  useGetBookingPaymentPlanQuery,
  usePayPlanBalanceMutation,
  useResendContributorInviteMutation,
} from '../../api/flexPaymentsApi';
import { useGetProfileQuery } from '../../api/profileApi';
import { useGatewayCheckout } from '../../hooks/useGatewayCheckout';
import { extractErrorMessage } from '../../utils/errorHandler';
import {
  CONTRIBUTOR_STATUS_LABEL,
  FLEX_KIND_LABEL,
  FLEX_PAYMENTS_API_CONNECTED,
  FLEX_STATUS_LABEL,
  formatKobo,
  formatTimeLeft,
  isContributorPayable,
  isOpenPayment,
  msUntil,
  percentPaid,
} from '../../lib/flexPayments';
import type {
  ContributorStatus,
  FlexPaymentStatus,
  PaymentPlan,
  PlanPaymentStatus,
} from '../../types/flexPayments';

type Tone = 'neutral' | 'amber' | 'green' | 'red' | 'blue';

const TONE_CLASS: Record<Tone, string> = {
  neutral: 'bg-gray-100 text-gray-700',
  amber: 'bg-amber-100 text-amber-800',
  green: 'bg-emerald-100 text-emerald-800',
  red: 'bg-red-100 text-red-700',
  blue: 'bg-sky-100 text-sky-800',
};

const PLAN_TONE: Record<FlexPaymentStatus, Tone> = {
  PENDING: 'amber',
  PROCESSING: 'blue',
  PARTIALLY_PAID: 'amber',
  FULLY_PAID: 'green',
  FAILED: 'red',
  EXPIRED: 'red',
  REFUNDED: 'neutral',
};

const CONTRIBUTOR_TONE: Record<ContributorStatus, Tone> = {
  PENDING: 'amber',
  PROCESSING: 'blue',
  PAID: 'green',
  FAILED: 'red',
  EXPIRED: 'red',
  REFUNDED: 'neutral',
};

const PAYMENT_LABEL: Record<PlanPaymentStatus, string> = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  SUCCESS: 'Paid',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
};

const PAYMENT_TONE: Record<PlanPaymentStatus, Tone> = {
  PENDING: 'amber',
  PROCESSING: 'blue',
  SUCCESS: 'green',
  FAILED: 'red',
  REFUNDED: 'neutral',
};

const Pill: React.FC<{ tone: Tone; children: React.ReactNode }> = ({ tone, children }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold whitespace-nowrap ${TONE_CLASS[tone]}`}>
    {children}
  </span>
);

const formatDateTime = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString('en-NG', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : '—';

/** One line saying what happens next, or what happened. */
function deadlineLine(plan: PaymentPlan): { text: string; urgent: boolean } | null {
  const left = msUntil(plan.dueAt);
  const what = plan.kind === 'INSTALMENT' ? 'Balance due' : 'Everyone must pay by';
  switch (plan.status) {
    case 'FULLY_PAID':
      return { text: 'Paid in full. Nothing more to pay.', urgent: false };
    case 'REFUNDED':
      return { text: 'This booking was cancelled and the payments were refunded.', urgent: false };
    case 'EXPIRED':
      return {
        text:
          plan.kind === 'INSTALMENT'
            ? 'The balance was not paid in time, so the booking was cancelled under the cancellation policy.'
            : 'Not everyone paid in time, so the dates were released. Payments already made are being refunded.',
        urgent: true,
      };
    default:
      if (left === null) return null;
      if (left <= 0) return { text: `${what} ${formatDateTime(plan.dueAt)} — now overdue.`, urgent: true };
      return {
        text: `${what} ${formatDateTime(plan.dueAt)} · ${formatTimeLeft(left)} left`,
        urgent: left < 24 * 3_600_000,
      };
  }
}

interface PaymentPlanCardProps {
  /** The booking's id as used in /account/bookings/[bookingId]. */
  bookingId: string;
}

/**
 * The guest's view of a flexible payment plan on their booking page (PRD
 * section 8, Guest): breakdown, outstanding balance and deadline, pay the
 * balance, each contributor's status with "resend invitation", and the
 * payments made so far.
 *
 * Renders nothing for an ordinary booking, and nothing at all until the
 * payments API is connected.
 */
const PaymentPlanCard: React.FC<PaymentPlanCardProps> = ({ bookingId }) => {
  const { data: plan, isLoading, isError, refetch } = useGetBookingPaymentPlanQuery(bookingId, {
    skip: !FLEX_PAYMENTS_API_CONNECTED || !bookingId,
  });
  const { data: profileData } = useGetProfileQuery(undefined, { skip: !FLEX_PAYMENTS_API_CONNECTED });
  const [payBalance, { isLoading: isStartingBalance }] = usePayPlanBalanceMutation();
  const [resendInvite] = useResendContributorInviteMutation();
  const [gateway, setGateway] = useState('');
  const [payOpen, setPayOpen] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const { openGateway, isGatewayReady } = useGatewayCheckout(gateway);

  if (!FLEX_PAYMENTS_API_CONNECTED) return null;

  if (isLoading) {
    return <div className="mt-6 h-40 rounded-2xl bg-gray-100 animate-pulse" aria-hidden />;
  }

  if (isError) {
    return (
      <div className="mt-6 rounded-2xl border border-gray-200 p-4 flex items-center justify-between gap-4">
        <p className="text-sm text-gray-600">We couldn&apos;t load the payment plan for this booking.</p>
        <button type="button" onClick={() => refetch()} className="shrink-0 text-sm font-semibold text-[#026672] underline">
          Try again
        </button>
      </div>
    );
  }

  if (!plan) return null;

  const outstandingKobo = Math.max(0, plan.totalKobo - plan.paidKobo);
  const percent = percentPaid(plan.paidKobo, plan.totalKobo);
  const open = isOpenPayment(plan.status);
  const deadline = deadlineLine(plan);
  const canPayBalance = plan.kind === 'INSTALMENT' && open && plan.status !== 'PROCESSING' && outstandingKobo > 0;
  const contributors = plan.contributors ?? [];
  const paidCount = contributors.filter((c) => c.status === 'PAID').length;

  const handlePayBalance = async () => {
    if (!gateway) {
      toast.error('Choose a payment partner first.');
      return;
    }
    try {
      const init = await payBalance({ bookingId, provider: gateway }).unwrap();
      const profile = profileData?.data;
      const opened = openGateway({
        init,
        email: profile?.email ?? '',
        fullName: [profile?.profile?.firstName, profile?.profile?.lastName].filter(Boolean).join(' '),
        description: `Balance payment for booking ${bookingId}`,
        returnUrl: `${window.location.origin}/booking-validation?paymentReference=${encodeURIComponent(init.reference)}&bookingId=${encodeURIComponent(bookingId)}&provider=${init.provider}`,
        onClosed: () => toast.info('Payment was cancelled. You can try again.'),
      });
      if (!opened) toast.error('Payment system unavailable. Please refresh the page.');
    } catch (err) {
      toast.error(extractErrorMessage(err, 'We could not start the payment. Please try again.'));
    }
  };

  const handleResend = async (contributorId: string) => {
    setResendingId(contributorId);
    try {
      await resendInvite({ bookingId, contributorId }).unwrap();
      toast.success('Invitation sent again.');
    } catch (err) {
      toast.error(extractErrorMessage(err, 'We could not resend the invitation.'));
    } finally {
      setResendingId(null);
    }
  };

  return (
    <section aria-labelledby="payment-plan-heading" className="mt-6 rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-4 sm:px-5 py-4 bg-[#F6FAFB] border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#028090]">Payment plan</p>
          <h3 id="payment-plan-heading" className="text-lg font-semibold text-gray-900">
            {FLEX_KIND_LABEL[plan.kind]}
          </h3>
        </div>
        <Pill tone={PLAN_TONE[plan.status]}>{FLEX_STATUS_LABEL[plan.status]}</Pill>
      </div>

      <div className="px-4 sm:px-5 py-4">
        {/* Paid vs outstanding */}
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-2xl font-semibold text-gray-900">
            {formatKobo(plan.paidKobo)}
            <span className="text-base font-normal text-gray-500"> paid of {formatKobo(plan.totalKobo)}</span>
          </p>
          <p className="text-sm font-semibold text-gray-700">{percent}%</p>
        </div>
        <div
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Amount paid"
          className="mt-2 h-2.5 rounded-full bg-gray-200 overflow-hidden"
        >
          <div className="h-full rounded-full bg-[#028090] transition-all" style={{ width: `${percent}%` }} />
        </div>
        {outstandingKobo > 0 && open && (
          <p className="mt-2 text-sm text-gray-700">
            <span className="font-semibold">{formatKobo(outstandingKobo)}</span> outstanding
            {plan.kind === 'INVITE_FRIENDS' && contributors.length > 0
              ? ` · ${paidCount} of ${contributors.length} people have paid`
              : ''}
          </p>
        )}
        {deadline && (
          <p className={`mt-3 flex gap-2 text-sm ${deadline.urgent ? 'text-red-700 font-semibold' : 'text-gray-600'}`}>
            <Icon icon={deadline.urgent ? 'mdi:alert-circle-outline' : 'mdi:calendar-clock-outline'} width={18} className="shrink-0 mt-0.5" />
            {deadline.text}
          </p>
        )}
        {plan.status === 'PROCESSING' && (
          <p className="mt-3 flex gap-2 text-sm text-sky-800">
            <Icon icon="mdi:progress-clock" width={18} className="shrink-0 mt-0.5" />
            We&apos;re confirming a payment with the bank. This usually takes a moment.
          </p>
        )}
        {plan.kind === 'INVITE_FRIENDS' && open && (
          <p className="mt-3 text-sm text-gray-600">
            Your booking is confirmed once everyone has paid. Until then the dates are only held for you.
          </p>
        )}

        {/* Pay the balance */}
        {canPayBalance && (
          <div className="mt-4">
            {!payOpen ? (
              <button
                type="button"
                onClick={() => setPayOpen(true)}
                className="w-full sm:w-auto rounded-full bg-[#028090] px-6 py-3 font-bold text-white hover:bg-[#026d7a] transition-colors"
              >
                Pay balance · {formatKobo(outstandingKobo)}
              </button>
            ) : (
              <div className="rounded-2xl border border-gray-200 p-4">
                <GatewayPicker value={gateway} onChange={setGateway} />
                <div className="mt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                  <button type="button" onClick={() => setPayOpen(false)} className="rounded-full px-5 py-2.5 font-semibold text-gray-700 hover:bg-gray-100">
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handlePayBalance}
                    disabled={!gateway || !isGatewayReady || isStartingBalance}
                    className="rounded-full bg-[#028090] px-6 py-2.5 font-bold text-white hover:bg-[#026d7a] disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                  >
                    {isStartingBalance ? 'Starting payment…' : `Pay ${formatKobo(outstandingKobo)}`}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Contributors */}
        {plan.kind === 'INVITE_FRIENDS' && contributors.length > 0 && (
          <div className="mt-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Who&apos;s paying</h4>
            <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200">
              {contributors.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-3.5 py-3">
                  <div className="flex-1 min-w-[10rem]">
                    <p className="font-semibold text-gray-900 break-all">
                      {c.isInitiator ? 'You' : c.displayName || c.contact}
                    </p>
                    {!c.isInitiator && c.displayName && c.contact && c.displayName !== c.contact && (
                      <p className="text-sm text-gray-500 break-all">{c.contact}</p>
                    )}
                    {c.status === 'PAID' && c.paidAt && (
                      <p className="text-sm text-gray-500">Paid {formatDateTime(c.paidAt)}</p>
                    )}
                  </div>
                  <p className="font-semibold text-gray-900">{formatKobo(c.shareKobo)}</p>
                  <Pill tone={CONTRIBUTOR_TONE[c.status]}>{CONTRIBUTOR_STATUS_LABEL[c.status]}</Pill>
                  {open && !c.isInitiator && isContributorPayable(c.status) && (
                    <button
                      type="button"
                      onClick={() => handleResend(c.id)}
                      disabled={resendingId === c.id}
                      className="rounded-full border border-gray-300 px-3.5 py-1.5 text-sm font-semibold text-gray-800 hover:border-[#028090] hover:text-[#026672] disabled:opacity-50 transition-colors"
                    >
                      {resendingId === c.id ? 'Sending…' : 'Resend invitation'}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Payments */}
        {plan.payments.length > 0 && (
          <div className="mt-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Payments</h4>
            <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200">
              {plan.payments.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-3.5 py-3">
                  <div className="flex-1 min-w-[10rem]">
                    <p className="font-semibold text-gray-900">{p.label}</p>
                    <p className="text-sm text-gray-500 break-all">
                      {p.paidAt ? `${formatDateTime(p.paidAt)} · ` : ''}
                      {p.reference}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900">{formatKobo(p.amountKobo)}</p>
                  <Pill tone={PAYMENT_TONE[p.status]}>{PAYMENT_LABEL[p.status]}</Pill>
                  {p.receiptUrl && (
                    <a href={p.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-[#026672] underline">
                      Receipt
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
};

export default PaymentPlanCard;
