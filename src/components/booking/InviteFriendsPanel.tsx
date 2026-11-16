'use client';

import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';

import {
  allowedSplitModes,
  clampContributorCount,
  formatKobo,
  FUNDING_WINDOW_HOURS,
  resizeInviteDraft,
  seedCustomAmounts,
  type InviteDraftResult,
} from '../../lib/flexPayments';
import type { InviteFriendsConfig, InviteFriendsDraft, SplitMode } from '../../types/flexPayments';

interface InviteFriendsPanelProps {
  config: InviteFriendsConfig;
  totalKobo: number;
  draft: InviteFriendsDraft;
  onChange: (draft: InviteFriendsDraft) => void;
  /** From `evaluateInviteDraft` — the parent owns it so the Pay button agrees with the form. */
  result: InviteDraftResult;
  /** Set once the guest has pressed Pay with an invalid form: show every problem. */
  showAllErrors: boolean;
}

const inputBase =
  'w-full rounded-xl border px-3.5 py-2.5 text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#028090] focus:border-transparent';

const MODE_LABEL: Record<SplitMode, string> = { EQUAL: 'Split equally', CUSTOM: 'Custom amounts' };

const InviteFriendsPanel: React.FC<InviteFriendsPanelProps> = ({
  config,
  totalKobo,
  draft,
  onChange,
  result,
  showAllErrors,
}) => {
  const count = draft.friends.length + 1;
  const modes = allowedSplitModes(config);
  const isCustom = draft.mode === 'CUSTOM';

  // Transient string so the number can be cleared and retyped (see CLAUDE.md,
  // "Numeric stepper inputs").
  const [countInput, setCountInput] = useState(String(count));
  useEffect(() => setCountInput(String(count)), [count]);

  const [touched, setTouched] = useState<Set<number>>(new Set());

  const setCount = (next: number) => {
    const clamped = clampContributorCount(next, config);
    if (clamped === count) return;
    const resized = resizeInviteDraft(draft, clamped);
    // In custom mode the old amounts no longer fit the new head-count; start
    // again from an even split rather than leave a total that can't balance.
    onChange(isCustom ? seedCustomAmounts(resized, totalKobo) : resized);
    setTouched((prev) => new Set([...prev].filter((i) => i < clamped - 1)));
  };

  const setMode = (mode: SplitMode) => {
    if (mode === draft.mode) return;
    onChange(mode === 'CUSTOM' ? seedCustomAmounts({ ...draft, mode }, totalKobo) : { ...draft, mode });
  };

  const setFriend = (index: number, patch: Partial<InviteFriendsDraft['friends'][number]>) =>
    onChange({
      ...draft,
      friends: draft.friends.map((f, i) => (i === index ? { ...f, ...patch } : f)),
    });

  const amountField = (value: string, onValue: (v: string) => void, label: string) => (
    <div className="relative w-full sm:w-40 shrink-0">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">₦</span>
      <input
        type="text"
        inputMode="decimal"
        aria-label={label}
        value={value}
        onFocus={(e) => e.target.select()}
        onChange={(e) => onValue(e.target.value.replace(/[^\d.,]/g, ''))}
        className={`${inputBase} pl-8 border-gray-300 text-right font-semibold`}
      />
    </div>
  );

  const shareText = (index: number) => (
    <p className="w-full sm:w-40 shrink-0 sm:text-right text-[15px] font-semibold text-gray-900">
      {formatKobo(result.sharesKobo[index] ?? 0)}
    </p>
  );

  const stepBtn =
    'w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-700 hover:border-[#028090] hover:text-[#026672] disabled:opacity-40 disabled:hover:border-gray-300 disabled:hover:text-gray-700 transition-colors';

  return (
    <div className="mt-3 rounded-2xl bg-[#F6FAFB] border border-[#028090]/15 p-4 md:p-5">
      {/* How many people */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-gray-900">How many people are paying?</p>
          <p className="text-sm text-gray-500">
            Including you · {config.min_contributors} to {config.max_contributors}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Fewer people"
            className={stepBtn}
            disabled={count <= config.min_contributors}
            onClick={() => setCount(count - 1)}
          >
            <Icon icon="mdi:minus" width={18} />
          </button>
          <input
            type="number"
            aria-label="Number of people paying"
            value={countInput}
            min={config.min_contributors}
            max={config.max_contributors}
            onFocus={(e) => e.target.select()}
            onChange={(e) => {
              const raw = e.target.value;
              setCountInput(raw);
              if (raw === '') return;
              const n = parseInt(raw, 10);
              if (!Number.isNaN(n)) setCount(n);
            }}
            onBlur={() => setCountInput(String(count))}
            className="w-14 h-10 rounded-xl border border-gray-300 text-center font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#028090] focus:border-transparent [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            type="button"
            aria-label="More people"
            className={stepBtn}
            disabled={count >= config.max_contributors}
            onClick={() => setCount(count + 1)}
          >
            <Icon icon="mdi:plus" width={18} />
          </button>
        </div>
      </div>

      {/* Equal or custom */}
      {modes.length > 1 && (
        <div role="radiogroup" aria-label="How to split the cost" className="mt-4 grid grid-cols-2 gap-1 rounded-full bg-white border border-gray-200 p-1">
          {modes.map((mode) => (
            <button
              key={mode}
              type="button"
              role="radio"
              aria-checked={draft.mode === mode}
              onClick={() => setMode(mode)}
              className={`rounded-full py-2 text-sm font-semibold transition-colors ${
                draft.mode === mode ? 'bg-[#028090] text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {MODE_LABEL[mode]}
            </button>
          ))}
        </div>
      )}

      {/* Shares */}
      <ul className="mt-4 space-y-3">
        <li className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 rounded-xl bg-white border border-gray-200 px-3.5 py-3">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900">You</p>
            <p className="text-sm text-gray-500">You pay your share now to start the booking</p>
          </div>
          {isCustom
            ? amountField(draft.ownAmountInput, (v) => onChange({ ...draft, ownAmountInput: v }), 'Your share in naira')
            : shareText(0)}
        </li>

        {draft.friends.map((friend, index) => {
          const error =
            showAllErrors || touched.has(index) ? result.contactErrors[index] : null;
          const errorId = `invite-contact-error-${index}`;
          return (
            <li key={index} className="rounded-xl bg-white border border-gray-200 px-3.5 py-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <div className="flex-1 min-w-0">
                  <label htmlFor={`invite-contact-${index}`} className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Person {index + 2}
                  </label>
                  <input
                    id={`invite-contact-${index}`}
                    type="text"
                    inputMode="email"
                    autoComplete="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    placeholder="Email address or phone number"
                    value={friend.contact}
                    aria-invalid={!!error}
                    aria-describedby={error ? errorId : undefined}
                    onChange={(e) => setFriend(index, { contact: e.target.value })}
                    onBlur={() => setTouched((prev) => new Set(prev).add(index))}
                    className={`${inputBase} ${error ? 'border-red-400' : 'border-gray-300'}`}
                  />
                </div>
                <div className="sm:pt-6">
                  {isCustom
                    ? amountField(friend.amountInput, (v) => setFriend(index, { amountInput: v }), `Person ${index + 2}'s share in naira`)
                    : shareText(index + 1)}
                </div>
              </div>
              {error && (
                <p id={errorId} className="mt-1.5 text-sm text-red-600">
                  {error}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      {/* Running total */}
      <div className="mt-4 flex items-center justify-between gap-4 text-sm" aria-live="polite">
        <p className="text-gray-600">
          {count} people · total {formatKobo(totalKobo)}
        </p>
        {result.splitError ? (
          <p className="flex items-center gap-1.5 font-semibold text-red-600 text-right">
            <Icon icon="mdi:alert-circle-outline" width={16} className="shrink-0" />
            {result.splitError}
          </p>
        ) : (
          <p className="flex items-center gap-1.5 font-semibold text-emerald-700">
            <Icon icon="mdi:check-circle-outline" width={16} />
            Shares add up
          </p>
        )}
      </div>

      <ul className="mt-4 pt-4 border-t border-[#028090]/15 space-y-2 text-sm text-gray-600">
        <li className="flex gap-2">
          <Icon icon="mdi:link-variant" width={18} className="shrink-0 mt-0.5 text-[#028090]" />
          Each person gets their own secure payment link for exactly their share.
        </li>
        <li className="flex gap-2">
          <Icon icon="mdi:timer-sand" width={18} className="shrink-0 mt-0.5 text-[#028090]" />
          Your dates are held for {FUNDING_WINDOW_HOURS} hours. The booking is confirmed once everyone has paid.
        </li>
        <li className="flex gap-2">
          <Icon icon="mdi:cash-refund" width={18} className="shrink-0 mt-0.5 text-[#028090]" />
          If time runs out first, the dates are released and everyone who paid is refunded.
        </li>
        <li className="flex gap-2">
          <Icon icon="mdi:shield-lock-outline" width={18} className="shrink-0 mt-0.5 text-[#028090]" />
          Contact details are used only for the invitation and receipt, and are never shown to the others.
        </li>
      </ul>
    </div>
  );
};

export default InviteFriendsPanel;
