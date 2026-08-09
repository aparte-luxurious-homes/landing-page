"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import type { Media } from "@/lib/links/types";

/**
 * Property media gallery — video first.
 *
 * A walkthrough video sells a short-let far better than a still, so when a
 * property has one it takes the hero slot and the photos drop to the
 * thumbnail strip. (The previous version filtered videos out entirely, so
 * they never appeared at all.)
 *
 * Protecting the <2.5s LCP budget on 3G, which a raw autoplaying video would
 * wreck:
 *   - `poster` is the featured image, so the hero paints immediately from an
 *     already-optimised still rather than waiting on the video.
 *   - `preload="metadata"` fetches headers, not the whole file.
 *   - The poster is a real <Image> for the no-video case, so image-only
 *     properties keep the previous priority-loaded behaviour.
 *
 * Autoplay is muted + playsInline (both required for mobile autoplay to be
 * allowed at all) and is paused for anyone with prefers-reduced-motion set.
 */
export default function Gallery({ media, alt }: { media: Media[]; alt: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const usable = media.filter((m) => m.media_url);
  const videos = usable.filter((m) => m.media_type === "VIDEO");
  const images = usable.filter((m) => m.media_type === "IMAGE");

  const heroVideo = videos.find((m) => m.is_featured) ?? videos[0];
  const heroImage = images.find((m) => m.is_featured) ?? images[0];

  // Honour reduced-motion without causing a hydration mismatch: render with
  // autoplay, then stand it down on the client if the user asked for less
  // motion.
  useEffect(() => {
    if (!videoRef.current) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (reduced?.matches) {
      videoRef.current.autoplay = false;
      videoRef.current.pause();
    }
  }, []);

  if (!heroVideo && !heroImage) {
    return (
      <div className="flex aspect-[16/9] w-full items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400">
        No photos yet
      </div>
    );
  }

  // Thumbnails: every image not already used as the hero still, plus any
  // additional videos.
  const thumbs = [
    ...videos.filter((m) => m.id !== heroVideo?.id),
    ...images.filter((m) => (heroVideo ? true : m.id !== heroImage?.id)),
  ].slice(0, 4);

  return (
    <div>
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-neutral-100">
        {heroVideo ? (
          <video
            ref={videoRef}
            src={heroVideo.media_url}
            poster={heroImage?.media_url}
            autoPlay
            muted
            loop
            playsInline
            controls
            preload="metadata"
            aria-label={`Video tour of ${alt}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <Image
            src={heroImage!.media_url}
            alt={alt}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        )}
      </div>

      {thumbs.length > 0 && (
        <div className="mt-2 grid grid-cols-4 gap-2">
          {thumbs.map((m) => (
            <div
              key={m.id}
              className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100"
            >
              {m.media_type === "VIDEO" ? (
                <video
                  src={m.media_url}
                  muted
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover"
                />
              ) : (
                <Image
                  src={m.media_url}
                  alt=""
                  fill
                  loading="lazy"
                  sizes="25vw"
                  className="object-cover"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
