import { PropertyType } from '../types/property';

/** Matches `property_type === EVENT_CENTRE` on the property resource. */
export function isEventCentre(type: string | null | undefined): boolean {
  return String(type ?? '').toUpperCase() === PropertyType.EVENT_CENTRE;
}

/**
 * Display-only add-on line. Live `POST /bookings` has no additional-fee IDs;
 * later checkout should skip selectable extras until the API exposes them.
 */
export type AdditionalCostLine = {
  name: string;
  amount: number;
  selected?: boolean;
};

/** Inputs use live unit/booking field names. */
export type StayCostInput = {
  price_per_night: number | string;
  nights?: number;
  has_stay_discount?: boolean;
  stay_discount_percentage?: number | string;
  stay_discount_min_days?: number;
  caution_fee?: number | string;
  additional?: AdditionalCostLine[];
};

export type StayCostBreakdown = {
  base: number;
  discount: number;
  additional_total: number;
  caution_fee: number;
  total: number;
};

const toNumber = (value: number | string | null | undefined): number => {
  if (value == null || value === '') return 0;
  const n = typeof value === 'number' ? value : parseFloat(value);
  return Number.isFinite(n) ? n : 0;
};

/**
 * `total = base − discount + sum(selected additional) + caution`.
 * Discount is `stay_discount_percentage` when `has_stay_discount` and nights ≥ `stay_discount_min_days`.
 */
export function itemizeStayCost(input: StayCostInput): StayCostBreakdown {
  const nights = input.nights != null && input.nights > 0 ? input.nights : 1;
  const base = toNumber(input.price_per_night) * nights;
  const minDays = input.stay_discount_min_days ?? 1;
  const pct = toNumber(input.stay_discount_percentage);
  const discount =
    input.has_stay_discount && nights >= minDays && pct > 0
      ? base * (pct / 100)
      : 0;
  const additional_total = (input.additional ?? [])
    .filter((line) => line.selected !== false)
    .reduce((sum, line) => sum + toNumber(line.amount), 0);
  const caution_fee = toNumber(input.caution_fee);
  return {
    base,
    discount,
    additional_total,
    caution_fee,
    total: base - discount + additional_total + caution_fee,
  };
}

/** How an event-centre hall is hired. */
export type BillingUnit = 'PER_DAY' | 'PER_HALF_DAY' | 'PER_HOUR';

/** What one of each billing unit is called, for "₦X / day" and "3 hours". */
export const BILLING_UNIT_WORD: Record<BillingUnit, { one: string; many: string }> = {
  PER_DAY: { one: 'day', many: 'days' },
  PER_HALF_DAY: { one: 'session', many: 'sessions' },
  PER_HOUR: { one: 'hour', many: 'hours' },
};

/** The fields of a hall the helpers below read; every one optional. */
export type HallLike = {
  offered_billing_units?: string[] | null;
  headline_billing_unit?: string | null;
  event_price_per_day?: number | string | null;
  event_price_per_half_day?: number | string | null;
  event_price_per_hour?: number | string | null;
  price_per_night?: number | string | null;
} | null | undefined;

/** The hire types a guest can actually book on this hall, in display order. */
export function offeredBillingUnits(unit: HallLike): BillingUnit[] {
  const listed = unit?.offered_billing_units as BillingUnit[] | undefined;
  if (Array.isArray(listed) && listed.length) return listed;
  // Older payloads: a hall with a day rate can at least be hired by the day.
  return Number(unit?.event_price_per_day || unit?.price_per_night) > 0 ? ['PER_DAY'] : [];
}

/** The hall's rate for one billing unit (0 when it isn't offered). */
export function rateFor(unit: HallLike, billingUnit: BillingUnit): number {
  const raw =
    billingUnit === 'PER_HOUR'
      ? unit?.event_price_per_hour
      : billingUnit === 'PER_HALF_DAY'
        ? unit?.event_price_per_half_day
        : unit?.event_price_per_day ?? unit?.price_per_night;
  return toNumber(raw);
}

/** What the headline price is per: "day", "session" or "hour". */
export function headlineUnitWord(unit: HallLike): string {
  const u = (unit?.headline_billing_unit as BillingUnit | null) ?? offeredBillingUnits(unit)[0];
  return u ? BILLING_UNIT_WORD[u].one : 'day';
}

/**
 * "10:00–13:00 (3 hours)", "Morning session (08:00–14:00)" or "2 days".
 * Reads the server's quote/booking for the times when it has them.
 */
export function describeHire(h: {
  billing_unit?: string | null;
  billing_duration?: number | null;
  event_start_time?: string | null;
  event_end_time?: string | null;
  half_day_window_name?: string | null;
}): string {
  const n = Number(h.billing_duration) || 1;
  const times =
    h.event_start_time && h.event_end_time
      ? `${h.event_start_time.slice(0, 5)}–${h.event_end_time.slice(0, 5)}`
      : '';
  if (h.billing_unit === 'PER_HOUR') {
    return `${times ? `${times} ` : ''}(${n} ${n === 1 ? 'hour' : 'hours'})`;
  }
  if (h.billing_unit === 'PER_HALF_DAY') {
    return `${h.half_day_window_name ?? 'Half-day'} session${times ? ` (${times})` : ''}`;
  }
  return `${n} ${n === 1 ? 'day' : 'days'}`;
}

/**
 * What a booking's price line counts: nights for a stay, and for a venue hire
 * days, sessions or hours. `count × base_price × units` is then the base.
 */
export function hireCount(b: {
  is_venue?: boolean;
  nights?: number;
  billing_unit?: string | null;
  billing_duration?: number | null;
}): { count: number; word: string; isVenue: boolean; unitWord: string } {
  const isVenue = !!b.is_venue || (!!b.billing_unit && b.billing_unit !== 'PER_NIGHT');
  if (!isVenue) {
    const n = Number(b.nights) || 0;
    return { count: n, word: n === 1 ? 'night' : 'nights', isVenue, unitWord: 'unit' };
  }
  const unit = (b.billing_unit as BillingUnit) || 'PER_DAY';
  const n = Number(b.billing_duration) || Number(b.nights) || 1;
  const w = BILLING_UNIT_WORD[unit] ?? BILLING_UNIT_WORD.PER_DAY;
  return { count: n, word: n === 1 ? w.one : w.many, isVenue, unitWord: 'hall' };
}
