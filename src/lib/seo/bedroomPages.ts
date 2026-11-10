/**
 * Bedroom-size landing pages, scoped to a city: /shortlets/lekki/2-bedroom.
 *
 * "2 bedroom shortlet in Lekki" is how a large share of guests search, and
 * until these existed it had nowhere to land: the bedroom filter only lived on
 * /search-results, whose deep filters are noindexed by design.
 *
 * They render through the same second segment as the city x type pages
 * (app/shortlets/[segment]/[facet]), resolved after the type vocabulary. The
 * slugs must stay disjoint from PROPERTY_TYPE_PAGES and SHORTLET_CITIES; an
 * e2e test asserts it.
 *
 * Every size is "N or more", never "exactly N", because that is what the API
 * filter means: `bedroom_count` matches a property when any of its units has
 * at least that many bedrooms (PropertyUnit.bedroom_count >= n). The copy says
 * so, as does the search page's own "2+ bedrooms" chip. There is no 1-bedroom
 * page for the same reason: ">= 1" is every listing except studios, so the
 * page would duplicate the city page and show four-bedroom houses under a
 * one-bedroom heading. Add it when the API gains an exact-count filter.
 *
 * Copy rules as everywhere under /shortlets: reliability, not luxury, and no
 * claim a host has not made (no prices, no power or Wi-Fi promises).
 */

export interface BedroomPage {
  /** URL segment. "2-bedroom". */
  slug: string;
  /** Minimum bedrooms, sent to the API as `bedroom_count`. */
  count: number;
  /** Display label, "2+ bedroom". */
  label: string;
  /** Spelled-out minimum for prose: "two". */
  words: string;
  /** Who the size suits, one clause. */
  suits: string;
}

export const BEDROOM_PAGES: BedroomPage[] = [
  {
    slug: "2-bedroom",
    count: 2,
    label: "2+ bedroom",
    words: "two",
    suits: "couples travelling with a child, two colleagues sharing, or a small family",
  },
  {
    slug: "3-bedroom",
    count: 3,
    label: "3+ bedroom",
    words: "three",
    suits: "families and groups of friends who want a room each",
  },
  {
    slug: "4-bedroom",
    count: 4,
    label: "4+ bedroom",
    words: "four",
    suits: "large families, wedding parties and team trips",
  },
];

export const getBedroomPage = (slug: string): BedroomPage | undefined =>
  BEDROOM_PAGES.find((b) => b.slug === slug);

/** Intro paragraph for a size in a place. Only claims the code guarantees. */
export const bedroomIntro = (b: BedroomPage, place: string): string =>
  `Short-let homes in ${place} with ${b.words} or more bedrooms, for ${b.suits}. ` +
  `Each listing here has at least one unit with ${b.words} or more bedrooms; ` +
  `the bedroom, bathroom and guest counts are shown per unit, so check the unit ` +
  `you book rather than the property as a whole. Every listing is verified ` +
  `before it goes live, and payment is held by Aparte until you check in.`;
