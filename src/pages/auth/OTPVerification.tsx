import * as React from 'react';
import { useVerifyOtpMutation } from '../../api/authApi'; // Import the mutation hook
import {
  setRole
} from '../../features/auth/authSlice';
import { useAppDispatch } from '../../hooks';
import { toast } from 'react-toastify';
import FormContainer from '../../components/forms/FormContainer';
import { Typography } from '@mui/material';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';
import { redirectToAdminDashboard } from '../../utils/adminRedirect';
import { useNavigate } from 'react-router-dom';

interface OTPVerificationProps {
  onComplete?: (otp: string) => void;
  onResend?: () => void;
  maxLength?: number;
  email?: string;
  phone?: string;
}

interface VerifyOtpResponse {
  message: string;
  data: {
    user: {
      id: number;
      email: string | null;
      phone: string;
      role: string;
      isVerified: boolean;
      createdAt: string;
      updatedAt: string;
      profile: {
        firstName: string;
      }
    };
    authorization: {
      type: string;
      name: string | null;
      token: string;
      abilities: string[];
      lastUsedAt: string | null;
      expiresAt: string | null;
    };
  };
}

interface ApiError {
  data: {
    message: string;
    errors?: Array<{ message: string }>;
  };
}

const getErrorMessage = (error: FetchBaseQueryError | SerializedError | undefined) => {
  if (!error) return '';
  if ('status' in error) {
    return 'data' in error ? String(error.data) : 'Error occurred';
  }
  return error.message || 'Error occurred';
};

export const OTPVerification: React.FC<OTPVerificationProps> = ({
  onComplete = () => {},
  onResend = () => {},
  maxLength = 6,
  email = '',
  phone = '',
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
        
        if (response.data?.authorization && response.data?.user) {
          const { role } = response.data.user;
          dispatch(setRole(role));

          // Handle different redirections based on user role
          if (role === 'AGENT') {
            toast.success('Account verified! Redirecting to admin dashboard...');
            redirectToAdminDashboard();
          } else if (role === 'OWNER') {
            toast.success('Account verified! Please list your property.');
            navigate('/list');
          } else {
            // For guests, redirect to home
            navigate('/');
          }
        }
      } catch (err) {
        const apiError = err as ApiError;
        toast.error(apiError.data.message || 'Invalid OTP. Please try again.');
        setOtp(Array(maxLength).fill(''));
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
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
        
        if (response.data?.authorization && response.data?.user) {
          const { role } = response.data.user;
          dispatch(setRole(role));
          // Handle different redirections based on user role
          if (role === 'AGENT') {
            toast.success('Account verified! Redirecting to admin dashboard...');
            redirectToAdminDashboard();
          } else if (role === 'OWNER') {
            toast.success('Account verified! Please list your property.');
            navigate('/list');
          } else {
            // For guests, redirect to home
            navigate('/');
          }
        }
      } catch (err) {
        const apiError = err as ApiError;
        toast.error(apiError.data.message || 'Invalid OTP. Please try again.');
        setOtp(Array(maxLength).fill(''));
      }
    }
  };

  return (
    <FormContainer
      title="OTP Verification"
      onSubmit={handleSubmit}
      error={getErrorMessage(error)}
      success={isSuccess ? 'OTP verified successfully' : undefined}
      loading={isLoading}
    >
      <div className="flex flex-col items-center gap-4">
        <Typography className="text-sm text-center text-gray-600">
          Enter the 'One Time Password' sent to your {email ? 'email' : 'phone number'}
        </Typography>

        <div 
          className="flex gap-4 my-6"
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
              aria-label={`Digit ${index + 1} of ${maxLength}`}
              className="w-12 h-12 text-center text-xl border border-gray-300 rounded-lg focus:border-[#028090] focus:outline-none focus:ring-2 focus:ring-[#028090]"
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