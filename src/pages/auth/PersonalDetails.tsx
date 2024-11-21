import * as React from 'react';

// TypeScript interfaces for the form data and props
export interface PersonalDetailsFormData {
  fullName: string;
  password: string;
  confirmPassword: string;
}

export interface PersonalDetailsProps {
  onSubmit: (data: PersonalDetailsFormData) => void;
  initialData?: Partial<PersonalDetailsFormData>;
}

// UserGuidelines Component
const UserGuidelines: React.FC = () => (
  <div className="modal-content">
    <h2 className="text-xl font-medium text-zinc-900 mb-5">User Guidelines</h2>
    <p className="text-base text-zinc-500 mb-4">
      Here are the terms and conditions for Aparte Nigeria. You must accept these to continue using the platform...
    </p>
    <button className="px-4 py-2 bg-red-600 text-white rounded-lg" onClick={() => window.location.reload()}>
      Close
    </button>
  </div>
);

// The main PersonalDetailsForm component
export const PersonalDetailsForm: React.FC<PersonalDetailsProps> = ({
  onSubmit,
  initialData = {}
}) => {
  const [formData, setFormData] = React.useState<PersonalDetailsFormData>({
    fullName: initialData.fullName || '',
    password: initialData.password || '',
    confirmPassword: initialData.confirmPassword || ''
  });

  // State to manage the modal visibility
  const [showGuidelines, setShowGuidelines] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const fullNameId = React.useId();
  const passwordId = React.useId();
  const confirmPasswordId = React.useId();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="flex flex-col max-w-[700px] w-full">
        <section className="flex flex-col pt-7 pb-12 w-full bg-white border border-solid shadow-2xl border-zinc-900 rounded-[30px]">
          <h1 className="self-center text-xl font-medium text-zinc-900" tabIndex={0}>
            Personal Details
          </h1>

          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/5712b7e6f7ba146c7ed6e28e7419c3a45d682d722e66566f61b3e315a7ffcc12?placeholderIfAbsent=true&apiKey=6fef1693177a4b1ba49c835b63f52a64"
            className="object-contain mt-7 w-full aspect-[1000]"
            alt="Personal details illustration"
            role="presentation"
          />

          <form
            onSubmit={handleSubmit}
            className="flex flex-col px-12 mt-7 w-full max-md:px-5"
            noValidate
          >
            <div className="flex flex-col gap-8">
              <div role="group" aria-labelledby="personal-details-group">
                <h2 id="personal-details-group" className="text-xl font-medium text-zinc-900 mb-5">
                  Personal Details
                </h2>

                <div className="flex flex-col gap-2">
                  <label 
                    htmlFor={fullNameId}
                    className="text-base text-zinc-500"
                  >
                    Full name
                  </label>
                  <input
                    id={fullNameId}
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="p-4 rounded-xl border border-solid border-zinc-500 text-xl font-medium text-zinc-900"
                    required
                    aria-required="true"
                  />
                </div>
              </div>

              <div role="group" aria-labelledby="password-group">
                <h2 id="password-group" className="text-xl font-medium text-zinc-900 mb-5">
                  Password
                </h2>

                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <label 
                      htmlFor={passwordId}
                      className="text-base text-zinc-500"
                    >
                      Password
                    </label>
                    <input
                      id={passwordId}
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="p-4 rounded-xl border border-solid border-zinc-500"
                      required
                      aria-required="true"
                      minLength={8}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label 
                      htmlFor={confirmPasswordId}
                      className="text-base text-zinc-500"
                    >
                      Confirm Password
                    </label>
                    <input
                      id={confirmPasswordId}
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="p-4 rounded-xl border border-solid border-zinc-500"
                      required
                      aria-required="true"
                      minLength={8}
                    />
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-2.5 text-sm text-zinc-900">
              By clicking <span className="font-medium">'continue'</span> You agree to have accepted the{" "}
              <a
                href="#"
                className="font-medium underline"
                onClick={(e) => {
                  e.preventDefault();
                  setShowGuidelines(true); // Show modal when clicked
                }}
              >
                Aparte Nigeria Terms and Conditions
              </a>
            </p>

            <button
              type="submit"
              className="px-16 py-6 mt-8 text-xl font-medium text-center text-white bg-[#028090] rounded-xl hover:bg-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-700 focus:ring-offset-2 transition-colors"
              aria-label="Continue with personal details"
            >
              Continue
            </button>
          </form>
        </section>
      </div>

      {/* Modal for user guidelines */}
      {showGuidelines && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-8 w-1/2">
            <UserGuidelines />
          </div>
        </div>
      )}
    </main>
  );
};
