import { useState } from "react";
import Header from "@/sections/Header";
import Footer from "@/sections/Footer";
import { FaqAccordion } from "@/components/help/FaqAccordion";
import { allFaqs, faqsForAudience } from "@/lib/help/data";
import type { FaqAudience } from "@/lib/help/types";
import Seo from "@/components/seo/Seo";
import { faqPageSchema } from "@/lib/seo/schema";

const AUDIENCES: { value: FaqAudience; label: string }[] = [
  { value: "all", label: "All" },
  { value: "guest", label: "Guests" },
  { value: "owner", label: "Owners" },
  { value: "agent", label: "Agents" },
];

export default function HelpFaqPage() {
  const [audience, setAudience] = useState<FaqAudience>("all");
  const visible = faqsForAudience(audience);
  const faqJsonLd = faqPageSchema(
    allFaqs.map((f) => ({ question: f.question, answer: f.answer })),
  );

  return (
    <>
      <Seo
        title="FAQ"
        description="Quick answers to common questions about bookings, payouts, cancellations, KYC and more on Aparte."
        canonicalPath="/help/faq"
        type="article"
        jsonLd={faqJsonLd ?? undefined}
      />
      <Header />
      <main className="bg-white pt-24 pb-32 lg:pb-44 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <header className="mb-6">
            <p className="text-xs font-bold uppercase tracking-wider text-teal mb-2">
              Help Center
            </p>
            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-ink leading-tight">
              Frequently asked questions
            </h1>
            <p className="mt-2 text-gray-600">
              Looking for something more detailed?{" "}
              <a href="/help" className="text-teal font-semibold hover:underline">
                Browse our full guides
              </a>
              .
            </p>
          </header>

          <div
            className="flex flex-wrap gap-2 mb-6"
            role="tablist"
            aria-label="FAQ by audience"
          >
            {AUDIENCES.map((a) => (
              <button
                key={a.value}
                role="tab"
                aria-selected={audience === a.value}
                onClick={() => setAudience(a.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-semibold transition ${
                  audience === a.value
                    ? "bg-teal text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>

          <FaqAccordion faqs={visible} />

          <p className="mt-8 text-sm text-gray-600 text-center">
            Still stuck? Email{" "}
            <a
              href="mailto:support@aparte.ng"
              className="text-teal font-semibold hover:underline"
            >
              support@aparte.ng
            </a>
            .
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
