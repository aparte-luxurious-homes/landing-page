import { useState } from "react";

interface EmailInputProps {
  onComplete?: (email: string) => void;
}

const EmailInput = ({ onComplete }: EmailInputProps) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
    // Add logic for successful email login here
    onComplete && onComplete(email); // Notify parent component if provided
  };

  return (
    <form
      className="w-full max-w-md bg-white shadow-md rounded-xl border border-solid border-black"
      onSubmit={handleEmailSubmit}
    >
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

        <p className="text-[10px] font-semibold text-gray-500 mb-2 px-4">
              You’ll receive an OTP to verify your email.
            </p>


        {error && (
          <p className="text-red-500 text-xs mb-2 px-4">{error}</p>
        )}
        {success && (
          <p className="text-[#028090] text-xs mb-2 px-4">{success}</p>
        )}

        <button
          type="submit"
          className="w-[95%] bg-[#028090] text-white rounded-lg py-3 ml-3 hover:bg-[#028090] transition-colors"
        >
          Continue
        </button>


         
        <div className="flex items-center justify-center my-4 px-8">
            <div className="border-t border-solid border-gray-300 flex-1"></div>
            <span className="px-6 text-gray-500">or</span>
            <div className="border-t border-solid border-gray-300 flex-1"></div>
          </div>

          <div className="space-y-3 mb-8 pl-3 mt-2">
            <button className="w-[97%] bg-white border border-gray-300 rounded-md py-3 flex items-center hover:bg-gray-100 transition-colors">
              <img
                src="https://img.icons8.com/color/16/000000/google-logo.png"
                alt="Google Logo"
                className="ml-3 h-3 w-3"
              />
              <span className="flex-1 text-center">Continue with Google</span>
            </button>
            <button className="w-[97%] bg-white  border border-gray-300 rounded-md py-3 flex items-center hover:bg-gray-100 transition-colors">
              <img
                src="https://img.icons8.com/ios-filled/16/000000/phone.png"
                alt="Phone Icon"
                className="ml-3 h-3 w-3" 
              />
              <span className="flex-1 text-center">Continue with Phone Number</span>
            </button>

          </div>

      </div>
    </form>
  );
};

export default EmailInput;
