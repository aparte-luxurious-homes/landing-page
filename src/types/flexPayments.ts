/**
 * Flexible payment types: Instalment Payment and Invite Friends to Pay.
 *
 * Plan amounts are integer KOBO (PRD assumption A-6). The rest of this app
 * works in naira (`booking.total_charging_fee`, `formatPrice(naira)`), so
 * convert at the edge with `nairaToKobo` / `koboToNaira` from
 * `lib/flexPayments.ts` and never mix the two units in one expression.
 *
 * The backend contract for payment plans has not been agreed. These shapes
 * mirror the admin dashboard's working model (`admin-dashboard/src/lib/types/
 * flexPayments.ts`); everything that would hit the network goes through
 * `api/flexPaymentsApi.ts`.
 */

/** What the guest picks at checkout. FULL is today's single payment. */
export type PaymentPlanChoice = 'FULL' | 'INSTALMENT' | 'INVITE_FRIENDS';

export type FlexPaymentKind = 'INSTALMENT' | 'INVITE_FRIENDS';

/** PRD section 6.1. Separate from the booking's own status. */
export type FlexPaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'PARTIALLY_PAID'
  | 'FULLY_PAID'
  | 'FAILED'
  | 'EXPIRED'
  | 'REFUNDED';

/* ---- Listing configuration (PRD 4.2, 5.2) ------------------------------ */

export interface InstalmentConfig {
  enabled: boolean;
  initial_percentage: number;
  /** 0 means the balance is due at check-in. */
  balance_deadline_days_before_checkin: number;
}

export interface InviteFriendsConfig {
  enabled: boolean;
  min_contributors: number;
  max_contributors: number;
  allow_equal_split: boolean;
  allow_custom_split: boolean;
}

/** The options a listing offers. A null side is not offered. */
export interface PaymentOptions {
  instalment: InstalmentConfig | null;
  inviteFriends: InviteFriendsConfig | null;
}

/* ---- Checkout draft ----------------------------------------------------- */

export type SplitMode = 'EQUAL' | 'CUSTOM';

/** One invited friend as typed at checkout. The initiator is not in this list. */
export interface ContributorDraft {
  /** Email address or phone number. */
  contact: string;
  /** Naira as typed; only read in CUSTOM mode. */
  amountInput: string;
}

export interface InviteFriendsDraft {
  mode: SplitMode;
  /** The initiator's own share as typed; only read in CUSTOM mode. */
  ownAmountInput: string;
  friends: ContributorDraft[];
}

/* ---- Booking-side data (read model) ------------------------------------ */

export type PlanPaymentStatus = 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface PlanPayment {
  id: string;
  reference: string;
  /** "Initial payment", "Balance", or a contributor's name. */
  label: string;
  amountKobo: number;
  status: PlanPaymentStatus;
  paidAt: string | null;
  receiptUrl?: string | null;
}

export type ContributorStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'EXPIRED' | 'REFUNDED';

export interface Contributor {
  id: string;
  /** Name when known, otherwise the masked contact. */
  displayName: string;
  /** The contact the initiator typed. Only ever sent to the initiator. */
  contact: string;
  isInitiator: boolean;
  shareKobo: number;
  status: ContributorStatus;
  paidAt: string | null;
  lastInvitedAt: string | null;
}

export interface PaymentPlan {
  id: string;
  bookingId: string;
  kind: FlexPaymentKind;
  status: FlexPaymentStatus;
  totalKobo: number;
  /** Verified money received so far. */
  paidKobo: number;
  /** Instalment only. */
  initialKobo?: number;
  balanceKobo?: number;
  /** Balance deadline (instalment) or funding-window expiry (invite friends). */
  dueAt: string | null;
  payments: PlanPayment[];
  contributors?: Contributor[];
}

/**
 * What a contributor sees when they open their payment link. Deliberately
 * carries no other contributor's contact details (PRD section 10, data
 * privacy) — only counts.
 */
export interface ContributionInvite {
  status: ContributorStatus;
  shareKobo: number;
  /** First name only. */
  initiatorName: string;
  propertyName: string;
  propertyLocation?: string | null;
  propertyImage?: string | null;
  checkIn: string;
  checkOut: string;
  /** Funding-window expiry. */
  expiresAt: string;
  contributorCount: number;
  paidCount: number;
  paidAt: string | null;
  reference: string | null;
  receiptUrl?: string | null;
}
