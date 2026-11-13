'use client';

import React from 'react';
import type { EmailHint } from '../../hooks/useEmailHint';

interface EmailSuggestionProps extends EmailHint {
  className?: string;
}

const PROBLEM_COPY: Record<NonNullable<EmailHint['problem']>, string> = {
  no_mail_server: "This domain can't receive email. Check the part after the @.",
  known_undeliverable:
    "Emails to this address haven't been reaching it. Check it's typed correctly, or use another one.",
};

/**
 * The line under an email input: "Did you mean tolu@gmail.com?" with a
 * one-tap fix, and/or a note that the address can't receive mail.
 *
 * Purely advisory. It never disables a submit button and never stops a form —
 * see useEmailHint for where the facts come from.
 */
export default function EmailSuggestion({
  suggestion,
  problem,
  onApply,
  className = '',
}: EmailSuggestionProps) {
  if (!suggestion && !problem) return null;

  return (
    <div className={`mt-1.5 space-y-1 text-sm ${className}`} aria-live="polite">
      {suggestion && (
        <p className="text-gray-700">
          Did you mean{' '}
          <button
            type="button"
            onClick={onApply}
            className="font-semibold text-[#028090] underline underline-offset-2 hover:text-[#026d7a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#028090] rounded"
          >
            {suggestion}
          </button>
          ?
        </p>
      )}
      {problem && (
        <p className={problem === 'no_mail_server' ? 'text-red-700' : 'text-amber-700'}>
          {PROBLEM_COPY[problem]}
        </p>
      )}
    </div>
  );
}
