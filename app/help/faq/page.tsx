import type { Metadata } from "next";

import { allFaqs } from "@/lib/help/data";
import { toJsonLd } from "@/lib/seo/jsonLd";
import { faqPageSchema } from "@/lib/seo/schema";
import HelpFaqPage from "@/views/help/Faq";

export const metadata: Metadata = {
  title: "Frequently asked questions",
  description:
    "Answers to common questions about booking, cancellations, refunds, " +
    "payouts and verification on Aparte — Nigeria's luxury short-stay platform.",
  alternates: { canonical: "/help/faq" },
};

/**
 * FAQPage JSON-LD is emitted here, server-side, over the full FAQ set — the
 * client view previously computed it and never rendered it. Google restricts
 * FAQ *rich results* to gov/health sites, but the markup's real audience is
 * AI answer engines (ChatGPT, Perplexity, AI Overviews), which read Q&A
 * structure from raw HTML.
 */
export default function Page() {
  const faqJsonLd = faqPageSchema(
    allFaqs.map((f) => ({ question: f.question, answer: f.answer }))
  );

  return (
    <>
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLd(faqJsonLd) }}
        />
      )}
      <HelpFaqPage />
    </>
  );
}
