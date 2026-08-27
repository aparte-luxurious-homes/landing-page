'use client';

import React, { useCallback, useEffect, useRef, useState } from "react";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import BedIcon from "@mui/icons-material/Bed";
import BathtubOutlinedIcon from "@mui/icons-material/BathtubOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import { Link } from '@/lib/router';
import SampleImg from "../../assets/images/Apartment/Bigimg.png";
import { formatRange, PropertyAggregates } from "../../utils/propertyAggregates";

interface ApartmentCardProps {
  /** Every still image for this listing, featured first. */
  images: string[];
  title: string;
  location: string;
  rating: number;
  reviews: number;
  hasUnits: boolean;
  minPrice: number;
  maxPrice: number;
  propertylink: string;
  aggregates?: PropertyAggregates;
  /** Drives the badge. Verification is the platform's central claim, and the
   *  card never showed it. */
  isVerified?: boolean;
}

const naira = (value: number) => `₦${value.toLocaleString("en-NG")}`;

/** Past this many photos the dot row gets unreadable; show a counter instead. */
const MAX_DOTS = 6;
/** Horizontal travel that separates a swipe from a tap. */
const SWIPE_THRESHOLD_PX = 40;

const ApartmentCard: React.FC<ApartmentCardProps> = ({
  images,
  title,
  location,
  rating,
  reviews,
  hasUnits,
  minPrice,
  maxPrice,
  propertylink,
  aggregates,
  isVerified = false,
}) => {
  const slides = images.length ? images : [SampleImg.src];
  const hasCarousel = slides.length > 1;

  const [index, setIndex] = useState(0);
  // Only images the guest has actually reached are requested. Rendering all
  // of them up front would be ~5 requests per card — 40 on the first screen —
  // and `loading="lazy"` does not help, since a translated slide still counts
  // as being in the viewport.
  const [loadedUpTo, setLoadedUpTo] = useState(0);
  const [failed, setFailed] = useState<Set<number>>(new Set());

  const touchStartX = useRef<number | null>(null);
  const didSwipe = useRef(false);

  useEffect(() => {
    setIndex(0);
    setLoadedUpTo(0);
    setFailed(new Set());
  }, [images]);

  const go = useCallback(
    (next: number) => {
      const clamped = (next + slides.length) % slides.length;
      setIndex(clamped);
      setLoadedUpTo((prev) => Math.max(prev, clamped));
    },
    [slides.length]
  );

  /** Arrows sit above the stretched link, so their clicks must not navigate. */
  const arrow = (delta: number) => (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    go(index + delta);
  };

  return (
    <article className="group relative flex flex-col items-start font-medium">
      <div
        className="relative w-full overflow-hidden rounded-xl bg-gray-100 aspect-[4/3]"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX;
          didSwipe.current = false;
        }}
        onTouchMove={(e) => {
          if (touchStartX.current === null) return;
          if (Math.abs(e.touches[0].clientX - touchStartX.current) > 10) {
            didSwipe.current = true;
          }
        }}
        onTouchEnd={(e) => {
          const start = touchStartX.current;
          touchStartX.current = null;
          if (start === null || !hasCarousel) return;
          const dx = e.changedTouches[0].clientX - start;
          if (Math.abs(dx) < SWIPE_THRESHOLD_PX) return;
          go(index + (dx < 0 ? 1 : -1));
        }}
        // A swipe ends in a click on the link underneath; swallow that one so
        // browsing photos never navigates away by accident.
        onClickCapture={(e) => {
          if (!didSwipe.current) return;
          e.preventDefault();
          e.stopPropagation();
          didSwipe.current = false;
        }}
      >
        <div
          className="flex h-full w-full transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((src, i) => (
            <div key={`${src}-${i}`} className="h-full w-full shrink-0">
              {i <= loadedUpTo && (
                <img
                  src={failed.has(i) ? SampleImg.src : src}
                  alt={i === 0 ? title : `${title} — photo ${i + 1}`}
                  loading={i === 0 ? undefined : 'lazy'}
                  onError={() =>
                    setFailed((prev) => new Set(prev).add(i))
                  }
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          ))}
        </div>

        {/* A real anchor, not an onClick: these are the crawl paths to every
            property page, and they must stay middle-clickable. */}
        <Link
          to={propertylink}
          aria-label={title}
          className="absolute inset-0 z-10"
        />

        {isVerified && (
          <span className="pointer-events-none absolute left-2 top-2 z-20 flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-semibold text-teal shadow-sm">
            <VerifiedOutlinedIcon sx={{ fontSize: 14 }} />
            Verified
          </span>
        )}

        {hasCarousel && (
          <>
            {/* Revealed on hover, and on keyboard focus so the carousel is
                not mouse-only. Touch users swipe instead. */}
            <button
              type="button"
              aria-label="Previous photo"
              onClick={arrow(-1)}
              className="absolute left-2 top-1/2 z-20 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink opacity-0 shadow transition-opacity hover:bg-white focus:opacity-100 group-hover:opacity-100"
            >
              <ChevronLeftRoundedIcon sx={{ fontSize: 20 }} />
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={arrow(1)}
              className="absolute right-2 top-1/2 z-20 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink opacity-0 shadow transition-opacity hover:bg-white focus:opacity-100 group-hover:opacity-100"
            >
              <ChevronRightRoundedIcon sx={{ fontSize: 20 }} />
            </button>

            <div className="pointer-events-none absolute inset-x-0 bottom-2 z-20 flex justify-center">
              {slides.length <= MAX_DOTS ? (
                <span className="flex items-center gap-1.5">
                  {slides.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 rounded-full bg-white transition-all ${
                        i === index ? 'w-4 opacity-100' : 'w-1.5 opacity-60'
                      }`}
                    />
                  ))}
                </span>
              ) : (
                <span className="rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-semibold text-white">
                  {index + 1} / {slides.length}
                </span>
              )}
            </div>
          </>
        )}
      </div>

      <Link to={propertylink} className="block w-full">
        <div className="mt-3 flex w-full items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-sm font-semibold text-ink">
            {title}
          </h3>
          {reviews > 0 && (
            <span className="flex shrink-0 items-center gap-0.5 text-xs text-ink">
              <StarRoundedIcon sx={{ fontSize: 16, color: "#028090" }} />
              {Number(rating || 0).toFixed(1)}
              <span className="text-gray-500">({reviews})</span>
            </span>
          )}
        </div>

        <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
          <LocationOnIcon sx={{ color: "#028090", fontSize: 16 }} />
          <span className="line-clamp-1">{location}</span>
        </div>

        {aggregates?.hasData && (
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-700">
            {formatRange(aggregates.bedroomRange) && (
              <span className="flex items-center gap-1">
                <BedIcon sx={{ color: "#028090", fontSize: 16 }} />
                {formatRange(aggregates.bedroomRange)} bed
              </span>
            )}
            {formatRange(aggregates.bathroomRange) && (
              <span className="flex items-center gap-1">
                <BathtubOutlinedIcon sx={{ color: "#028090", fontSize: 16 }} />
                {formatRange(aggregates.bathroomRange)} bath
              </span>
            )}
            {aggregates.maxGuests > 0 && (
              <span className="flex items-center gap-1">
                <GroupOutlinedIcon sx={{ color: "#028090", fontSize: 16 }} />
                up to {aggregates.maxGuests} guests
              </span>
            )}
          </div>
        )}

        <p
          className="mt-2 text-sm font-semibold text-ink"
          title={
            maxPrice > minPrice
              ? `${naira(minPrice)} – ${naira(maxPrice)} per night`
              : undefined
          }
        >
          {hasUnits
            ? `From ${naira(Number.isFinite(minPrice) ? minPrice : 0)} / night`
            : 'No pricing yet'}
        </p>
      </Link>
    </article>
  );
};

export default ApartmentCard;
