'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from '@/lib/router';
import { OTPVerification } from './OTPVerification';
import PhoneOTPStep from './PhoneOTPStep';
import { setToken } from '../../features/auth/authSlice';
import { useAppDispatch } from '../../hooks';
import { redirectToAdminDashboard } from '../../utils/adminRedirect';
import { routeAgentAfterAuth } from '../../utils/agentAuthRedirect';
import type { AgentApprovalUserLike } from '../../utils/agentApproval';
import PageLayout from '../../components/pagelayout';
import { toast, ToastContainer } from 'react-toastify';
import EmailForm from './components/EmailForm';
import GuestProfileForm from './components/GuestProfileForm';
import { profileApi } from '~/api/profileApi';
import { useResendSignupOtpMutation } from '../../api/authApi';
import { extractErrorMessage } from '../../utils/errorHandler';
import {
  PHONE_REAUTH_MESSAGE,
  PHONE_REAUTH_REASON,
  PhoneVerificationChallenge,
} from '../../utils/phoneVerification';

type UserType = 'GUEST' | 'OWNER' | 'AGENT';
type AuthMode = 'login' | 'signup';
type InputMode = 'phone' | 'email';

interface AuthPageProps {
  mode: AuthMode;
}

const AuthPage: React.FC<AuthPageProps> = ({ mode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Get user type from URL for signup
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  let pageType = searchParams.get('type') as UserType;

  // Extract only the actual type, removing redirect params if they're embedded
  if (pageType && pageType.includes('?')) {
    pageType = pageType.split('?')[0] as UserType;
  }

  const urlMode = searchParams.get('mode') as AuthMode;

  // Use URL mode if provided, otherwise use prop
  const effectiveMode = urlMode || mode;

  const [_inputMode, setInputMode] = useState<InputMode>('email');
  const [step, setStep] = useState<
    'form' | 'otp' | 'profile' | 'phoneOtp' | 'profileComplete'
  >('form');
  const [userType] = useState<UserType>(pageType || 'GUEST');

  // Form states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  // Set when sign-in answers PHONE_VERIFICATION_REQUIRED; drives the phone step.
  const [phoneChallenge, setPhoneChallenge] = useState<PhoneVerificationChallenge | null>(null);

  // Arrived here because a session was ended to confirm the phone (the
  // forced sign-out in app/authGateListener.ts). Shown as a banner above the
  // form rather than a toast, so it is still there after a slow page load.
  const isPhoneReauth = searchParams.get('reason') === PHONE_REAUTH_REASON;

  // Validate that we have required params for signup
  useEffect(() => {
    if (effectiveMode === 'signup' && !pageType) {
      // If we're in signup mode but no user type, redirect to user type selection
      const redirect = searchParams.get('redirect');
      navigate(redirect ? `/auth/user-type?redirect=${encodeURIComponent(redirect)}` : '/auth/user-type');
    }
  }, [effectiveMode, pageType, navigate, searchParams]);

  const handleAuthSuccess = (
    token: string,
    userRole: string,
    user?: AgentApprovalUserLike,
  ) => {
    dispatch(setToken({ token, role: userRole }));
    // Force a refetch of the profile data
    dispatch(profileApi.util.resetApiState());

    const redirect = searchParams.get('redirect');

    if (userRole === 'AGENT') {
      routeAgentAfterAuth(user || { role: 'AGENT' }, navigate);
      return;
    }

    // Owners / staff → admin dashboard; guests stay on the consumer site.
    if (userRole !== 'GUEST') {
      redirectToAdminDashboard();
    } else {
      navigate(redirect || '/');
    }
  };

  const handleOtpComplete = async () => {
    const redirect = searchParams.get('redirect');
    if (effectiveMode === 'signup' && userType === 'GUEST') {
      // For guests signing up, proceed to profile completion
      setStep('profile');
      toast.success('Email verified! Please complete your profile.');
      return;
    }

    // Force a refetch of the profile data
    dispatch(profileApi.util.resetApiState());

    // OTPVerification owns the destination for OWNER and AGENT: it knows the
    // role from the verify response and routes to /list or to the admin
    // dashboard. This handler runs FIRST, so navigating here as well meant two
    // authorities racing for the same decision — the agent's dashboard hop
    // only won because a full page load beats an SPA route change, and an
    // owner's `/list` only won because it happened to be called second.
    //
    // Same rule as the account tabs: one owner per destination. A guest still
    // navigates here, because the role branch deliberately defers to
    // `preventAutoNavigate` for them.
    if (userType === 'GUEST') {
      toast.success(
        effectiveMode === 'signup'
          ? 'Account created successfully! Welcome to Aparte.'
          : 'OTP verified successfully!'
      );
      navigate(redirect || '/');
    }
  };

  const handlePhoneVerificationRequired = (challenge: PhoneVerificationChallenge) => {
    setPhoneChallenge(challenge);
    if (challenge.phone) setPhoneNumber(challenge.phone);
    setStep('phoneOtp');
  };

  // The phone step has stored the session already. Mirror where the email
  // OTP step used to send a brand-new account; everyone else goes where a
  // normal sign-in would.
  const handlePhoneVerified = (
    token: string,
    role: string,
    user: AgentApprovalUserLike,
  ): boolean => {
    if (effectiveMode === 'signup' && role === 'GUEST') {
      setStep('profile');
      toast.success('Phone confirmed! Please complete your profile.');
      return true;
    }
    if (effectiveMode === 'signup' && role === 'OWNER') {
      dispatch(profileApi.util.resetApiState());
      navigate('/list');
      return true;
    }
    handleAuthSuccess(token, role, user);
    return true;
  };

  // Only a fresh sign-in issues a new challenge.
  const handlePhoneChallengeInvalid = () => {
    setPhoneChallenge(null);
    setStep('form');
  };

  const handleProfileSuccess = () => {
    const redirect = searchParams.get('redirect');
    dispatch(profileApi.util.resetApiState());
    navigate(redirect || '/');
  };

  const isBookingRedirect = searchParams.get('redirect')?.includes('booking');

  // Resend OTP handler
  const [resendOtp] = useResendSignupOtpMutation();

  const handleResendOtp = async () => {
    try {
      await resendOtp({
        email: emailAddress,
        phone: phoneNumber
      }).unwrap();
      toast.success('OTP resent successfully!');
    } catch (err) {
      const errorMessage = extractErrorMessage(err, 'Failed to resend OTP');
      toast.error(errorMessage);
    }
  };

  // Handle phone mode switch
  const handleSwitchToPhone = () => {
    setInputMode('phone');
    // Navigate to phone login/signup page
    navigate(`/phone-auth?mode=${effectiveMode}&type=${userType}${searchParams.get('redirect') ? `&redirect=${searchParams.get('redirect')}` : ''}`);
  };

  // Handle back to user type selection
  const handleBackToUserType = () => {
    const redirect = searchParams.get('redirect');
    navigate(redirect ? `/auth/user-type?redirect=${encodeURIComponent(redirect)}` : '/auth/user-type');
  };

  // Handle back navigation
  const handleBack = () => {
    if (step === 'otp') {
      setStep('form');
    } else if (step === 'phoneOtp') {
      setPhoneChallenge(null);
      setStep('form');
    } else if (step === 'profile') {
      setStep('otp');
    }
  };

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  return (
    <PageLayout>
      <div className="flex flex-col justify-center items-center min-h-screen pt-12 md:pt-40 px-4">
        {/* Back button for user type selection (only on signup form) */}
        {effectiveMode === 'signup' && step === 'form' && (
          <button
            onClick={handleBackToUserType}
            className="mb-4 mt-8 md:mt-0 text-gray-600 hover:text-[#028090] transition-colors flex items-center group w-full md:ml-[20%]"
          >
            <svg className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="hidden md:inline">Back to account type</span>
          </button>
        )}

        {/* Back button for nested steps */}
        {step !== 'form' && (
          <button
            onClick={handleBack}
            className="self-start mb-4 ml-4 md:ml-0 text-gray-600 hover:text-[#028090] transition-colors flex items-center"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        )}

        {isPhoneReauth && step === 'form' && (
          <div
            role="status"
            className="mb-6 p-4 bg-[#e6f4f5] border border-[#028090]/30 rounded-lg text-[#025e6b] max-w-md text-center text-sm"
          >
            {PHONE_REAUTH_MESSAGE}
          </div>
        )}

        {isBookingRedirect && (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-lg text-blue-700 max-w-md text-center">
            <p className="font-medium">Almost there! 🏨</p>
            <p className="text-sm">Please {effectiveMode} to complete your booking.</p>
          </div>
        )}

        {step === 'form' ? (
          <EmailForm
            mode={effectiveMode}
            userType={pageType}
            onSuccess={handleAuthSuccess}
            onSwitchMode={handleSwitchToPhone}
            setStep={setStep}
            onEmailChange={setEmailAddress}
            onPhoneChange={setPhoneNumber}
            setFirstName={setFirstName}
            setLastName={setLastName}
            firstName={firstName}
            lastName={lastName}
            onPhoneVerificationRequired={handlePhoneVerificationRequired}
          />
        ) : step === 'phoneOtp' && phoneChallenge ? (
          <PhoneOTPStep
            key={phoneChallenge.challenge}
            challenge={phoneChallenge.challenge}
            phone={phoneChallenge.phone}
            phoneMasked={phoneChallenge.phoneMasked}
            phoneOnFile={phoneChallenge.phoneOnFile}
            otpSent={phoneChallenge.otpSent}
            resendAfterSeconds={phoneChallenge.resendAfterSeconds}
            onVerified={handlePhoneVerified}
            onChallengeInvalid={handlePhoneChallengeInvalid}
          />
        ) : step === 'otp' ? (
          <OTPVerification
            onComplete={handleOtpComplete}
            onResend={handleResendOtp}
            maxLength={6}
            email={emailAddress}
            phone={phoneNumber}
            preventAutoNavigate={effectiveMode === 'signup' && userType === 'GUEST'}
            onPhoneVerificationRequired={handlePhoneVerificationRequired}
          />
        ) : (
          <GuestProfileForm onSuccess={handleProfileSuccess} firstName={firstName} lastName={lastName} />
        )}

        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </PageLayout>
  );
};

export default AuthPage;