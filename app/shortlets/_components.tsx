import Link from "next/link";

import Footer from "@/sections/Footer";
import Header from "@/sections/Header";
import {
  heroOf,
  priceFromOf,
  type ListedProperty,
} from "@/lib/seo/listingPages";
import { toJsonLd } from "@/lib/seo/jsonLd";

/**
 * Shared server-rendered pieces for the /shortlets landing pages.
 *
 * All server components on purpose. These pages exist to put copy, listings,
 * FAQs and structured data into the raw HTML for crawlers and AI answer
 * engines, so nothing here may pull in a client component — importing
 * ApartmentCard would drag the carousel, its state and MUI icons into a page
 * whose entire value is being static.
 */

/** Home > Shortlets > … */
export function Breadcrumb({ trail }: { trail: { name: string; href?: string }[] }) {
  return (
    <nav className="mb-6 text-sm text-gray-500" aria-label="Breadcrumb">
      <Link href="/" className="hover:text-teal">
        Home
      </Link>{" "}
      <span aria-hidden>›</span>{" "}
      <Link href="/shortlets" className="hover:text-teal">
        Shortlets
      </Link>
      {trail.map((crumb) => (
        <span key={crumb.name}>
          {" "}
          <span aria-hidden>›</span>{" "}
          {crumb.href ? (
            <Link href={crumb.href} className="hover:text-teal">
              {crumb.name}
            </Link>
          ) : (
            <span>{crumb.name}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {/* pb must stay >= the Footer's -mt-28 / lg:-mt-40 pull, or its
          angled wedge paints over the last block of content. */}
      <main className="bg-white pt-24 pb-32 lg:pb-48 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">{children}</div>
      </main>
      <Footer />
    </>
  );
}

export function ListingGrid({
  properties,
  altSuffix,
}: {
  properties: ListedProperty[];
  /** Completes the image alt: "{name} — {altSuffix}". */
  altSuffix: string;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {properties.map((p) => {
        const hero = heroOf(p);
        const priceFrom = priceFromOf(p);
        return (
          <Link
            key={p.id}
            href={`/property-details/${p.id}`}
            className="group block rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition"
          >
            <span className="block aspect-[4/3] bg-gray-100 overflow-hidden">
              {hero && (
                // Plain <img>: listing hosts vary and an unconfigured
                // next/image host throws at runtime. (No eslint-disable here
                // — this project does not load @next/next, so the disable
                // comment was itself the only lint error it produced.)
                <img
                  src={hero}
                  alt={`${p.name} — ${altSuffix}`}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />
              )}
            </span>
            <span className="block p-3">
              <span className="block font-semibold text-ink text-sm truncate">
                {p.name}
              </span>
              <span className="block text-xs text-gray-500 mt-0.5">
                {[p.city, p.state].filter(Boolean).join(", ")}
              </span>
              {priceFrom != null && (
                <span className="block text-sm text-teal font-semibold mt-1">
                  From ₦{Math.round(priceFrom).toLocaleString("en-NG")}/night
                </span>
              )}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

export function FaqList({
  faqs,
}: {
  faqs: { question: string; answer: string }[];
}) {
  if (!faqs.length) return null;
  return (
    <section className="mb-12 max-w-3xl" aria-label="Good to know">
      <h2 className="font-serif text-xl font-semibold text-ink mb-4">
        Good to know
      </h2>
      <dl className="space-y-5">
        {faqs.map((faq) => (
          <div key={faq.question}>
            <dt className="font-semibold text-ink">{faq.question}</dt>
            <dd className="mt-1 text-gray-700 leading-relaxed">{faq.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** Shown instead of the grid when nothing is live yet. */
export function EmptyState({
  subject,
  searchHref,
}: {
  subject: string;
  searchHref: string;
}) {
  return (
    <section className="mb-12">
      <p className="text-gray-600">
        New {subject} are being verified.{" "}
        <Link href={searchHref} className="text-teal font-semibold hover:underline">
          Search current availability
        </Link>{" "}
        or check back soon.
      </p>
    </section>
  );
}

/**
 * Render JSON-LD blocks, dropping the empty ones.
 *
 * Takes the objects rather than pre-serialised strings on purpose: the
 * escaping is applied in here, so no caller can hand this a raw string and
 * bypass it. `toJsonLd` escapes <, >, &, U+2028 and U+2029, which matters
 * because listing names in an ItemList are host-supplied free text and end up
 * inside a <script> block.
 */
export function JsonLdScripts({
  blocks,
}: {
  blocks: (Record<string, unknown> | null)[];
}) {
  return (
    <>
      {blocks
        .filter((b): b is Record<string, unknown> => Boolean(b))
        .map((block, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: toJsonLd(block) }}
          />
        ))}
    </>
  );
}
