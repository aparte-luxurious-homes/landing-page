'use client';

import React, { useState } from 'react';
import { useResetPasswordMutation } from '../../api/authApi';
import { Link, useNavigate, useLocation } from '@/lib/router';
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
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const inputMode = queryParams.get('email') ? 'email' : 'phone';
  const email = queryParams.get('email');
  const phone = queryParams.get('phone');
  const country = "Nigeria (+234)"; // Default country code

  const [resetPassword] = useResetPasswordMutation();

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate inputs
    if (!otp.trim()) {
      toast.error('Please enter the OTP');
      return;
    }

    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    if (!newPassword.trim()) {
      toast.error('Please enter a new password');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    if (!confirmPassword.trim()) {
      toast.error('Please confirm your password');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Validate that we have either email or phone
    if (inputMode === 'email' && !email) {
      toast.error('Email is required');
      return;
    }
    if (inputMode === 'phone' && !phone) {
      toast.error('Phone number is required');
      return;
    }

    try {
      setLoading(true);
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

      try {
        // Try direct mutation call
        const result = resetPassword(requestData);

        if (typeof result === 'object' && 'unwrap' in result) {
          await result.unwrap();
        } else {
          console.error('Unexpected mutation result type:', result);
          throw new Error('Mutation failed to return a promise');
        }
      } catch (mutationError) {
        console.error('Mutation failed with error:', mutationError);
        console.error('Trying direct fetch...');

        // Fallback to direct fetch
        try {
          const { BASE_API_URL } = await import('../../utils/url');
          const apiUrl = `${BASE_API_URL}/auth/password/reset`;

          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
          });

          const data = await response.json();

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
            onChange={(e) => setNewPassword(e.target.value.replace(/\s/g, ''))}
            placeholder="New Password"
            icon={passwordVisible ? <FaEyeSlash className="text-gray-500 hover:text-gray-700" /> : <FaEye className="text-gray-500 hover:text-gray-700" />}
            onIconClick={() => setPasswordVisible(!passwordVisible)}
          />
          <FormInput
            type={confirmPasswordVisible ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value.replace(/\s/g, ''))}
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