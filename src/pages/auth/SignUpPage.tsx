import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { OTPVerification } from "./OTPVerification";
import EmailInput from "./EmailInput";
import { toast, ToastContainer } from "react-toastify";
import UserTypeSection from "../../components/UserTypeSection";
import { setRole, setPhone as setPhoneAction, setAuthUser } from "../../features/auth/authSlice";
import { useSignupMutation, useLoginMutation } from "../../api/authApi";
import { useDispatch } from "react-redux";
import PageLayout from "../../components/pagelayout/index";
import { FaEye, FaEyeSlash } from "react-icons/fa";

type UserType = "GUEST" | "OWNER" | "AGENT";

const SignUp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const pageType = searchParams.get("type") as UserType;

  const [country, setCountry] = useState("Nigeria (+234)");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState(""); // For Home Owner sign-up
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"selectType" | "signup" | "otp" | "email">("signup");
  const [userType, setUserType] = useState<UserType>(pageType);
  const [, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState(""); // Store the generated OTP
  const [passwordVisible, setPasswordVisible] = useState(false);

  const [signup] = useSignupMutation();
  const [login] = useLoginMutation();
  const dispatch = useDispatch();

  // Function to generate a random OTP
  const generateOtp = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    console.log("Generated OTP:", otp); // Log the OTP for testing purposes
  };

  // Handle phone form submission
  const handlePhoneSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      setError("Please enter a valid 10-digit phone number.");
      setLoading(false);
      return;
    }

    try {
      const result: { message: string; data: { role: string; email: string; phone: string } } = await signup({
        phone,
        password,
        role: userType,
      }).unwrap();

      const { message, data } = result;
      setSuccess(message);
      dispatch(setRole(data.role));
      dispatch(setPhoneAction(data.phone));

      // Generate and store the OTP
      generateOtp();

      setTimeout(() => {
        setStep("otp");
      }, 3000);
    } catch (err: any) {
      setLoading(false);
      if (err.data && err.data.errors && err.data.errors.length > 0) {
        setError(err.data.errors[0].message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpComplete = async (enteredOtp: string) => {
    if (enteredOtp === generatedOtp) {
      setOtp(enteredOtp);
      toast.info(`OTP Verified Successfully! OTP: ${enteredOtp}`);
      // Log in the user and redirect to home page
      await handleLogin();
    } else {
      toast.info("Invalid OTP. Please try again.");
    }
  };

  const handleLogin = async () => {
    try {
      const result = await login({
        phone,
        password,
        role: userType,
      }).unwrap();

      const { authorization, user } = result;
      dispatch(setAuthUser({ id: user.id, token: authorization.token, role: user.role }));
      toast.info("You have signed in successfully!");
      navigate("/"); // Redirect to home page
    } catch (err: any) {
      console.error("Login failed:", err);
      setError("Login failed. Please try again.");
    }
  };

  const handleResendOtp = () => {
    generateOtp();
    toast.info("OTP Resent!");
  };

  const handleEmailSignUp = () => {
    setStep("email");
  };

  const handleUserTypeSelect = (selectedUserType: "GUEST" | "OWNER" | "AGENT") => {
    setUserType(selectedUserType);
    setStep("signup");
  };

  return (
    <PageLayout
      children={
        <div className="flex justify-center items-center min-h-screen pt-12 md:pt-40">
          {step === "selectType" && <UserTypeSection onSelect={handleUserTypeSelect} />}
    
          {step === "signup" && (
            <form
              className="w-full max-w-md bg-white shadow-md rounded-xl border border-solid border-black"
              onSubmit={handlePhoneSubmit}
            >
              <div className="mb-1 py-4">
                <h2 className="text-xl font-semibold text-center">Sign Up</h2>
              </div>
    
              <div className="border-t border-solid border-gray-300 w-full mb-4"></div>
    
              <div className="mb-4 px-6">
                <h3 className="text-md font-medium mb-3 pl-3 text-[#028090]">Welcome to Aparte</h3>
    
                {userType === "OWNER" && (
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
                      <label htmlFor="phone" className="text-sm text-gray-400">Phone Number</label>
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
    
                <div className="mb-4 px-2 ml-1">
                  <div className="mb-2 relative">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      type={passwordVisible ? "text" : "password"}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border text-xs border-black rounded-lg py-4 pl-6 focus:outline-none focus:ring-2 focus:ring-[#028090]"
                      placeholder="Password"
                      autoComplete="current-password"
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
                  You’ll receive an OTP to verify your phone number. Standard messages and data rates may apply.
                </p>
    
                {error && <p className="text-red-500 text-xs mb-2 px-4">{error}</p>}
                {success && <p className="text-[#028090] text-xs mb-2 px-4">{success}</p>}
    
                <button
                  type="submit"
                  className="w-[95%] bg-[#028090] text-white rounded-lg py-3 ml-3 hover:bg-[#028090] transition-colors"
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Continue"}
                </button>
              </div>
    
              <div className="space-y-3 mb-8 pl-8 mt-2">
              <button
                  className="w-[93%] bg-white border border-gray-300 rounded-md py-3 flex items-center hover:bg-gray-100 transition-colors"
                  onClick={handleEmailSignUp} 
                >
                  <img
                    src="/email.png"
                    alt="Email Icon"
                    className="ml-4 h-3 w-3"
                  />
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
            </form>
          )}

          {step === "otp" && (
            <div className="w-full max-w-md bg-white shadow-md rounded-xl border border-solid border-black">
            <OTPVerification
              onComplete={handleOtpComplete}
              onResend={handleResendOtp}
              maxLength={6}
              email={email}
              phone={phone}
            />
          
          </div>
          )}

          {step === "email" && (
            <div className="w-full max-w-md  p-6">
            <EmailInput onComplete={(email) => setEmail(email)} mode="signup" role={userType} />
            </div>
          )}
          <ToastContainer />
        </div>
      }
    />
  );
};

export default SignUp;