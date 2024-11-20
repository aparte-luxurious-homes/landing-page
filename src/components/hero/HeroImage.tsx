import React from "react";

interface HeroImageProps {
  src: string;
  alt: string;
}

const HeroImage: React.FC<HeroImageProps> = ({ src, alt }) => {
  return (
    <div className="relative w-full aspect-[3.06] max-md:max-w-full rounded-t-none overflow-hidden lg-md:rounded-t-4xl rounded-b-4xl min-h-[25rem]">
      <img
        loading="lazy"
        src={src}
        alt={alt}
        className="object-cover w-full h-full"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(2, 128, 144, 0) 0%, rgba(2, 128, 144, 1) 80%, rgba(102, 102, 102, 1) 100%)",
          opacity: 0.5,
        }}
      ></div>
    </div>
  );
};

export default HeroImage;