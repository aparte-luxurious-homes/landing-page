import { BASE_API_URL } from '@/utils/url';

/**
 * Server-side fetches used only by generateMetadata.
 *
 * These deliberately bypass RTK Query: the store is client-only (it seeds
 * from sessionStorage), so a server component cannot touch it. Both helpers
 * swallow failures and return null — a missing OG tag degrades gracefully,
 * a thrown error in generateMetadata takes the whole page down.
 */

export interface SeoProperty {
  id: string;
  name: string;
  description?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  average_rating?: number;
  total_reviews?: number;
  media?: Array<{ media_url?: string; fileUrl?: string; is_featured?: boolean }>;
  units?: Array<{ price_per_night?: number | string }>;
  location_visibility?: 'FULL' | 'APPROXIMATE';
}

export async function fetchPropertyForSeo(
  id: string
): Promise<SeoProperty | null> {
  if (!BASE_API_URL) return null;
  try {
    const res = await fetch(`${BASE_API_URL}/properties/${id}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const body = await res.json();
    return (body?.data ?? null) as SeoProperty | null;
  } catch {
    return null;
  }
}

/** First usable image URL — the API has used both keys over time. */
export function heroImageOf(property: SeoProperty | null): string | undefined {
  const media = property?.media ?? [];
  const featured = media.find((m) => m?.is_featured) ?? media[0];
  return featured?.media_url ?? featured?.fileUrl ?? undefined;
}
