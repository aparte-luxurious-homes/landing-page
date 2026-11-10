/**
 * The guest's position for "near me" search, and the rules for holding it.
 *
 * Kept out of the URL on purpose: the page URL is sent to GA as
 * `page_location`, copied into `og:url` and pasted into chats. The position
 * lives here, in sessionStorage, for one tab and half an hour, and goes only
 * to the search API - rounded to ~110m before it is stored at all.
 */

export interface NearCoords {
  lat: number;
  lng: number;
}

const STORAGE_KEY = 'aparte:near:v1';
/** Long enough to page through results; short enough that a guest who has
 *  moved across town is not still searching from where they were. */
const TTL_MS = 30 * 60 * 1000;

/** ~110m. Finer than this is not needed to search, and is more than we
 *  should hold. */
export const round3 = (value: number): number => Math.round(value * 1000) / 1000;

export function readCachedCoords(): NearCoords | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { lat?: unknown; lng?: unknown; at?: unknown };
    if (
      typeof parsed.lat !== 'number' || typeof parsed.lng !== 'number'
      || typeof parsed.at !== 'number' || Date.now() - parsed.at > TTL_MS
    ) {
      window.sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return { lat: parsed.lat, lng: parsed.lng };
  } catch {
    // Private mode, blocked storage, or a malformed value.
    return null;
  }
}

export function writeCachedCoords(coords: NearCoords): void {
  try {
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ lat: round3(coords.lat), lng: round3(coords.lng), at: Date.now() }),
    );
  } catch {
    // Storage unavailable: the position still works for this page view.
  }
}

export function clearCachedCoords(): void {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
}

/**
 * "About 1.2 km away". "About" is literal: the distance is measured to the
 * approximate pin shown on the map, which can be up to 400m from the stay.
 */
export function formatDistance(metres: number | null | undefined): string | null {
  if (metres == null || !Number.isFinite(metres)) return null;
  if (metres < 1000) return `About ${Math.max(100, Math.round(metres / 100) * 100)} m away`;
  const km = metres / 1000;
  return `About ${km < 10 ? km.toFixed(1) : Math.round(km)} km away`;
}
