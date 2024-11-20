import * as React from 'react';

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

    if (inputRefs.current[pastedData.length - 1]) {
      inputRefs.current[pastedData.length - 1]?.focus();
    }
  };

  return (
    <main className="flex flex-col max-w-[700px]">
      <section 
        className="flex flex-col items-center pt-7 pb-16 w-full bg-white border border-solid shadow-2xl border-cyan-700 rounded-[30px] max-md:max-w-full"
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

        <h2 className="mt-7 text-xl font-medium text-cyan-700">
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
              onComplete(otp.join(''));
            }
          }}
        >
          <div 
            className="flex gap-4 mt-10 max-w-full w-[390px]"
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
                className="flex shrink-0 rounded-lg border border-solid border-zinc-500 h-[60px] w-[53px] text-center text-xl focus:border-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-700"
                required
              />
            ))}
          </div>

          <button
            type="submit"
            className="px-16 py-6 mt-12 w-full text-xl font-medium text-center text-white whitespace-nowrap bg-cyan-700 rounded-xl max-w-[600px] max-md:px-5 max-md:mt-10 max-md:max-w-full hover:bg-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-700 focus:ring-offset-2"
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
              className="font-medium text-cyan-700 hover:text-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-700 focus:rounded"
              aria-label="Resend OTP code"
              >
                  Resend
           </button>
        </div>
      </section>
    </main>
  );
};