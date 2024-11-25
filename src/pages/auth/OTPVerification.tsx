import * as React from 'react';
import { PersonalDetailsForm, PersonalDetailsFormData } from './PersonalDetails'; // Make sure to adjust the path

interface OTPVerificationProps {
  onComplete?: (otp: string) => void;
  onResend?: () => void;
  maxLength?: number;
}

export const OTPVerification: React.FC<OTPVerificationProps> = ({
  onComplete = () => {},
  onResend = () => {},
  maxLength = 6
}) => {
  const [otp, setOtp] = React.useState<string[]>(Array(maxLength).fill(''));
  const [isOtpConfirmed, setIsOtpConfirmed] = React.useState(false); // State to track OTP confirmation
  const [isPersonalDetailsVisible, setIsPersonalDetailsVisible] = React.useState(false); // State for personal details form visibility
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < maxLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every(digit => digit) && newOtp.length === maxLength) {
      setIsOtpConfirmed(true); // Set OTP confirmation when complete
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
      setIsOtpConfirmed(true); // Set OTP confirmation when complete
      onComplete(newOtp.join(''));
    }

    if (inputRefs.current[pastedData.length - 1]) {
      inputRefs.current[pastedData.length - 1]?.focus();
    }
  };


  return (
    <main className="flex flex-col max-w-[600px]">
      {!isPersonalDetailsVisible ? (
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
                setIsOtpConfirmed(true); // Set OTP confirmation when complete
                onComplete(otp.join(''));
                setIsPersonalDetailsVisible(true); // Show personal details form
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
        <PersonalDetailsForm onSubmit={function (_data: PersonalDetailsFormData): void {
            throw new Error('Function not implemented.');
          } } /> // Render personal details form after OTP confirmation
      )}
    </main>
  );
};
