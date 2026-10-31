'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useLazyCheckEmailQuery } from '../api/utilsApi';
import { isPlausibleEmail, normaliseEmail, suggestEmail } from '../lib/email-check';

/** What to tell the person about the address in the box, if anything. */
export type EmailProblem = 'no_mail_server' | 'known_undeliverable' | null;

export interface EmailHint {
  /** Full corrected address to offer, or null. */
  suggestion: string | null;
  problem: EmailProblem;
  /** Replace the typed address with the suggestion. */
  onApply: () => void;
}

/** Long enough that a blur → refocus → blur doesn't ask twice. */
const SERVER_CHECK_DELAY_MS = 400;

/**
 * Typo hint for an email input.
 *
 * - The provider-typo suggestion is local and instant (src/lib/email-check.ts).
 * - The server check runs only after the input loses focus, debounced, and
 *   only for something that already looks like an address. A failed or
 *   missing endpoint is ignored — the hint simply doesn't show.
 * - A server answer is only shown while the box still holds the address it
 *   was about, so editing the field clears a stale warning straight away.
 *
 * Never blocks submission: callers render the hint and carry on.
 */
export function useEmailHint(email: string, setEmail: (next: string) => void) {
  const [trigger, { data: serverResult }] = useLazyCheckEmailQuery();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const check = useCallback(
    (value: string) => {
      if (timer.current) clearTimeout(timer.current);
      const trimmed = value.trim();
      if (!isPlausibleEmail(trimmed)) return;
      timer.current = setTimeout(() => {
        // preferCacheValue: an address already checked this session is not re-sent.
        trigger(trimmed, true).unwrap().catch(() => undefined);
      }, SERVER_CHECK_DELAY_MS);
    },
    [trigger],
  );

  const onBlur = useCallback(() => check(email), [check, email]);

  const hint = useMemo(() => {
    const current = normaliseEmail(email);
    const fresh = serverResult && normaliseEmail(serverResult.email) === current ? serverResult : null;

    const local = suggestEmail(email);
    const remote =
      fresh?.suggestion && normaliseEmail(fresh.suggestion) !== current ? fresh.suggestion : null;
    const suggestion = local ?? remote;

    let problem: EmailProblem = null;
    // null means the DNS lookup didn't finish — unknown, never a problem.
    if (fresh?.domain_accepts_mail === false) problem = 'no_mail_server';
    else if (fresh?.known_undeliverable) problem = 'known_undeliverable';

    return { suggestion, problem };
  }, [email, serverResult]);

  const onApply = useCallback(() => {
    if (!hint.suggestion) return;
    setEmail(hint.suggestion);
    check(hint.suggestion);
  }, [hint.suggestion, setEmail, check]);

  return {
    onBlur,
    hint: { suggestion: hint.suggestion, problem: hint.problem, onApply } as EmailHint,
  };
}
