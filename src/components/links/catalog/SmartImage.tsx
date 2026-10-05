import Image from "next/image";

import { isOptimisableHost } from "@/lib/listings/media";

interface SmartImageProps {
  src: string;
  alt: string;
  /** Layout-accurate `sizes` — this is what keeps a phone from downloading
   * a desktop-width photo for a 180px tile. */
  sizes: string;
  priority?: boolean;
  className?: string;
}

/**
 * A cover-fit image that goes through next/image when the host is one we
 * optimise, and a plain <img> otherwise (an unlisted host throws at render).
 * Always absolutely positioned: the parent sets the box and aspect.
 */
export default function SmartImage({
  src,
  alt,
  sizes,
  priority = false,
  className = "",
}: SmartImageProps) {
  if (isOptimisableHost(src)) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={`object-cover ${className}`}
      />
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={`absolute inset-0 h-full w-full object-cover ${className}`}
    />
  );
}
