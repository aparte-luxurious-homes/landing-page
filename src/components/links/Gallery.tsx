import Image from "next/image";

import type { Media } from "@/lib/links/types";

/** Hero + thumbnail strip. The hero is the LCP element — eager, priority. */
export default function Gallery({ media, alt }: { media: Media[]; alt: string }) {
  const images = media.filter((m) => m.media_type === "IMAGE" && m.media_url);
  if (images.length === 0) {
    return (
      <div className="flex aspect-[16/9] w-full items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400">
        No photos yet
      </div>
    );
  }

  const hero = images.find((m) => m.is_featured) ?? images[0];
  const rest = images.filter((m) => m.id !== hero.id).slice(0, 4);

  return (
    <div>
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-neutral-100">
        <Image
          src={hero.media_url}
          alt={alt}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-cover"
        />
      </div>
      {rest.length > 0 && (
        <div className="mt-2 grid grid-cols-4 gap-2">
          {rest.map((m) => (
            <div
              key={m.id}
              className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100"
            >
              <Image
                src={m.media_url}
                alt=""
                fill
                loading="lazy"
                sizes="25vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
