/**
 * Referral code persistence — captures `?ref=CODE` from any URL the user
 * lands on (e.g. a property listing) and persists it across navigation so
 * the booking form can auto-fill it later.
 *
 * The code is stored in localStorage with a 30-day TTL so it survives
 * browser restarts but eventually expires.
 */

const STORAGE_KEY = 'aparte_referral_code';
const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

interface StoredRef {
  code: string;
  expiresAt: number;
}

/**
 * Read `?ref=CODE` from a URL search string (or `window.location.search`)
 * and persist it to localStorage. Safe to call on every navigation —
 * a no-op when no `ref` query param is present.
 */
export function captureReferralFromUrl(search?: string): void {
  if (typeof window === 'undefined') return;
  try {
    const params = new URLSearchParams(search ?? window.location.search);
    const ref = params.get('ref');
    if (!ref) return;
    const code = ref.trim().toUpperCase();
    if (!code) return;
    const payload: StoredRef = { code, expiresAt: Date.now() + TTL_MS };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // localStorage may be unavailable (privacy mode) — silently ignore
  }
}

/**
 * Return the stored referral code if one is present and not expired.
 * Returns null otherwise.
 */
export function getStoredReferralCode(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredRef;
    if (!parsed?.code || !parsed?.expiresAt || parsed.expiresAt < Date.now()) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed.code;
  } catch {
    return null;
  }
}

/**
 * Clear the stored referral code (e.g. after the user signs up or makes
 * a booking and the code has been applied — caller's discretion).
 */
export function clearStoredReferralCode(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
