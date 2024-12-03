import * as React from 'react';
import { useNavigate } from 'react-router-dom';  
import Logo from '../../assets/images/Logo.png'; 
interface OTPVerificationProps {
  onComplete?: (otp: string) => void;
  onResend?: () => void;
  maxLength?: number;
}

export const OTPVerification: React.FC<OTPVerificationProps> = ({
  onComplete = () => {},
  onResend = () => {},
  maxLength = 6,
}) => {
  const [otp, setOtp] = React.useState<string[]>(Array(maxLength).fill(''));
  const [isOtpConfirmed, setIsOtpConfirmed] = React.useState(false);
  const [isGuidelineVisible, setIsGuidelineVisible] = React.useState(false); 
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  const navigate = useNavigate(); 

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < maxLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every(digit => digit) && newOtp.length === maxLength) {
      setIsOtpConfirmed(true);
      onComplete(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').slice(0, maxLength);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split('').forEach((digit, index) => {
      if (index < maxLength) {
        newOtp[index] = digit;
      }
    });
    setOtp(newOtp);

    if (newOtp.every(digit => digit) && newOtp.length === maxLength) {
      setIsOtpConfirmed(true); 
      onComplete(newOtp.join(''));
    }

    if (inputRefs.current[pastedData.length - 1]) {
      inputRefs.current[pastedData.length - 1]?.focus();
    }
  };

  const onAgreeContinue = () => {
    navigate('/'); 
  };

  return (
    <main className="flex flex-col max-w-[600px]">
      {!isGuidelineVisible ? (
        <section 
          className="flex flex-col items-center pt-7 pb-16 w-full bg-white border border-solid shadow-2xl border-[#028090] rounded-[30px] max-md:max-w-full relative"
          role="region"
          aria-labelledby="otp-title"
        >
          <h1 id="otp-title" className="ml-4 text-xl font-medium text-center text-zinc-900">
            OTP Confirmation
          </h1>

          <img 
            loading="lazy" 
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/5712b7e6f7ba146c7ed6e28e7419c3a45d682d722e66566f61b3e315a7ffcc12?placeholderIfAbsent=true&apiKey=6fef1693177a4b1ba49c835b63f52a64" 
            alt="OTP verification illustration"
            className="object-contain self-stretch mt-7 w-full aspect-[1000] max-md:max-w-full" 
          />

          <h2 className="mt-7 text-xl font-medium text-[#028090]">
            Enter OTP
          </h2>

          <p className="mt-2.5 text-sm text-center text-zinc-900 w-[359px]">
            Enter the 'One Time Password' sent to your email or phone number
          </p>

          <form 
            className="flex flex-col items-center w-full"
            onSubmit={(e) => {
              e.preventDefault();
              if (otp.every(digit => digit)) {
                setIsOtpConfirmed(true); 
                setIsGuidelineVisible(true); 
              }
            }}
          >
            <div 
              className="flex gap-4 mt-10 max-w-full w-[390px] relative"
              role="group"
              aria-label="OTP input fields"
            >
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleChange(index, e.target.value)}
                  onKeyDown={e => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  aria-label={`Digit ${index + 1} of ${maxLength}`}
                  className="flex shrink-0 rounded-lg border border-solid border-zinc-500 h-[60px] w-[53px] text-center text-xl focus:border-[#028090] focus:outline-none focus:ring-2 focus:ring-cyan-700"
                  required
                />
              ))}

              {/* OTP Confirmed Button */}
              {isOtpConfirmed && (
                <button 
                  className="absolute top-[-20px] right-[-30px] px-2 py-1 text-sm font-medium text-white bg-[#028090] rounded-md shadow-md"
                  aria-label="OTP Confirmed"
                >
                  OTP Confirmed
                </button>
              )}
            </div>

            <button
              type="submit"
              className="px-10 py-6 mt-12 w-full text-xl font-medium text-center text-white whitespace-nowrap bg-[#028090] rounded-xl max-w-[550px] max-md:px-5 max-md:mt-10 max-md:max-w-full max-sm:w-[500px] hover:bg-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-700 focus:ring-offset-2"
              disabled={!otp.every(digit => digit)}
            >
              Continue
            </button>
          </form>

          <div className="flex flex-row items-center gap-1 mt-8 text-sm">
            <p className="text-zinc-900 whitespace-nowrap">Didn't receive OTP?</p>
            <button
              type="button"
              onClick={onResend}
              className="font-medium text-[#028090] hover:text-cyan-800 focus:outline-none focus:ring-2 focus:ring-[#028090] focus:rounded"
              aria-label="Resend OTP code"
            >
              Resend
            </button>
          </div>
        </section>
      ) : (
        // User Guidelines Section
        <section className="max-w-4xl mx-auto border border-solid border-black p-6 bg-white rounded-lg shadow-md">
          {/* Logo Header */}
          <div className="flex items-center">
            <img src={Logo} alt="Aparte Nigeria Logo" className="h-8 w-auto" />
          </div>
      
          {/* Divider */}
          <hr className="my-4 w-full border-t border-gray-500" /> {/* Ensure full-width divider */}
      
          {/* Guidelines Header */}
          <h2 className="text-lg font-semibold text-left text-black mb-4">Aparte Nigeria User Guidelines</h2>
      
          {/* Guidelines Text */}
          <div className="text-gray-700 text-sm mb-4">
            <p>
              We’re thrilled to have you join our community dedicated to connecting you with luxury apartment listings across Nigeria.
              <br />
              As you begin your journey to find the perfect space, please take a moment to review and agree to our platform’s terms and conditions.
            </p>
          </div>
      
          {/* Acknowledgment Text */}
          <div className="text-gray-700 text-sm mb-6">
            <p>
            By continuing, you acknowledge your commitment to use Aparte Nigeria responsibly and in line with our guidelines, designed to maintain a safe and trustworthy environment for all users.
            </p>
          </div>

            {/* Terms and Conditions Link */}
        <div className="text-sm text-black mb-6">
          <p>
            By clicking 'Continue', you agree to have accepted the <a href="/terms-and-conditions" className="underline font-medium">Aparte Nigeria Terms and Conditions</a>.
          </p>
        </div>
      
          {/* Continue Button */}
          <div className="flex flex-col items-center mt-8">
            <button
              className="w-full text-xl font-semibold text-white bg-[#028090] hover:bg-cyan-800 py-3 px-10 rounded-lg"
              onClick={onAgreeContinue}
              aria-label="Agree and continue to homepage"
            >
              Agree and Continue
            </button>
          </div>
        </section>
      )}
    </main>
  );
};
