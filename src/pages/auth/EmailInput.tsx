import React, { useState } from 'react';
import { OTPVerification } from './OTPVerification';
import { useSignupMutation, useLoginMutation } from '../../api/authApi';
import {
  setRole,
  setAuthUser,
  setEmail as setEmailAction,
} from '../../features/auth/authSlice';
import { useAppDispatch } from '../../hooks';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

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
        if (onComplete) onComplete(email);
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

        dispatch(setAuthUser({
          token: authorization.token, role: user.role,
          id: user.id
        }));
        setSuccess('Login successful!');
        if (onComplete) onComplete(email);
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

  return (
    <div className="w-full max-w-md bg-white shadow-md rounded-xl border border-solid border-black">
      {!showOtpInput ? (
        // Email and Password Form
        <form onSubmit={handleEmailSubmit}>
          <div className="mb-1 py-4">
            <h2 className="text-xl font-semibold text-center">
              {mode === 'login' ? 'Login with Email' : 'Signup with Email'}
            </h2>
          </div>

          <div className="border-t border-solid border-gray-300 w-full mb-4"></div>

          <div className="mb-4 px-6">
            <h3 className="text-md font-medium mb-3 pl-3 text-[#028090]">
              Welcome to Aparte
            </h3>

            {mode === 'signup' && role === 'OWNER' && (
              <div className="mb-4">
                <div className="relative w-[95%] ml-3 border border-solid border-black rounded-lg bg-white focus-within:ring-2 focus-within:ring-[#028090]">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-3 bg-transparent text-gray-700 focus:outline-none placeholder-gray-300"
                    placeholder="Full Name"
                  />
                </div>
              </div>
            )}

            <div className="mb-4">
              <div className="relative w-[95%] ml-3 border border-solid border-black rounded-lg bg-white focus-within:ring-2 focus-within:ring-[#028090]">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 bg-transparent text-gray-700 focus:outline-none placeholder-gray-300"
                  placeholder="Email"
                />
              </div>
            </div>

            <div className="mb-4 px-2 ml-1">
              <div className="mb-2 relative">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <input
                  type={passwordVisible ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border text-xs border-black rounded-lg py-4 pl-6 focus:outline-none focus:ring-2 focus:ring-[#028090]"
                  placeholder="Password"
                />

                <span
                  className="absolute inset-y-0 right-8 flex items-center cursor-pointer top-6"
                  onClick={() => setPasswordVisible((prev) => !prev)}
                >
                  {passwordVisible ? (
                    <FaEyeSlash className="text-gray-500 hover:text-gray-700" />
                  ) : (
                    <FaEye className="text-gray-500 hover:text-gray-700" />
                  )}
                </span>
              </div>
            </div>

            <p className="text-[10px] font-semibold text-gray-500 mb-2 px-4">
              You'll receive an OTP to verify your email.
            </p>

            {error && <p className="text-red-500 text-xs mb-2 px-4">{error}</p>}
            {success && (
              <p className="text-[#028090] text-xs mb-2 px-4">{success}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-[95%] bg-[#028090] text-white rounded-lg py-3 ml-3 hover:bg-[#028090] transition-colors"
            >
              {loading ? 'Processing...' : 'Continue'}
            </button>
          </div>

          {/* Divider and Alternate Login Options */}
          <div className="flex items-center justify-center mt-4 px-9">
            <div className="border-t border-solid border-gray-300 flex-1"></div>
            <span className="px-6 text-gray-500">or</span>
            <div className="border-t border-solid border-gray-300 flex-1"></div>
          </div>

          <div className="space-y-3 mb-4 pl-9 mt-2">
            <button className="w-[92%] bg-white border border-gray-300 rounded-md py-3 flex items-center hover:bg-gray-100 transition-colors">
              <img
                src="https://img.icons8.com/color/16/000000/google-logo.png"
                alt="Google Logo"
                className="ml-3 h-3 w-3"
              />
              <span className="flex-1 text-center">Continue with Google</span>
            </button>
            <button className="w-[92%] bg-white border border-gray-300 rounded-md py-3 flex items-center hover:bg-gray-100 transition-colors">
              <img
                src="https://img.icons8.com/ios-filled/16/000000/phone.png"
                alt="Phone Icon"
                className="ml-3 h-3 w-3"
              />
              <span className="flex-1 text-center">
                Continue with Phone Number
              </span>
            </button>
          </div>
          {mode == 'login' && (
            <p className="text-center mb-4">
              Not registered?{' '}
              <Link className="text-[#028090]" to="/signup">
                Sign up
              </Link>
            </p>
          )}
        </form>
      ) : (
        <OTPVerification
          onComplete={handleOtpComplete}
          onResend={() => {
            console.log('Resend OTP');
          }}
          maxLength={6}
          email={email}
          phone={''}
        />
      )}
    </div>
  );
};

export default EmailInput;
