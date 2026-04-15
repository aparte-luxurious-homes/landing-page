import React, { useState } from 'react';
import FormContainer from '../../../components/forms/FormContainer';
import FormInput from '../../../components/inputs/FormInput';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { BaseFormProps } from './types';
import { redirectToAdminDashboard } from '../../../utils/adminRedirect';
import { toast } from 'react-toastify';
import { extractErrorMessage } from '../../../utils/errorHandler';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
import { 
  useSignupMutation, 
  useLoginMutation, 
  useGoogleAuthMutation 
} from '../../../api/authApi';

interface EmailFormProps extends BaseFormProps {
  setStep: (step: 'form' | 'otp' | 'profile') => void;
  onEmailChange: (email: string) => void;
  onSwitchMode: () => void;
}

const EmailForm: React.FC<EmailFormProps> = ({
  mode,
  userType,
  onSuccess,
  // onSwitchMode,
  setStep,
  onEmailChange
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [referralCode, setReferralCode] = useState('');

  // API hooks
  const [signup] = useSignupMutation();
  const [login] = useLoginMutation();
  const [googleAuth] = useGoogleAuthMutation();
  
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Auto-populate referral code from URL (e.g. /signup?ref=CODE)
  React.useEffect(() => {
    const refFromUrl = searchParams.get('ref');
    if (refFromUrl && !referralCode) {
      setReferralCode(refFromUrl);
    }
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

    // Full name validation for owner signup
    if (mode === 'signup' && userType === 'OWNER' && !fullName.trim()) {
      setError('Please enter your full name.');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'signup') {
        // Signup flow
        const result = await signup({
          email,
          password,
          role: userType,
          fullName: userType === 'OWNER' ? fullName : undefined,
          referral_code: referralCode || undefined,
        }).unwrap();

        setSuccess(result.message || 'Verification code sent to your email!');
        onEmailChange(email);
        setStep('otp');
        toast.success('Verification code sent to your email!');
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
    } catch (err) {
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
      {/* Full Name Field for Owner Signup */}
      {mode === 'signup' && userType === 'OWNER' && (
        <FormInput
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Full Name"
          required
        />
      )}

      {/* Email Field */}
      <FormInput
        value={email}
        onChange={handleEmailChange}
        type="email"
        placeholder="Email Address"
        required
      />

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
          onChange={(e) => setReferralCode(e.target.value)}
          placeholder="Referral Code (Optional)"
        />
      )}

      {/* OTP Info - Bold and Standalone */}
      {mode === 'signup' && (
        <div className="">
          <p className="text-[10px] font-semibold text-gray-500 mb-2 px-4 text-center">
            You'll receive an OTP to verify your email address.
          </p>
        </div>
      )}
    </FormContainer>
  );
};

export default EmailForm;
