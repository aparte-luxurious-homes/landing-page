"use client";

import { useEffect, useState } from "react";

interface ShareButtonProps {
  title: string;
  /** Absolute URL to share. */
  url: string;
  className?: string;
}

/**
 * Native share sheet where there is one (every phone), clipboard otherwise.
 * The only state is the two-second "Copied" confirmation — no toast library
 * on a page whose whole value is loading fast on a phone.
 */
export default function ShareButton({ title, url, className = "" }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(t);
  }, [copied]);

  const share = async () => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // Dismissed, or the platform refused — fall through to the clipboard.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      window.prompt("Copy this link", url);
    }
  };

  return (
    <button
      type="button"
      onClick={share}
      aria-live="polite"
      className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-neutral-300 px-4 text-sm font-semibold text-ink transition-colors hover:border-teal hover:text-teal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal ${className}`}
    >
      <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
        <path d="M16 6l-4-4-4 4" />
        <path d="M12 2v13" />
      </svg>
      {copied ? "Link copied" : "Share this page"}
    </button>
  );
}
