// Google tags (gtag.js) — GA4 measurement and Google Ads conversion tracking.
//
// Both destinations ride on ONE gtag.js library. The snippet Google hands you
// per product looks standalone, but pasting two of them loads the same script
// twice and gives you a duplicated dataLayer bootstrap. The correct shape is a
// single load followed by one `config` call per destination, which is what this
// module does.
//
// A tag is injected only when ALL of the following hold:
//   1. at least one destination ID is configured, AND
//   2. this is a production build (process.env.NODE_ENV === 'production'), AND
//   3. the visitor has granted consent.
//
// Staging/preview deploys are excluded by leaving the IDs blank there. For Ads
// that is not just hygiene: conversions fired from previews and QA runs feed
// the bidding model, so a leaked ID actively degrades campaign performance.

import { isConsentGranted } from "./consent";

export const GA_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
export const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

const IS_PRODUCTION = process.env.NODE_ENV === "production";

let initialized = false;

/** True when GA4 *could* run in this build (id present + production). */
export function isGaConfigured(): boolean {
  return Boolean(GA_ID) && IS_PRODUCTION;
}

/** True when Google Ads *could* run in this build (id present + production). */
export function isAdsConfigured(): boolean {
  return Boolean(ADS_ID) && IS_PRODUCTION;
}

/** True when any Google tag is configured — the gate for loading gtag.js. */
export function isAnyGoogleTagConfigured(): boolean {
  return isGaConfigured() || isAdsConfigured();
}

/** True when GA4 is configured AND the visitor has consented. */
export function isGaEnabled(): boolean {
  return isGaConfigured() && isConsentGranted();
}

/** True when Google Ads is configured AND the visitor has consented. */
export function isAdsEnabled(): boolean {
  return isAdsConfigured() && isConsentGranted();
}

/**
 * Inject gtag.js and configure every enabled destination.
 * Idempotent and consent-gated.
 */
export function initGa(): void {
  if (initialized || typeof window === "undefined") return;
  if (!isAnyGoogleTagConfigured() || !isConsentGranted()) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };

  // The `id` in the URL only bootstraps the library; every destination is
  // registered by its own `config` call below. Either ID works, so prefer GA4
  // and fall back to Ads when GA4 is not configured.
  const bootstrapId = GA_ID || ADS_ID;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${bootstrapId}`;
  document.head.appendChild(script);

  window.gtag("js", new Date());

  // Truthiness checks rather than the is*Configured() helpers so TypeScript
  // narrows these to `string`.
  if (GA_ID && IS_PRODUCTION) {
    // send_page_view:false — the SPA route hook (ScrollToTop) owns page_view,
    // so we don't double-count the initial load.
    window.gtag("config", GA_ID, { send_page_view: false });
  }
  if (ADS_ID && IS_PRODUCTION) {
    window.gtag("config", ADS_ID);
  }

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

/**
 * Report a Google Ads conversion.
 *
 * `label` is the conversion label from the Ads UI (Goals → Conversions → the
 * action → its tag setup). Pass either the bare label, or a full
 * `AW-XXXXXXXX/label` if the conversion belongs to a different Ads account.
 *
 * Deliberately separate from `trackEvent`: a GA4 event sent without `send_to`
 * goes to the GA4 property only and is silently ignored by Ads, which is the
 * usual reason conversions "fire" in the console but never appear in the Ads
 * dashboard.
 *
 *   trackConversion("AbC-D_efG-h12", { value: 45000, currency: "NGN" });
 */
export function trackConversion(
  label: string,
  params: Record<string, unknown> = {}
): void {
  if (!isAdsEnabled() || typeof window === "undefined" || !window.gtag) return;
  const sendTo = label.startsWith("AW-") ? label : `${ADS_ID}/${label}`;
  window.gtag("event", "conversion", { send_to: sendTo, ...params });
}
