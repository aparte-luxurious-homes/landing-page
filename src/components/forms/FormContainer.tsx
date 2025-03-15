import React from 'react';

interface FormContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  error?: string;
  success?: string;
  loading?: boolean;
  submitText?: string;
  alternateOptions?: React.ReactNode;
  footerContent?: React.ReactNode;
  submitButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
}

const FormContainer: React.FC<FormContainerProps> = ({
  title,
  subtitle = "Welcome to Aparte",
  children,
  onSubmit,
  error,
  success,
  loading = false,
  submitText,
  alternateOptions,
  footerContent,
  submitButtonProps
}) => {
  return (
    <div className="w-full max-w-md bg-white shadow-md rounded-xl border border-solid border-black mx-4 md:mx-0 scale-[0.98] md:scale-100">
      <form onSubmit={onSubmit} className="px-2 md:px-0">
        <div className="mb-1 py-4">
          <h2 className="text-xl font-semibold text-center">{title}</h2>
        </div>

        <div className="border-t border-solid border-gray-300 w-full mb-4"></div>

        <div className="mb-4 px-4 md:px-6">
          <h3 className="text-md font-medium mb-3 pl-3 text-[#028090]">
            {subtitle}
          </h3>

          {children}

          {error && <p className="text-red-500 text-xs mb-2 px-4">{error}</p>}
          {success && <p className="text-[#028090] text-xs mb-2 px-4">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            {...submitButtonProps}
            onClick={(e) => {
              console.log('FormContainer button clicked');
              submitButtonProps?.onClick?.(e);
            }}
            className={`w-[95%] bg-[#028090] text-white rounded-lg py-3 ml-3 transition-colors ${
              loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#026d7a] cursor-pointer active:bg-[#025e6b]'
            } ${submitButtonProps?.className || ''}`}
          >
            {loading ? 'Processing...' : submitText}
          </button>
        </div>

        {alternateOptions && (
          <>
            <div className="flex items-center justify-center mt-4 px-9">
              <div className="border-t border-solid border-gray-300 flex-1"></div>
              <span className="px-6 text-gray-500">or</span>
              <div className="border-t border-solid border-gray-300 flex-1"></div>
            </div>
            <div className="space-y-3 mb-4 pl-9 mt-2">
              {alternateOptions}
            </div>
          </>
        )}

        {footerContent && (
          <div className="mb-4">
            {footerContent}
          </div>
        )}
      </form>
    </div>
  );
};

export default FormContainer; 