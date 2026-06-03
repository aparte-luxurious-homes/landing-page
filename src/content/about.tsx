// About Us page content. Consumed by src/pages/AboutUs.tsx.
// Authored 2026-05-06. Edit copy here; layout lives in the page component.

export interface AboutHero {
  eyebrow: string;
  headline: string;
  body: string;
}

export interface AboutColumn {
  title: string;
  body: string;
  icon?: string; // optional icon name (we'll map to an asset in the page)
}

export interface AboutPillar {
  title: string;
  body: string;
}

export interface AboutValue {
  title: string;
  body: string;
}

export interface AboutCTA {
  label: string;
  href: string;
  variant: "primary" | "secondary";
}

export interface AboutFaqTeaserItem {
  question: string;
  answer: string;
}

export interface AboutContent {
  hero: AboutHero;
  howItWorks: {
    title: string;
    columns: AboutColumn[];
  };
  whyAparte: {
    title: string;
    pillars: AboutPillar[];
  };
  values: {
    title: string;
    items: AboutValue[];
  };
  cta: {
    headline: string;
    body: string;
    buttons: AboutCTA[];
  };
  faqTeaser: {
    title: string;
    subtitle: string;
    items: AboutFaqTeaserItem[];
    cta: { label: string; href: string };
  };
}

export const aboutContent: AboutContent = {
  hero: {
    eyebrow: "About Aparte",
    headline: "Luxury stays, made effortless.",
    body: "Aparte connects discerning travelers with carefully vetted homes, apartments, and hotels across Nigeria. We work directly with property owners and agents to surface stays that are clean, comfortable, and worth coming back to — and we handle the rest, from payment to verification to support.",
  },
  howItWorks: {
    title: "How Aparte works",
    columns: [
      {
        title: "Discover",
        body: "Search by city, dates, and guests. Filter by property type, price, and amenities. Every listing is verified — no surprises on arrival.",
        icon: "search",
      },
      {
        title: "Book",
        body: "Pay securely by card, bank transfer, or wallet. Instant Book confirms in seconds; Request to Book holds your dates while the host approves.",
        icon: "calendar",
      },
      {
        title: "Stay",
        body: "Get your exact address and check-in details once confirmed. The host welcomes you on arrival. Aparte support is one tap away the whole time.",
        icon: "key",
      },
    ],
  },
  whyAparte: {
    title: "Why Aparte",
    pillars: [
      {
        title: "Verified hosts",
        body: "Every property is reviewed by our team before it goes live — ownership documents, photos, and address all checked. Hosts pass KYC before they can collect payouts.",
      },
      {
        title: "Secure payments",
        body: "Card, bank transfer, and wallet payments are processed through Monnify, Paystack, and Flutterwave — the same gateways trusted by Nigeria's largest businesses.",
      },
      {
        title: "Always-on support",
        body: "Our support team replies within one business day. For bookings in progress, in-app dispute and cancellation flows route directly to the team that can act.",
      },
      {
        title: "Premium curation",
        body: "We focus on a smaller catalog of stays we'd happily book ourselves. Reviews, ratings, and direct feedback keep quality high.",
      },
    ],
  },
  values: {
    title: "What we believe",
    items: [
      {
        title: "Trust by design",
        body: "Identity verification, document review, and audit logging are built into every interaction — not bolted on. The platform is designed so the right thing is also the default thing.",
      },
      {
        title: "Quality over quantity",
        body: "We'd rather list 100 great properties than 10,000 forgettable ones. Every host invited to Aparte is curated. Every review counts.",
      },
      {
        title: "Hospitality first",
        body: "Aparte isn't an inventory marketplace. It's a hospitality platform. We win when guests come back and hosts get rebooked.",
      },
    ],
  },
  cta: {
    headline: "Start your Aparte journey",
    body: "Whether you're looking for your next stay or your next stream of income, we'd love to have you.",
    buttons: [
      { label: "Find a stay", href: "/", variant: "primary" },
      { label: "List your Aparte", href: "/list", variant: "secondary" },
    ],
  },
  faqTeaser: {
    title: "Frequently asked questions",
    subtitle: "Quick answers to the things most travelers and hosts ask.",
    items: [
      {
        question: "How does Aparte verify properties?",
        answer:
          "Every property is reviewed by our team within 48 hours of submission. We check ownership documents, photos, and address. Hosts pass KYC before they can withdraw earnings.",
      },
      {
        question: "Is my booking refundable?",
        answer:
          "Most cancellations refund 80% of the booking price and 100% of the caution fee. Request-to-Book bookings that aren't approved in 24 hours refund in full automatically.",
      },
      {
        question: "How do I list my property?",
        answer:
          "Tap \"List your Aparte\" from the header or footer and walk through the 8-step listing wizard. Have photos and at least one ownership document ready before you start.",
      },
    ],
    cta: { label: "Read our full FAQ →", href: "/help/faq" },
  },
};
