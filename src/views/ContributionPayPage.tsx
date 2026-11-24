'use client';

import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';

import GatewayPicker from '../components/booking/GatewayPicker';
import Logo from '../components/header/Logo';
import {
  useGetContributionInviteQuery,
  useStartContributionPaymentMutation,
} from '../api/flexPaymentsApi';
import { useGatewayCheckout } from '../hooks/useGatewayCheckout';
import { extractErrorMessage } from '../utils/errorHandler';
import { formatKobo, formatTimeLeft, msUntil } from '../lib/flexPayments';
import type { ContributionInvite } from '../types/flexPayments';

const SERIF = 'Fraunces, ui-serif, Georgia, serif';

const formatDate = (value: string) => {
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleDateString('en-NG', { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
};

const formatDateTime = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })
    : '';

/** A centred message with an icon: every non-payable state of the link. */
const Notice: React.FC<{
  icon: string;
  tone: 'green' | 'amber' | 'red' | 'blue';
  title: string;
  children: React.ReactNode;
}> = ({ icon, tone, title, children }) => {
  const tones = {
    green: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-700',
    red: 'bg-red-100 text-red-700',
    blue: 'bg-sky-100 text-sky-700',
  };
  return (
    <div className="text-center py-4">
      <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${tones[tone]}`}>
        <Icon icon={icon} width={32} />
      </div>
      <h1 className="text-2xl font-semibold text-[#191919]" style={{ fontFamily: SERIF }}>
        {title}
      </h1>
      <div className="mt-2 space-y-3 text-[15px] text-gray-600">{children}</div>
    </div>
  );
};

const StaySummary: React.FC<{ invite: ContributionInvite }> = ({ invite }) => (
  <div className="flex gap-4 rounded-2xl border border-gray-200 p-3">
    {invite.propertyImage ? (
      <img src={invite.propertyImage} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
    ) : (
      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-[#E3F2F4] text-[#026672]">
        <Icon icon="mdi:home-city-outline" width={30} />
      </div>
    )}
    <div className="min-w-0">
      <p className="font-semibold text-gray-900">{invite.propertyName}</p>
      {invite.propertyLocation && <p className="text-sm text-gray-500">{invite.propertyLocation}</p>}
      <p className="mt-1 text-sm text-gray-700">
        {formatDate(invite.checkIn)} – {formatDate(invite.checkOut)}
      </p>
    </div>
  </div>
);

interface ContributionPayPageProps {
  token: string;
}

/**
 * What a contributor sees behind their payment link (PRD 5.3 steps 6–8): the
 * stay, who invited them, exactly their share and how long is left, then the
 * gateway. It shows how many people have paid but never who they are (PRD
 * section 10, data privacy).
 */
const ContributionPayPage: React.FC<ContributionPayPageProps> = ({ token }) => {
  const { data: invite, isLoading, isError, refetch, isFetching } = useGetContributionInviteQuery(token, {
    skip: !token,
  });
  const [startPayment, { isLoading: isStarting }] = useStartContributionPaymentMutation();
  const [gateway, setGateway] = useState('');
  const { openGateway, isGatewayReady } = useGatewayCheckout(gateway);

  // Re-render each minute so the time left stays honest while the page is open.
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const handlePay = async () => {
    if (!invite) return;
    if (!gateway) {
      toast.error('Choose a payment partner first.');
      return;
    }
    try {
      const init = await startPayment({ token, provider: gateway }).unwrap();
      const opened = openGateway({
        init,
        email: init.payerEmail ?? '',
        description: `Your share of ${invite.propertyName}`,
        // Back to this page: it re-reads the server's verified status.
        returnUrl: window.location.href.split('?')[0],
        onClosed: () => toast.info('Payment was cancelled. You can try again.'),
      });
      if (!opened) toast.error('Payment system unavailable. Please refresh the page.');
    } catch (err) {
      toast.error(extractErrorMessage(err, 'We could not start the payment. Please try again.'));
    }
  };

  const body = () => {
    if (isLoading) {
      return (
        <div className="space-y-4" aria-busy="true" aria-label="Loading your payment link">
          <div className="h-8 w-2/3 rounded-lg bg-gray-100 animate-pulse" />
          <div className="h-24 rounded-2xl bg-gray-100 animate-pulse" />
          <div className="h-32 rounded-2xl bg-gray-100 animate-pulse" />
        </div>
      );
    }

    if (isError || !invite) {
      return (
        <Notice icon="mdi:link-variant-off" tone="amber" title="This payment link isn't available">
          <p>
            It may have expired, already been used, or been copied incompletely. Ask the person who invited you to
            send it again from their Aparte bookings.
          </p>
        </Notice>
      );
    }

    const left = msUntil(invite.expiresAt);
    const progress = `${invite.paidCount} of ${invite.contributorCount} people have paid`;

    if (invite.status === 'PAID') {
      return (
        <>
          <Notice icon="mdi:check-circle-outline" tone="green" title="You've paid your share">
            <p>
              Thank you. {formatKobo(invite.shareKobo)} received{invite.paidAt ? ` on ${formatDateTime(invite.paidAt)}` : ''}.
            </p>
          </Notice>
          <div className="mt-4 space-y-4">
            <StaySummary invite={invite} />
            <dl className="rounded-2xl bg-gray-50 p-4 text-sm space-y-2">
              {invite.reference && (
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Reference</dt>
                  <dd className="font-mono text-gray-900 break-all text-right">{invite.reference}</dd>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Booking progress</dt>
                <dd className="font-medium text-gray-900">{progress}</dd>
              </div>
            </dl>
            <p className="text-sm text-gray-600">
              {invite.paidCount >= invite.contributorCount
                ? 'Everyone has paid, so the booking is confirmed.'
                : 'The booking is confirmed once everyone has paid. If that doesn’t happen in time, your payment is refunded.'}
            </p>
            {invite.receiptUrl && (
              <a
                href={invite.receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full rounded-full border border-gray-300 py-3 text-center font-semibold text-gray-800 hover:border-[#028090] hover:text-[#026672]"
              >
                View receipt
              </a>
            )}
          </div>
        </>
      );
    }

    if (invite.status === 'PROCESSING') {
      return (
        <Notice icon="mdi:progress-clock" tone="blue" title="We're confirming your payment">
          <p>This usually takes a moment. You don&apos;t need to pay again.</p>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="rounded-full border border-gray-300 px-5 py-2.5 font-semibold text-gray-800 hover:border-[#028090] hover:text-[#026672] disabled:opacity-50"
          >
            {isFetching ? 'Checking…' : 'Check again'}
          </button>
        </Notice>
      );
    }

    if (invite.status === 'REFUNDED') {
      return (
        <Notice icon="mdi:cash-refund" tone="blue" title="Your payment was refunded">
          <p>
            This booking didn&apos;t go ahead, so {formatKobo(invite.shareKobo)} was returned to the account or card
            you paid with.
          </p>
        </Notice>
      );
    }

    if (invite.status === 'EXPIRED' || (left !== null && left <= 0)) {
      return (
        <Notice icon="mdi:timer-off-outline" tone="red" title="This invitation has expired">
          <p>
            The time to pay for this booking ran out and the dates were released. Nothing was taken from you. If the
            group still wants to book, {invite.initiatorName} can start again on Aparte.
          </p>
        </Notice>
      );
    }

    // PENDING or FAILED: the share can be paid.
    return (
      <>
        <p className="text-xs font-bold uppercase tracking-wider text-[#028090]">Invite friends to pay</p>
        <h1 className="mt-1 text-3xl font-semibold leading-tight text-[#191919]" style={{ fontFamily: SERIF }}>
          {invite.initiatorName} invited you to pay your share
        </h1>

        {invite.status === 'FAILED' && (
          <p role="alert" className="mt-4 flex gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            <Icon icon="mdi:alert-circle-outline" width={18} className="mt-0.5 shrink-0" />
            Your last payment didn&apos;t go through and you were not charged. You can try again.
          </p>
        )}

        <div className="mt-5 space-y-4">
          <StaySummary invite={invite} />

          <div className="rounded-2xl border border-[#028090]/15 bg-[#F6FAFB] p-4">
            <div className="flex items-baseline justify-between gap-4">
              <p className="font-semibold text-gray-900">Your share</p>
              <p className="text-3xl font-semibold text-[#191919]" style={{ fontFamily: SERIF }}>
                {formatKobo(invite.shareKobo)}
              </p>
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-600">
              <Icon icon="mdi:account-group-outline" width={16} />
              {progress}
            </p>
            {left !== null && (
              <p className={`mt-1 flex items-center gap-1.5 text-sm ${left < 3 * 3_600_000 ? 'font-semibold text-red-700' : 'text-gray-600'}`}>
                <Icon icon="mdi:timer-sand" width={16} />
                {formatTimeLeft(left)} left to pay · by {formatDateTime(invite.expiresAt)}
              </p>
            )}
          </div>

          <GatewayPicker value={gateway} onChange={setGateway} />

          <button
            type="button"
            onClick={handlePay}
            disabled={!gateway || !isGatewayReady || isStarting}
            className="w-full rounded-full bg-[#028090] px-4 py-4 text-base font-bold text-white shadow-[0_10px_24px_-10px_rgba(2,128,144,0.8)] transition-all hover:bg-[#026d7a] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500 disabled:shadow-none"
          >
            {isStarting
              ? 'Starting payment…'
              : !gateway
                ? 'Choose a payment partner'
                : `Pay ${formatKobo(invite.shareKobo)}`}
          </button>

          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex gap-2">
              <Icon icon="mdi:lock-outline" width={18} className="mt-0.5 shrink-0 text-[#028090]" />
              You pay Aparte securely. Your card details are never stored by Aparte.
            </li>
            <li className="flex gap-2">
              <Icon icon="mdi:cash-refund" width={18} className="mt-0.5 shrink-0 text-[#028090]" />
              If the booking isn&apos;t fully paid in time, your payment is refunded.
            </li>
          </ul>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-[#F3F3F3]">
      <header className="mx-auto flex max-w-lg items-center px-4 py-5">
        <Logo />
      </header>
      <main className="mx-auto max-w-lg px-4 pb-16">
        <div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_24px_48px_-16px_rgba(25,25,25,0.2)] md:p-6">
          {body()}
        </div>
      </main>
    </div>
  );
};

export default ContributionPayPage;
