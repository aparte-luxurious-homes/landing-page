'use client';

import React, { useCallback, useEffect, useRef, useState } from "react";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
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
  /** Earned badge — see TOP_RATED_* in utils/propertyCard. */
  isTopRated?: boolean;
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
  isTopRated = false,
}) => {
  const slides = images.length ? images : [SampleImg.src];
  const hasCarousel = slides.length > 1;

  // "From" only earns its space when units actually differ in price;
  // a single-unit listing just states the rate.
  const safeMin = Number.isFinite(minPrice) ? minPrice : 0;
  const priceLabel = !hasUnits
    ? 'No pricing yet'
    : maxPrice > safeMin
      ? `From ${naira(safeMin)} / night`
      : `${naira(safeMin)} / night`;

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
          // Must be the SAME threshold onTouchEnd acts on. It used to be 10px
          // here against 40px there, so a tap that drifted 11-39px — routine
          // for a thumb — was marked a swipe and had its click swallowed,
          // while the carousel didn't move either. The tap simply died, and
          // the toolbar sits at the bottom edge where thumbs land.
          if (
            Math.abs(e.touches[0].clientX - touchStartX.current) >=
            SWIPE_THRESHOLD_PX
          ) {
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

        {/* Replaces a "Verified" badge that sat on every card. Guests can only
            ever be served verified listings (the API filters on the session,
            not a query param), so that badge distinguished nothing and hinted
            the list held unverified stock. This one has to be earned. */}
        {isTopRated && (
          <span className="pointer-events-none absolute left-2 top-2 z-20 flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-semibold text-teal shadow-sm">
            <StarRoundedIcon sx={{ fontSize: 14 }} />
            Top rated
          </span>
        )}

        {/* Beds/baths/guests ride on the photo rather than costing the card a
            third text line. pointer-events-none so it never intercepts a
            swipe or a click on the link underneath. */}
        {aggregates?.hasData && (
          <span className="pointer-events-none absolute bottom-2 left-2 z-20 flex items-center gap-2 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-[2px]">
            {formatRange(aggregates.bedroomRange) && (
              <span className="flex items-center gap-1">
                <BedIcon sx={{ fontSize: 14 }} />
                {formatRange(aggregates.bedroomRange)}
              </span>
            )}
            {formatRange(aggregates.bathroomRange) && (
              <span className="flex items-center gap-1">
                <BathtubOutlinedIcon sx={{ fontSize: 14 }} />
                {formatRange(aggregates.bathroomRange)}
              </span>
            )}
            {aggregates.maxGuests > 0 && (
              <span className="flex items-center gap-1">
                <GroupOutlinedIcon sx={{ fontSize: 14 }} />
                {aggregates.maxGuests}
              </span>
            )}
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

            {/* Bottom-RIGHT, not centred: the spec toolbar holds the bottom
                left, and fixed opposite corners cannot collide at any card
                width — which matters most on the sm 2-up grid (~280px). Every
                card gets the same geometry whether or not it has spec data. */}
            <div className="pointer-events-none absolute bottom-2 right-2 z-20 flex justify-end">
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

        {/* Mirrors the title/rating row above: the listing on the left, what
            qualifies it on the right, so rating and location line up in a
            second column. The price is fixed-width and the location takes
            what is left, so a long "Victoria Island, Lagos" truncates rather
            than shoving the price or wrapping the card to a third line. */}
        <div className="mt-1 flex w-full items-baseline justify-between gap-2 text-xs">
          <span
            className="shrink-0 text-sm font-semibold text-ink"
            title={
              maxPrice > minPrice
                ? `${naira(minPrice)} – ${naira(maxPrice)} per night`
                : undefined
            }
          >
            {priceLabel}
          </span>
          {location && (
            <span
              className="flex min-w-0 items-center gap-0.5 text-gray-500"
              // The price wins the space fight, so on the narrowest cards a
              // long "City, State" clips — keep the full value recoverable.
              title={location}
            >
              <LocationOnIcon
                sx={{ color: '#028090', fontSize: 14, flexShrink: 0 }}
              />
              <span className="truncate">{location}</span>
            </span>
          )}
        </div>
      </Link>
    </article>
  );
};

export default ApartmentCard;
