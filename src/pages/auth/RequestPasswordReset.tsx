import React, { useState } from 'react';
import { useRequestPasswordResetMutation } from '../../api/authApi';
import { Link, useNavigate } from 'react-router-dom';
import FormContainer from '../../components/forms/FormContainer';
import FormInput from '../../components/inputs/FormInput';
import { toast } from 'react-toastify';
import PageLayout from '../../components/pagelayout';

const RequestPasswordReset = () => {
  const [inputMode, setInputMode] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('Nigeria (+234)');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [requestPasswordReset] = useRequestPasswordResetMutation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate input
    if (inputMode === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.trim()) {
        toast.error('Please enter your email address');
        return;
      }
      if (!emailRegex.test(email)) {
        toast.error('Please enter a valid email address');
        return;
      }
    } else {
      if (!phone.trim()) {
        toast.error('Please enter your phone number');
        return;
      }
      if (phone.length < 10) {
        toast.error('Please enter a valid phone number');
        return;
      }
    }

    setLoading(true);
    try {
      const countryCode = country.match(/\(([^)]+)\)/)?.[1] || '';
      // Format phone number: remove any non-digit characters and ensure it starts with the country code
      const formattedPhone = phone.replace(/\D/g, '');
      const phoneWithCode = inputMode === 'phone' 
        ? (countryCode + formattedPhone).replace(/^\+/, '') // Remove leading + if present
        : undefined;

      const response = await requestPasswordReset({ 
        email: inputMode === 'email' ? email.trim() : undefined,
        phone: phoneWithCode
      }).unwrap();
      
      toast.success(response.message || 'Reset instructions sent');
      navigate(`/auth/reset-password?${inputMode}=${encodeURIComponent(inputMode === 'email' ? email : phoneWithCode || '')}`);
    } catch (err) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || 'Failed to send reset instructions');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setPhone(value);
  };

  return (
    <PageLayout>
      <div className="flex justify-center items-center min-h-screen pt-12 md:pt-40">
        <FormContainer
          title="Reset Password"
          onSubmit={handleSubmit}
          loading={loading}
          submitText={inputMode === 'email' ? 'Reset with Email' : 'Reset with Phone Number'}
          alternateOptions={
            <button 
              type="button"
              onClick={() => setInputMode(inputMode === 'email' ? 'phone' : 'email')}
              className="w-[92%] bg-white border border-gray-300 rounded-md py-3 flex items-center hover:bg-gray-100 transition-colors"
            >
              {inputMode === 'email' ? (
                <>
                  <img src="https://img.icons8.com/ios-filled/16/000000/phone.png" alt="Phone Icon" className="ml-3 h-3 w-3" />
                  <span className="flex-1 text-center">Reset with Phone Number</span>
                </>
              ) : (
                <>
                  <img src="/email.png" alt="Email Icon" className="ml-3 h-3 w-3" />
                  <span className="flex-1 text-center">Reset with Email</span>
                </>
              )}
            </button>
          }
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
          {inputMode === 'email' ? (
            <FormInput
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          ) : (
            <div className="relative mb-4">
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
              <div className="border-t border-solid border-gray-200"></div>
              <div className="flex flex-row items-center space-x-2 p-3">
                <label htmlFor="phone" className="text-sm text-gray-400">Phone Number</label>
                <div className="h-4 w-px bg-gray-300"></div>
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
          )}
          <p className="text-[10px] font-semibold text-gray-500 mb-2 px-4">
            You'll receive instructions to reset your password.
          </p>
        </FormContainer>
      </div>
    </PageLayout>
  );
};

export default RequestPasswordReset;
