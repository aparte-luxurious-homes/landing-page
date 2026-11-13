/**
 * Pure helpers for flexible payments — no DOM, no network, no runtime imports
 * — so they run under Node's built-in test runner (`npm run test:unit`).
 *
 * Money here is integer kobo. Splits must add up to the total EXACTLY (PRD
 * acceptance criteria), so everything below uses integer arithmetic and hands
 * any leftover kobo to a definite share rather than rounding it away.
 *
 * The maths mirrors `admin-dashboard/src/lib/flexPayments.ts`; the server is
 * the authority on every amount and re-derives them at payment time.
 */
import type {
  ContributorStatus,
  FlexPaymentKind,
  FlexPaymentStatus,
  InstalmentConfig,
  InviteFriendsConfig,
  InviteFriendsDraft,
  PaymentOptions,
} from '../types/flexPayments';

/**
 * Flip to true once the payments API exists. While false, checkout offers
 * only "Pay in full", the booking page shows no payment plan, and a payment
 * link says it is unavailable — so no guest is ever offered an option nothing
 * can honour.
 */
export const FLEX_PAYMENTS_API_CONNECTED = false;

/**
 * Local review switch: `NEXT_PUBLIC_FLEX_PAYMENTS_PREVIEW=true` shows the
 * checkout options with the default listing settings below, on any listing,
 * so the screens can be clicked through before the API exists. It never takes
 * money or creates a booking: confirming a flexible option stops with a
 * notice. Ignored in production builds.
 */
export const FLEX_PAYMENTS_PREVIEW =
  process.env.NODE_ENV !== 'production'
   &&
  process.env.NEXT_PUBLIC_FLEX_PAYMENTS_PREVIEW === 'true';

/** PRD 5.2 / OQ-11. */
export const FUNDING_WINDOW_HOURS = 24;

export const DEFAULT_INSTALMENT_CONFIG: InstalmentConfig = {
  enabled: true,
  initial_percentage: 60,
  balance_deadline_days_before_checkin: 3,
};

export const DEFAULT_INVITE_FRIENDS_CONFIG: InviteFriendsConfig = {
  enabled: true,
  min_contributors: 2,
  max_contributors: 10,
  allow_equal_split: true,
  allow_custom_split: true,
};

/* ---- Units -------------------------------------------------------------- */

/** Naira (this app's unit; may be a string like "200,000.50") to integer kobo. */
export function nairaToKobo(naira: number | string): number {
  const n = typeof naira === 'string' ? Number(naira.replace(/,/g, '')) : naira;
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

export function koboToNaira(kobo: number): number {
  return kobo / 100;
}

/** "₦120,000" for whole naira, "₦33,333.34" otherwise — kobo are never hidden. */
export function formatKobo(kobo: number): string {
  const whole = kobo % 100 === 0;
  return `₦${koboToNaira(kobo).toLocaleString('en-NG', {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

/* ---- Listing options ---------------------------------------------------- */

function isInstalmentConfig(v: unknown): v is InstalmentConfig {
  const c = v as InstalmentConfig | null;
  return (
    !!c &&
    typeof c === 'object' &&
    c.enabled === true &&
    Number.isFinite(c.initial_percentage) &&
    c.initial_percentage > 0 &&
    c.initial_percentage < 100 &&
    Number.isInteger(c.balance_deadline_days_before_checkin) &&
    c.balance_deadline_days_before_checkin >= 0
  );
}

function isInviteFriendsConfig(v: unknown): v is InviteFriendsConfig {
  const c = v as InviteFriendsConfig | null;
  return (
    !!c &&
    typeof c === 'object' &&
    c.enabled === true &&
    Number.isInteger(c.min_contributors) &&
    Number.isInteger(c.max_contributors) &&
    c.min_contributors >= 2 &&
    c.max_contributors >= c.min_contributors &&
    (c.allow_equal_split || c.allow_custom_split)
  );
}

/**
 * The flexible options a property offers, read from the fields the admin
 * dashboard writes (`instalment_payment`, `invite_friends_payment`). Anything
 * missing, switched off or malformed is simply not offered.
 */
export function readPaymentOptions(property: unknown): PaymentOptions {
  const p = (property ?? {}) as Record<string, unknown>;
  return {
    instalment: isInstalmentConfig(p.instalment_payment) ? p.instalment_payment : null,
    inviteFriends: isInviteFriendsConfig(p.invite_friends_payment) ? p.invite_friends_payment : null,
  };
}

/* ---- Instalment maths --------------------------------------------------- */

export function splitInstalment(
  totalKobo: number,
  initialPercentage: number,
): { initialKobo: number; balanceKobo: number } {
  const initialKobo = Math.round((totalKobo * initialPercentage) / 100);
  // The balance is the remainder, so the two can never drift apart.
  return { initialKobo, balanceKobo: totalKobo - initialKobo };
}

/** Check-in minus N days. Date-only strings ("2026-11-14") stay on that calendar day. */
export function balanceDeadline(checkIn: Date | string, daysBeforeCheckin: number): Date {
  const d = new Date(checkIn);
  d.setUTCDate(d.getUTCDate() - daysBeforeCheckin);
  return d;
}

/**
 * A booking only qualifies when the balance deadline is still in the future,
 * otherwise "pay the rest later" would already be overdue at checkout (OQ-5).
 */
export function isInstalmentEligible(
  checkIn: Date | string,
  daysBeforeCheckin: number,
  now: Date = new Date(),
): boolean {
  const deadline = balanceDeadline(checkIn, daysBeforeCheckin).getTime();
  return !Number.isNaN(deadline) && deadline > now.getTime();
}

/* ---- Invite Friends maths ---------------------------------------------- */

/** Equal shares that sum exactly: the first `remainder` shares carry one extra kobo. */
export function equalShares(totalKobo: number, count: number): number[] {
  if (!Number.isInteger(count) || count < 1) return [];
  const base = Math.floor(totalKobo / count);
  const remainder = totalKobo - base * count;
  return Array.from({ length: count }, (_, i) => base + (i < remainder ? 1 : 0));
}

/** Null when the custom shares are acceptable, otherwise a message. */
export function validateCustomShares(totalKobo: number, sharesKobo: number[]): string | null {
  if (sharesKobo.length === 0) return 'Add at least one share';
  if (sharesKobo.some((s) => !Number.isInteger(s) || s <= 0)) {
    return 'Every share must be more than zero';
  }
  const sum = sharesKobo.reduce((a, b) => a + b, 0);
  if (sum === totalKobo) return null;
  const diff = formatKobo(Math.abs(totalKobo - sum));
  return sum < totalKobo ? `Shares are ${diff} short of the total` : `Shares are ${diff} over the total`;
}

export type ContactKind = 'email' | 'phone';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Classify what was typed and normalise it for duplicate checks. Phones are
 * Nigerian mobiles (0803…, 803…, +234803…, 234803…) or any other number in
 * full international form (+ and 8–15 digits).
 */
export function parseContact(raw: string): { kind: ContactKind; normalized: string } | null {
  const value = raw.trim();
  if (!value) return null;
  if (value.includes('@')) {
    return EMAIL_RE.test(value) ? { kind: 'email', normalized: value.toLowerCase() } : null;
  }
  const hasPlus = value.startsWith('+');
  const digits = value.replace(/[\s\-().]/g, '').replace(/^\+/, '');
  if (!/^\d+$/.test(digits)) return null;
  const local = /^0[789]\d{9}$/.test(digits)
    ? digits.slice(1)
    : /^234[789]\d{9}$/.test(digits)
      ? digits.slice(3)
      : /^[789]\d{9}$/.test(digits) && !hasPlus
        ? digits
        : null;
  if (local) return { kind: 'phone', normalized: `+234${local}` };
  if (hasPlus && digits.length >= 8 && digits.length <= 15) {
    return { kind: 'phone', normalized: `+${digits}` };
  }
  return null;
}

export function clampContributorCount(count: number, cfg: InviteFriendsConfig): number {
  return Math.max(cfg.min_contributors, Math.min(count, cfg.max_contributors));
}

/** The split modes a listing allows, equal first. */
export function allowedSplitModes(cfg: InviteFriendsConfig): Array<'EQUAL' | 'CUSTOM'> {
  const modes: Array<'EQUAL' | 'CUSTOM'> = [];
  if (cfg.allow_equal_split) modes.push('EQUAL');
  if (cfg.allow_custom_split) modes.push('CUSTOM');
  return modes;
}

export interface InviteDraftResult {
  /** Index 0 is the initiator (OQ-6: they pay as contributor #1). */
  sharesKobo: number[];
  /** One entry per friend; null when that contact is fine. */
  contactErrors: Array<string | null>;
  /** Split-level problem (shares don't reach the total, a share is zero…). */
  splitError: string | null;
  isValid: boolean;
}

/**
 * Work out every share and everything wrong with the draft in one pass, so
 * the form and the Pay button can never disagree about whether it is ready.
 * `ownContacts` are the initiator's own email/phone: inviting yourself would
 * make two contributors out of one person.
 */
export function evaluateInviteDraft(
  draft: InviteFriendsDraft,
  totalKobo: number,
  ownContacts: string[] = [],
): InviteDraftResult {
  const count = draft.friends.length + 1;
  const sharesKobo =
    draft.mode === 'EQUAL'
      ? equalShares(totalKobo, count)
      : [draft.ownAmountInput, ...draft.friends.map((f) => f.amountInput)].map((v) =>
          v.trim() === '' ? 0 : nairaToKobo(v),
        );

  const own = new Set(
    ownContacts.map((c) => parseContact(c ?? '')?.normalized).filter((c): c is string => !!c),
  );
  const seen = new Set<string>();
  const contactErrors = draft.friends.map((friend) => {
    if (!friend.contact.trim()) return 'Enter an email address or phone number';
    const parsed = parseContact(friend.contact);
    if (!parsed) return 'Enter a valid email address or phone number';
    if (own.has(parsed.normalized)) return "That's you — you're already contributor 1";
    if (seen.has(parsed.normalized)) return 'This person is already on the list';
    seen.add(parsed.normalized);
    return null;
  });

  const splitError =
    totalKobo <= 0
      ? 'The booking total is missing'
      : draft.mode === 'EQUAL' && sharesKobo.some((s) => s <= 0)
        ? 'The total is too small to split this many ways'
        : validateCustomShares(totalKobo, sharesKobo);

  return {
    sharesKobo,
    contactErrors,
    splitError,
    isValid: !splitError && contactErrors.every((e) => e === null),
  };
}

/** Grow or shrink the friends list to `count` contributors (initiator included). */
export function resizeInviteDraft(draft: InviteFriendsDraft, count: number): InviteFriendsDraft {
  const friendCount = Math.max(1, count - 1);
  const friends = draft.friends.slice(0, friendCount);
  while (friends.length < friendCount) friends.push({ contact: '', amountInput: '' });
  return { ...draft, friends };
}

/** Pre-fill the custom amounts with the equal split so the guest edits from a valid state. */
export function seedCustomAmounts(draft: InviteFriendsDraft, totalKobo: number): InviteFriendsDraft {
  const shares = equalShares(totalKobo, draft.friends.length + 1).map((s) => String(koboToNaira(s)));
  return {
    ...draft,
    ownAmountInput: shares[0] ?? '',
    friends: draft.friends.map((f, i) => ({ ...f, amountInput: shares[i + 1] ?? '' })),
  };
}

/* ---- Statuses (PRD 6.1) -------------------------------------------------- */

export const FLEX_STATUS_LABEL: Record<FlexPaymentStatus, string> = {
  PENDING: 'Awaiting payment',
  PROCESSING: 'Processing',
  PARTIALLY_PAID: 'Partially paid',
  FULLY_PAID: 'Fully paid',
  FAILED: 'Payment failed',
  EXPIRED: 'Expired',
  REFUNDED: 'Refunded',
};

export const FLEX_KIND_LABEL: Record<FlexPaymentKind, string> = {
  INSTALMENT: 'Instalment payment',
  INVITE_FRIENDS: 'Invite friends to pay',
};

export const CONTRIBUTOR_STATUS_LABEL: Record<ContributorStatus, string> = {
  PENDING: 'Awaiting payment',
  PROCESSING: 'Processing',
  PAID: 'Paid',
  FAILED: 'Payment failed',
  EXPIRED: 'Expired',
  REFUNDED: 'Refunded',
};

/** Money is still expected from someone. */
export function isOpenPayment(status: FlexPaymentStatus): boolean {
  return status === 'PENDING' || status === 'PROCESSING' || status === 'PARTIALLY_PAID' || status === 'FAILED';
}

/** A contributor can still be nudged or can still pay. */
export function isContributorPayable(status: ContributorStatus): boolean {
  return status === 'PENDING' || status === 'FAILED';
}

export function percentPaid(paidKobo: number, totalKobo: number): number {
  if (totalKobo <= 0) return 0;
  return Math.max(0, Math.min(100, Math.floor((paidKobo / totalKobo) * 100)));
}

/** Milliseconds until `dueAt`, negative when past; null when there is no deadline. */
export function msUntil(dueAt: string | null | undefined, now: Date = new Date()): number | null {
  if (!dueAt) return null;
  const t = new Date(dueAt).getTime();
  return Number.isNaN(t) ? null : t - now.getTime();
}

/** "2 days", "5 hours", "12 minutes" — the largest unit that fits, for "… left" copy. */
export function formatTimeLeft(ms: number): string {
  const minutes = Math.max(0, Math.floor(ms / 60_000));
  const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? '' : 's'}`;
  if (minutes >= 48 * 60) return plural(Math.floor(minutes / (24 * 60)), 'day');
  if (minutes >= 60) return plural(Math.floor(minutes / 60), 'hour');
  return plural(Math.max(1, minutes), 'minute');
}
