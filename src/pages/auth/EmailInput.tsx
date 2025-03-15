import React, { useState } from 'react';
import { OTPVerification } from './OTPVerification';
import { useSignupMutation, useLoginMutation } from '../../api/authApi';
import {
  setRole,
  setToken,
  setEmail as setEmailAction,
} from '../../features/auth/authSlice';
import { useAppDispatch } from '../../hooks';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import FormInput from '../../components/inputs/FormInput';
import FormContainer from '../../components/forms/FormContainer';

interface EmailInputProps {
  mode: 'login' | 'signup';
  role: 'GUEST' | 'OWNER' | 'AGENT';
  onComplete?: (email: string) => void;
}

const EmailInput: React.FC<EmailInputProps> = ({ mode, role, onComplete }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const [signup, { isLoading }] = useSignupMutation();
  const [login] = useLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log(email);

    setError('');
    setSuccess('');
    
    // Validate email address
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(isLoading);

    if (mode === 'signup') {
      try {
        const result: {
          message: string;
          data: { role: string; email: string; phone: string };
        } = await signup({
          email,
          password,
          role,
          fullName: role === 'OWNER' ? fullName : undefined,
        }).unwrap();

        const { message, data } = result;
        setSuccess(message);
        setShowOtpInput(true);
        dispatch(setRole(data.role));
        dispatch(setEmailAction(data.email));
        onComplete && onComplete(email);
      } catch (err: any) {
    setLoading(false);
    if (err.data && err.data.errors && err.data.errors.length > 0) {
          setError(err.data.errors[0].message);
        } else {
          setError('Signup failed. Please try again.');
        }
      }
    } else {
      // Handle login logic here
      setLoading(true);
      try {
        const { authorization, user } = await login({
          email,
          password,
          role: 'GUEST',
        }).unwrap();

        dispatch(setToken({ token: authorization.token, role: user.role }));
        setSuccess('Login successful!');
        onComplete && onComplete(email);
        navigate('/'); // Redirect to the landing page
      } catch (err: any) {
        console.log('Error: ', err);
        setLoading(false);
        if (err.data && err.data.errors && err.data.errors.length > 0) {
          setError(err.data.errors[0].message);
        } else {
          setError('Something went wrong. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle OTP completion
  const handleOtpComplete = (otp: string) => {
    console.log('OTP entered:', otp);
    setSuccess('OTP verified successfully!');
  };

  // Add handler for phone signup
  const handlePhoneSignUp = () => {
    setShowOtpInput(true);
  };

  return (
    <>
      {!showOtpInput ? (
        <FormContainer
          title={mode === 'login' ? 'Login with Email' : 'Signup with Email'}
          onSubmit={handleEmailSubmit}
          error={error}
          success={success}
          loading={loading}
          alternateOptions={
            <button 
              type="button"
              onClick={handlePhoneSignUp}
              className="w-[92%] bg-white border border-gray-300 rounded-md py-3 flex items-center hover:bg-gray-100 transition-colors"
            >
              <img
                src="https://img.icons8.com/ios-filled/16/000000/phone.png"
                alt="Phone Icon"
                className="ml-3 h-3 w-3"
              />
              <span className="flex-1 text-center">
                {mode === 'login' ? 'Login with Phone Number' : 'Sign up with Phone Number'}
              </span>
            </button>
          }
          footerContent={
            mode === 'login' && (
              <p className="text-center">
                Not registered? <Link className='text-[#028090]' to="/signup">Sign up</Link>
              </p>
            )
          }
        >
          {mode === 'signup' && role === 'OWNER' && (
            <FormInput
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full Name"
            />
          )}

          <FormInput
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

          <p className="text-[10px] font-semibold text-gray-500 mb-2 px-4">
            You'll receive an OTP to verify your email.
          </p>
        </FormContainer>
      ) : (
        <div className="w-full max-w-md bg-white shadow-md rounded-xl border-0 md:border md:border-solid md:border-black">
          <OTPVerification
            onComplete={handleOtpComplete}
            onResend={() => {
              console.log('Resend OTP');
            }}
            maxLength={6}
            email={email}
            phone={''}
          />
        </div>
      )}
    </>
  );
};

export default EmailInput;