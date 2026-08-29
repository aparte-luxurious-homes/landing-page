/**
 * Picking the display image off a listing.
 *
 * The API's `media` rows are untyped and inconsistent between endpoints: the
 * key is `media_url` on the server list endpoints and `mediaUrl` (occasionally
 * `fileUrl`) on some client ones, and video rows sit in the same array. This
 * logic was copy-pasted in four places; each copy handled a different subset.
 *
 * Server-safe: no React, no MUI, no browser globals.
 */

export interface MediaLike {
  media_url?: string | null;
  mediaUrl?: string | null;
  fileUrl?: string | null;
  media_type?: string | null;
  mediaType?: string | null;
  is_featured?: boolean | null;
}

const urlOf = (m?: MediaLike | null): string | undefined =>
  (m?.media_url || m?.mediaUrl || m?.fileUrl) ?? undefined;

const isVideo = (m?: MediaLike | null): boolean =>
  (m?.media_type || m?.mediaType) === 'VIDEO';

/**
 * The featured still image, else the first still, else the first row of any
 * kind. Returns undefined when the listing has no usable media — callers
 * decide between a placeholder and a fallback asset.
 */
export const heroImageOf = (
  media?: MediaLike[] | null
): string | undefined => galleryImagesOf(media)[0];

/**
 * Every still image on a listing, featured one first, de-duplicated.
 *
 * Feeds the card carousel. Videos are excluded: the card shows a plain <img>
 * track, and a video URL there renders as a broken image.
 */
export const galleryImagesOf = (media?: MediaLike[] | null): string[] => {
  const rows = media ?? [];
  const stills = rows.filter((m) => !isVideo(m) && urlOf(m));
  const ordered = [
    ...stills.filter((m) => m?.is_featured),
    ...stills.filter((m) => !m?.is_featured),
  ];
  // Fall back to anything with a URL when every row claims to be a video —
  // media_type is not reliably set on older listings.
  const source = ordered.length ? ordered : rows.filter((m) => urlOf(m));
  return [...new Set(source.map((m) => urlOf(m) as string))];
};
