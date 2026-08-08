'use client';

// Terms & Conditions — DRAFT (2026-05-06).
// Drafted from platform rules in CLAUDE.md. Review with legal counsel before public launch.

import type { LegalDocument } from "./types";

export const termsAndConditions: LegalDocument = {
  title: "Terms & Conditions",
  effective_date: "2026-05-06",
  is_draft: false,
  contact_email: "support@aparte.ng",
  intro:
    "These Terms & Conditions govern your use of the Aparte platform, including the Aparte website, mobile experiences, and any related services (collectively, the \"Platform\"). The Platform is operated by Aparte Luxurious Homes Ltd. (\"Aparte\", \"we\", \"us\"), a company registered in the Federal Republic of Nigeria. By creating an account, listing a property, booking a stay, or otherwise using the Platform, you agree to these Terms.",
  sections: [
    {
      id: "acceptance",
      heading: "1. Acceptance and eligibility",
      body: [
        "By accessing or using the Platform, you confirm that you are at least 18 years old and have the legal capacity to enter into binding contracts under Nigerian law. If you are using the Platform on behalf of an organization, you confirm that you have authority to bind that organization to these Terms.",
        "Aparte primarily serves the Nigerian market. The country field on all property listings is fixed to Nigeria, and our payment, KYC, and verification systems are tailored to Nigerian regulatory requirements.",
      ],
    },
    {
      id: "definitions",
      heading: "2. Definitions",
      body: [
        "In these Terms, the following words have the following meanings:",
      ],
      list: [
        "Guest — a user who books a stay through the Platform.",
        "Host — a property Owner or Agent who lists or manages a property on the Platform.",
        "Owner — a user with the OWNER role; the legal owner of one or more properties listed on the Platform.",
        "Agent — a user with the AGENT role; a host who manages properties on behalf of one or more Owners.",
        "Booking — a confirmed reservation of a property unit for specified dates, paid through the Platform.",
        "Caution Fee — a refundable damage deposit collected with each Booking.",
        "KYC — Know Your Customer identity verification, including NIN/BVN and document checks.",
      ],
    },
    {
      id: "accounts",
      heading: "3. Accounts, KYC, and security",
      body: [
        "You may register for a Guest, Owner, or Agent account. Each account is personal and may not be shared. You are responsible for keeping your password confidential and for all activity that occurs under your account.",
        "Hosts must complete KYC verification before withdrawing earnings. KYC requires a valid National Identification Number (NIN) or Bank Verification Number (BVN) plus a supporting document (such as an international passport, driver's licence, utility bill, tenancy agreement, title deed, or certificate of occupancy). Aparte uses your NIN/BVN solely to verify your name against the national registry and does not share it with other users.",
        "We may suspend or terminate accounts found to be fraudulent, impersonating others, or violating these Terms or applicable law.",
      ],
    },
    {
      id: "listings",
      heading: "4. Property listings",
      body: [
        "Owners and Agents may list properties for short-term rental on the Platform. Every listing must include accurate property details, photographs, an address verifiable through Google Places, and at least one ownership document.",
        "Listings are submitted for verification by the Aparte team and remain in PENDING status until reviewed. Listings that fail verification will receive feedback and may be resubmitted. Aparte reserves the right to decline, hide, or remove listings that are incomplete, misleading, unsafe, or violate these Terms.",
        "Hosts represent and warrant that they have the legal right to list each property — whether as Owner, authorised Agent, or otherwise — and to receive bookings for the dates they make available. Hosts are responsible for keeping listing information, availability, and pricing accurate.",
      ],
    },
    {
      id: "bookings",
      heading: "5. Bookings and booking modes",
      body: [
        "Aparte supports two booking modes, set per-property by the Host:",
      ],
      list: [
        "Instant Book — a Booking is confirmed immediately on payment. The Host is notified and the property's availability is locked.",
        "Request to Book — the Guest's dates are held while the Host decides whether to accept. The Host has 24 hours to respond. If the Host fails to respond, the request is auto-cancelled and any held funds are released.",
      ],
      subsections: [
        {
          heading: "5.1 Booking IDs and confirmation",
          body: [
            "Each Booking is assigned a unique identifier in the format APRT_BK_YYYYMMDD_XXXXX. Confirmation is delivered by email and is also viewable on the Booking's detail page, including a downloadable PDF receipt.",
          ],
        },
        {
          heading: "5.2 Check-in and check-out",
          body: [
            "Guests must check in on the scheduled start date and check out by the scheduled end date. The exact property address is revealed to the Guest only after the Booking is confirmed.",
          ],
        },
      ],
    },
    {
      id: "payments",
      heading: "6. Payments, fees, and payouts",
      body: [
        "Guests pay for Bookings using card, bank transfer, or wallet balance. Payments are processed by our third-party payment partners (Monnify, Paystack, and Flutterwave). The payment gateway fee, where applicable, is added on top of the Booking price and is paid by the Guest.",
        "On a successful Booking, the price (excluding the Caution Fee) is split as follows: 90% to the Owner, 5% to the Agent (where assigned), and 5% to the Platform. Default percentages may be adjusted from time to time and will be reflected in this policy and the Host's wallet ledger.",
        "Hosts may withdraw their wallet balance to a verified bank account once KYC is complete and a payout account has been added. Withdrawals are subject to a bank/gateway transfer fee, which is debited from the Host's wallet at the time of withdrawal. Withdrawal requests are reviewed and approved by the Aparte team, typically within 24 hours.",
      ],
    },
    {
      id: "caution-fee",
      heading: "7. Caution fees",
      body: [
        "The Caution Fee is a refundable damage deposit collected alongside the Booking payment. It is held separately from the Booking price and is not paid out to the Host on confirmation.",
        "After checkout, the Caution Fee is refunded to the Guest's wallet in full, subject to the Host's confirmation that no damage occurred. If damage is claimed, the Caution Fee may be partially or fully retained pending resolution. See our Cancellation Policy for details.",
      ],
    },
    {
      id: "cancellations",
      heading: "8. Cancellations and refunds",
      body: [
        "Cancellations are governed by our separate Cancellation Policy, which forms part of these Terms. In summary: Guest-initiated cancellations refund 80% of the Booking price and 100% of the Caution Fee; auto-expired Request-to-Book bookings refund 100%; Aparte- or Host-initiated cancellations refund 100% of all amounts paid.",
      ],
    },
    {
      id: "disputes",
      heading: "9. Disputes",
      body: [
        "If a Guest or Host has a substantive issue with a Booking — including property mismatch, cleanliness, safety, missing amenities, damage, rule violation, or other concerns — they may open a dispute from the Booking page. Each dispute is assigned a unique identifier (DSP-XXXXX) and routed to the Aparte support team for review.",
        "Both parties may upload evidence (photo, video, document). Aparte reviews disputes in good faith and may issue: no action, a partial refund, a full refund, or partial/full compensation. Decisions of the Aparte support team are final but may be escalated for human review.",
      ],
    },
    {
      id: "content",
      heading: "10. Content and intellectual property",
      body: [
        "By uploading photos, descriptions, reviews, or other content to the Platform, you grant Aparte a worldwide, non-exclusive, royalty-free licence to use, reproduce, adapt, and display that content for the purpose of operating, promoting, and improving the Platform.",
        "You retain ownership of your content. You represent that you have all necessary rights to grant this licence and that your content does not infringe any third party's rights or violate any law.",
        "The Aparte name, logo, and underlying platform technology are the property of Aparte Luxurious Homes Ltd. and may not be reproduced or reused without our prior written consent.",
      ],
    },
    {
      id: "prohibited",
      heading: "11. Prohibited conduct",
      body: [
        "You agree not to use the Platform to:",
      ],
      list: [
        "Submit fraudulent, inaccurate, or impersonating information.",
        "List a property you do not have the legal right to rent.",
        "Pay for a Booking with stolen, fraudulent, or disputed payment instruments.",
        "Harass, threaten, defame, or harm other users.",
        "Violate any property's house rules (including pet, party, smoking, and quiet-hours rules as set by the Host).",
        "Probe, scan, scrape, or attempt to circumvent the Platform's security or rate limits.",
        "Use the Platform to facilitate any illegal activity.",
      ],
    },
    {
      id: "termination",
      heading: "12. Suspension and termination",
      body: [
        "You may close your account at any time by contacting support. Outstanding Bookings, refunds, payouts, and disputes will be settled in line with these Terms before closure.",
        "Aparte may suspend or terminate accounts that violate these Terms, with notice where reasonably possible. We may act without notice in cases of fraud, abuse, or risk to other users.",
      ],
    },
    {
      id: "liability",
      heading: "13. Limitation of liability",
      body: [
        "Aparte is a platform that connects Guests and Hosts. We do not own, operate, or control the properties listed on the Platform. To the maximum extent permitted by law, Aparte's liability arising out of or in connection with the Platform is limited to the amount paid by you to Aparte (excluding amounts paid to Hosts) in the twelve months preceding the event giving rise to the claim.",
        "We are not liable for indirect, consequential, special, or punitive damages, including lost profits, lost data, or interruption of business.",
        "Nothing in these Terms limits liability for death or personal injury caused by negligence, fraud, or any other liability that cannot be excluded under Nigerian law.",
      ],
    },
    {
      id: "indemnity",
      heading: "14. Indemnity",
      body: [
        "You agree to indemnify and hold Aparte harmless from any claim, damage, or expense (including legal fees) arising out of your breach of these Terms, your violation of any law, or your infringement of any third party's rights.",
      ],
    },
    {
      id: "changes",
      heading: "15. Changes to these Terms",
      body: [
        "We may update these Terms from time to time. Material changes will be communicated by email or in-app notification at least 14 days before they take effect. Continued use of the Platform after the effective date constitutes acceptance.",
      ],
    },
    {
      id: "law",
      heading: "16. Governing law and jurisdiction",
      body: [
        "These Terms are governed by the laws of the Federal Republic of Nigeria. Any dispute arising out of or in connection with these Terms is subject to the exclusive jurisdiction of the courts of Lagos, Nigeria.",
      ],
    },
    {
      id: "contact",
      heading: "17. Contact",
      body: [
        "Questions about these Terms? Email support@aparte.ng or write to us at our registered Nigerian address (available on request).",
      ],
    },
  ],
};
