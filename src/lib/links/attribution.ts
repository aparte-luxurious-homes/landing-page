/** Client-side attribution capture (spec §8.2, §8.5.2).
 *
 * On page load, URL params (rs / utm_* / _sl / ref) are written to
 * sessionStorage. First-touch wins within the session: an existing stored
 * referral code is never overwritten by a later link — the guest keeps the
 * code that brought them in. The stored bundle is attached to the view beacon
 * and the checkout request.
 *
 * The referral code has exactly one money-bearing effect server-side (setting
 * referrer_id on a guest who has none); everything else here is analytics.
 */

const KEY = "aparte_link_attribution";

export interface Attribution {
  referrer_source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  short_link_code?: string;
  ref?: string;
}

export function captureAttribution(searchParams: URLSearchParams): Attribution {
  if (typeof window === "undefined") return {};

  let stored: Attribution = {};
  try {
    stored = JSON.parse(window.sessionStorage.getItem(KEY) ?? "{}");
  } catch {
    stored = {};
  }

  const incoming: Attribution = {};
  const rs = searchParams.get("rs");
  if (rs) incoming.referrer_source = rs.toUpperCase().slice(0, 50);
  for (const k of ["utm_source", "utm_medium", "utm_campaign"] as const) {
    const v = searchParams.get(k);
    if (v) incoming[k] = v.slice(0, 100);
  }
  const sl = searchParams.get("_sl");
  if (sl) incoming.short_link_code = sl.slice(0, 12);
  const ref = searchParams.get("ref");
  if (ref) incoming.ref = ref.toUpperCase().slice(0, 12);

  // First-touch: stored values win; incoming only fills gaps.
  const merged: Attribution = { ...incoming, ...stored };
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(merged));
  } catch {
    /* private mode — attribution just won't persist */
  }
  return merged;
}

export function getAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.sessionStorage.getItem(KEY) ?? "{}");
  } catch {
    return {};
  }
}

/** Catalog pages seed the sharer's referral code as session context —
 * first-touch still wins if another code is already stored. */
export function seedReferralCode(code: string | null | undefined): void {
  if (!code || typeof window === "undefined") return;
  const current = getAttribution();
  if (current.ref) return;
  try {
    window.sessionStorage.setItem(
      KEY,
      JSON.stringify({ ...current, ref: code.toUpperCase() })
    );
  } catch {
    /* ignore */
  }
}
