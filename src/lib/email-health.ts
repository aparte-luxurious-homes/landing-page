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
}

export interface EmailHealth {
  status: EmailStatus;
  bouncedAt: string | null;
  /** A human sentence, e.g. "The mailbox doesn't exist." */
  reason: string | null;
  /** Full corrected address when a typo is likely. */
  suggestion: string | null;
}

export function readEmailHealth(user: EmailHealthFields | null | undefined): EmailHealth {
  const raw = user?.email_status ?? user?.emailStatus ?? 'OK';
  const status: EmailStatus = raw === 'BOUNCING' || raw === 'UNDELIVERABLE' ? raw : 'OK';
  return {
    status,
    bouncedAt: user?.email_bounced_at ?? user?.emailBouncedAt ?? null,
    reason: user?.email_bounce_reason ?? user?.emailBounceReason ?? null,
    suggestion: user?.email_suggestion ?? user?.emailSuggestion ?? null,
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

/**
 * Plain-language message for a failed email change, and whether it is about
 * the email at all (so a form can pin it to the email field).
 *
 * PUT /profile answers 409 (or, before the email-health release, 400 with an
 * "already in use" detail) for an address another account owns, and 400/422
 * for one that isn't a valid address.
 */
export function describeEmailChangeError(err: unknown): { message: string; aboutEmail: boolean } {
  const e = err as { status?: number | string; data?: { detail?: unknown; message?: unknown } };
  const detail = e?.data?.detail;
  const text =
    typeof detail === 'string'
      ? detail
      : typeof e?.data?.message === 'string'
        ? (e.data.message as string)
        : '';

  // The same save can carry other fields (a DOB under 18, say), so only
  // errors that are about the email are rewritten; anything else passes
  // through as the API worded it.
  const mentionsEmail = /e-?mail/i.test(text);
  const emailFieldInvalid =
    Array.isArray(detail) &&
    detail.some(
      (d) => Array.isArray((d as { loc?: unknown })?.loc) && (d as { loc: unknown[] }).loc.includes('email'),
    );

  if (e?.status === 409 || (mentionsEmail && /already|in use|taken|exists/i.test(text))) {
    return {
      message:
        'That email is already used by another Aparte account. Use a different address, or sign in to that account instead.',
      aboutEmail: true,
    };
  }
  if (emailFieldInvalid || (mentionsEmail && /valid|format/i.test(text))) {
    return {
      message: "That doesn't look like a working email address. Check it and try again.",
      aboutEmail: true,
    };
  }
  if (e?.status === 'FETCH_ERROR') {
    return { message: "We couldn't reach Aparte. Check your connection and try again.", aboutEmail: false };
  }
  return { message: text || "We couldn't save your changes. Please try again.", aboutEmail: mentionsEmail };
}

export function emailChangeErrorMessage(err: unknown): string {
  return describeEmailChangeError(err).message;
}
