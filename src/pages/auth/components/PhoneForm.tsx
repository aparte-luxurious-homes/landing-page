import React, { useState } from 'react';
import { useSignupMutation, useLoginMutation } from '../../../api/authApi';
import FormContainer from '../../../components/forms/FormContainer';
import FormInput from '../../../components/inputs/FormInput';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { BaseFormProps } from './types';
import { ApiError } from '../../../api/types';
import { redirectToAdminDashboard } from '../../../utils/adminRedirect';
import { toast } from 'react-toastify';
import { getStoredReferralCode } from '../../../utils/referral';

const PhoneForm: React.FC<BaseFormProps> = ({
  mode,
  userType,
  onSuccess,
  onSwitchMode,
  setStep,
  onPhoneChange
}) => {
  const [country, setCountry] = useState('Nigeria (+234)');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [referralLocked, setReferralLocked] = useState(false);

  const [signup] = useSignupMutation();

  const [login] = useLoginMutation();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Auto-populate referral code from URL (e.g. /signup?ref=CODE) and lock the input.
  // Also falls back to localStorage in case the user navigated through other pages.
  React.useEffect(() => {
    const refFromUrl = searchParams.get('ref');
    const stored = refFromUrl ? refFromUrl.trim().toUpperCase() : getStoredReferralCode();
    if (stored && !referralCode) {
      setReferralCode(stored);
      setReferralLocked(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

    if (mode === 'signup' && (!firstName.trim() || !lastName.trim())) {
      setError('Please enter your first and last name.');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'signup') {
        const result = await signup({
          phone,
          password,
          role: userType,
          name: firstName.trim(),
          last_name: lastName.trim(),
          referral_code: referralCode || undefined,
        }).unwrap();

        setSuccess(result.message);
        onPhoneChange?.(phone);
        setStep('otp');
      } else {
        const result = await login({
          phone,
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
      const apiError = err as ApiError;
      if (apiError?.data?.errors?.[0]?.message) {
        setError(apiError.data.errors[0].message);
      } else {
        setError('Something went wrong. Please try again.');
      }
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhone(value);
    onPhoneChange?.(value);
  };

  return (
    <FormContainer
      title={mode === 'login' ? 'Login' : 'Sign Up'}
      onSubmit={handleSubmit}
      error={error}
      success={success}
      submitText={mode === 'login' ? 'Login' : 'Sign Up'}
      loading={loading}
      alternateOptions={
        <button
          type="button"
          onClick={onSwitchMode}
          className="w-[92%] bg-white border border-gray-300 rounded-md py-3 flex items-center hover:bg-gray-100 transition-colors"
        >
          <img src="/email.png" alt="Email Icon" className="ml-3 h-3 w-3" />
          <span className="flex-1 text-center">
            {mode === 'login' ? 'Login with Email' : 'Sign up with Email'}
          </span>
        </button>
      }
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
      {mode === 'signup' && (
        <>
          <FormInput
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First Name"
            required
          />
          <FormInput
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last Name"
            required
          />
        </>
      )}

      <div className="relative w-[95%] ml-3 border border-solid border-black rounded-lg bg-white focus-within:ring-2 focus-within:ring-[#028090] mb-4">
        <div className="relative">
          <div className="flex flex-row items-center space-x-2 p-3">
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="appearance-none bg-transparent font-semibold text-gray-700 focus:outline-none w-full"
            >
              <option>Nigeria (+234)</option>
              <option>Kenya (+254)</option>
              <option>Ghana (+233)</option>
            </select>
          </div>
          <div className="border-t border-solid border-black"></div>
          <div className="flex flex-row items-center space-x-2 p-3 pl-6">
            <label htmlFor="phone" className="text-sm text-gray-400">Phone Number</label>
            <div className="h-4 w-px bg-gray-700"></div>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={handlePhoneChange}
              className="flex-1 bg-transparent text-gray-700 focus:outline-none pl-4 placeholder-gray-300"
              placeholder="080 X XXXX XXX"
            />
          </div>
        </div>
      </div>

      <FormInput
        type={passwordVisible ? "text" : "password"}
        value={password}
        onChange={(e) => setPassword(e.target.value.replace(/\s/g, ''))}
        placeholder="Password"
        icon={passwordVisible ? (
          <FaEyeSlash className="text-gray-500 hover:text-gray-700" />
        ) : (
          <FaEye className="text-gray-500 hover:text-gray-700" />
        )}
        onIconClick={() => setPasswordVisible((prev) => !prev)}
      />

      {mode === 'signup' && (
        <FormInput
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
          placeholder={referralLocked ? 'Referral code applied' : 'Referral Code (Optional)'}
          disabled={referralLocked}
          readOnly={referralLocked}
        />
      )}

      {mode === 'signup' && (
        <p className="text-[10px] font-semibold text-gray-500 mb-2 px-4">
          You'll receive an OTP to verify your phone number.
        </p>
      )}
    </FormContainer>
  );
};

export default PhoneForm; 