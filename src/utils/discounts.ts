/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Discount policies → the words a guest reads.
 *
 * The API returns policies in two places and one derived form:
 *
 *   property.discount_summary          the best offer anywhere on the listing,
 *                                      already resolved across its units
 *   property.<kind>_discount_policy    the listing-wide policy
 *   unit.effective_<kind>_discount_policy
 *                                      what will actually price THIS unit —
 *                                      its own override, or the inherited one
 *
 * Always prefer the resolved/effective field over re-deriving it here. A unit
 * can override the property, so a component that reads the property policy and
 * shows it next to a unit is advertising a saving that unit may not give.
 *
 * Nothing in here decides money. The booking quote is the only authority on
 * what a guest pays (`discount_amount` on BookingQuoteResponse); these strings
 * exist so a guest can see that an offer exists *before* picking dates, which
 * until now they could not — the discount only ever appeared in the price
 * breakdown, after the choice it was meant to inform.
 */

export type DiscountType = 'FIXED' | 'PERCENTAGE';

export interface DiscountTier {
  min_nights: number;
  value: number | string;
}

export interface DiscountPolicy {
  is_active?: boolean;
  discount_type?: DiscountType;
  tiers?: DiscountTier[];
}

export interface DiscountSummary {
  discount_type?: DiscountType;
  min_nights: number;
  best_value: string;
  tier_count: number;
  /** 'all_units' — every unit gives it. 'some_units' — only part of the listing. */
  scope?: 'all_units' | 'some_units';
}

const naira = (value: number) => `₦${Math.round(value).toLocaleString('en-NG')}`;

/** Reduce a policy to the same shape `discount_summary` uses. */
export function summarizePolicy(
  policy?: DiscountPolicy | null
): DiscountSummary | null {
  if (!policy?.is_active) return null;
  const tiers = (policy.tiers ?? []).filter(Boolean);
  if (!tiers.length) return null;

  const values = tiers.map((t) => Number(t.value) || 0);
  const best = Math.max(...values);
  if (best <= 0) return null;

  return {
    discount_type: policy.discount_type,
    min_nights: Math.min(...tiers.map((t) => Number(t.min_nights) || 0)),
    best_value: String(best),
    tier_count: tiers.length,
  };
}

/** Compact form for a catalogue card, where there is room for about six words. */
export function discountBadge(summary?: DiscountSummary | null): string | null {
  if (!summary) return null;
  const value = Number(summary.best_value) || 0;
  if (value <= 0) return null;
  return summary.discount_type === 'PERCENTAGE'
    ? `${value}% off`
    : `${naira(value)}/night off`;
}

/**
 * Full sentence for the property page.
 *
 * `tier_count > 1` is called out because the headline is the BEST tier, which
 * a guest booking the minimum qualifying stay will not get — "up to" is the
 * difference between an offer and a complaint.
 */
export function discountLabel(
  summary?: DiscountSummary | null,
  kind: 'long_stay' | 'extension' = 'long_stay'
): string | null {
  if (!summary) return null;
  const value = Number(summary.best_value) || 0;
  if (value <= 0) return null;

  const upTo = summary.tier_count > 1 ? 'up to ' : '';
  const amount =
    summary.discount_type === 'PERCENTAGE'
      ? `${value}%`
      : `${naira(value)} per night`;

  const nights = summary.min_nights;
  const nightWord = nights === 1 ? 'night' : 'nights';

  if (kind === 'extension') {
    return `Save ${upTo}${amount} when you extend by ${nights}+ ${nightWord}`;
  }
  return `Save ${upTo}${amount} on stays of ${nights}+ ${nightWord}`;
}

/** "on selected units" caveat, or null when the whole listing qualifies. */
export function discountScopeNote(
  summary?: DiscountSummary | null
): string | null {
  return summary?.scope === 'some_units' ? 'on selected units' : null;
}
