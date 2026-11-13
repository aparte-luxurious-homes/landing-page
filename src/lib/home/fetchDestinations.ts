/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Destination tiles for the homepage rail — server-side only.
 *
 * The tiles show a real photo from a real verified listing in each city
 * rather than stock imagery: the platform sells "what you booked is what you
 * get", and a tile of somebody else's villa is the exact opposite claim.
 * public/ carries no city photography and none is being added.
 *
 * One request per city, each cached for an hour by the Next Data
 * Cache. The page's own `revalidate = 600` regenerates the HTML every ten
 * minutes, but these responses are served from that cache in between, so the
 * upstream cost is 7 calls/hour, not 7 per regeneration.
 *
 * Every failure mode degrades to a placeholder tile: the rail must render
 * even with the API down, because it is the crawlable path from / into the
 * /shortlets city pages.
 */

import { fetchCityRows } from '@/lib/seo/cityStock';
import { heroImageOf } from '@/lib/listings/media';
import { SHORTLET_CITIES } from '@/lib/seo/cities';

export interface DestinationTile {
  slug: string;
  name: string;
  /** A photo from a verified listing in this city, or null → placeholder. */
  imageUrl: string | null;
  /** Verified listings in this city (0 when the API did not answer). */
  count: number;
}

export async function fetchDestinationTiles(): Promise<DestinationTile[]> {
  // Same request as cityStock's, so the two share one cached entry per city.
  const tiles = await Promise.all(
    SHORTLET_CITIES.map(async (city): Promise<DestinationTile & { known: boolean }> => {
      const { count, rows } = await fetchCityRows(city);
      const withImage = rows.find((p) => heroImageOf(p?.media));
      const featuredWithImage = rows.find(
        (p) => p?.is_featured && heroImageOf(p?.media)
      );
      const pick = featuredWithImage ?? withImage;
      return {
        slug: city.slug,
        name: city.name,
        imageUrl: pick ? heroImageOf(pick.media) ?? null : null,
        count: count ?? 0,
        known: count !== null,
      };
    })
  );

  // A city known to have no verified listing is left out: a tile that opens
  // an empty page is a dead end (decided 2026-11-13). A city whose count the
  // API did not return keeps its placeholder tile, so an outage never empties
  // the rail, which is the crawlable path from / into the city pages.
  return tiles
    .filter((t) => !(t.known && t.count === 0))
    .map(({ slug, name, imageUrl, count }) => ({ slug, name, imageUrl, count }))
    .sort((a, b) => b.count - a.count);
}
