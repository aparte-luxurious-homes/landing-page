'use client';

/**
 * The browser's position for "near me" search, shared across the page.
 *
 * Shared rather than per-component because three surfaces read it at once
 * (the homepage rail, the search bar, the results page). A per-component hook
 * would make three `getCurrentPosition` calls - and on a browser that has not
 * decided yet, three permission prompts racing each other.
 *
 * The one rule that matters: the browser is only ever ASKED from a click.
 * `request()` is for click handlers. `auto` reads a position silently, and
 * only when the Permissions API already says "granted" - a guest who never
 * tapped "use my location" never sees a prompt they did not ask for.
 */

import { useCallback, useEffect, useSyncExternalStore } from 'react';
import {
  clearCachedCoords,
  readCachedCoords,
  round3,
  writeCachedCoords,
  type NearCoords,
} from '../lib/geo/nearMe';

export type GeoPermission = 'unsupported' | 'unknown' | 'prompt' | 'granted' | 'denied';
export type GeoStatus = 'idle' | 'locating' | 'ready' | 'error';
export type GeoError = 'denied' | 'timeout' | 'unavailable' | null;

export interface GeoState {
  permission: GeoPermission;
  status: GeoStatus;
  coords: NearCoords | null;
  error: GeoError;
  /**
   * True once the permission state has been read (or found unreadable). A
   * page that would otherwise search without a position waits for this, so
   * a guest who already granted access is not first shown the whole country.
   */
  checked: boolean;
}

const INITIAL: GeoState = {
  permission: 'unknown', status: 'idle', coords: null, error: null, checked: false,
};

let state: GeoState = INITIAL;
let initialised = false;
let inFlight: Promise<NearCoords | null> | null = null;
const listeners = new Set<() => void>();

function setState(patch: Partial<GeoState>) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Runs once per page load, from an effect - never during render, so the
 *  server and the first client render agree. */
function initialise() {
  if (initialised || typeof window === 'undefined') return;
  initialised = true;

  if (!('geolocation' in navigator)) {
    setState({ permission: 'unsupported', checked: true });
    return;
  }

  const cached = readCachedCoords();
  if (cached) setState({ coords: cached, status: 'ready' });

  // Older Safari has no Permissions API, and some browsers throw on the
  // 'geolocation' name. Both stay "unknown": the button still works, but
  // nothing ever runs automatically.
  if (!navigator.permissions?.query) {
    setState({ checked: true });
    return;
  }
  try {
    navigator.permissions
      .query({ name: 'geolocation' as PermissionName })
      .then((status) => {
        const apply = () => {
          const permission = status.state as GeoPermission;
          if (permission === 'denied') {
            // Turned off since we last read it: forget the position too.
            clearCachedCoords();
            setState({ permission, coords: null, status: 'idle', checked: true });
          } else {
            setState({ permission, checked: true });
          }
        };
        apply();
        status.onchange = apply;
      })
      .catch(() => setState({ checked: true }));
  } catch {
    // Permissions API present but refuses the 'geolocation' name.
    setState({ checked: true });
  }
}

/** Ask the browser for a position. Call only from a user gesture. */
function locate(): Promise<NearCoords | null> {
  if (typeof window === 'undefined' || !('geolocation' in navigator)) {
    return Promise.resolve(null);
  }
  if (inFlight) return inFlight;

  setState({ status: 'locating', error: null });
  inFlight = new Promise<NearCoords | null>((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: round3(position.coords.latitude),
          lng: round3(position.coords.longitude),
        };
        writeCachedCoords(coords);
        setState({ coords, status: 'ready', error: null, permission: 'granted' });
        resolve(coords);
      },
      (err) => {
        const error: GeoError = err.code === err.PERMISSION_DENIED
          ? 'denied'
          : err.code === err.TIMEOUT ? 'timeout' : 'unavailable';
        setState({
          status: 'error',
          error,
          ...(error === 'denied' ? { permission: 'denied' as const, coords: null } : {}),
        });
        resolve(null);
      },
      // City-block accuracy is all a 5km search needs, and the coarse fix
      // arrives in a second instead of waiting on GPS.
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 10 * 60 * 1000 },
    );
  }).finally(() => {
    inFlight = null;
  });
  return inFlight;
}

export function useGeolocation({ auto = false }: { auto?: boolean } = {}) {
  const current = useSyncExternalStore(subscribe, () => state, () => INITIAL);

  useEffect(() => {
    initialise();
  }, []);

  // Silent only when the browser has already said yes - a granted
  // permission shows no prompt.
  useEffect(() => {
    if (auto && current.permission === 'granted' && !current.coords && current.status === 'idle') {
      void locate();
    }
  }, [auto, current.permission, current.coords, current.status]);

  const request = useCallback(() => locate(), []);

  return { ...current, request };
}
