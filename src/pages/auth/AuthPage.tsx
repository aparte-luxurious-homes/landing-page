import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { OTPVerification } from './OTPVerification';
import { setToken } from '../../features/auth/authSlice';
import { useAppDispatch } from '../../hooks';
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
  const searchParams = new URLSearchParams(location.search);
  const pageType = searchParams.get('type') as UserType;

  const [_inputMode, setInputMode] = useState<InputMode>('email');
  const [step, setStep] = useState<'form' | 'otp' | 'profile'>('form');
  const [userType] = useState<UserType>(pageType || 'GUEST');

  // Form states
  const [phoneNumber, _setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');


  const handleAuthSuccess = (token: string, userRole: string) => {
    dispatch(setToken({ token, role: userRole }));
    // Force a refetch of the profile data
    dispatch(profileApi.util.resetApiState());

    const redirect = searchParams.get('redirect');
    navigate(redirect || '/');
  };

  const handleOtpComplete = async () => {
    const redirect = searchParams.get('redirect');
    if (mode === 'signup' && userType === 'GUEST') {
      // For guests signing up, proceed to profile completion
      setStep('profile');
      return;
    }

    if (mode === 'signup') {
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

  return (
    <PageLayout>
      <div className="flex flex-col justify-center items-center min-h-screen pt-12 md:pt-40">
        {isBookingRedirect && (
          <div className="mb-8 p-4 bg-primary-50 border border-primary-100 rounded-lg text-primary-700 max-w-md text-center">
            <p className="font-medium">Almost there! 🏨</p>
            <p className="text-sm">Please login or sign up to complete your booking.</p>
          </div>
        )}
        {step === 'form' ? (
          <>
            <EmailForm
              mode={mode}
              userType={userType}
              onSuccess={handleAuthSuccess}
              onSwitchMode={() => setInputMode('phone')}
              setStep={setStep}
              onEmailChange={setEmailAddress}
            />
          </>
        ) : step === 'otp' ? (
          <OTPVerification
            onComplete={handleOtpComplete}
            onResend={handleResendOtp}
            maxLength={6}
            email={emailAddress}
            phone={phoneNumber}
            preventAutoNavigate={mode === 'signup' && userType === 'GUEST'}
          />
        ) : (
          <GuestProfileForm onSuccess={handleProfileSuccess} />
        )}
        <ToastContainer />
      </div>
    </PageLayout>
  );
};

export default AuthPage; 