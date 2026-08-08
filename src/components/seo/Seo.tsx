import { Helmet } from 'react-helmet-async';
import {
  SITE_NAME,
  SITE_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  SITE_LOCALE,
  TWITTER_HANDLE,
  absoluteUrl,
} from '@/lib/seo/config';

// Serialisation lives in lib/seo/jsonLd so the server-rendered layout and
// this client component share one hardened escaper.
import { toJsonLd, type JsonLd } from '@/lib/seo/jsonLd';

export interface SeoProps {
  /** Page title. The "| Aparte" brand suffix is appended unless brandSuffix=false. */
  title?: string;
  /** Append "| Aparte" to the title. Default true. */
  brandSuffix?: boolean;
  /** Meta + OG/Twitter description. Falls back to the site default. */
  description?: string;
  /** Path ("/about") or absolute URL used for canonical + og:url. Omit to skip canonical. */
  canonicalPath?: string;
  /** Absolute image URL for OG/Twitter. Defaults to the brand share image. */
  image?: string;
  /** OG object type. */
  type?: 'website' | 'article' | 'product';
  /** Emit robots noindex,nofollow — use on auth/account/transactional pages. */
  noindex?: boolean;
  /** One or more JSON-LD objects, emitted as <script type="application/ld+json">. */
  jsonLd?: JsonLd | JsonLd[];
}

const DEFAULT_TITLE = `${SITE_NAME} — Luxury Short-Stay Apartments & Homes in Nigeria`;

/**
 * Central per-page SEO head. Wraps react-helmet-async and emits title,
 * description, canonical, Open Graph, Twitter cards and optional JSON-LD.
 * Apply to every public route; pass `noindex` on private/transactional routes.
 */
const Seo = ({
  title,
  brandSuffix = true,
  description = SITE_DESCRIPTION,
  canonicalPath,
  image = DEFAULT_OG_IMAGE,
  type = 'website',
  noindex = false,
  jsonLd,
}: SeoProps) => {
  const fullTitle = title
    ? brandSuffix
      ? `${title} | ${SITE_NAME}`
      : title
    : DEFAULT_TITLE;

  const canonical = canonicalPath ? absoluteUrl(canonicalPath) : undefined;
  const blocks = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {canonical ? <link rel="canonical" href={canonical} /> : null}
      {noindex ? <meta name="robots" content="noindex,nofollow" /> : null}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {canonical ? <meta property="og:url" content={canonical} /> : null}
      <meta property="og:image" content={image} />
      <meta property="og:locale" content={SITE_LOCALE} />

      {/* Twitter / X */}
      <meta name="twitter:card" content="summary_large_image" />
      {TWITTER_HANDLE ? <meta name="twitter:site" content={TWITTER_HANDLE} /> : null}
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {blocks.map((block, i) => (
        <script key={i} type="application/ld+json">
          {toJsonLd(block)}
        </script>
      ))}
    </Helmet>
  );
};

export default Seo;
