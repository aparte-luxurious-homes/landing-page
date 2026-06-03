// Cancellation Policy — DRAFT (2026-05-06).
// Drafted from platform rules in CLAUDE.md. Review with legal counsel before public launch.

import type { LegalDocument } from "./types";

export const cancellationPolicy: LegalDocument = {
  title: "Cancellation Policy",
  effective_date: "2026-05-06",
  is_draft: false,
  contact_email: "support@aparte.ng",
  intro:
    "This Cancellation Policy explains what happens when a booking made through Aparte is cancelled — by you, by your host, or by the Aparte team. It works alongside our Terms & Conditions and forms part of the agreement between you and Aparte Luxurious Homes Ltd. (\"Aparte\", \"we\", \"us\"). Where this policy refers to a refund, the refund is paid to your Aparte wallet first; you may then withdraw to a verified bank account, subject to KYC completion.",
  sections: [
    {
      id: "guest-cancellation",
      heading: "1. Guest-initiated cancellation",
      body: [
        "You may request a cancellation at any time before check-in by opening the booking in your account and tapping \"Request cancellation.\" The booking moves to a CANCEL_REQUESTED state while our team reviews it.",
        "Once approved, you will be refunded 80% of the booking price (the nightly rate × number of nights) and 100% of the caution fee. The remaining 20% covers irrecoverable processing, payout, and operational costs. Cancellation requests are typically reviewed and approved within 24 hours.",
        "If you have already checked in, standard cancellation is no longer available. You may still raise a dispute (see Section 6) if there is a substantive issue with the property or your stay.",
      ],
    },
    {
      id: "host-rejection",
      heading: "2. Host rejection of Request-to-Book bookings",
      body: [
        "Some properties on Aparte use Request to Book mode. When you book one of these properties, your dates are held while the host decides whether to accept. The host has 24 hours to respond.",
        "If the host rejects your request, or does not respond within 24 hours (after which the request is auto-cancelled by our system), you will receive a 100% refund. No fees are deducted, because the booking was never confirmed and no funds were transferred to the host.",
      ],
    },
    {
      id: "booking-modes",
      heading: "3. Booking modes summary",
      body: [
        "Aparte supports two booking modes, set per-property by the host:",
      ],
      list: [
        "Instant Book — your booking is confirmed immediately on payment. Standard guest-cancellation terms apply.",
        "Request to Book — your dates are held and your payment is captured only after the host accepts. If the host declines or fails to respond within 24 hours, you receive a full refund automatically.",
      ],
    },
    {
      id: "extensions",
      heading: "4. Stay extensions",
      body: [
        "If you have requested an extension to your stay, the extension may be cancelled separately from the original booking. Cancelling an extension while it is awaiting owner approval refunds the extension amount in full.",
        "If the extension has been approved and paid for, standard guest-cancellation terms apply to the extension portion only (80% refund of the extension price). The original booking is unaffected.",
      ],
    },
    {
      id: "caution-fee",
      heading: "5. Caution fee handling",
      body: [
        "The caution fee is a refundable damage deposit collected alongside your booking payment but held separately from the nightly rate. It is intended to cover any damage caused during your stay.",
        "After checkout, the host has the opportunity to review the property and confirm that no damage occurred. Once confirmed, the caution fee is refunded to your Aparte wallet in full, typically within 48 hours of checkout.",
        "If the host claims damage occurred, the caution fee is held pending review by the Aparte support team. You will be notified and given the opportunity to respond. Depending on outcome, the caution fee may be partially or fully forfeited, refunded, or escalated to a formal dispute.",
      ],
    },
    {
      id: "refund-timelines",
      heading: "6. Refund timelines",
      body: [
        "All refunds are paid to your Aparte wallet first. From there, you can either apply the balance to a future booking or withdraw to a verified Nigerian bank account.",
      ],
      list: [
        "Wallet credit — usually immediate once a refund is approved.",
        "Bank withdrawal — 24 to 72 hours after withdrawal request is approved, subject to KYC and payout-account verification.",
        "Gateway disputes (chargebacks) — handled separately under the rules of the original payment provider (Monnify, Paystack, or Flutterwave).",
      ],
    },
    {
      id: "disputes",
      heading: "7. Disputes",
      body: [
        "If something more serious happens — the property does not match the listing, there are safety concerns, cleanliness issues, missing amenities, or you cannot access the property at check-in — you may raise a dispute instead of (or in addition to) cancellation.",
        "Disputes are opened from the booking page. You choose a category, describe what happened, and upload photo or video evidence. An Aparte admin reviews each dispute and may issue no action, a partial refund, or a full refund depending on outcome.",
        "We aim to acknowledge disputes within 24 hours and resolve them within 7 business days. Complex disputes may take longer.",
      ],
    },
    {
      id: "host-cancellation",
      heading: "8. Cancellation by Aparte or by the host",
      body: [
        "In rare cases, Aparte may cancel a booking — for example if a property fails a re-verification check, becomes unsafe, or the host loses access to it before your check-in date.",
        "In all such cases, you will receive a 100% refund of the booking price and caution fee, plus reasonable assistance finding an alternative stay where possible. We will notify you by email and in-app notification as soon as the cancellation is initiated.",
      ],
    },
    {
      id: "force-majeure",
      heading: "9. Events outside our control",
      body: [
        "Aparte cannot guarantee refunds in the event of force majeure — natural disasters, government-imposed travel restrictions, civil unrest, or similar events that make travel or hospitality impossible. In such cases we will work in good faith with both hosts and guests to find a fair outcome, which may include partial refund, rescheduling, or wallet credit toward a future stay.",
      ],
    },
    {
      id: "contact",
      heading: "10. Contact",
      body: [
        "Questions about this policy, a specific cancellation, or a refund that has not arrived? Email support@aparte.ng with your booking ID (format APRT_BK_YYYYMMDD_XXXXX). We reply within one business day.",
      ],
    },
  ],
};
