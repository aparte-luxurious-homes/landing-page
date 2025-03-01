import { useState } from 'react';
import { OTPVerification } from './OTPVerification';
import EmailInput from './EmailInput';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast, ToastContainer } from "react-toastify";
import {
  setAuthUser,
  setPhone as setPhoneAction,
} from '../../features/auth/authSlice';
import { useLoginMutation } from '../../api/authApi';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import PageLayout from "../../components/pagelayout/index";

const Login = () => {
  const [country, setCountry] = useState('Nigeria (+234)');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [step, setStep] = useState<'login' | 'otp' | 'email'>('login');
  const [, setOtp] = useState('');

  const [login] = useLoginMutation();
  const dispatch = useDispatch();

  // Handle phone form submission
  const handlePhoneSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      setError('Please enter a valid 10-digit phone number.');
      setLoading(false);
      return;
    }

    try {
      const result = await login({
        phone,
        password,
        role: 'GUEST',
      }).unwrap();

      const { user, authorization } = result;
      setSuccess('Login was successful');
      dispatch(
        setAuthUser({
          token: authorization.token,
          role: user.role,
          id: user.id
        })
      );
      dispatch(setPhoneAction(user.phone));

      // Display success message for 2 seconds before navigating to OTP
      setTimeout(() => {
        setStep('otp');
      }, 2000);
    } catch (err: any) {
      setLoading(false);
      if (err.data && err.data.errors && err.data.errors.length > 0) {
        toast.error(err.data.errors[0].message);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP completion
  const handleOtpComplete = (enteredOtp: string) => {
    setOtp(enteredOtp);
    toast.info(`OTP Verified Successfully! OTP: ${enteredOtp}`);
   
  };

  console.log(step, "this is step");

  // Handle OTP resend
  const handleResendOtp = () => {
    toast.info("OTP Resent!");
   
  };

  // Handle the transition to Email Input
  const handleEmailLogin = () => {
    setStep('email');
  };

  return (
    <PageLayout
      children={
        <div className="flex justify-center items-center min-h-screen pt-12 md:pt-40">
          {step === 'login' && (
            <form
              className="w-full max-w-md bg-white shadow-md rounded-xl border border-solid border-black"
              onSubmit={handlePhoneSubmit}
            >
              <div className="mb-1 py-4">
                <h2 className="text-xl font-semibold text-center">Login</h2>
              </div>

              <div className="border-t border-solid border-gray-300 w-full mb-4"></div>

              <div className="mb-4 px-6">
                <h3 className="text-md font-medium mb-3 pl-3 text-[#028090]">
                  Welcome to Aparte
                </h3>

                <div className="mb-4">
                  <div className="relative w-[95%] ml-3 border border-solid border-black rounded-lg bg-white focus-within:ring-2 focus-within:ring-[#028090]">
                    <div className="flex flex-col p-2">
                      <div className="pl-4">
                        <label
                          htmlFor="country"
                          className="block text-[9px] text-gray-500 ml-0"
                        >
                          Country / Region
                        </label>
                        <select
                          id="country"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="custom-select appearance-none bg-transparent font-semibold text-gray-700 focus:outline-none w-full"
                        >
                          <option>Nigeria (+234)</option>
                          <option>Kenya (+254)</option>
                          <option>Ghana (+233)</option>
                        </select>
                      </div>

                      <div className="absolute right-8 top-5 pointer-events-none">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M19.9201 8.94922L13.4001 15.4692C12.6301 16.2392 11.3701 16.2392 10.6001 15.4692L4.08008 8.94922"
                            stroke="#292D32"
                            strokeWidth="1.5"
                            strokeMiterlimit="10"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>

                    <div className="border-t border-solid border-black"></div>

                    <div className="flex flex-row items-center space-x-2 p-3 pl-6">
                      <label htmlFor="phone" className="text-sm text-gray-400">
                        Phone Number
                      </label>

                      <div className="h-4 w-px bg-gray-700"></div>

                      <input
                        type="tel"
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="flex-1 bg-transparent text-gray-700 focus:outline-none pl-4 placeholder-gray-300"
                        placeholder="080 X XXXX XXX"
                      />
                    </div>
                  </div>
                </div>

                {/* Password input below the existing box */}
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
                  You'll receive an OTP to verify your phone number. Standard
                  messages and data rates may apply.
                </p>

                {error && <p className="text-red-500 text-xs mb-2 px-4">{error}</p>}
                {success && (
                  <p className="text-[#028090] text-xs mb-2 px-4">{success}</p>
                )}

                <button
                  type="submit"
                  className="w-[95%] bg-[#028090] text-white rounded-lg py-3 ml-3 hover:bg-[#028090] transition-colors"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Continue'}
                </button>
              </div>

              <div className="flex items-center justify-center mt-4 px-8">
                <div className="border-t border-solid border-gray-300 flex-1"></div>
                <span className="px-6 text-gray-500">or</span>
                <div className="border-t border-solid border-gray-300 flex-1"></div>
              </div>

              <div className="space-y-3 mb-4 pl-8 mt-2">
                <button
                  className="w-[93%] bg-white border border-gray-300 rounded-md py-3 flex items-center hover:bg-gray-100 transition-colors"
                  onClick={handleEmailLogin} 
                >
                  <img src="/email.png" alt="Email Icon" className="ml-4 h-3 w-3" />
                  <span className="flex-1 text-center">Continue with Email</span>
                </button>
                <button className="w-[93%] bg-white border border-gray-300 rounded-md py-3 flex items-center hover:bg-gray-100 transition-colors">
                  <img
                    src="https://img.icons8.com/color/16/000000/google-logo.png"
                    alt="Google Logo"
                    className="ml-4 h-4 w-4"
                  />
                  <span className="flex-1 text-center">Continue with Google</span>
                </button>
              </div>

              <p className="text-center mb-4">
                Not registered? <Link className='text-[#028090]' to="/signup">Sign up</Link>
              </p>
              
            </form>
          )}

          {step === 'otp' && (
            <OTPVerification
              onComplete={handleOtpComplete}
              onResend={handleResendOtp}
              maxLength={6}
              email={email}
              phone={''}
            />
          )}

          {step === 'email' && (
            <div className="w-full max-w-md p-6">
              <EmailInput
                onComplete={(email) => setEmail(email)}
                mode="login"
                role={'GUEST'}
              />
              <p className="text-center mt-4">
                Forgot Password? <Link className='text-[#028090]' to="/request-password-reset">Request Password Reset</Link>
              </p>
            </div>
          )}
          <ToastContainer />
        </div>
      }
    />

  );
};

export default Login;