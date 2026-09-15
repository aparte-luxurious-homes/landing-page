'use client';

import * as React from 'react';
import { useVerifyOtpMutation, VerifyOtpResponse } from '../../api/authApi';
import {
  setToken,
} from '../../features/auth/authSlice';
import { useAppDispatch } from '../../hooks';
import { toast } from 'react-toastify';
import FormContainer from '../../components/forms/FormContainer';
import { Typography } from '@mui/material';
import { redirectToAdminDashboard } from '../../utils/adminRedirect';
import { routeAgentAfterAuth } from '../../utils/agentAuthRedirect';
import { extractErrorMessage } from '../../utils/errorHandler';
import { useLocation, useNavigate } from '@/lib/router';
import { useAppSelector } from '../../hooks';
import { useGetProfileQuery } from '../../api/profileApi';
import { SKIP_PATHS } from '../../components/RequireCompleteProfile';

interface OTPVerificationProps {
  onComplete?: (otp: string) => void;
  onResend?: () => void;
  maxLength?: number;
  email?: string;
  phone?: string;
  preventAutoNavigate?: boolean;
  /**
   * When true, suppresses both token dispatch AND navigation after verify.
   * Used by the dual-OTP signup flow where email OTP is only the first step —
   * the session token must not be issued until the phone OTP is also verified.
   */
  skipAutoActions?: boolean;
}

function navigateAfterVerify(
  role: string,
  user: Parameters<typeof routeAgentAfterAuth>[0],
  navigate: (path: string) => void,
  preventAutoNavigate: boolean,
  needsCompletion: boolean,
  onSkippedPath: boolean,
) {
  if (role === 'AGENT') {  
    // redirect to complete-profile if needsCompletion and not onSkippedPath
    if (needsCompletion && !onSkippedPath) {
      const next = encodeURIComponent(location.pathname + location.search);
      navigate(`/complete-profile?next=${next}`);
      return;
    } 
    else {
      // redirect to agent dashboard if not needsCompletion or onSkippedPath
      routeAgentAfterAuth(user, navigate);
      return;
    }
  }
  if (role === 'ADMIN') {
    if (redirectToAdminDashboard()) {
      toast.success('Account verified! Redirecting to admin dashboard...');
    } else {
      toast.success('Account verified! Sign in to reach your dashboard.');
      navigate('/login/agent');
    }
    return;
  }
  if (role === 'OWNER') {
    toast.success('Account verified! Please list your property.');
    navigate('/list');
    return;
  }
  if (!preventAutoNavigate) {
    toast.success('Account verified successfully!');
    navigate('/');
  }
}

export const OTPVerification: React.FC<OTPVerificationProps> = ({
  onComplete = () => { },
  onResend = () => { },
  maxLength = 6,
  email = '',
  phone = '',
  preventAutoNavigate = false,
  skipAutoActions = false,
}) => {
  const dispatch = useAppDispatch();
  const [otp, setOtp] = React.useState<string[]>(Array(maxLength).fill(''));
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  const [verifyOtp, { isLoading, isSuccess, error }] = useVerifyOtpMutation();

  const auth = useAppSelector((state) => state.root.auth);
  const isAuthenticated = !!(auth?.isAuthenticated && auth?.token);
  const location = useLocation();

  const { data: profileResp } = useGetProfileQuery(undefined, {
    skip: !isAuthenticated,
  });

  const profile = profileResp?.data;
  const isComplete = profile?.isProfileComplete ?? profile?.is_profile_complete;
  const needsCompletion =
    isAuthenticated && profile != null && isComplete === false;
  const onSkippedPath = SKIP_PATHS.some((p) => location.pathname.startsWith(p));


  const completeVerify = async (code: string) => {
    const response: VerifyOtpResponse = await verifyOtp({
      otp: code,
      email,
      phone,
    }).unwrap();

    onComplete(code);

    if (skipAutoActions) {
      return;
    }

    if (response.data?.authorization && response.data?.user) {
      const { role, ...rest } = response.data.user;
      const { token } = response.data.authorization;
      dispatch(setToken({ token, role }));
      navigateAfterVerify(role, { role, ...rest }, navigate, preventAutoNavigate, needsCompletion, onSkippedPath);
    }
  };

  const handleInputChange = async (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < maxLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every(digit => digit) && newOtp.length === maxLength) {
      try {
        await completeVerify(newOtp.join(''));
      } catch (err) {
        const errorMessage = extractErrorMessage(err, 'Invalid OTP. Please try again.');
        toast.error(errorMessage);
        setOtp(Array(maxLength).fill(''));
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, maxLength);
    if (!pastedData) return;

    const newOtp = Array(maxLength).fill('');
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    const focusIndex = Math.min(pastedData.length, maxLength) - 1;
    inputRefs.current[focusIndex]?.focus();

    if (newOtp.every(digit => digit) && newOtp.length === maxLength) {
      try {
        await completeVerify(newOtp.join(''));
      } catch (err) {
        const errorMessage = extractErrorMessage(err, 'Invalid OTP. Please try again.');
        toast.error(errorMessage);
        setOtp(Array(maxLength).fill(''));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.every(digit => digit)) {
      try {
        await completeVerify(otp.join(''));
      } catch (err) {
        const errorMessage = extractErrorMessage(err, 'Invalid OTP. Please try again.');
        toast.error(errorMessage);
        setOtp(Array(maxLength).fill(''));
      }
    }
  };

  return (
    <FormContainer
      title="OTP Verification"
      onSubmit={handleSubmit}
      error={error ? extractErrorMessage(error, '') : undefined}
      success={isSuccess ? 'OTP verified successfully' : undefined}
      loading={isLoading}
    >
      <div className="flex flex-col items-center gap-4">
        <Typography className="text-sm text-center text-gray-600">
          Enter the 'One Time Password' sent to your {email ? 'email' : 'phone number'}
        </Typography>

        <div
          className="flex gap-2 sm:gap-4 my-6"
          role="group"
          aria-label="OTP input fields"
        >
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={el => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleInputChange(index, e.target.value)}
              onKeyDown={e => handleKeyDown(index, e)}
              onPaste={handlePaste}
              aria-label={`Digit ${index + 1} of ${maxLength}`}
              className="w-10 h-10 sm:w-12 sm:h-12 text-center text-lg sm:text-xl border border-gray-300 rounded-lg focus:border-[#028090] focus:outline-none focus:ring-2 focus:ring-[#028090]"
              required
            />
          ))}
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Didn't receive OTP?</span>
          <button
            type="button"
            onClick={onResend}
            className="font-medium text-[#028090] hover:text-cyan-800"
          >
            Resend
          </button>
        </div>
      </div>
    </FormContainer>
  );
}

export default OTPVerification;
