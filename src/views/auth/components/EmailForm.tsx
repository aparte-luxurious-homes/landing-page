'use client';

import React, { useState } from 'react';
import FormContainer from '../../../components/forms/FormContainer';
import FormInput from '../../../components/inputs/FormInput';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link, useLocation, useSearchParams } from '@/lib/router';
import { BaseFormProps } from './types';
import { redirectToAdminDashboard } from '../../../utils/adminRedirect';
import { toast } from 'react-toastify';
import { extractErrorMessage } from '../../../utils/errorHandler';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { getStoredReferralCode } from '../../../utils/referral';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
import { 
  useSignupMutation, 
  useLoginMutation, 
  useGoogleAuthMutation 
} from '../../../api/authApi';

interface EmailFormProps extends BaseFormProps {
  setStep: (step: 'form' | 'otp' | 'phoneOtp' | 'profile' | 'profileComplete') => void;
  onEmailChange: (email: string) => void;
  onPhoneChange?: (phone: string) => void;
  onSwitchMode: () => void;
  setFirstName: (firstName: string) => void;
  setLastName: (lastName: string) => void;
  firstName: string;
  lastName: string;
}

// Supported country codes. Kept small and explicit — intl phone libraries add
// bundle weight that's not worth it for three markets.
const COUNTRY_CODES = [
  { code: '+234', label: 'Nigeria (+234)' },
  { code: '+254', label: 'Kenya (+254)' },
  { code: '+233', label: 'Ghana (+233)' },
];

const EmailForm: React.FC<EmailFormProps> = ({
  mode,
  userType,
  onSuccess,
  // onSwitchMode,
  setStep,
  onEmailChange,
  onPhoneChange,
  setFirstName,
  setLastName ,
  firstName,
  lastName,
}) => {
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+234');
  const [phoneLocal, setPhoneLocal] = useState('');
  const [password, setPassword] = useState('');
  // const [firstName, setFirstName] = useState('');
  // const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [referralLocked, setReferralLocked] = useState(false);

  // API hooks
  const [signup] = useSignupMutation();
  const [login] = useLoginMutation();
  const [googleAuth] = useGoogleAuthMutation();
  
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Auto-populate referral code from URL (e.g. /signup?ref=CODE) and lock the input.
  // Also falls back to localStorage in case the user navigated through other pages.
  React.useEffect(() => {
    const refFromUrl = searchParams.get('ref');
    const stored = refFromUrl ? refFromUrl.trim().toUpperCase() : getStoredReferralCode();
    if (stored && !referralCode) {
      setReferralCode(stored);
      setReferralLocked(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Get user type display name
  const getUserTypeDisplay = (type: string) => {
    switch(type) {
      case 'GUEST': return 'Guest';
      case 'OWNER': return 'Home Owner';
      case 'AGENT': return 'Agent';
      default: return type;
    }
  };

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) return;

    setLoading(true);
    try {
      const result = await googleAuth({ 
        token: response.credential,
        role: mode === 'signup' ? userType : undefined
      }).unwrap();

      const { data } = result;
      const { user, authorization } = data;

      toast.success(`Welcome ${user.profile?.firstName || 'User'}!`);

      if (user.role === 'GUEST' && !user.profile?.firstName) {
        setStep('profile');
        onEmailChange(user.email || '');
      } else {
        onSuccess(authorization.token, user.role);
        
        if (user.role !== 'GUEST') {
          redirectToAdminDashboard();
        }
      }
    } catch (err) {
      const errorMessage = extractErrorMessage(err, 'Google authentication failed!');
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    // Password validation for signup
    if (mode === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    // First/last name required for all signups
    if (mode === 'signup' && (!firstName.trim() || !lastName.trim())) {
      setError('Please enter your first and last name.');
      setLoading(false);
      return;
    }

    // Phone required for signup (dual-OTP flow).
    const digits = phoneLocal.replace(/\D/g, '');
    const fullPhone = `${countryCode}${digits.replace(/^0+/, '')}`;
    if (mode === 'signup') {
      if (digits.length < 7 || digits.length > 15) {
        setError('Please enter a valid phone number.');
        setLoading(false);
        return;
      }
    }

    try {
      if (mode === 'signup') {
        // Signup flow
        const result = await signup({
          email,
          phone: fullPhone,
          password,
          role: userType,
          name: firstName.trim(),
          last_name: lastName.trim(),
          referral_code: referralCode || undefined,
        }).unwrap();

        setSuccess(result.message || 'Verification codes sent to your email and phone!');
        onEmailChange(email);
        onPhoneChange?.(fullPhone);
        setStep('otp');
        toast.success('Verification codes sent to your email and phone!');
      } else {
        // Login flow
        const result = await login({
          email,
          password,
          role: userType,
        }).unwrap();

        if (result.requiresOTP) {
          setStep('otp');
          onEmailChange(email);
          toast.info('Please verify your email with the OTP sent');
          return;
        }

        const { user, authorization } = result.data;
        setSuccess('Login successful!');
        onSuccess(authorization.token, user.role);
        
        if (user.role !== 'GUEST') {
          toast.success('Redirecting to dashboard...');
          redirectToAdminDashboard();
        }
      }
    } catch (err: any) {
      // Backend returns 401 with detail={code: "PHONE_VERIFICATION_REQUIRED", phone}
      // when the email is verified but the phone isn't. Route the user into the
      // phone-OTP step instead of showing a generic error.
      const detail = err?.data?.detail;
      const code = typeof detail === 'object' ? detail?.code : undefined;
      if (code === 'PHONE_VERIFICATION_REQUIRED') {
        const phoneFromBackend = typeof detail === 'object' ? detail?.phone : undefined;
        if (phoneFromBackend) {
          onPhoneChange?.(phoneFromBackend);
        }
        toast.info('Phone verification required — check your SMS for the code.');
        setStep('phoneOtp');
        return;
      }
      const errorMessage = extractErrorMessage(err, 'Something went wrong. Please try again.');
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    onEmailChange(value);
  };

  return (
    <FormContainer
      title={mode === 'login' ? 'Welcome Back!' : 'Create Your Account'}
      onSubmit={handleSubmit}
      error={error}
      success={success}
      loading={loading}
      submitText={mode === 'login' ? 'Login' : 'Sign Up'}
      footerContent={
        mode === 'login' ? (
          <div className="space-y-2">
            <p className="text-center text-sm">
              Not registered?{' '}
              <Link 
                className='text-[#028090] font-medium hover:underline' 
                to={`/signup?type=GUEST${location.search}`}
              >
                Sign up
              </Link>
            </p>
            <p className="text-center">
              Forgot Password? <Link className='text-[#028090]' to="/auth/request-reset">Reset Password</Link>
            </p>
          </div>
        ) : (
          <p className="text-center text-sm">
            Already have an account?{' '}
            <Link 
              className='text-[#028090] font-medium hover:underline' 
              to="/login"
            >
              Login
            </Link>
          </p>
        )
      }
    >

      {/* Google Login (only when VITE_GOOGLE_CLIENT_ID is set) */}
      {GOOGLE_CLIENT_ID ? (
        <div className="mb-6 flex flex-col items-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              setError('Google authentication failed');
              toast.error('Google authentication failed');
            }}
            useOneTap
            theme="filled_blue"
            shape="pill"
            text={mode === 'login' ? "continue_with" : "signup_with"}
          />

          <div className="relative flex py-4 items-center w-full">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
        </div>
      ) : null}

      {mode === 'signup' && (
        <div className="mb-6 text-center">
          <span className="text-gray-600">Signing up as: </span>
          <span className="font-bold text-[#028090] text-lg">
            {getUserTypeDisplay(userType)}
          </span>
        </div>
      )}
      {/* First / Last Name — required for all signups */}
      {mode === 'signup' && (
        <>
          <FormInput
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First Name"
            required
          />
          <FormInput
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last Name"
            required
          />
        </>
      )}

      {/* Email Field */}
      <FormInput
        value={email}
        onChange={handleEmailChange}
        type="email"
        placeholder="Email Address"
        required
      />

      {/* Phone Field — required for signup (dual-OTP flow) */}
      {mode === 'signup' && (
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
            value={phoneLocal}
            onChange={(e) => setPhoneLocal(e.target.value.replace(/\D/g, '').slice(0, 15))}
            placeholder="80X XXX XXXX"
            required
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:border-[#028090] focus:outline-none focus:ring-1 focus:ring-[#028090]"
          />
        </div>
      )}

      {/* Password Field */}
      <FormInput
        type={passwordVisible ? "text" : "password"}
        value={password}
        onChange={(e) => setPassword(e.target.value.replace(/\s/g, ''))}
        placeholder="Password"
        required
        icon={
          <button
            type="button"
            onClick={() => setPasswordVisible((prev) => !prev)}
            className="focus:outline-none"
          >
            {passwordVisible ? (
              <FaEyeSlash className="text-gray-500 hover:text-gray-700" />
            ) : (
              <FaEye className="text-gray-500 hover:text-gray-700" />
            )}
          </button>
        }
      />

      {/* Referral Code Field */}
      {mode === 'signup' && (
        <FormInput
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
          placeholder={referralLocked ? 'Referral code applied' : 'Referral Code (Optional)'}
          disabled={referralLocked}
          readOnly={referralLocked}
        />
      )}

      {/* OTP Info - Bold and Standalone */}
      {mode === 'signup' && (
        <div className="">
          <p className="text-[10px] font-semibold text-gray-500 mb-2 px-4 text-center">
            You'll receive two OTPs — one for your email and one for your phone.
          </p>
        </div>
      )}
    </FormContainer>
  );
};

export default EmailForm;
