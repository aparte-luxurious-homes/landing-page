import React from "react";

interface HeroImageProps {
  src: string;
  alt: string;
}

const HeroImage: React.FC<HeroImageProps> = ({ src, alt }) => {
  return (
    <div className="relative w-full aspect-[3.06] max-md:max-w-full overflow-hidden  min-h-[25rem]">
      <img
        loading="lazy"
        src={src}
        alt={alt}
        className="object-cover h-full"
      />
      <div
        className="absolute inset-0"
      ></div>
    </div>
  );
};

export default HeroImage;