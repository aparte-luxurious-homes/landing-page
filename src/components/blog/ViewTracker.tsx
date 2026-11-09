"use client";

import { useEffect } from "react";

import { useRecordBlogViewMutation } from "@/api/blogApi";

/**
 * Counts one read per article per browser session, for "Popular articles".
 * Renders nothing. A failed count is ignored: it must never affect reading.
 */
export default function ViewTracker({ slug }: { slug: string }) {
  const [record] = useRecordBlogViewMutation();

  useEffect(() => {
    const key = `blog-viewed:${slug}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // Private mode without storage: count it anyway.
    }
    record(slug).catch(() => undefined);
  }, [slug, record]);

  return null;
}
