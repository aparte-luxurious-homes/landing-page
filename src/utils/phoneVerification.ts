/**
 * Phone-verification gate: reading the API's structured auth errors.
 *
 * Once the platform switch is on, every OWNER / AGENT / GUEST must confirm
 * their phone by SMS once. The API says so in two shapes, both HTTP 401 with
 * `detail.code === "PHONE_VERIFICATION_REQUIRED"`:
 *
 *  - The CHALLENGE variant, from the sign-in endpoints (`/auth/login`,
 *    `/auth/google`, `/auth/otp/verify`). It carries a short-lived `challenge`
 *    JWT that authorises `/auth/phone/request-otp` and `/auth/phone/verify`.
 *    The UI routes the user into the phone step with it.
 *  - The REAUTH variant (`reauth: true`, no challenge), from any authenticated
 *    endpoint. The session is no longer good enough; the app signs the user
 *    out and sends them to sign in again, which then returns the challenge.
 *
 * Errors arrive in two wrappings: `unwrap()` rejects with `{status, data}`,
 * while `onQueryStarted`'s `queryFulfilled` rejects with `{error: {status,
 * data}}`. Every reader here accepts both.
 */

export const PHONE_VERIFICATION_REQUIRED = 'PHONE_VERIFICATION_REQUIRED';
export const EMAIL_VERIFICATION_REQUIRED = 'EMAIL_VERIFICATION_REQUIRED';
export const PHONE_CHALLENGE_INVALID = 'PHONE_CHALLENGE_INVALID';

/** Query value the forced sign-out puts on /login so the page can explain itself. */
export const PHONE_REAUTH_REASON = 'phone_verification';
export const PHONE_REAUTH_MESSAGE =
  'For your security, sign in again and confirm your phone number.';

/** Everything the phone step needs, taken from the challenge variant. */
export interface PhoneVerificationChallenge {
  challenge: string;
  phone: string | null;
  phoneMasked: string | null;
  phoneOnFile: boolean;
  otpSent: boolean;
  resendAfterSeconds: number;
  message?: string;
}

interface ApiErrorLike {
  status?: number | string;
  data?: { detail?: unknown };
}

/** Normalise both RTK error wrappings to `{status, data}`. */
export function unwrapApiError(err: unknown): ApiErrorLike | null {
  if (!err || typeof err !== 'object') return null;
  const e = err as ApiErrorLike & { error?: ApiErrorLike };
  if (e.data !== undefined || e.status !== undefined) return e;
  if (e.error && typeof e.error === 'object') return e.error;
  return null;
}

/** The object `detail` of an API error, or null when detail is a string/array/absent. */
export function readErrorDetail(err: unknown): Record<string, unknown> | null {
  const detail = unwrapApiError(err)?.data?.detail;
  if (detail && typeof detail === 'object' && !Array.isArray(detail)) {
    return detail as Record<string, unknown>;
  }
  return null;
}

/** `detail.code` when the API answered with a structured error. */
export function readErrorCode(err: unknown): string | undefined {
  const code = readErrorDetail(err)?.code;
  return typeof code === 'string' ? code : undefined;
}

export function readErrorStatus(err: unknown): number | undefined {
  const status = unwrapApiError(err)?.status;
  return typeof status === 'number' ? status : undefined;
}

const str = (v: unknown): string | null => (typeof v === 'string' && v ? v : null);

/**
 * The challenge variant, or null for anything else (including the reauth
 * variant, which has no challenge to continue with).
 */
export function readPhoneChallenge(err: unknown): PhoneVerificationChallenge | null {
  const detail = readErrorDetail(err);
  if (!detail || detail.code !== PHONE_VERIFICATION_REQUIRED) return null;
  const challenge = str(detail.challenge);
  if (!challenge) return null;
  const phone = str(detail.phone);
  const resend = Number(detail.resend_after_seconds);
  return {
    challenge,
    phone,
    phoneMasked: str(detail.phone_masked) ?? phone,
    // Absent flag: trust the phone itself.
    phoneOnFile:
      typeof detail.phone_on_file === 'boolean' ? detail.phone_on_file : !!phone,
    otpSent: detail.otp_sent === true,
    resendAfterSeconds: Number.isFinite(resend) && resend > 0 ? Math.ceil(resend) : 0,
    message: str(detail.message) ?? undefined,
  };
}

/** True for the "sign in again" variant any authenticated endpoint may return. */
export function isPhoneReauthError(err: unknown): boolean {
  const e = unwrapApiError(err);
  if (e?.status !== 401) return false;
  const detail = readErrorDetail(err);
  return detail?.code === PHONE_VERIFICATION_REQUIRED && detail?.reauth === true;
}

/** `/auth/login` refused an unverified email and sent a fresh code to it. */
export function readEmailVerificationRequired(
  err: unknown,
): { email: string | null; message?: string } | null {
  const detail = readErrorDetail(err);
  if (!detail || detail.code !== EMAIL_VERIFICATION_REQUIRED) return null;
  return { email: str(detail.email), message: str(detail.message) ?? undefined };
}

/**
 * Codes the auth screens handle themselves; the generic error toast in the
 * RTK `onQueryStarted` hooks must stay quiet for them.
 */
export function isHandledAuthGateError(err: unknown): boolean {
  const code = readErrorCode(err);
  return code === PHONE_VERIFICATION_REQUIRED || code === EMAIL_VERIFICATION_REQUIRED;
}
