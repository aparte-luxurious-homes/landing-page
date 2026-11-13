'use client';

import MyLocationRoundedIcon from '@mui/icons-material/MyLocationRounded';
import { useGeolocation } from '@/hooks/useGeolocation';
import type { NearCoords } from '@/lib/geo/nearMe';

interface UseMyLocationButtonProps {
  /** Called once a position is in hand. */
  onLocated: (coords: NearCoords) => void;
  className?: string;
}

/**
 * "Use my current location", with every state it can end in spelled out.
 *
 * This is the only place on the site that makes the browser ask for a
 * position, and it does so from a click. A browser without geolocation gets
 * nothing rendered rather than a button that cannot work.
 */
export default function UseMyLocationButton({ onLocated, className = '' }: UseMyLocationButtonProps) {
  const geo = useGeolocation();

  if (geo.permission === 'unsupported') return null;

  const locating = geo.status === 'locating';
  const denied = geo.permission === 'denied' || geo.error === 'denied';

  const handleClick = async () => {
    const coords = await geo.request();
    if (coords) onLocated(coords);
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleClick}
        disabled={locating}
        className="flex w-full items-center gap-3 rounded-[10px] border border-gray-200 bg-white px-4 py-3 text-left text-sm font-medium text-cyan-800 hover:bg-cyan-50 disabled:cursor-wait disabled:opacity-70"
      >
        <MyLocationRoundedIcon sx={{ fontSize: 20 }} aria-hidden />
        <span>{locating ? 'Finding your location…' : 'Use my current location'}</span>
      </button>
      {denied ? (
        <p className="mt-1.5 px-1 text-xs text-gray-500" role="status">
          Location is off for Aparte in this browser. Turn it on in your browser
          settings, or type an area instead.
        </p>
      ) : geo.status === 'error' ? (
        <p className="mt-1.5 px-1 text-xs text-gray-500" role="status">
          We couldn&apos;t find your location. Try again, or type an area instead.
        </p>
      ) : null}
    </div>
  );
}
