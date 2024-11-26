import React, { useState } from "react";
import { OTPVerification } from "./OTPVerification"; // Adjust the import path

interface EmailInputProps {
  onComplete?: (email: string) => void;
}

const EmailInput = ({ onComplete }: EmailInputProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false); // State to control OTP visibility

  // Handle email form submission
  const handleEmailSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Reset messages
    setError("");
    setSuccess("");

    // Validate email address
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Simulate email submission
    setSuccess("Verification link has been sent to your email.");
    setShowOtpInput(true); // Show OTP input after successful email submission
    onComplete && onComplete(email); // Notify parent component if provided
  };

  // Handle OTP completion
  const handleOtpComplete = (otp: string) => {
    console.log("OTP entered:", otp);
    setSuccess("OTP verified successfully!");
    // Proceed to the next step or show the personal details form here
  };

  return (
    <div className="w-full max-w-md bg-white shadow-md rounded-xl border border-solid border-black">
      {!showOtpInput ? (
        // Email and Password Form
        <form onSubmit={handleEmailSubmit}>
          <div className="mb-1 py-4">
            <h2 className="text-xl font-semibold text-center">Login with Email</h2>
          </div>

          <div className="border-t border-solid border-gray-300 w-full mb-4"></div>

          <div className="mb-4 px-6">
            <h3 className="text-md font-medium mb-3 pl-3 text-[#028090]">
              Welcome to Aparte
            </h3>

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
              <div className="mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border text-xs border-black rounded-lg py-4 pl-6 focus:outline-none focus:ring-2 focus:ring-[#028090]"
                  placeholder="Password"
                />
              </div>
            </div>

            <p className="text-[10px] font-semibold text-gray-500 mb-2 px-4">
              You’ll receive an OTP to verify your email.
            </p>

            {error && <p className="text-red-500 text-xs mb-2 px-4">{error}</p>}
            {success && <p className="text-[#028090] text-xs mb-2 px-4">{success}</p>}

            <button
              type="submit"
              className="w-[95%] bg-[#028090] text-white rounded-lg py-3 ml-3 hover:bg-[#028090] transition-colors"
            >
              Continue
            </button>
          </div>

          {/* Divider and Alternate Login Options */}
          <div className="flex items-center justify-center my-4 px-9">
            <div className="border-t border-solid border-gray-300 flex-1"></div>
            <span className="px-6 text-gray-500">or</span>
            <div className="border-t border-solid border-gray-300 flex-1"></div>
          </div>

          <div className="space-y-3 mb-8 pl-9 mt-2">
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
              <span className="flex-1 text-center">Continue with Phone Number</span>
            </button>
          </div>
        </form>
      ) : (
        // OTP Verification Component
        <OTPVerification
          onComplete={handleOtpComplete}
          onResend={() => {
            console.log("Resend OTP");
          }}
          maxLength={6} // Define the OTP length here
        />
      )}
    </div>
  );
};

export default EmailInput;
