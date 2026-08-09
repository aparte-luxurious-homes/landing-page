// Microsoft Clarity (session replay + heatmaps).
//
// Injected only when a project ID is configured (VITE_CLARITY_PROJECT_ID), this
// is a production build, and the visitor has granted consent. The landing page
// is public and low-PII, so Clarity's default masking is acceptable here.
// (The admin dashboard runs Clarity in full-mask mode — see that app.)

import { isConsentGranted } from "./consent";

export const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

/** Clarity's command queue function, which buffers calls until the tag loads. */
type ClarityQueue = ((...args: unknown[]) => void) & { q?: unknown[] };

let initialized = false;

/** True when Clarity *could* run in this build (id present + production). */
export function isClarityConfigured(): boolean {
  return Boolean(CLARITY_ID) && (process.env.NODE_ENV === 'production');
}

/** True when Clarity is configured AND the visitor has consented. */
export function isClarityEnabled(): boolean {
  return isClarityConfigured() && isConsentGranted();
}

/** Inject the Clarity bootstrap. Idempotent and consent-gated. */
export function initClarity(): void {
  if (initialized || typeof window === "undefined") return;
  if (!isClarityEnabled()) return;

  const w = window as unknown as { clarity?: ClarityQueue };
  if (!w.clarity) {
    const fn: ClarityQueue = function (...args: unknown[]) {
      (fn.q = fn.q || []).push(args);
    };
    w.clarity = fn;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${CLARITY_ID}`;
  const first = document.getElementsByTagName("script")[0];
  first?.parentNode?.insertBefore(script, first);

  initialized = true;
}

/** Tag the current Clarity session with a custom event name. */
export function clarityEvent(name: string): void {
  if (!isClarityEnabled() || typeof window === "undefined") return;
  window.clarity?.("event", name);
}

/** Set a custom Clarity tag (key/value) on the current session. */
export function claritySet(key: string, value: string): void {
  if (!isClarityEnabled() || typeof window === "undefined") return;
  window.clarity?.("set", key, value);
}
