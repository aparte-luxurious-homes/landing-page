// Privacy Policy — DRAFT (2026-05-06).
// Drafted from platform behavior in CLAUDE.md. Review with legal counsel before public launch.

import type { LegalDocument } from "./types";

export const privacyPolicy: LegalDocument = {
  title: "Privacy Policy",
  effective_date: "2026-05-06",
  is_draft: false,
  contact_email: "privacy@aparte.ng",
  intro:
    "This Privacy Policy explains how Aparte Digital Limited (RC 9311297) (\"Aparte\", \"we\", \"us\") collects, uses, shares, and protects your personal data when you use the Aparte platform. It applies to Guests, Owners, Agents, and anyone else who interacts with our website, services, or staff. We comply with the Nigeria Data Protection Act (NDPA) 2023 and the Nigeria Data Protection Regulation (NDPR), and where applicable, with comparable laws of jurisdictions where our users reside.",
  sections: [
    {
      id: "controller",
      heading: "1. Who is responsible for your data",
      body: [
        "Aparte Digital Limited (RC 9311297) is the data controller for the personal data we process about you. If you have any questions about this policy, how we handle your data, or to exercise any of your rights, please contact our Data Protection Officer at privacy@aparte.ng.",
      ],
    },
    {
      id: "data-we-collect",
      heading: "2. Data we collect",
      body: [
        "We collect personal data in several categories:",
      ],
      subsections: [
        {
          heading: "2.1 Profile data",
          body: ["Provided by you when you register or update your profile."],
          list: [
            "First and last name, gender, date of birth.",
            "Email address and phone number.",
            "Address, city, state, and country.",
            "Profile photo.",
            "Optional bio.",
            "Auto-generated 8-character referral code.",
          ],
        },
        {
          heading: "2.2 KYC and identity data",
          body: [
            "Required only when you list a property, request a payout, or are otherwise required to verify identity under Nigerian regulation.",
          ],
          list: [
            "National Identification Number (NIN) or Bank Verification Number (BVN).",
            "Supporting identity document (e.g., passport, driver's licence) and/or proof of address (utility bill, tenancy agreement, title deed, certificate of occupancy).",
          ],
        },
        {
          heading: "2.3 Payment data",
          body: [
            "We do not store full card numbers or CVV codes. Card payments are processed and stored by our payment partners (Monnify, Paystack, Flutterwave). For bank transfers and payouts, we store account name, account number, and bank code as needed to send payouts.",
          ],
        },
        {
          heading: "2.4 Booking, listing, and transactional data",
          body: [
            "Records of stays, properties listed, payments made or received, wallet transactions, and disputes raised — generated as a natural consequence of using the Platform.",
          ],
        },
        {
          heading: "2.5 Device, log, and behavioural data",
          body: [
            "IP address, device type, browser type, user agent, pages viewed, time spent, and other usage data — collected automatically when you visit the Platform. These are used for security, fraud prevention, debugging, and improving the service.",
          ],
        },
        {
          heading: "2.6 Communications",
          body: [
            "Emails, in-app messages, and support tickets you send to us. We may record these interactions to help us serve you and to improve our support team.",
          ],
        },
      ],
    },
    {
      id: "how-we-use",
      heading: "3. How we use your data",
      body: [
        "We process your personal data for the following purposes, on the following legal bases:",
      ],
      list: [
        "Performance of contract — to operate your account, process bookings, transfer payouts, refund cancellations, and resolve disputes.",
        "Legal obligation — to comply with Know-Your-Customer (KYC), anti-money-laundering, and tax-reporting obligations under Nigerian law.",
        "Legitimate interests — to prevent fraud, secure our platform, audit our operations, debug technical issues, and improve our service.",
        "Consent — to send you marketing communications, where you have opted in. You may withdraw consent at any time from your account settings.",
      ],
    },
    {
      id: "sharing",
      heading: "4. Who we share data with",
      body: [
        "We share data only with parties that help us run the Platform or that you have explicitly chosen to interact with through the Platform.",
      ],
      subsections: [
        {
          heading: "4.1 Other users",
          body: [
            "Hosts and Guests share limited information with each other to enable bookings — for example, your first name and profile photo are visible to your Host once a Booking is confirmed. Full property addresses are revealed to Guests only after Booking confirmation; before then, we display an approximate location.",
          ],
        },
        {
          heading: "4.2 Service providers",
          body: ["We work with third-party providers under contract. They process data only on our instructions."],
          list: [
            "Postmark — transactional email delivery.",
            "Termii — SMS delivery for OTP and notifications.",
            "Monnify, Paystack, and Flutterwave — card and bank payments, payouts, and bank verification.",
            "Cloudinary and Google Cloud Storage — image and document storage.",
            "Sentry — error monitoring and crash reporting.",
            "Google Cloud Platform — hosting and database infrastructure (region: europe-west1).",
          ],
        },
        {
          heading: "4.3 Legal and regulatory",
          body: [
            "We may disclose data when required by law, court order, or to comply with a legitimate request from law-enforcement or regulators. We will not disclose data without legal basis.",
          ],
        },
      ],
    },
    {
      id: "retention",
      heading: "5. How long we keep data",
      body: [
        "We retain personal data only as long as necessary for the purposes for which it was collected.",
      ],
      list: [
        "Account and profile data — retained while your account is active, and for up to 7 years after closure for tax and audit purposes.",
        "Booking and transactional data — retained for at least 7 years (Nigerian tax and financial-records requirements).",
        "KYC and identity documents — retained for at least 5 years after account closure (anti-money-laundering requirements).",
        "Webhook events from payment providers — retained for 90 days for reconciliation and debugging.",
        "Marketing data — retained until you withdraw consent.",
      ],
    },
    {
      id: "security",
      heading: "6. Security",
      body: [
        "We protect your data with industry-standard controls including HTTPS encryption in transit, encrypted storage at rest, JWT-based authentication with short token lifetimes (12 hours), and PII masking in our internal logs (your NIN and BVN are never visible in plain text in any log).",
        "No method of transmission or storage is 100% secure, but we work continuously to assess and improve our security posture.",
      ],
    },
    {
      id: "your-rights",
      heading: "7. Your rights",
      body: [
        "Under Nigerian data protection law, you have the following rights:",
      ],
      list: [
        "Access — request a copy of the personal data we hold about you.",
        "Correction — ask us to correct inaccurate or incomplete data.",
        "Deletion — ask us to delete your personal data, subject to our legal retention obligations.",
        "Portability — receive your data in a structured, machine-readable format.",
        "Restriction and objection — ask us to limit or stop certain types of processing.",
        "Withdrawal of consent — for marketing or other consent-based processing, withdraw at any time.",
      ],
    },
    {
      id: "cookies",
      heading: "8. Cookies and similar technologies",
      body: [
        "We use cookies and similar technologies for two purposes. First, a small number of essential cookies keep you signed in and remember your booking session for up to 12 hours — these are always active, as the Platform cannot function without them. Second, with your consent, we use analytics tools — Google Analytics 4 and Microsoft Clarity — to understand how visitors use the Platform: which pages are viewed, how features are used, and where people run into difficulty, so that we can improve the experience. Microsoft Clarity may also capture anonymised session replays and heatmaps; sensitive fields are masked and we do not use these tools to identify you personally.",
        "Analytics cookies are never set until you accept them. On your first visit we show a consent banner where you can Accept or Decline. You can change your decision at any time using the \"Cookie settings\" link in the footer of any page — declining, or later withdrawing consent, stops all further analytics collection. We do not use cookies for third-party advertising.",
      ],
    },
    {
      id: "international",
      heading: "9. International transfers",
      body: [
        "Some of our infrastructure providers, including Google Cloud Platform (region: europe-west1), are located outside Nigeria. Where personal data is transferred outside Nigeria, we ensure the transfer is governed by appropriate safeguards, including standard contractual clauses and provider security commitments.",
      ],
    },
    {
      id: "children",
      heading: "10. Children",
      body: [
        "Aparte is not directed at, and does not knowingly collect data from, anyone under the age of 18. If you believe a minor has registered with us, please contact privacy@aparte.ng and we will close the account.",
      ],
    },
    {
      id: "changes",
      heading: "11. Changes to this policy",
      body: [
        "We may update this Privacy Policy from time to time. Material changes will be communicated by email or in-app notification at least 14 days before they take effect.",
      ],
    },
    {
      id: "contact",
      heading: "12. Contact and complaints",
      body: [
        "Questions, requests, or complaints about how we handle your data? Email our Data Protection Officer at privacy@aparte.ng. We respond to all requests within 30 days. If you are not satisfied with our response, you may lodge a complaint with the Nigeria Data Protection Commission.",
      ],
    },
  ],
};
