"use client";

import Script from "next/script";

/**
 * Payment gateway SDKs, loaded only on routes that can actually take a
 * payment.
 *
 * These were blocking <script> tags in index.html, so every route — /terms
 * included — paid for both gateways before first paint. Loading them
 * globally via next/script also made Paystack's inline.js log
 * "Please put your Paystack Inline javascript file inside of a form element"
 * on pages with no checkout form.
 *
 * Mount this on: /confirm-booking, /booking-validation, and the account
 * routes (ExtendStayModal opens a Paystack checkout).
 */
export default function PaymentScripts() {
  return (
    <>
      <Script
        src="https://sdk.monnify.com/plugin/monnify.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://js.paystack.co/v1/inline.js"
        strategy="afterInteractive"
      />
    </>
  );
}
