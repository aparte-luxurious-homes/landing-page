/**
 * Single source of truth for SEO / GEO constants.
 *
 * Every <Seo> tag and JSON-LD builder reads brand, domain and default copy from
 * here, so a domain change or rebrand is a one-line edit. Keep this file free of
 * React imports so it can be consumed by plain modules too.
 */

/** Canonical production origin, no trailing slash. Override via VITE_SITE_URL. */
export const SITE_URL: string = (
  import.meta.env.VITE_SITE_URL || 'https://aparte.ng'
).replace(/\/+$/, '');

/** Short brand name used in titles ("… | Aparte"). */
export const SITE_NAME = 'Aparte';

/** Full trading/brand name used as Organization.name in structured data. */
export const SITE_LEGAL_NAME = 'Aparte Luxurious Homes';

/**
 * Registered company name as filed with Nigeria's Corporate Affairs Commission.
 * This is the entity that operates the platform; "Aparte" and "Aparte Luxurious
 * Homes" are its trading names. Emitted as Organization.legalName and shown in
 * the site footer.
 */
export const SITE_REGISTERED_NAME = 'Aparte Digital Limited';

/** CAC registration ("RC") number for SITE_REGISTERED_NAME. */
export const SITE_RC_NUMBER = '9311297';

/** Footer/legal display form, e.g. "Aparte Digital Limited (RC 9311297)". */
export const SITE_REGISTERED_ENTITY = `${SITE_REGISTERED_NAME} (RC ${SITE_RC_NUMBER})`;

/** Default meta description / OG description for pages that don't set their own. */
export const SITE_DESCRIPTION =
  'Aparte connects discerning travellers with handpicked luxury short-stay ' +
  'apartments, homes and hotels across Nigeria. Browse verified listings, see ' +
  'real-time availability and book your next stay instantly.';

/** Brand colour used for theme-color / OG accents. Matches MUI theme primary. */
export const THEME_COLOR = '#028090';

/** Support / contact email. */
export const SUPPORT_EMAIL = 'support@aparte.ng';

/** Hosted brand logo (used in Organization JSON-LD). */
export const ORG_LOGO_URL =
  'https://cdn.builder.io/api/v1/image/assets/TEMP/3b38bbc7c5ff8c386fd93465ae15df57abad2ed77415c2a134724b60741e6ac0?placeholderIfAbsent=true&apiKey=8e9d8cabec6941f3ad44d75c45253ccb';

/** Default Open Graph / Twitter share image (1200x630, lives in /public). */
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`;

/** Optional Twitter/X handle (e.g. "@aparte"). Empty = omit twitter:site. */
export const TWITTER_HANDLE = '';

/** Country the platform operates in (ISO 3166-1 alpha-2). */
export const SITE_COUNTRY = 'NG';

/** OG locale. */
export const SITE_LOCALE = 'en_NG';

/**
 * Public social / external profile URLs for Organization.sameAs (entity clarity
 * for search + AI engines). Populate as accounts come online.
 */
export const SOCIAL_LINKS: string[] = [];

/** Join a path onto SITE_URL, producing an absolute, canonical URL. */
export const absoluteUrl = (path = '/'): string => {
  if (/^https?:\/\//i.test(path)) return path;
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${suffix}`;
};
