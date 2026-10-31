/**
 * Email health of the signed-in user: whether mail we send them is arriving.
 *
 * The API marks an address BOUNCING after a soft bounce and UNDELIVERABLE
 * after a hard bounce (or repeated soft ones), on GET /profile and
 * GET /auth/me. Every field is optional here so the UI is inert until the
 * backend ships them, and both spellings are read because /profile is
 * hand-built in camelCase while the contract names them in snake_case.
 */

export type EmailStatus = 'OK' | 'BOUNCING' | 'UNDELIVERABLE';

export interface EmailHealthFields {
  email_status?: EmailStatus | null;
  email_bounced_at?: string | null;
  email_bounce_reason?: string | null;
  email_suggestion?: string | null;
  emailStatus?: EmailStatus | null;
  emailBouncedAt?: string | null;
  emailBounceReason?: string | null;
  emailSuggestion?: string | null;
  /** An address waiting for its 6-digit code (POST /profile/email/change). */
  pending_email?: string | null;
  pendingEmail?: string | null;
}

export interface EmailHealth {
  status: EmailStatus;
  bouncedAt: string | null;
  /** A human sentence, e.g. "The mailbox doesn't exist." */
  reason: string | null;
  /** Full corrected address when a typo is likely. */
  suggestion: string | null;
  /** New address the person asked to switch to and hasn't confirmed yet. */
  pendingEmail: string | null;
}

export function readEmailHealth(user: EmailHealthFields | null | undefined): EmailHealth {
  const raw = user?.email_status ?? user?.emailStatus ?? 'OK';
  const status: EmailStatus = raw === 'BOUNCING' || raw === 'UNDELIVERABLE' ? raw : 'OK';
  return {
    status,
    bouncedAt: user?.email_bounced_at ?? user?.emailBouncedAt ?? null,
    reason: user?.email_bounce_reason ?? user?.emailBounceReason ?? null,
    suggestion: user?.email_suggestion ?? user?.emailSuggestion ?? null,
    pendingEmail: (user?.pending_email ?? user?.pendingEmail ?? '').trim() || null,
  };
}

export function isEmailFailing(health: EmailHealth): boolean {
  return health.status === 'BOUNCING' || health.status === 'UNDELIVERABLE';
}

/*
 * Dismissal lasts for the browser session and is keyed on the address, so
 * fixing one problem and later hitting another (a new address that also
 * bounces) shows the notice again. Storage can throw (private mode, blocked
 * site data) — a failed read just means "not dismissed".
 */
const DISMISS_KEY = 'aparte.emailHealthDismissed';

export function isEmailHealthDismissed(email: string | null | undefined): boolean {
  if (!email) return false;
  try {
    return window.sessionStorage.getItem(DISMISS_KEY) === email.trim().toLowerCase();
  } catch {
    return false;
  }
}

export function dismissEmailHealth(email: string | null | undefined): void {
  if (!email) return;
  try {
    window.sessionStorage.setItem(DISMISS_KEY, email.trim().toLowerCase());
  } catch {
    /* storage unavailable — the notice just comes back next page */
  }
}

export type EmailChangeStep = 'request' | 'confirm' | 'cancel';

export interface EmailChangeError {
  message: string;
  /**
   * The code step can't succeed any more (expired, or out of tries — the API
   * clears the pending change then), so the way forward is a new code.
   */
  needsNewCode: boolean;
}

type ApiError = {
  status?: number | string;
  data?: { detail?: unknown; message?: unknown; [key: string]: unknown };
};

function errorText(e: ApiError): string {
  const detail = e?.data?.detail;
  if (typeof detail === 'string') return detail;
  const nested = (detail as { message?: unknown } | null)?.message;
  if (typeof nested === 'string') return nested;
  return typeof e?.data?.message === 'string' ? e.data.message : '';
}

const ATTEMPT_KEYS = ['attempts_left', 'attemptsLeft', 'attempts_remaining', 'attemptsRemaining', 'remaining_attempts'];

/** Tries left on a wrong code, from a structured field or the API's sentence. */
function attemptsLeft(e: ApiError, text: string): number | null {
  const sources = [e?.data?.detail, e?.data];
  for (const src of sources) {
    if (!src || typeof src !== 'object') continue;
    for (const key of ATTEMPT_KEYS) {
      const raw = (src as Record<string, unknown>)[key];
      if (raw != null && Number.isFinite(Number(raw))) return Math.max(0, Number(raw));
    }
  }
  const m =
    text.match(/(\d+)\s*(?:more\s+)?(?:attempts?|tries|try)\s*(?:left|remaining)/i) ??
    text.match(/(?:attempts?|tries)\s*(?:left|remaining)\s*:?\s*(\d+)/i);
  return m ? Number(m[1]) : null;
}

/**
 * The words to show for a failed step of the verified email change
 * (POST /profile/email/change, POST /profile/email/confirm,
 * DELETE /profile/email/change).
 */
export function describeEmailChangeError(err: unknown, step: EmailChangeStep): EmailChangeError {
  const e = err as ApiError;
  const text = errorText(e);
  const plain = (message: string, needsNewCode = false) => ({ message, needsNewCode });

  if (e?.status === 'FETCH_ERROR') {
    return plain("We couldn't reach Aparte. Check your connection and try again.");
  }
  if (e?.status === 429) return plain('Please wait a minute before asking for another code.');
  if (e?.status === 409) return plain('Another account already uses that email.');

  if (step === 'request') {
    if (e?.status === 422 || /valid|format/i.test(text)) {
      return plain("That doesn't look like a working email address. Check it and try again.");
    }
    if (e?.status === 400 && /same|already|current/i.test(text)) {
      return plain("That's already the email on your account.");
    }
    return plain(text || "We couldn't send a code. Please try again.");
  }

  if (step === 'confirm') {
    if (/expire|no pending|nothing pending|not pending/i.test(text)) {
      return plain('That code has expired. Send a new one.', true);
    }
    if (e?.status === 422) return plain('Enter the 6-digit code from the email.');
    if (e?.status === 400 || /code|incorrect|wrong|invalid/i.test(text)) {
      const left = attemptsLeft(e, text);
      if (left === 0 || /too many/i.test(text)) {
        return plain("That code isn't right, and there are no tries left. Send a new one.", true);
      }
      if (left == null) return plain("That code isn't right.");
      return plain(`That code isn't right. ${left} ${left === 1 ? 'try' : 'tries'} left.`);
    }
    return plain(text || "We couldn't check that code. Please try again.");
  }

  return plain(text || "We couldn't cancel the change. Please try again.");
}
