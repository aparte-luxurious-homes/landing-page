import * as React from 'react';
import { useVerifyOtpMutation, VerifyOtpResponse } from '../../api/authApi'; // Import the mutation hook
import {
  setToken,
} from '../../features/auth/authSlice';
import { useAppDispatch } from '../../hooks';
import { toast } from 'react-toastify';
import FormContainer from '../../components/forms/FormContainer';
import { Typography } from '@mui/material';
import { redirectToAdminDashboard } from '../../utils/adminRedirect';
import { useNavigate } from 'react-router-dom';
import { extractErrorMessage } from '../../utils/errorHandler';

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

  const [verifyOtp, { isLoading, isSuccess, error }] = useVerifyOtpMutation(); // Use the mutation hook

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
        const response: VerifyOtpResponse = await verifyOtp({
          otp: newOtp.join(''),
          email,
          phone,
        }).unwrap();

        onComplete(newOtp.join(''));

        if (skipAutoActions) {
          // Caller (e.g. dual-OTP signup) will handle the next step itself —
          // don't dispatch the token here because the user still needs to
          // verify a second channel (phone) before a real session is created.
        } else if (response.data?.authorization && response.data?.user) {
          const { role } = response.data.user;
          const { token } = response.data.authorization;
          dispatch(setToken({ token, role }));

          // Handle different redirections based on user role
          if (role === 'AGENT' || role === 'ADMIN') {
            toast.success('Account verified! Redirecting to admin dashboard...');
            redirectToAdminDashboard();
          } else if (role === 'OWNER') {
            toast.success('Account verified! Please list your property.');
            navigate('/list');
          } else {
            // For guests, redirect to home unless prevented
            if (!preventAutoNavigate) {
              toast.success('Account verified successfully!');
              navigate('/');
            }
          }
        }
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
        const response: VerifyOtpResponse = await verifyOtp({
          otp: newOtp.join(''),
          email,
          phone,
        }).unwrap();

        onComplete(newOtp.join(''));

        if (skipAutoActions) {
          // Caller (e.g. dual-OTP signup) will handle the next step itself —
          // don't dispatch the token here because the user still needs to
          // verify a second channel (phone) before a real session is created.
        } else if (response.data?.authorization && response.data?.user) {
          const { role } = response.data.user;
          const { token } = response.data.authorization;
          dispatch(setToken({ token, role }));

          if (role === 'AGENT' || role === 'ADMIN') {
            toast.success('Account verified! Redirecting to admin dashboard...');
            redirectToAdminDashboard();
          } else if (role === 'OWNER') {
            toast.success('Account verified! Please list your property.');
            navigate('/list');
          } else {
            if (!preventAutoNavigate) {
              toast.success('Account verified successfully!');
              navigate('/');
            }
          }
        }
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
        const response: VerifyOtpResponse = await verifyOtp({
          otp: otp.join(''),
          email,
          phone,
        }).unwrap();
 
        onComplete(otp.join(''));

        if (skipAutoActions) {
          // Caller (e.g. dual-OTP signup) will handle the next step itself —
          // don't dispatch the token here because the user still needs to
          // verify a second channel (phone) before a real session is created.
        } else if (response.data?.authorization && response.data?.user) {
          const { role } = response.data.user;
          const { token } = response.data.authorization;
          dispatch(setToken({ token, role }));

          // Handle different redirections based on user role
          if (role === 'AGENT' || role === 'ADMIN') {
            toast.success('Account verified! Redirecting to admin dashboard...');
            redirectToAdminDashboard();
          } else if (role === 'OWNER') {
            toast.success('Account verified! Please list your property.');
            navigate('/list');
          } else {
            // For guests, redirect to home unless prevented
            if (!preventAutoNavigate) {
              toast.success('Account verified successfully!');
              navigate('/');
            }
          }
        }
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
              ref={el => inputRefs.current[index] = el}
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