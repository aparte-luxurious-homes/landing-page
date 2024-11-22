import React from 'react';

// Types
export interface UserGuidelinesProps {
  onContinue?: () => void;
  termsLink?: string;
  logoSrc?: string;
  headerImageSrc?: string;
}

export interface ImageProps {
  src: string;
  alt: string;
  className?: string;
}

// GuidelineImage Component
const GuidelineImage: React.FC<ImageProps> = ({ src, alt, className }) => (
  <img
    loading="lazy"
    src={src}
    alt={alt}
    className={className}
    role="img"
    aria-label={alt}
  />
);

// UserGuidelines Component
export const UserGuidelines: React.FC<UserGuidelinesProps> = ({
  onContinue = () => {},
  termsLink = '#terms',
  logoSrc = 'https://cdn.builder.io/api/v1/image/assets/TEMP/9a1b0d14d3de947aced63f09919ee35260e2237dd5ea877a1c9850c287ae2494?placeholderIfAbsent=true&apiKey=6fef1693177a4b1ba49c835b63f52a64',
  headerImageSrc = 'https://cdn.builder.io/api/v1/image/assets/TEMP/5712b7e6f7ba146c7ed6e28e7419c3a45d682d722e66566f61b3e315a7ffcc12?placeholderIfAbsent=true&apiKey=6fef1693177a4b1ba49c835b63f52a64'
}) => {
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      onContinue();
    }
  };

  return (
    <main 
      className="flex flex-col text-xl font-medium max-w-[700px] text-zinc-900"
      role="main"
      aria-labelledby="guidelines-title"
    >
      <article 
        className="flex flex-col pt-8 pb-12 w-full bg-white border border-solid shadow-2xl border-zinc-900 rounded-[30px] max-md:max-w-full"
        role="article"
      >
        <GuidelineImage
          src={logoSrc}
          alt="Aparte Nigeria Logo"
          className="object-contain ml-12 aspect-[1.47] w-[47px] max-md:ml-2.5"
        />
        <GuidelineImage
          src={headerImageSrc}
          alt="Guidelines Header Illustration"
          className="object-contain mt-5 w-full aspect-[1000] max-md:max-w-full"
        />
        
        <section 
          className="flex flex-col px-12 mt-7 w-full max-md:px-5 max-md:max-w-full"
          aria-labelledby="guidelines-content"
        >
          <h1 
            id="guidelines-title"
            className="self-start text-2xl text-cyan-700"
          >
            Aparte Nigeria users guidelines
          </h1>
          
          <div 
            className="mt-8 leading-8 text-justify max-md:max-w-full"
            role="contentinfo"
          >
            <p>
              We're thrilled to have you join our community dedicated to
              connecting you with luxury apartment listings across Nigeria. As you
              begin your journey to find the perfect space, please take a moment
              to review and agree to our platform's terms and conditions.
            </p>
            <p className="mt-4">
              By continuing, you acknowledge your commitment to use Aparte Nigeria
              responsibly and in line with our guidelines, designed to maintain a
              safe and trustworthy environment for all users.
            </p>
          </div>
          
          <p 
            className="self-start mt-6 text-sm underline decoration-auto decoration-solid underline-offset-auto max-md:max-w-full"
            role="note"
          >
            By clicking <span className="font-medium">'continue'</span> You
            agree to have accepted the{" "}
            <a 
              href={termsLink}
              className="font-medium underline"
              role="link"
              aria-label="Read Aparte Nigeria Terms and Conditions"
            >
              Aparte Nigeria Terms and Conditions
            </a>
          </p>
          
          <button
            onClick={onContinue}
            onKeyPress={handleKeyPress}
            className="px-16 py-6 mt-8 text-center text-white bg-cyan-700 rounded-xl max-md:px-5 max-md:max-w-full hover:bg-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:ring-offset-2"
            type="button"
            role="button"
            aria-label="Agree and Continue"
          >
            Agree / Continue
          </button>
        </section>
      </article>
    </main>
  );
};
