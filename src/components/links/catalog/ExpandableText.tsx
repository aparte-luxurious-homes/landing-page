"use client";

import { useState } from "react";

interface ExpandableTextProps {
  text: string;
  className?: string;
}

/** Long bio, clamped to four lines with a "Read more" — expanding is the
 * reader's action, so the change is instant and there is no animation. */
export default function ExpandableText({ text, className = "" }: ExpandableTextProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className={className}>
      <p className={`whitespace-pre-line ${open ? "" : "line-clamp-4"}`}>{text}</p>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="mt-2 min-h-[44px] text-sm font-semibold text-teal hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
      >
        {open ? "Show less" : "Read more"}
      </button>
    </div>
  );
}
