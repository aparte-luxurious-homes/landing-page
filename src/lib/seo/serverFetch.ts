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

/**
 * Returns null ONLY when the property definitively does not exist (404, or
 * 422 for a malformed id) so callers can safely notFound(). Transient
 * failures (network, 5xx, missing config) throw instead — a caller that
 * .catch()es can degrade to rendering without SEO data rather than serving
 * a wrong 404 for a real property during an API blip.
 */
export async function fetchPropertyForSeo(
  id: string
): Promise<SeoProperty | null> {
  if (!BASE_API_URL) throw new Error("BASE_API_URL not configured");
  const res = await fetch(`${BASE_API_URL}/properties/${id}`, {
    next: { revalidate: 300 },
  });
  if (res.status === 404 || res.status === 422) return null;
  if (!res.ok) throw new Error(`API ${res.status} for property ${id}`);
  const body = await res.json();
  return (body?.data ?? null) as SeoProperty | null;
}

/** First usable image URL — the API has used both keys over time. */
export function heroImageOf(property: SeoProperty | null): string | undefined {
  const media = property?.media ?? [];
  const featured = media.find((m) => m?.is_featured) ?? media[0];
  return featured?.media_url ?? featured?.fileUrl ?? undefined;
}

export interface SeoReview {
  rating?: number;
  comment?: string | null;
  created_at?: string | null;
  is_removed?: boolean;
  user?: { first_name?: string; last_name?: string; name?: string } | null;
}

/**
 * Public, unauthenticated review list for a property — feeds the Review /
 * AggregateRating branches of lodgingPropertySchema. Same failure contract as
 * fetchPropertyForSeo: any error degrades to an empty list, never a throw.
 */
export async function fetchReviewsForSeo(
  propertyId: string
): Promise<SeoReview[]> {
  if (!BASE_API_URL) return [];
  try {
    const res = await fetch(
      `${BASE_API_URL}/properties/${propertyId}/reviews?limit=10`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const body = await res.json();
    const rows = body?.data?.data ?? body?.data ?? [];
    return Array.isArray(rows) ? (rows as SeoReview[]) : [];
  } catch {
    return [];
  }
}
