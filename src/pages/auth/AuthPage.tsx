import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { OTPVerification } from './OTPVerification';
import { setToken } from '../../features/auth/authSlice';
import { useAppDispatch } from '../../hooks';
// import { redirectToAdminDashboard } from '~/utils/adminRedirect';
import PageLayout from '../../components/pagelayout';
import { toast, ToastContainer } from 'react-toastify';
import EmailForm from './components/EmailForm';
import GuestProfileForm from './components/GuestProfileForm';
import { profileApi } from '~/api/profileApi';
import { useResendSignupOtpMutation } from '../../api/authApi';
import { extractErrorMessage } from '../../utils/errorHandler';

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

  // Validate that we have required params for signup
  useEffect(() => {
    if (effectiveMode === 'signup' && !pageType) {
      // If we're in signup mode but no user type, redirect to user type selection
      const redirect = searchParams.get('redirect');
      navigate(redirect ? `/auth/user-type?redirect=${encodeURIComponent(redirect)}` : '/auth/user-type');
    }
  }, [effectiveMode, pageType, navigate, searchParams]);

  const handleAuthSuccess = (token: string, userRole: string) => {
    dispatch(setToken({ token, role: userRole }));
    // Force a refetch of the profile data
    dispatch(profileApi.util.resetApiState());

    const redirect = searchParams.get('redirect');

    // Redirect based on user role
    if (userRole !== 'GUEST') {
      navigate('/admin/dashboard');
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

    if (effectiveMode === 'signup') {
      toast.success('Account created successfully! Welcome to Aparte.');
    } else {
      toast.success('OTP verified successfully!');
    }

    // Force a refetch of the profile data
    dispatch(profileApi.util.resetApiState());
    navigate(redirect || '/');
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
          />
        ) : step === 'otp' ? (
          <OTPVerification
            onComplete={handleOtpComplete}
            onResend={handleResendOtp}
            maxLength={6}
            email={emailAddress}
            phone={phoneNumber}
            preventAutoNavigate={effectiveMode === 'signup' && userType === 'GUEST'}
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