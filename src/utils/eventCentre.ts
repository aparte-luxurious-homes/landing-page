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
