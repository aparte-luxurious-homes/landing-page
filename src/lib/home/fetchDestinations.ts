/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Destination tiles for the homepage rail — server-side only.
 *
 * The tiles show a real photo from a real verified listing in each city
 * rather than stock imagery: the platform sells "what you booked is what you
 * get", and a tile of somebody else's villa is the exact opposite claim.
 * public/ carries no city photography and none is being added.
 *
 * One request per city (7 total), each cached for an hour by the Next Data
 * Cache. The page's own `revalidate = 600` regenerates the HTML every ten
 * minutes, but these responses are served from that cache in between, so the
 * upstream cost is 7 calls/hour, not 7 per regeneration.
 *
 * Every failure mode degrades to a placeholder tile: the rail must render
 * even with the API down, because it is the crawlable path from / into the
 * /shortlets city pages.
 */

import { API_BASE } from '@/lib/links/api';
import { heroImageOf } from '@/lib/listings/media';
import { SHORTLET_CITIES } from '@/lib/seo/cities';

export interface DestinationTile {
  slug: string;
  name: string;
  /** A photo from a verified listing in this city, or null → placeholder. */
  imageUrl: string | null;
  /** Verified listings in this city. 0 renders as "New listings soon". */
  count: number;
}

const CITY_REVALIDATE_SECONDS = 3600;

/** How many rows to look through for one with usable media. */
const SCAN_LIMIT = 6;

export async function fetchDestinationTiles(): Promise<DestinationTile[]> {
  const tiles = await Promise.all(
    SHORTLET_CITIES.map(async (city): Promise<DestinationTile> => {
      const placeholder: DestinationTile = {
        slug: city.slug,
        name: city.name,
        imageUrl: null,
        count: 0,
      };

      try {
        const params = new URLSearchParams({
          limit: String(SCAN_LIMIT),
          is_verified: 'true',
          ...city.apiParams,
        });
        const res = await fetch(`${API_BASE}/api/v1/properties?${params}`, {
          next: { revalidate: CITY_REVALIDATE_SECONDS },
        });
        if (!res.ok) return placeholder;

        const body = await res.json();
        const rows: any[] = body?.data?.data?.data ?? body?.data?.data ?? [];
        if (!Array.isArray(rows)) return placeholder;

        // meta.total is the match count for THIS filtered query; stats
        // .totalIsVerified is the same number while is_verified=true is set.
        const count =
          Number(
            body?.data?.data?.meta?.total ??
              body?.data?.stats?.totalIsVerified ??
              rows.length
          ) || 0;

        const withImage = rows.find((p) => heroImageOf(p?.media));
        const featuredWithImage = rows.find(
          (p) => p?.is_featured && heroImageOf(p?.media)
        );
        const pick = featuredWithImage ?? withImage;

        return {
          ...placeholder,
          imageUrl: pick ? heroImageOf(pick.media) ?? null : null,
          count,
        };
      } catch {
        return placeholder;
      }
    })
  );

  // Busiest cities first; cities still awaiting their first verified listing
  // fall to the end of the rail rather than being hidden — every one of them
  // is a link target that needs to stay crawlable from the homepage.
  return tiles.sort((a, b) => b.count - a.count);
}
