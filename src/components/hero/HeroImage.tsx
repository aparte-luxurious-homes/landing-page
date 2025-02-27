import React from "react";
import { SxProps, Theme } from "@mui/material";

interface HeroImageProps {
  src: string;
  alt: string;
  sx?: SxProps<Theme>;
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

export default HeroImage;