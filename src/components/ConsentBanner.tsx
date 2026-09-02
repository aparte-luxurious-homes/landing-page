'use client';

import { useEffect, useState } from "react";
import { Link } from '@/lib/router';
import {
  hasDecided,
  setConsent,
  initGa,
  initClarity,
  trackPageView,
  isAnyGoogleTagConfigured,
  isClarityConfigured,
} from "@/analytics";
import { initMixpanel, isMixpanelConfigured } from "@/components/MixpanelInit";

/**
 * Cookie-consent banner gating Google tags (GA4 + Ads), Microsoft Clarity and
 * Mixpanel.
 *
 * Renders only when analytics could actually run (production build with an ID
 * configured) and the visitor hasn't chosen yet. On Accept it persists the
 * choice and starts analytics immediately; on Decline nothing is loaded and no
 * analytics cookies are set.
 */
export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (
      (isAnyGoogleTagConfigured() || isClarityConfigured() || isMixpanelConfigured()) &&
      !hasDecided()
    ) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const accept = () => {
    setConsent("granted");
    initGa();
    initClarity();
    initMixpanel();
    // Record the page they accepted on — the route hook fires before consent
    // exists, so the first page_view would otherwise be missed.
    trackPageView(window.location.pathname + window.location.search);
    setVisible(false);
  };

  const decline = () => {
    setConsent("denied");
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-[9999] px-4 pb-4 sm:px-6 sm:pb-6"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-4 rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-black/5 sm:flex-row sm:items-center sm:p-6">
        <p className="flex-1 text-sm leading-relaxed text-gray-600">
          We use cookies and similar tools (Google Analytics &amp; Microsoft
          Clarity) to understand how you use Aparte and improve your experience.
          See our{" "}
          <Link
            to="/privacy-policy"
            className="font-semibold text-[#124452] underline"
          >
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={decline}
            className="rounded-lg px-5 py-2.5 text-sm font-semibold text-[#124452] ring-1 ring-[#124452]/30 transition-colors hover:bg-[#124452]/5"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={accept}
            className="rounded-lg bg-[#124452] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0d343f]"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
