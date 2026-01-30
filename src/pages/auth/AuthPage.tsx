import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { OTPVerification } from './OTPVerification';
import { setToken } from '../../features/auth/authSlice';
import { useAppDispatch } from '../../hooks';
import PageLayout from '../../components/pagelayout';
import { toast, ToastContainer } from 'react-toastify';
import PhoneForm from './components/PhoneForm';
import EmailForm from './components/EmailForm';
import { profileApi } from '~/api/profileApi';

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

  const [inputMode, setInputMode] = useState<InputMode>('email');
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [userType] = useState<UserType>(pageType || 'GUEST');

  // Form states
  const [phoneNumber, setPhoneNumber] = useState('');
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
    if (mode === 'signup') {
      toast.success('Account created successfully! Welcome to Aparte.');
      // Force a refetch of the profile data
      dispatch(profileApi.util.resetApiState());
      navigate(redirect || '/');
    } else {
      toast.success('OTP verified successfully!');
      // Force a refetch of the profile data
      dispatch(profileApi.util.resetApiState());
      navigate(redirect || '/');
    }
  };


  const isBookingRedirect = searchParams.get('redirect')?.includes('booking');

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
            {/* {inputMode === 'phone' ? (
              <PhoneForm
                mode={mode}
                userType={userType}
                onSuccess={handleAuthSuccess}
                onSwitchMode={() => setInputMode('email')}
                setStep={setStep}
                onPhoneChange={setPhoneNumber}
              />
            ) : ( */}
            <EmailForm
              mode={mode}
              userType={userType}
              onSuccess={handleAuthSuccess}
              onSwitchMode={() => setInputMode('phone')}
              setStep={setStep}
              onEmailChange={setEmailAddress}
            />
            {/* )} */}
          </>
        ) : (
          <OTPVerification
            onComplete={handleOtpComplete}
            maxLength={6}
            email={emailAddress}
            phone={phoneNumber}
          />
        )}
        <ToastContainer />
      </div>
    </PageLayout>
  );
};

export default AuthPage; 