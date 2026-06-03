// Barrel for the analytics layer. Import from "@/analytics".
//
// Usage:
//   import { trackEvent } from "@/analytics";
//   trackEvent("booking_created", { property_id });

export {
  GA_ID,
  isGaConfigured,
  isGaEnabled,
  initGa,
  trackPageView,
  trackEvent,
} from "./ga";

export {
  CLARITY_ID,
  isClarityConfigured,
  isClarityEnabled,
  initClarity,
  clarityEvent,
  claritySet,
} from "./clarity";

export {
  getConsent,
  hasDecided,
  isConsentGranted,
  setConsent,
  clearConsent,
  onConsentChange,
} from "./consent";

export type { ConsentValue } from "./consent";
