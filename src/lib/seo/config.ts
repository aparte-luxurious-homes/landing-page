/**
 * Single source of truth for SEO / GEO constants.
 *
 * Every <Seo> tag and JSON-LD builder reads brand, domain and default copy from
 * here, so a domain change or rebrand is a one-line edit. Keep this file free of
 * React imports so it can be consumed by plain modules too.
 */

import { SITE_URL as SITE_URL_ENV } from '../../config/env';

/** Canonical production origin, no trailing slash.
 * Override via VITE_SITE_URL (Vite) or NEXT_PUBLIC_SITE_URL (Next). */
export const SITE_URL: string = (SITE_URL_ENV || 'https://aparte.ng').replace(
  /\/+$/,
  ''
);

/** Short brand name used in titles ("... | Aparte"), and Organization.name. */
export const SITE_NAME = 'Aparte';

/**
 * Secondary written form of the trade name, emitted as Organization.alternateName.
 *
 * The only two names this platform presents publicly are "Aparte" and
 * "AparteNG". "Aparte Luxurious Homes" is a retired precursor business and must
 * never appear in copy, metadata, or any machine-readable identity signal.
 * See api-v1/docs/seo-luxury-strip-spec.md.
 */
export const SITE_ALTERNATE_NAME = 'AparteNG';

/**
 * Registered company name as filed with Nigeria's Corporate Affairs Commission.
 * This is the entity that operates the platform; "Aparte" and "AparteNG" are its
 * trading names. Emitted as Organization.legalName and shown in the site footer.
 */
export const SITE_REGISTERED_NAME = 'Aparte Digital Limited';

/** CAC registration ("RC") number for SITE_REGISTERED_NAME. */
export const SITE_RC_NUMBER = '9311297';

/** Footer/legal display form, e.g. "Aparte Digital Limited (RC 9311297)". */
export const SITE_REGISTERED_ENTITY = `${SITE_REGISTERED_NAME} (RC ${SITE_RC_NUMBER})`;

/**
 * Site-wide default <title>, and the og:title / twitter:title fallback.
 *
 * Positioning is reliability, not luxury: lead with what is verifiable
 * (verification, refundable caution fee, payment protection) rather than with
 * an adjective. Per-route titles override this via the `%s | Aparte` template
 * in app/layout.tsx.
 */
export const SITE_DEFAULT_TITLE =
  'Aparte | Verified short-lets in Nigeria. What you booked is what you get.';

/**
 * Default meta description / OG description for pages that don't set their own.
 *
 * "payment held by Aparte until you check in" is a load-bearing factual claim,
 * not a slogan: TransactionService.process_booking_split releases only 10% to
 * the host at confirmation and the remaining 80% at stage='CHECK_IN'. If that
 * settlement schedule ever changes, this sentence must change with it.
 */
export const SITE_DESCRIPTION =
  'Book verified apartments in Lagos and across Nigeria. Transparent ' +
  'pricing, refundable caution fees, payment held by Aparte until you ' +
  'check in. No negotiation, no surprises.';

/** Brand colour used for theme-color / OG accents. Matches MUI theme primary. */
export const THEME_COLOR = '#028090';

/** Support / contact email. */
export const SUPPORT_EMAIL = 'support@aparte.ng';

/** Hosted brand logo (used in Organization JSON-LD). */
export const ORG_LOGO_URL =
  'https://cdn.builder.io/api/v1/image/assets/TEMP/3b38bbc7c5ff8c386fd93465ae15df57abad2ed77415c2a134724b60741e6ac0?placeholderIfAbsent=true&apiKey=8e9d8cabec6941f3ad44d75c45253ccb';

/** Default Open Graph / Twitter share image (1200x630).
 * Served by app/opengraph-image.tsx (next/og ImageResponse). No binary asset
 * to keep in sync; the card is generated from the brand constants above. */
export const DEFAULT_OG_IMAGE = `${SITE_URL}/opengraph-image`;

/** Twitter/X handle for twitter:site. */
export const TWITTER_HANDLE = '@theaparteng';

/** Country the platform operates in (ISO 3166-1 alpha-2). */
export const SITE_COUNTRY = 'NG';

/** OG locale. */
export const SITE_LOCALE = 'en_NG';

/**
 * Public social / external profile URLs for Organization.sameAs (entity clarity
 * for search + AI engines). These feed the Organization JSON-LD automatically.
 *
 * Instagram is @aparte_ng; the earlier @theaparteng Instagram account was
 * suspended; do not reintroduce it here.
 *
 * OPEN ITEM (seo-luxury-strip-spec Task 3): the spec asks for TikTok to be
 * added and Instagram to be dropped "until the Business Manager rebuild
 * completes". Neither was applied. The TikTok handle was not supplied and the
 * spec forbids guessing it, and @aparte_ng is currently live, so removing it
 * would delete a working entity signal rather than fix one. Both are flagged
 * for the CTO in luxury-strip-report.md.
 */
export const SOCIAL_LINKS: string[] = [
  'https://www.instagram.com/aparte_ng',
  'https://x.com/theaparteng',
  'https://www.facebook.com/profile.php?id=100068835872133',
];

/** Join a path onto SITE_URL, producing an absolute, canonical URL. */
export const absoluteUrl = (path = '/'): string => {
  if (/^https?:\/\//i.test(path)) return path;
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${suffix}`;
};
