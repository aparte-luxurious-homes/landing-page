'use client';

import * as React from 'react';
import { Typography } from '@mui/material';
import { toast } from 'react-toastify';
import { useNavigate, useSearchParams } from '@/lib/router';

import FormContainer from '../../components/forms/FormContainer';
import { setToken } from '../../features/auth/authSlice';
import { useAppDispatch } from '../../hooks';
import { profileApi } from '../../api/profileApi';
import { redirectToAdminDashboard } from '../../utils/adminRedirect';
import { routeAgentAfterAuth } from '../../utils/agentAuthRedirect';
import { extractErrorMessage } from '../../utils/errorHandler';
import {
  PHONE_CHALLENGE_INVALID,
  readErrorCode,
  readErrorDetail,
  readErrorStatus,
} from '../../utils/phoneVerification';
import {
  useRequestPhoneOtpMutation,
  useVerifyPhoneOtpMutation,
  VerifyPhoneOtpResponse,
} from '../../api/authApi';

type VerifiedUser = VerifyPhoneOtpResponse['data']['user'];

export interface PhoneOTPStepProps {
  /** Short-lived token from the PHONE_VERIFICATION_REQUIRED 401. */
  challenge: string;
  phone: string | null;
  phoneMasked: string | null;
  /** False when the account has no number yet: ask for one first. */
  phoneOnFile: boolean;
  /** Whether the server already texted a code for this challenge. */
  otpSent: boolean;
  /** Server-side resend cooldown at the moment the challenge was issued. */
  resendAfterSeconds: number;
  /**
   * Called with the new session once the phone is confirmed. The token is
   * already stored when this runs. Return true to take over navigation;
   * otherwise the step routes by role.
   */
  onVerified?: (token: string, role: string, user: VerifiedUser) => boolean | void;
  /**
   * The challenge expired or was refused. The caller should send the user
   * back to the sign-in form — only a fresh sign-in issues a new challenge.
   */
  onChallengeInvalid?: () => void;
  maxLength?: number;
}

// Supported country codes — same list as the signup form (EmailForm).
const COUNTRY_CODES = [
  { code: '+234', label: 'Nigeria (+234)' },
  { code: '+254', label: 'Kenya (+254)' },
  { code: '+233', label: 'Ghana (+233)' },
];

// Used only when the server confirms a send without saying how long to wait.
const DEFAULT_RESEND_SECONDS = 60;

const CODE_EXPIRY_NOTE = 'The code expires in 30 minutes.';

/**
 * Phone confirmation step of the phone-verification gate.
 *
 * Everything is authorised by the `challenge` the sign-in endpoint returned:
 * requesting a code (optionally setting / changing the number) and verifying
 * it. A successful verify returns a full session, exactly like login.
 *
 * There is deliberately no "send the code to my email instead" option — that
 * fallback was retired (the endpoint now answers 410).
 */
export const PhoneOTPStep: React.FC<PhoneOTPStepProps> = ({
  challenge,
  phone,
  phoneMasked,
  phoneOnFile,
  otpSent,
  resendAfterSeconds,
  onVerified,
  onChallengeInvalid,
  maxLength = 6,
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [view, setView] = React.useState<'enterPhone' | 'enterCode'>(
    phoneOnFile ? 'enterCode' : 'enterPhone',
  );
  const [target, setTarget] = React.useState<string | null>(phoneMasked || phone);
  const [codeSent, setCodeSent] = React.useState(otpSent);
  const [cooldown, setCooldown] = React.useState(Math.max(0, resendAfterSeconds || 0));
  const [limitReached, setLimitReached] = React.useState(false);
  const [inlineError, setInlineError] = React.useState('');

  const [otp, setOtp] = React.useState<string[]>(Array(maxLength).fill(''));
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  const [countryCode, setCountryCode] = React.useState('+234');
  const [phoneLocal, setPhoneLocal] = React.useState('');

  const [verifyPhoneOtp, { isLoading: isVerifying, isSuccess }] = useVerifyPhoneOtpMutation();
  const [requestPhoneOtp, { isLoading: isSending }] = useRequestPhoneOtpMutation();

  // Resend countdown, driven by the server's resend_after_seconds.
  React.useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const clearDigits = () => {
    setOtp(Array(maxLength).fill(''));
    inputRefs.current[0]?.focus();
  };

  const challengeExpired = (err: unknown) => {
    toast.error(
      extractErrorMessage(err, 'Your verification session has expired. Please sign in again.'),
    );
    onChallengeInvalid?.();
  };

  /** Shared handling for request-otp errors. */
  const handleRequestError = (err: unknown) => {
    const code = readErrorCode(err);
    const status = readErrorStatus(err);

    if (code === PHONE_CHALLENGE_INVALID || status === 401) {
      challengeExpired(err);
      return;
    }

    const message = extractErrorMessage(err, "We couldn't send the code. Please try again.");
    setInlineError(message);
    toast.error(message);

    if (code === 'PHONE_OTP_COOLDOWN') {
      const wait = Number(readErrorDetail(err)?.resend_after_seconds);
      setCooldown(Number.isFinite(wait) && wait > 0 ? Math.ceil(wait) : DEFAULT_RESEND_SECONDS);
    } else if (code === 'PHONE_OTP_LIMIT') {
      setLimitReached(true);
    } else if (code === 'PHONE_REQUIRED') {
      setView('enterPhone');
    }
  };

  const sendCode = async (newPhone?: string) => {
    setInlineError('');
    try {
      const response = await requestPhoneOtp(
        newPhone ? { challenge, phone: newPhone } : { challenge },
      ).unwrap();
      const data = response?.data;
      const sentTo = data?.phoneMasked || data?.phone || newPhone || target;
      setTarget(sentTo ?? null);
      setCodeSent(true);
      setLimitReached(false);
      setCooldown(
        typeof data?.resendAfterSeconds === 'number' && data.resendAfterSeconds > 0
          ? Math.ceil(data.resendAfterSeconds)
          : DEFAULT_RESEND_SECONDS,
      );
      setView('enterCode');
      clearDigits();
      toast.success(sentTo ? `Code sent to ${sentTo}.` : 'Code sent.');
    } catch (err) {
      handleRequestError(err);
    }
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phoneLocal.replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 15) {
      setInlineError('Please enter a valid phone number.');
      return;
    }
    void sendCode(`${countryCode}${digits.replace(/^0+/, '')}`);
  };

  const routeAfterVerify = (token: string, role: string, user: VerifiedUser) => {
    if (onVerified?.(token, role, user)) return;

    if (role === 'AGENT') {
      routeAgentAfterAuth(user, navigate);
      return;
    }
    if (role !== 'GUEST') {
      // Owners (and staff, should one ever land here) work in the dashboard.
      if (!redirectToAdminDashboard()) {
        navigate('/login/agent');
      }
      return;
    }
    navigate(searchParams.get('redirect') || '/');
  };

  const attemptVerify = async (code: string) => {
    setInlineError('');
    try {
      const response = await verifyPhoneOtp({ challenge, otp: code }).unwrap();
      const user = response.data?.user;
      const token = response.data?.authorization?.token;
      if (!user || !token) {
        throw new Error('Incomplete verification response');
      }
      dispatch(setToken({ token, role: user.role }));
      dispatch(profileApi.util.resetApiState());
      toast.success('Phone number confirmed.');
      routeAfterVerify(token, user.role, user);
    } catch (err) {
      const errCode = readErrorCode(err);
      if (errCode === PHONE_CHALLENGE_INVALID || readErrorStatus(err) === 401) {
        challengeExpired(err);
        return;
      }
      const message = extractErrorMessage(err, 'That code is not correct. Please try again.');
      setInlineError(message);
      toast.error(message);
      if (errCode === 'PHONE_OTP_EXPIRED') {
        // The code is burned: the only way forward is a new one.
        setCodeSent(false);
        setCooldown(0);
      }
      clearDigits();
    }
  };

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < maxLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    if (next.every((d) => d) && next.length === maxLength) {
      void attemptVerify(next.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, maxLength);
    if (!pasted) return;
    const next = Array(maxLength).fill('');
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setOtp(next);
    inputRefs.current[Math.min(pasted.length, maxLength) - 1]?.focus();
    if (next.every((d) => d)) void attemptVerify(next.join(''));
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeSent) {
      void sendCode();
      return;
    }
    if (otp.every((d) => d)) void attemptVerify(otp.join(''));
  };

  const changeNumber = () => {
    setInlineError('');
    setPhoneLocal('');
    setView('enterPhone');
  };

  if (view === 'enterPhone') {
    return (
      <FormContainer
        title="Confirm your phone number"
        subtitle="One quick step to keep your account secure"
        onSubmit={handlePhoneSubmit}
        error={inlineError || undefined}
        loading={isSending}
        submitText={isSending ? 'Sending code…' : 'Send code'}
        footerContent={
          phoneOnFile ? (
            <p className="text-center text-sm">
              <button
                type="button"
                onClick={() => {
                  setInlineError('');
                  setView('enterCode');
                }}
                className="font-medium text-[#028090] hover:text-cyan-800"
              >
                Keep {target || 'my current number'}
              </button>
            </p>
          ) : undefined
        }
      >
        <Typography className="text-sm text-center text-gray-600 mb-4">
          {phoneOnFile
            ? "Enter the number you'd like to confirm. We'll text a 6-digit code to it."
            : "Add your mobile number. We'll text a 6-digit code to it to confirm it's yours."}
        </Typography>

        <div className="flex gap-2 mb-4">
          <select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:border-[#028090] focus:outline-none focus:ring-1 focus:ring-[#028090] bg-white text-sm"
            aria-label="Country code"
          >
            {COUNTRY_CODES.map((c) => (
              <option key={c.code} value={c.code}>{c.code}</option>
            ))}
          </select>
          <input
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            value={phoneLocal}
            onChange={(e) => setPhoneLocal(e.target.value.replace(/\D/g, '').slice(0, 15))}
            placeholder="80X XXX XXXX"
            aria-label="Phone number"
            required
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:border-[#028090] focus:outline-none focus:ring-1 focus:ring-[#028090]"
          />
        </div>
      </FormContainer>
    );
  }

  const resendDisabled = isSending || cooldown > 0 || limitReached;

  return (
    <FormContainer
      title="Confirm your phone number"
      subtitle="One quick step to keep your account secure"
      onSubmit={handleCodeSubmit}
      error={inlineError || undefined}
      success={isSuccess ? 'Phone number confirmed' : undefined}
      loading={isVerifying || (!codeSent && isSending)}
      submitText={codeSent ? 'Verify' : isSending ? 'Sending code…' : 'Send code'}
      submitButtonProps={
        !codeSent && (cooldown > 0 || limitReached) ? { disabled: true } : undefined
      }
    >
      <div className="flex flex-col items-center gap-4">
        <Typography className="text-sm text-center text-gray-600">
          {codeSent ? (
            <>
              Enter the 6-digit code we texted to{' '}
              <span className="font-semibold">{target || 'your phone'}</span>.{' '}
              {CODE_EXPIRY_NOTE}
            </>
          ) : (
            <>
              We&apos;ll text a 6-digit code to{' '}
              <span className="font-semibold">{target || 'your phone'}</span>.{' '}
              {CODE_EXPIRY_NOTE}
              {cooldown > 0 && ` You can request it in ${cooldown}s.`}
            </>
          )}
        </Typography>

        {codeSent && (
          <>
            <div
              className="flex gap-2 sm:gap-4 my-6"
              role="group"
              aria-label="Phone code input fields"
            >
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={index === 0 ? 'one-time-code' : 'off'}
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  aria-label={`Digit ${index + 1} of ${maxLength}`}
                  className="w-10 h-10 sm:w-12 sm:h-12 text-center text-lg sm:text-xl border border-gray-300 rounded-lg focus:border-[#028090] focus:outline-none focus:ring-2 focus:ring-[#028090]"
                  required
                />
              ))}
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Didn&apos;t receive the code?</span>
              <button
                type="button"
                onClick={() => void sendCode()}
                disabled={resendDisabled}
                className="font-medium text-[#028090] hover:text-cyan-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending
                  ? 'Sending…'
                  : cooldown > 0
                    ? `Resend in ${cooldown}s`
                    : 'Resend'}
              </button>
            </div>
          </>
        )}

        <button
          type="button"
          onClick={changeNumber}
          className="text-xs font-medium text-[#028090] hover:text-cyan-800 underline underline-offset-2 mb-2"
        >
          Wrong number? Change it
        </button>
      </div>
    </FormContainer>
  );
};

export default PhoneOTPStep;
