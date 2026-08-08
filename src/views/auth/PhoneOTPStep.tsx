'use client';

import * as React from 'react';
import { Typography } from '@mui/material';
import { toast } from 'react-toastify';
import { useNavigate } from '@/lib/router';

import FormContainer from '../../components/forms/FormContainer';
import { setToken } from '../../features/auth/authSlice';
import { useAppDispatch } from '../../hooks';
import { redirectToAdminDashboard } from '../../utils/adminRedirect';
import { extractErrorMessage } from '../../utils/errorHandler';
import {
  useRequestPhoneOtpMutation,
  useRequestPhoneOtpViaEmailMutation,
  useVerifyPhoneOtpMutation,
  VerifyPhoneOtpResponse,
} from '../../api/authApi';

interface PhoneOTPStepProps {
  phone: string;
  /**
   * Called after a successful phone verification. If the caller returns a value,
   * auto-navigation is skipped and the caller takes over (e.g. guest profile step).
   */
  onComplete?: (response: VerifyPhoneOtpResponse) => boolean | void;
  preventAutoNavigate?: boolean;
  maxLength?: number;
}

// Matches backend rate limit at services/auth/services.py:866 — the API
// rejects a fresh OTP request within 60s with HTTP 429.
const RESEND_COOLDOWN_SECONDS = 60;

/** Phone-OTP verification screen (dual-OTP signup flow + login phone gate). */
export const PhoneOTPStep: React.FC<PhoneOTPStepProps> = ({
  phone,
  onComplete,
  preventAutoNavigate = false,
  maxLength = 6,
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [otp, setOtp] = React.useState<string[]>(Array(maxLength).fill(''));
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  const [resendCooldown, setResendCooldown] = React.useState(RESEND_COOLDOWN_SECONDS);

  const [verifyPhoneOtp, { isLoading, isSuccess, error }] = useVerifyPhoneOtpMutation();
  const [requestPhoneOtp, { isLoading: isResending }] = useRequestPhoneOtpMutation();
  const [requestPhoneOtpViaEmail, { isLoading: isSendingViaEmail }] = useRequestPhoneOtpViaEmailMutation();
  const [emailFallbackSent, setEmailFallbackSent] = React.useState(false);

  // Cooldown countdown — re-arms whenever a resend (or email-fallback) fires
  // or the backend rejects with 429.
  React.useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const attemptVerify = async (code: string) => {
    try {
      const response = await verifyPhoneOtp({ phone, otp: code }).unwrap();

      const handled = onComplete?.(response);
      if (handled) return;

      if (response.data?.authorization && response.data?.user) {
        const { role } = response.data.user;
        const { token } = response.data.authorization;
        dispatch(setToken({ token, role }));

        if (preventAutoNavigate) return;

        if (role === 'AGENT' || role === 'ADMIN') {
          toast.success('Phone verified! Redirecting to admin dashboard...');
          redirectToAdminDashboard();
        } else if (role === 'OWNER') {
          toast.success('Phone verified! Please list your property.');
          navigate('/list');
        } else {
          toast.success('Phone verified successfully!');
          navigate('/');
        }
      }
    } catch (err) {
      const errorMessage = extractErrorMessage(err, 'Invalid OTP. Please try again.');
      toast.error(errorMessage);
      setOtp(Array(maxLength).fill(''));
      inputRefs.current[0]?.focus();
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.every((d) => d)) void attemptVerify(otp.join(''));
  };

  const handleResend = async () => {
    try {
      await requestPhoneOtp({ phone }).unwrap();
      toast.success('New OTP sent to your phone.');
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      const msg = extractErrorMessage(err, 'Failed to resend phone OTP');
      toast.error(msg);
      // Server rate-limits at 60s — lock the button so the user sees a
      // visible countdown instead of being able to spam-retry.
      if ((err as { status?: number })?.status === 429) {
        setResendCooldown(RESEND_COOLDOWN_SECONDS);
      }
    }
  };

  const handleSendViaEmail = async () => {
    try {
      await requestPhoneOtpViaEmail({ phone }).unwrap();
      setEmailFallbackSent(true);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      const msg = extractErrorMessage(err, "Couldn't send the code via email.");
      toast.error(msg);
      if ((err as { status?: number })?.status === 429) {
        setResendCooldown(RESEND_COOLDOWN_SECONDS);
      }
    }
  };

  return (
    <FormContainer
      title="Verify your phone number"
      onSubmit={handleSubmit}
      error={error ? extractErrorMessage(error, '') : undefined}
      success={isSuccess ? 'Phone verified successfully' : undefined}
      loading={isLoading}
    >
      <div className="flex flex-col items-center gap-4">
        <Typography className="text-sm text-center text-gray-600">
          {emailFallbackSent ? (
            <>
              Code sent to your email — check your inbox. Enter it below; it&apos;s
              the same code, not a new one.
            </>
          ) : (
            <>
              Enter the 6-digit code sent to{' '}
              <span className="font-semibold">{phone}</span>
            </>
          )}
        </Typography>

        <div
          className="flex gap-2 sm:gap-4 my-6"
          role="group"
          aria-label="Phone OTP input fields"
        >
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
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
          <span className="text-gray-600">Didn't receive the code?</span>
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending || resendCooldown > 0}
            className="font-medium text-[#028090] hover:text-cyan-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResending
              ? 'Sending…'
              : resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : 'Resend'}
          </button>
        </div>

        <button
          type="button"
          onClick={handleSendViaEmail}
          disabled={isSendingViaEmail || (resendCooldown > 0 && emailFallbackSent)}
          className="text-xs font-medium text-[#028090] hover:text-cyan-800 underline underline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSendingViaEmail
            ? 'Sending to email…'
            : emailFallbackSent
              ? resendCooldown > 0
                ? `Send to email again in ${resendCooldown}s`
                : 'Send to email again'
              : 'No SMS? Send the code to my email instead'}
        </button>
      </div>
    </FormContainer>
  );
};

export default PhoneOTPStep;
