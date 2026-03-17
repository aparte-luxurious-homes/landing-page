import React, { useState } from 'react';

import FormContainer from '../../../components/forms/FormContainer';
import FormInput from '../../../components/inputs/FormInput';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import { BaseFormProps } from './types';
import { redirectToAdminDashboard } from '../../../utils/adminRedirect';
import { toast } from 'react-toastify';
import { extractErrorMessage } from '../../../utils/errorHandler';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useSignupMutation, useLoginMutation, useGoogleAuthMutation } from '../../../api/authApi';

const EmailForm: React.FC<BaseFormProps> = ({
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

  const [signup] = useSignupMutation();
  const [login] = useLoginMutation();
  const [googleAuth] = useGoogleAuthMutation();
  const location = useLocation();

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) return;

    setLoading(true);
    try {
      const result = await googleAuth({ token: response.credential }).unwrap();

      const { authorization, user } = result.data || result;

      // Check user role and handle redirection
      if (user.role !== 'GUEST') {
        toast.success(`Welcome ${user.profile?.firstName || 'User'}! Redirecting...`);
        onSuccess(authorization.token, user.role);
        redirectToAdminDashboard();
        return;
      }

      setSuccess('Login successful!');
      onSuccess(authorization.token, user.role);
    } catch (err) {
      setLoading(false);
      const errorMessage = extractErrorMessage(err, 'Google Login failed!');
      setError(errorMessage);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'signup') {
        const result = await signup({
          email,
          password,
          role: userType,
          fullName: userType === 'OWNER' ? fullName : undefined,
        }).unwrap();

        setSuccess(result.message);
        onEmailChange?.(email);
        setStep('otp');
      } else {
        const result = await login({
          email,
          password,
          role: userType,
        }).unwrap();

        const { authorization, user } = result.data || result;

        // Check user role and handle redirection
        if (user.role !== 'GUEST') {
          // For non-guest users (OWNER or AGENT), redirect to admin dashboard
          toast.success('Login successful! Redirecting to dashboard...');
          onSuccess(authorization.token, user.role);
          redirectToAdminDashboard();
          return;
        }

        // For guest users, proceed with normal login flow
        setSuccess('Login successful!');
        onSuccess(authorization.token, user.role);
      }
    } catch (err) {
      setLoading(false);
      const errorMessage = extractErrorMessage(err, 'Something went wrong. Please try again.');
      setError(errorMessage);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    onEmailChange?.(value);
  };

  return (
    <FormContainer
      title={mode === 'login' ? 'Login with Email' : 'Signup with Email'}
      onSubmit={handleSubmit}
      error={error}
      success={success}
      loading={loading}
      submitText={mode === 'login' ? 'Login' : 'Sign Up'}
      // alternateOptions={
      //   <button
      //     type="button"
      //     onClick={onSwitchMode}
      //     className="w-[92%] bg-white border border-gray-300 rounded-md py-3 flex items-center hover:bg-gray-100 transition-colors"
      //   >
      //     <img src="https://img.icons8.com/ios-filled/16/000000/phone.png" alt="Phone Icon" className="ml-3 h-3 w-3" />
      //     <span className="flex-1 text-center">
      //       {mode === 'login' ? 'Login with Phone Number' : 'Sign up with Phone Number'}
      //     </span>
      //   </button>
      // }
      footerContent={
        mode === 'login' ? (
          <div className="space-y-2">
            <p className="text-center">
              Not registered? <Link className='text-[#028090]' to={"/signup" + location.search}>Sign up</Link>
            </p>
            <p className="text-center">
              Forgot Password? <Link className='text-[#028090]' to="/auth/request-reset">Reset Password</Link>
            </p>
          </div>
        ) : (
          <p className="text-center">
            Already have an account? <Link className='text-[#028090]' to={"/login" + location.search}>Login</Link>
          </p>
        )
      }
    >
      <div className="mb-6 flex flex-col items-center">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setError('Google Login Failed')}
          useOneTap
          theme="filled_blue"
          shape="pill"
          text="continue_with"
        />
        <div className="relative flex py-4 items-center w-full mt-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
      </div>

      {mode === 'signup' && userType === 'OWNER' && (
        <FormInput
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Full Name"
        />
      )}

      <FormInput
        value={email}
        onChange={handleEmailChange}
        type="email"
        placeholder="Email"
      />

      <FormInput
        type={passwordVisible ? "text" : "password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        icon={passwordVisible ? (
          <FaEyeSlash className="text-gray-500 hover:text-gray-700" />
        ) : (
          <FaEye className="text-gray-500 hover:text-gray-700" />
        )}
        onIconClick={() => setPasswordVisible((prev) => !prev)}
      />

      {mode === 'signup' && (
        <p className="text-[10px] font-semibold text-gray-500 mb-2 px-4">
          You'll receive an OTP to verify your email.
        </p>
      )}
    </FormContainer>
  );
};

export default EmailForm; 