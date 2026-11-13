/**
 * Property-type landing pages — /shortlets/apartments, /shortlets/villas, …
 *
 * The type counterpart to SHORTLET_CITIES. Deliberately the same shape, because
 * both render through the same route: `app/shortlets/[segment]` resolves a
 * slug against the cities first and these second.
 *
 * Nothing type-related was crawlable before this existed. The homepage
 * category row is a set of `<button>`s that filter client-side, and the only
 * URL carrying `property_type` is `/search-results`, whose canonical collapses
 * filter variants and which is noindexed on deep filters by design. "Serviced
 * apartments in Lagos" had no page to land on.
 *
 * `value` must match the API's PropertyType enum exactly — it is sent as
 * `property_type`. The label/slug are never derived from it and it is never
 * derived from them: "Hotel Room".toUpperCase() is "HOTEL ROOM", which matches
 * no row, and that was a real bug once. See lib/propertyTypes.
 *
 * Copy rules, non-negotiable: the positioning is reliability, not luxury. No
 * luxury adjectives, and never the retired "Aparte Luxurious Homes" name.
 * See lib/seo/config.ts.
 */

export interface PropertyTypePage {
  /** URL segment. Plural and lower-case. */
  slug: string;
  /** API enum value, sent as `property_type`. */
  value: string;
  /** Singular, sentence case. "Apartment". */
  name: string;
  /** Plural, lower-case, for use inside a sentence. "apartments". */
  plural: string;
  /** One line. Meta description tail and hub subtitle. */
  tagline: string;
  /** Two or three sentences, server-rendered above the listings. */
  intro: string;
  faqs: { question: string; answer: string }[];
}

export const PROPERTY_TYPE_PAGES: PropertyTypePage[] = [
  {
    slug: "apartments",
    value: "APARTMENT",
    name: "Apartment",
    plural: "apartments",
    tagline: "Self-contained flats with their own kitchen and living space.",
    intro:
      "Serviced apartments are the most common short-let in Nigeria, and the most practical for stays longer than a night or two. Every apartment on Aparte has been inspected before it goes live, so the photos, the room count and the price you see are the ones you get. Payment is held until you check in.",
    faqs: [
      {
        question: "How long can I book a serviced apartment for?",
        answer:
          "Most apartments accept anything from a single night to several weeks. The nightly rate and the minimum stay are shown on each listing before you book, and longer stays are often priced lower per night.",
      },
      {
        question: "Are apartments self-contained?",
        answer:
          "Yes. A listing filed as an apartment has its own kitchen, bathroom and living area. The exact bedroom, bathroom and living-room counts are listed per unit, so you can check before booking rather than on arrival.",
      },
    ],
  },
  {
    slug: "duplexes",
    value: "DUPLEX",
    name: "Duplex",
    plural: "duplexes",
    tagline: "Two-floor homes, usually with more bedrooms and private parking.",
    intro:
      "A duplex gives you a whole house over two floors, which makes it the usual choice for families and groups travelling together. They typically carry more bedrooms than an apartment and come with their own compound and parking. Every duplex here is verified before listing.",
    faqs: [
      {
        question: "How many people can a duplex sleep?",
        answer:
          "It varies by property, and the maximum is stated on each listing. Duplexes generally have three or more bedrooms, so they suit families and groups better than a one-bedroom apartment would.",
      },
      {
        question: "Do duplexes include parking?",
        answer:
          "Most have a private compound with space for one or more cars. Parking is listed as an amenity where it is available, so you can filter for it rather than assume it.",
      },
    ],
  },
  {
    slug: "bungalows",
    value: "BUNGALOW",
    name: "Bungalow",
    plural: "bungalows",
    tagline: "Single-storey homes with no stairs and their own compound.",
    intro:
      "Bungalows are single-storey houses, which makes them worth looking for if stairs are a problem or you are travelling with small children or older relatives. They usually come with a private compound. As with every listing on Aparte, the property is inspected before it is published.",
    faqs: [
      {
        question: "Is a bungalow a whole house?",
        answer:
          "Yes. A bungalow listing is the entire single-storey property, not a room within it, unless the listing explicitly says otherwise.",
      },
    ],
  },
  {
    slug: "villas",
    value: "VILLA",
    name: "Villa",
    plural: "villas",
    tagline: "Detached houses, typically with outdoor space.",
    intro:
      "Villas are detached homes with their own grounds, often with a pool or garden. They are the largest of the whole-property short-lets and are usually booked for groups or longer stays. Every villa has been verified, and your payment is held by Aparte until check-in.",
    faqs: [
      {
        question: "What is the difference between a villa and a duplex?",
        answer:
          "Both are whole houses. A duplex is arranged over two floors; a villa is detached and usually has more outdoor space. Room counts and amenities are listed on each property, which is the reliable way to compare them.",
      },
    ],
  },
  {
    slug: "hotels",
    value: "HOTEL",
    name: "Hotel Room",
    plural: "hotel rooms",
    tagline: "Rooms and suites with daily service and a front desk.",
    intro:
      "Hotel rooms suit short stays where you want a front desk, daily housekeeping and no setup. Rooms are booked per night with the same verified pricing as every other listing on Aparte, so the rate you see at checkout is the rate you pay.",
    faqs: [
      {
        question: "Is breakfast included?",
        answer:
          "Only where the listing says so. Anything included is stated on the property page before you pay, and anything charged separately is shown as an additional fee rather than added at the desk.",
      },
    ],
  },
  {
    slug: "event-centres",
    value: "EVENT_CENTRE",
    name: "Event Centre",
    plural: "event centres",
    tagline: "Halls and venues booked by the hour or the day, not the night.",
    intro:
      "Event centres are hired for a session rather than a stay, so they are priced by the hour, half-day or day and measured in seating and standing capacity rather than bedrooms. Each venue lists its capacity, parking and power arrangements up front, and is verified before it is published.",
    faqs: [
      {
        question: "How is an event centre priced?",
        answer:
          "By duration rather than by night. You choose the billing unit — hourly, half-day or daily — and the number of units when you book, and the total is calculated before you pay.",
      },
      {
        question: "How do I know a venue is big enough?",
        answer:
          "Every venue lists its seating and standing capacity separately, since the two differ substantially for the same room. Filter by the number of guests and only venues that can hold them are shown.",
      },
    ],
  },
  {
    slug: "other-stays",
    value: "OTHERS",
    name: "Other Stay",
    plural: "other stays",
    tagline: "Everything that does not fit the usual categories.",
    intro:
      "Some properties do not sit neatly in any one category — annexes, studios, converted spaces and one-off homes. They are listed here, and held to exactly the same verification standard as everything else on Aparte.",
    faqs: [
      {
        question: "Are these listings verified too?",
        answer:
          "Yes. Verification does not depend on the category. Every property published on Aparte has been inspected, whatever it is filed as.",
      },
    ],
  },
];

export function getPropertyTypePage(slug: string): PropertyTypePage | undefined {
  return PROPERTY_TYPE_PAGES.find((t) => t.slug === slug);
}
