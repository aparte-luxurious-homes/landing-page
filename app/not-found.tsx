import type { Metadata } from "next";
import Link from "next/link";

/**
 * Branded 404. Next already returns the correct HTTP 404 status wherever
 * notFound() fires (unknown root slugs, dead property links); this replaces
 * the unstyled default page with recovery paths so a dead shared link still
 * converts instead of dead-ending.
 */

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

const LINKS = [
  { href: "/", label: "Go to the homepage" },
  { href: "/search-results", label: "Search apartments & homes" },
  { href: "/help", label: "Visit the Help Center" },
];

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="max-w-md text-center">
        <p className="text-xs font-bold uppercase tracking-wider text-teal mb-3">
          404 — Page not found
        </p>
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-ink leading-tight">
          This page doesn&apos;t exist — but the stay you&apos;re looking for
          might.
        </h1>
        <p className="mt-4 text-gray-600">
          The link may be out of date, or the listing may no longer be
          published.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-teal font-semibold hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <p className="mt-10 text-sm text-gray-500">
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
  );
}
