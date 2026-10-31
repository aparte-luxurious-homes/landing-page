'use client';

import React, { useState, useRef, useCallback } from 'react';
import { IconButton } from '@mui/material';
import PlaceCard from "../assets/images/placecard.png";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Keyboard } from 'swiper/modules';
// Swiper ships NO styles with its components. The lightbox is the only Swiper
// left on this page; the hero itself is native scroll-snap.
import 'swiper/css';
import 'swiper/css/navigation';
import {
  Close as CloseIcon,
  IosShare as ShareIcon,
  GridViewRounded as GridIcon,
  PlayArrowRounded as PlayIcon,
  ChevronLeft as PrevIcon,
  ChevronRight as NextIcon,
} from '@mui/icons-material';

interface MediaItem {
  fileUrl?: string;
  media_url?: string;
  mediaUrl?: string;
  media_type?: string;
  mediaType?: string;
}

interface ApartmentHeroProps {
  title: string | undefined;
  unit: { media: MediaItem[] } | null;
  images: MediaItem[];
  /** Title block drawn over the bottom of the photo. */
  children?: React.ReactNode;
}

const toItem = (img: MediaItem) => ({
  url: img.media_url || img.mediaUrl || img.fileUrl || '',
  type: (img.media_type || img.mediaType || 'IMAGE') as string,
});

const fallbackSrc = (PlaceCard as unknown as { src?: string }).src ?? '';

/**
 * Immersive hero: the photo IS the top of the page, with the name set over it.
 * Phones get a tall full-bleed swipe gallery that the content sheet slides up
 * over; desktop gets a cinematic banner with a thumbnail rail.
 */
const ApartmentHero: React.FC<ApartmentHeroProps> = ({ title, unit, images: propImages, children }) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [slide, setSlide] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  const showLightbox = lightboxIndex !== null;
  const openLightbox = useCallback((index: number) => setLightboxIndex(index), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const mediaItems = [...(unit?.media ?? []), ...(propImages ?? [])].map(toItem);
  const total = mediaItems.length;
  const label = title || 'Property';
  const slides = total ? mediaItems : [{ url: '', type: 'IMAGE' }];

  const goTo = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const next = (i + total) % total;
    el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' });
  };

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const next = Math.round(el.scrollLeft / el.clientWidth);
    if (next !== slide) setSlide(next);
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: label, url });
      else await navigator.clipboard.writeText(url);
    } catch {
      /* dismissed share sheet / clipboard blocked: nothing to recover */
    }
  };

  const glass =
    'flex items-center gap-1.5 rounded-full bg-black/40 text-white text-[13px] font-semibold px-3.5 py-2 border border-white/25 backdrop-blur-md cursor-pointer';

  return (
    <div className="relative w-[95%] mx-auto mt-4">
      <div className="relative w-full overflow-hidden rounded-[32px] md:rounded-b-[40px] bg-[#028090]" style={{ height: 'min(80svh, 680px)' }}>
        {/* Photos */}
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="absolute inset-0 flex overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {slides.map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={() => openLightbox(i)}
              aria-label={`Open ${label} photo ${i + 1}`}
              className="relative snap-center shrink-0 w-full h-full p-0 border-0 cursor-pointer bg-transparent"
            >
              {item.type === 'VIDEO' ? (
                <>
                  <video src={item.url} muted playsInline preload="metadata" className="w-full h-full object-cover" />
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-black/55 flex items-center justify-center text-white">
                    <PlayIcon fontSize="large" />
                  </span>
                </>
              ) : (
                <img
                  src={item.url || fallbackSrc}
                  alt={`${label} — photo ${i + 1}`}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              )}
            </button>
          ))}
        </div>

        {/* Scrims: top for the controls, deep bottom for the title. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/45 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-[#353a3b] to-transparent" />

        {/* Controls */}
        <div className="absolute top-4 left-4 md:left-8 right-4 md:right-8 flex items-start justify-between">
          {total > 0 ? (
            <button type="button" onClick={() => openLightbox(slide)} className={glass}>
              <GridIcon sx={{ fontSize: 16 }} />
              {slide + 1} / {total}
            </button>
          ) : (
            <span />
          )}
          <button type="button" onClick={share} aria-label="Share this property" className={glass}>
            <ShareIcon sx={{ fontSize: 16 }} />
            Share
          </button>
        </div>

        {/* Desktop arrows */}
        {total > 1 && (
          <>
            <IconButton
              onClick={() => goTo(slide - 1)}
              aria-label="Previous photo"
              sx={{ display: { xs: 'none', md: 'flex' }, position: 'absolute', left: 24, top: '42%', bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: '#fff' } }}
            >
              <PrevIcon />
            </IconButton>
            <IconButton
              onClick={() => goTo(slide + 1)}
              aria-label="Next photo"
              sx={{ display: { xs: 'none', md: 'flex' }, position: 'absolute', right: 24, top: '42%', bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: '#fff' } }}
            >
              <NextIcon />
            </IconButton>
          </>
        )}

        {/* Title block */}
        <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-[1536px] px-4 md:px-8 pb-8 md:pb-10 pointer-events-none">
          <div className="pointer-events-auto">{children}</div>
        </div>

        {/* Desktop thumbnail rail */}
        {total > 1 && (
          <div className="hidden md:flex absolute right-8 bottom-10 gap-2">
            {mediaItems.slice(0, 5).map((m, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Show photo ${i + 1}`}
                className={`w-16 h-16 rounded-2xl overflow-hidden p-0 cursor-pointer border-2 ${
                  i === slide ? 'border-white' : 'border-white/20 opacity-80'
                }`}
              >
                {m.type === 'VIDEO' ? (
                  <video src={m.url} muted preload="metadata" className="w-full h-full object-cover" />
                ) : (
                  <img src={m.url} alt="" loading="lazy" className="w-full h-full object-cover" />
                )}
              </button>
            ))}
            {total > 5 && (
              <button type="button" onClick={() => openLightbox(0)} className="w-16 h-16 rounded-2xl bg-white/90 text-[#191919] text-sm font-bold cursor-pointer border-0">
                +{total - 5}
              </button>
            )}
          </div>
        )}

      </div>

      {total > 0 && showLightbox && (
        <div role="dialog" aria-modal="true" aria-label={`${label} photos`} className="fixed inset-0 z-[1400] bg-black/95 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 shrink-0">
            <span ref={counterRef} className="text-white text-sm font-medium">
              {(lightboxIndex ?? 0) + 1} / {total}
            </span>
            <IconButton onClick={closeLightbox} sx={{ color: 'white' }} aria-label="Close lightbox">
              <CloseIcon />
            </IconButton>
          </div>
          <Swiper
            modules={[Navigation, Keyboard]}
            navigation
            keyboard={{ enabled: true }}
            initialSlide={lightboxIndex ?? 0}
            loop={total > 1}
            className="w-full flex-1 min-h-0 lightbox-swiper"
            onSlideChange={(s) => {
              if (counterRef.current) counterRef.current.textContent = `${s.realIndex + 1} / ${total}`;
            }}
          >
            {mediaItems.map((item, index) => (
              <SwiperSlide key={index} className="flex items-center justify-center">
                {item.type === 'VIDEO' ? (
                  <video src={item.url} controls playsInline preload="metadata" className="max-w-full max-h-full object-contain mx-auto" />
                ) : (
                  <img src={item.url} alt={`${label} — photo ${index + 1}`} className="max-w-full max-h-full object-contain mx-auto" />
                )}
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </div>
  );
};

export default ApartmentHero;
