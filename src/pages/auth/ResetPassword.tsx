import React, { useState } from 'react';
import { useResetPasswordMutation } from '../../api/authApi';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import FormContainer from '../../components/forms/FormContainer';
import FormInput from '../../components/inputs/FormInput';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import PageLayout from '../../components/pagelayout';

interface ApiError {
  status?: number;
  data?: {
    message?: string;
    errors?: Array<{ message: string }>;
  };
  message?: string;
  stack?: string;
}

const ResetPassword = () => {
  console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);
  
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const inputMode = queryParams.get('email') ? 'email' : 'phone';
  const email = queryParams.get('email');
  const phone = queryParams.get('phone');
  const country = "Nigeria (+234)"; // Default country code
  
  const [resetPassword, { isLoading: mutationLoading, error: mutationError }] = useResetPasswordMutation();
  console.log('Reset password mutation:', { resetPassword, mutationLoading, mutationError });

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Form submission started');
    console.log('Current form state:', {
      otp,
      newPassword: newPassword ? '[PRESENT]' : '[EMPTY]',
      confirmPassword: confirmPassword ? '[PRESENT]' : '[EMPTY]',
      inputMode,
      email,
      phone
    });
    
    // Validate inputs
    if (!otp.trim()) {
      console.log('Validation failed: OTP empty');
      toast.error('Please enter the OTP');
      return;
    }
    console.log('OTP validation passed');

    if (otp.length !== 6) {
      console.log('Validation failed: OTP length invalid');
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    console.log('OTP length validation passed');
    
    if (!newPassword.trim()) {
      console.log('Validation failed: Password empty');
      toast.error('Please enter a new password');
      return;
    }
    console.log('Password presence validation passed');

    if (newPassword.length < 8) {
      console.log('Validation failed: Password too short');
      toast.error('Password must be at least 8 characters long');
      return;
    }
    console.log('Password length validation passed');

    if (!confirmPassword.trim()) {
      console.log('Validation failed: Confirm password empty');
      toast.error('Please confirm your password');
      return;
    }
    console.log('Confirm password presence validation passed');

    if (newPassword !== confirmPassword) {
      console.log('Validation failed: Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }
    console.log('Password match validation passed');

    // Validate that we have either email or phone
    if (inputMode === 'email' && !email) {
      console.log('Validation failed: Email required but missing');
      toast.error('Email is required');
      return;
    }
    if (inputMode === 'phone' && !phone) {
      console.log('Validation failed: Phone required but missing');
      toast.error('Phone number is required');
      return;
    }
    console.log('Contact method validation passed');
    
    try {
      setLoading(true);
      console.log('All validations passed, preparing request data...');
      const countryCode = country.match(/\(([^)]+)\)/)?.[1] || '';
      // Format phone number: remove any non-digit characters and ensure it starts with the country code
      const formattedPhone = phone ? phone.replace(/\D/g, '') : '';
      const phoneWithCode = inputMode === 'phone' 
        ? (countryCode + formattedPhone).replace(/^\+/, '') // Remove leading + if present
        : undefined;

      const requestData = {
        email: inputMode === 'email' ? email?.trim() : undefined,
        phone: phoneWithCode,
        otp: otp.trim(),
        password: newPassword,
        password_confirmation: confirmPassword,
      };
      console.log('Sending request with data:', { 
        ...requestData, 
        password: '[REDACTED]',
        inputMode,
        email: email || undefined,
        phone: phoneWithCode || undefined
      });

      try {
        console.log('Calling resetPassword mutation...');
        console.log('resetPassword function type:', typeof resetPassword);
        console.log('resetPassword function:', resetPassword);
        
        // Try direct mutation call
        const result = resetPassword(requestData);
        console.log('Immediate mutation result:', result);

        if (typeof result === 'object' && 'unwrap' in result) {
          console.log('Unwrapping promise...');
          const response = await result.unwrap();
          console.log('Password reset API response:', response);
        } else {
          console.error('Unexpected mutation result type:', result);
          throw new Error('Mutation failed to return a promise');
        }
      } catch (mutationError) {
        console.error('Mutation failed with error:', mutationError);
        console.error('Trying direct fetch...');
        
        // Fallback to direct fetch with more debugging
        try {
          const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/auth/password/reset`;
          console.log('Making direct fetch to:', apiUrl);
          
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
          });
          
          console.log('Fetch response status:', response.status);
          const data = await response.json();
          console.log('Direct fetch response:', data);
          
          if (!response.ok) {
            throw new Error(data.message || 'Password reset failed');
          }
          
          toast.success(data.message || 'Password reset successful');
        } catch (fetchError) {
          console.error('Direct fetch also failed:', fetchError);
          throw fetchError;
        }
      }
      
      // Success toast is handled by the mutation's onQueryStarted
      navigate('/login');
    } catch (err) {
      // Error toast is handled by the mutation's onQueryStarted
      const error = err as ApiError;
      console.error('Password reset error details:', {
        error,
        status: error?.status,
        data: error?.data,
        message: error?.message,
        stack: error?.stack,
      });
    } finally {
      setLoading(false);
    }
  };

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    console.log('Form onSubmit triggered');
    handleSubmit(e).catch(console.error);
  };

  return (
    <PageLayout>
      <div className="flex justify-center items-center min-h-screen pt-12 md:pt-40">
        <FormContainer
          title="Create New Password"
          onSubmit={onFormSubmit}
          loading={loading}
          submitText="Reset Password"
          submitButtonProps={{
            onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
              console.log('Direct button click handler');
              e.preventDefault();
              handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>).catch(console.error);
            }
          }}
          footerContent={
            <div className="space-y-2">
              <p className="text-center">
                Remember your password? <Link className='text-[#028090]' to="/login">Login</Link>
              </p>
              <p className="text-center">
                Don't have an account? <Link className='text-[#028090]' to="/signup">Sign up</Link>
              </p>
            </div>
          }
        >
          <FormInput
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
          />
          <FormInput
            type={passwordVisible ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New Password"
            icon={passwordVisible ? <FaEyeSlash className="text-gray-500 hover:text-gray-700" /> : <FaEye className="text-gray-500 hover:text-gray-700" />}
            onIconClick={() => setPasswordVisible(!passwordVisible)}
          />
          <FormInput
            type={confirmPasswordVisible ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            icon={confirmPasswordVisible ? <FaEyeSlash className="text-gray-500 hover:text-gray-700" /> : <FaEye className="text-gray-500 hover:text-gray-700" />}
            onIconClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
          />
          <p className="text-[10px] font-semibold text-gray-500 mb-2 px-4">
            Enter the OTP sent to your email and create a new password.
          </p>
        </FormContainer>
      </div>
    </PageLayout>
  );
};

export default ResetPassword; 