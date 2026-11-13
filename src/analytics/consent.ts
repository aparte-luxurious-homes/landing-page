// Consent state for analytics (GA4 + Microsoft Clarity).
//
// No analytics script is injected until the visitor explicitly grants consent,
// so no analytics cookies are set before then. The choice is persisted in
// localStorage and re-applied on the next visit (see main.tsx).

export type ConsentValue = "granted" | "denied";

const STORAGE_KEY = "aparte_analytics_consent";

type Listener = (value: ConsentValue) => void;
const listeners = new Set<Listener>();

/** The stored choice, or `null` if the visitor hasn't decided yet. */
export function getConsent(): ConsentValue | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

/** Whether the visitor has made a choice (accept or decline). */
export function hasDecided(): boolean {
  return getConsent() !== null;
}

/** Whether analytics is allowed to run. */
export function isConsentGranted(): boolean {
  return getConsent() === "granted";
}

/** Persist the visitor's choice and notify subscribers. */
export function setConsent(value: ConsentValue): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* ignore — private mode / storage disabled */
  }
  listeners.forEach((fn) => fn(value));
}

/**
 * Reset the stored choice so the consent banner is shown again. Callers should
 * reload the page afterwards: on reload the gate re-evaluates from scratch, so
 * already-loaded analytics scripts stop running (consent withdrawal) and the
 * banner re-appears for a fresh choice.
 */
export function clearConsent(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore — private mode / storage disabled */
  }
}

/** Subscribe to consent changes. Returns an unsubscribe function. */
export function onConsentChange(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
