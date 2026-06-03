// Google Analytics 4 (gtag.js).
//
// The script is injected only when ALL of the following hold:
//   1. a measurement ID is configured (VITE_GA4_MEASUREMENT_ID), AND
//   2. this is a production build (import.meta.env.PROD), AND
//   3. the visitor has granted consent.
// Staging/preview deploys are excluded by leaving the ID blank there.

import { isConsentGranted } from "./consent";

export const GA_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID;

let initialized = false;

/** True when GA *could* run in this build (id present + production). */
export function isGaConfigured(): boolean {
  return Boolean(GA_ID) && import.meta.env.PROD;
}

/** True when GA is configured AND the visitor has consented. */
export function isGaEnabled(): boolean {
  return isGaConfigured() && isConsentGranted();
}

/** Inject gtag.js and configure GA. Idempotent and consent-gated. */
export function initGa(): void {
  if (initialized || typeof window === "undefined") return;
  if (!isGaEnabled()) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  window.gtag("js", new Date());
  // send_page_view:false — the SPA route hook (ScrollToTop) owns page_view, so
  // we don't double-count the initial load.
  window.gtag("config", GA_ID, { send_page_view: false });

  initialized = true;
}

/** Emit a page_view for the given SPA path. No-op until enabled. */
export function trackPageView(path: string): void {
  if (!isGaEnabled() || typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", "page_view", {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
}

/** Emit a custom GA event. The reusable helper for product instrumentation. */
export function trackEvent(
  name: string,
  params: Record<string, unknown> = {}
): void {
  if (!isGaEnabled() || typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", name, params);
}
