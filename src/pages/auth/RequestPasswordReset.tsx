import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';

import {
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
} from '../../api/authApi';
import { Link, useNavigate } from 'react-router-dom';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

const RequestPasswordReset = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'request' | 'verify' | 'reset'>('request');

  const [requestPasswordReset] = useRequestPasswordResetMutation();
  const [resetPassword] = useResetPasswordMutation();

  const handleRequestSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await requestPasswordReset({ email }).unwrap();
      setSuccess('OTP has been sent to your email.');
      setStep('reset');
    } catch (err: any) {
      let error = 'Something went wrong. Please try again.';
      if (err?.data?.message) {
        error = err.data.message;
      }
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      await resetPassword({
        email,
        otp,
        password: newPassword,
        password_confirmation: confirmPassword,
      }).unwrap();
      toast.success('Password has been reset successfully.');
      navigate('/login', { replace: true });
    } catch (err: any) {
      let error = 'Something went wrong. Please try again.';
      if (err?.data?.message) {
        error = err.data.message;
      }
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await requestPasswordReset({ email }).unwrap();
      setSuccess('OTP has been sent to your email.');
    } catch (err: any) {
      let error = 'Something went wrong. Please try again.';
      if (err?.data?.message) {
        error = err.data.message;
      }
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center px-4 md:px-0 min-h-screen pt-12 md:pt-40">
      {step === 'request' && (
        <form
          className="w-full max-w-md bg-white shadow-md rounded-xl border border-solid border-black"
          onSubmit={handleRequestSubmit}
        >
          <div className="mb-1 py-4">
            <h2 className="text-xl font-semibold text-center">
              Request Password Reset
            </h2>
          </div>

          <div className="border-t border-solid border-gray-300 w-full mb-4"></div>

          <div className="mb-4 px-2 md:px-6">
            <h3 className="text-md font-medium mb-3 pl-3 text-[#028090]">
              Enter your email to receive a password reset link
            </h3>

            <div className="mb-4">
              <div className="relative w-[95%] ml-3 border border-solid border-black rounded-lg bg-white focus-within:ring-2 focus-within:ring-[#028090]">
                <div className="flex flex-col p-2">
                  <div className="pl-4">
                    <label
                      htmlFor="email"
                      className="block text-[9px] text-gray-500 ml-0"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-3 bg-transparent text-gray-700 focus:outline-none placeholder-gray-300"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
              </div>
            </div>

            {error && <p className="text-red-500 text-xs mb-2 px-4">{error}</p>}
            {success && (
              <p className="text-[#028090] text-xs mb-2 px-4">{success}</p>
            )}

            <button
              type="submit"
              className="w-[95%] bg-[#028090] text-white rounded-lg py-3 ml-3 hover:bg-[#028090] transition-colors"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Send Reset Link'}
            </button>
          </div>

          <p className="text-center mb-4">
            Remembered your password?{' '}
            <Link className="text-[#028090]" to="/login">
              Login
            </Link>
          </p>
        </form>
      )}

      {step === 'reset' && (
        <form
          className="w-full max-w-md bg-white shadow-md rounded-xl border border-solid border-black"
          onSubmit={handleResetSubmit}
        >
          <div className="mb-1 py-4 px-8 flex items-center">
            <button onClick={() => setStep('request')}>
              <ArrowBackIosIcon />
            </button>
            <h2 className="text-xl font-semibold text-center flex-1">
              Reset Password
            </h2>
          </div>

          <div className="border-t border-solid border-gray-300 w-full mb-4"></div>

          <div className="mb-4 px-6">
            <div className="mb-4">
              <div className="relative w-[95%] ml-3 border border-solid border-black rounded-lg bg-white focus-within:ring-2 focus-within:ring-[#028090]">
                <div className="flex flex-col p-2">
                  <div className="pl-4">
                    <label
                      htmlFor="otp"
                      className="block text-[9px] text-gray-500 ml-0"
                    >
                      OTP
                    </label>
                    <input
                      type="text"
                      id="otp"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full p-3 bg-transparent text-gray-700 focus:outline-none placeholder-gray-300"
                      placeholder="Enter OTP"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="mb-4">
              <div className="relative w-[95%] ml-3 border border-solid border-black rounded-lg bg-white focus-within:ring-2 focus-within:ring-[#028090]">
                <div className="flex flex-col p-2">
                  <div className="pl-4">
                    <label
                      htmlFor="newPassword"
                      className="block text-[9px] text-gray-500 ml-0"
                    >
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full p-3 bg-transparent text-gray-700 focus:outline-none placeholder-gray-300"
                      placeholder="Enter new password"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="mb-4">
              <div className="relative w-[95%] ml-3 border border-solid border-black rounded-lg bg-white focus-within:ring-2 focus-within:ring-[#028090]">
                <div className="flex flex-col p-2">
                  <div className="pl-4">
                    <label
                      htmlFor="confirmPassword"
                      className="block text-[9px] text-gray-500 ml-0"
                    >
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full p-3 bg-transparent text-gray-700 focus:outline-none placeholder-gray-300"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="px-4 my-2">
              <span>Didn't get OTP?</span>{' '}
              <button className="text-[#028090]" onClick={handleResendOtp}>
                Resend OTP
              </button>
            </div>
            {error && <p className="text-red-500 text-xs mb-2 px-4">{error}</p>}
            <button
              type="submit"
              className="w-[95%] bg-[#028090] text-white rounded-lg py-3 ml-3 hover:bg-[#028090] transition-colors"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Reset Password'}
            </button>
          </div>

          <p className="text-center mb-4">
            Remembered your password?{' '}
            <Link className="text-[#028090]" to="/login">
              Login
            </Link>
          </p>
        </form>
      )}
      <ToastContainer />
    </div>
  );
};

export default RequestPasswordReset;
