'use client';

import React from 'react';
import { Icon } from '@iconify/react';

import { Option } from './PaymentMethodSelection';
import InviteFriendsPanel from './InviteFriendsPanel';
import { Link } from '@/lib/router';
import { formatKobo, type InviteDraftResult } from '../../lib/flexPayments';
import type {
  InstalmentConfig,
  InviteFriendsConfig,
  InviteFriendsDraft,
  PaymentPlanChoice,
} from '../../types/flexPayments';

const SERIF = 'Fraunces, ui-serif, Georgia, serif';

export interface InstalmentQuote {
  config: InstalmentConfig;
  initialKobo: number;
  balanceKobo: number;
  /** "Wed, 11 Nov 2026" */
  deadlineLabel: string;
  /** False when the balance deadline has already passed for these dates. */
  eligible: boolean;
}

interface PaymentPlanSelectionProps {
  plan: PaymentPlanChoice;
  onPlanChange: (plan: PaymentPlanChoice) => void;
  totalKobo: number;
  /** Null when the listing doesn't offer instalments. */
  instalment: InstalmentQuote | null;
  /** Null when the listing doesn't offer Invite Friends to Pay. */
  inviteConfig: InviteFriendsConfig | null;
  inviteDraft: InviteFriendsDraft;
  onInviteDraftChange: (draft: InviteFriendsDraft) => void;
  inviteResult: InviteDraftResult;
  showInviteErrors: boolean;
  /** Local review mode: say so on the card, so nobody mistakes it for live. */
  preview?: boolean;
}

/**
 * "How much do you want to pay now?" — Pay in full, Pay in instalments, or
 * Invite friends to pay (PRD 4.3, 5.3). Rendered above the payment-method
 * card, and only when the listing offers at least one flexible option.
 */
const PaymentPlanSelection: React.FC<PaymentPlanSelectionProps> = ({
  plan,
  onPlanChange,
  totalKobo,
  instalment,
  inviteConfig,
  inviteDraft,
  onInviteDraftChange,
  inviteResult,
  showInviteErrors,
}) => {
  const balancePercent = instalment ? 100 - instalment.config.initial_percentage : 0;

  return (
    <div className="bg-white rounded-[28px] shadow-[0_24px_48px_-16px_rgba(25,25,25,0.2)] border border-black/5 p-5 md:p-6 mb-4">
      <h2 className="text-2xl font-semibold text-[#191919] mb-1" style={{ fontFamily: SERIF }}>
        Choose how to pay
      </h2>
      <p className="text-sm text-gray-500 mb-4">Pay it all today, spread it, or share it with friends.</p>

      <div role="radiogroup" aria-label="Payment plan" className="space-y-3">
        <Option
          selected={plan === 'FULL'}
          onSelect={() => onPlanChange('FULL')}
          icon={<Icon icon="mdi:cash-check" width={22} />}
          title="Pay in full"
          hint={`${formatKobo(totalKobo)} today`}
        />

        {instalment && (
          <div>
            <Option
              selected={plan === 'INSTALMENT'}
              onSelect={() => onPlanChange('INSTALMENT')}
              icon={<Icon icon="mdi:chart-pie-outline" width={22} />}
              title="Pay in instalments"
              hint={
                instalment.eligible
                  ? `${formatKobo(instalment.initialKobo)} today, the rest by ${instalment.deadlineLabel}`
                  : 'Not available for dates this close to check-in'
              }
              badge={instalment.eligible ? `${instalment.config.initial_percentage}% now` : undefined}
              disablePaymentOption={!instalment.eligible}
            />
            {plan === 'INSTALMENT' && instalment.eligible && (
              <div className="mt-3 rounded-2xl bg-[#F6FAFB] border border-[#028090]/15 p-4 md:p-5">
                <dl className="space-y-3 text-[15px]">
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-gray-700">
                      Pay today <span className="text-gray-400">({instalment.config.initial_percentage}%)</span>
                    </dt>
                    <dd className="font-semibold text-gray-900">{formatKobo(instalment.initialKobo)}</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-gray-700">
                      Balance <span className="text-gray-400">({balancePercent}%)</span>
                      <span className="block text-sm text-gray-500">Due by {instalment.deadlineLabel}</span>
                    </dt>
                    <dd className="font-semibold text-gray-900">{formatKobo(instalment.balanceKobo)}</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 pt-3 border-t border-dashed border-gray-300">
                    <dt className="font-semibold text-gray-900">Total</dt>
                    <dd className="font-semibold text-gray-900">{formatKobo(totalKobo)}</dd>
                  </div>
                </dl>
                <ul className="mt-4 pt-4 border-t border-[#028090]/15 space-y-2 text-sm text-gray-600">
                  <li className="flex gap-2">
                    <Icon icon="mdi:check-decagram-outline" width={18} className="shrink-0 mt-0.5 text-[#028090]" />
                    Your booking is confirmed as soon as today&apos;s payment goes through. No interest, no extra fees.
                  </li>
                  <li className="flex gap-2">
                    <Icon icon="mdi:bell-ring-outline" width={18} className="shrink-0 mt-0.5 text-[#028090]" />
                    Pay the balance from My bookings any time before the deadline. We&apos;ll remind you.
                  </li>
                  <li className="flex gap-2">
                    <Icon icon="mdi:alert-circle-outline" width={18} className="shrink-0 mt-0.5 text-[#028090]" />
                    <span>
                      If the balance isn&apos;t paid in time, the booking is cancelled under the{' '}
                      <Link to="/cancellation-policy" target="_blank" className="font-semibold text-[#026672] underline">
                        cancellation policy
                      </Link>
                      .
                    </span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}

        {inviteConfig && (
          <div>
            <Option
              selected={plan === 'INVITE_FRIENDS'}
              onSelect={() => onPlanChange('INVITE_FRIENDS')}
              icon={<Icon icon="mdi:account-multiple-plus-outline" width={22} />}
              title="Invite friends to pay"
              hint={`Split the cost between ${inviteConfig.min_contributors === inviteConfig.max_contributors ? inviteConfig.max_contributors : `up to ${inviteConfig.max_contributors}`} people, each with their own payment link`}
            />
            {plan === 'INVITE_FRIENDS' && (
              <InviteFriendsPanel
                config={inviteConfig}
                totalKobo={totalKobo}
                draft={inviteDraft}
                onChange={onInviteDraftChange}
                result={inviteResult}
                showAllErrors={showInviteErrors}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPlanSelection;
