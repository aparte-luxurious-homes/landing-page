import React, { useState } from 'react';
import { useSignupMutation, useLoginMutation } from '../../../api/authApi';
import FormContainer from '../../../components/forms/FormContainer';
import FormInput from '../../../components/inputs/FormInput';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { BaseFormProps } from './types';
import { ApiError } from '../../../api/types';

const EmailForm: React.FC<BaseFormProps> = ({
  mode,
  userType,
  onSuccess,
  onSwitchMode,
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

        const { authorization, user } = result;
        onSuccess(authorization.token, user.role);
      }
    } catch (err) {
      setLoading(false);
      const apiError = err as ApiError;
      if (apiError?.data?.errors?.[0]?.message) {
        setError(apiError.data.errors[0].message);
      } else {
        setError('Something went wrong. Please try again.');
      }
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
      alternateOptions={
        <button 
          type="button"
          onClick={onSwitchMode}
          className="w-[92%] bg-white border border-gray-300 rounded-md py-3 flex items-center hover:bg-gray-100 transition-colors"
        >
          <img src="https://img.icons8.com/ios-filled/16/000000/phone.png" alt="Phone Icon" className="ml-3 h-3 w-3" />
          <span className="flex-1 text-center">
            Continue with Phone Number
          </span>
        </button>
      }
      footerContent={
        mode === 'login' ? (
          <div className="space-y-2">
            <p className="text-center">
              Not registered? <Link className='text-[#028090]' to="/signup">Sign up</Link>
            </p>
            <p className="text-center">
              Forgot Password? <Link className='text-[#028090]' to="/request-password-reset">Reset Password</Link>
            </p>
          </div>
        ) : (
          <p className="text-center">
            Already have an account? <Link className='text-[#028090]' to="/login">Login</Link>
          </p>
        )
      }
    >
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