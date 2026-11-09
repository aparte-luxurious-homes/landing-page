import type { Metadata } from "next";
import Link from "next/link";

import { BlogShell } from "@/components/blog/BlogShell";

/**
 * Shown for an article that was never published, has been unpublished or
 * deleted, and for an unknown category or tag. A real 404, so search engines
 * drop the address, with a way back for the person holding the old link.
 */

export const metadata: Metadata = {
  title: "Article not found",
  robots: { index: false, follow: false },
};

export default function BlogNotFound() {
  return (
    <BlogShell>
      <div className="py-10 text-center">
        <p className="text-xs font-bold uppercase tracking-wider text-teal mb-3">404 · Article not found</p>
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-ink leading-tight">
          This article isn&apos;t available.
        </h1>
        <p className="mt-4 text-gray-600">
          It may have been taken down, or the link may be mistyped.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/blog"
            className="inline-block rounded-lg bg-teal px-5 py-2.5 text-white font-semibold hover:opacity-90"
          >
            Go to the blog
          </Link>
          <Link
            href="/"
            className="inline-block rounded-lg border border-gray-200 px-5 py-2.5 font-semibold text-ink hover:bg-gray-50"
          >
            Go to the homepage
          </Link>
        </div>
      </div>
    </BlogShell>
  );
}
