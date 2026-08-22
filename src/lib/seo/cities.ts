/**
 * City landing-page config — the single source for /shortlets/[city].
 *
 * These pages exist because the highest-volume commercial queries
 * ("shortlet in Lekki", "serviced apartment Abuja") previously had no
 * indexable target: query-param search URLs are canonicalised and partially
 * noindexed by design. Every field here is rendered server-side, so the copy
 * must stand alone as citable text for AI answer engines — specific, factual,
 * no filler.
 *
 * `apiParams` maps the page to the listings API filter. Lagos uses the state
 * filter because Google Places tags Lekki/Ikoyi/VI addresses inconsistently
 * (sometimes "Lagos", sometimes the locality) — state-level catches all of
 * them; the locality pages use the narrower city filter.
 *
 * Keep this list in sync with the "## Coverage" section of public/llms.txt.
 */

export interface ShortletCity {
  slug: string;
  name: string;
  state: string;
  /** Filter passed to GET /api/v1/properties. */
  apiParams: Record<string, string>;
  /** One-line positioning used in meta description + intro. */
  tagline: string;
  /** 2–3 sentence server-rendered intro. Unique per city. */
  intro: string;
  /** Neighbourhoods/areas name-dropped in copy and internal links. */
  areas: string[];
  /** City-specific Q&A rendered on-page and emitted as FAQPage JSON-LD. */
  faqs: { question: string; answer: string }[];
}

export const SHORTLET_CITIES: ShortletCity[] = [
  {
    slug: "lagos",
    name: "Lagos",
    state: "Lagos",
    apiParams: { state: "Lagos" },
    tagline:
      "Nigeria's commercial capital, with the deepest pool of verified shortlets in the country.",
    intro:
      "Lagos has Nigeria's largest inventory of verified short-stay apartments, " +
      "from waterfront flats in Ikoyi and Victoria Island to serviced homes " +
      "along the Lekki corridor and business-friendly stays near Ikeja and the " +
      "airport. Every listing on Aparte is verified before it goes live, with " +
      "real-time availability and pricing in NGN.",
    areas: ["Lekki", "Victoria Island", "Ikoyi", "Ikeja", "Ajah", "Yaba"],
    faqs: [
      {
        question: "How much does a shortlet apartment cost in Lagos?",
        answer:
          "Nightly rates in Lagos vary widely by area: expect roughly " +
          "NGN 50,000 to NGN 150,000 per night for a one-bedroom in the Lekki " +
          "corridor, and NGN 150,000 upwards for premium apartments in Victoria " +
          "Island or Ikoyi. Prices on Aparte are shown per night in NGN, with any " +
          "caution fee stated before you book.",
      },
      {
        question: "Which Lagos areas are best for short stays?",
        answer:
          "Lekki Phase 1 and Victoria Island are the most popular for leisure " +
          "and nightlife, Ikoyi for quiet residential stays, and Ikeja GRA for " +
          "airport access and business trips.",
      },
    ],
  },
  {
    slug: "lekki",
    name: "Lekki",
    state: "Lagos",
    apiParams: { city: "Lekki" },
    tagline:
      "The Lekki corridor — Lagos's shortlet heartland, minutes from beaches and nightlife.",
    intro:
      "Lekki is the busiest short-stay market in Nigeria: modern serviced " +
      "apartments in Phase 1, gated estates off the Expressway, and easy reach " +
      "of Landmark Beach, restaurants and co-working spaces. Aparte lists " +
      "verified Lekki apartments with real photos, real-time availability and " +
      "instant booking.",
    areas: ["Lekki Phase 1", "Chevron", "Ikate", "Osapa London", "Agungi"],
    faqs: [
      {
        question: "Is Lekki good for a short stay in Lagos?",
        answer:
          "Yes — Lekki is the most requested shortlet location in Lagos. It " +
          "combines beach access, restaurants and nightlife with a large " +
          "supply of modern one-to-three-bedroom serviced apartments, which " +
          "keeps nightly rates competitive relative to Victoria Island and " +
          "Ikoyi.",
      },
      {
        question: "What does a Lekki shortlet cost per night?",
        answer:
          "Most verified Lekki listings on Aparte fall between NGN 50,000 " +
          "and NGN 200,000 per night depending on size, estate and season. A " +
          "refundable caution fee may apply and is always shown before " +
          "checkout.",
      },
    ],
  },
  {
    slug: "victoria-island",
    name: "Victoria Island",
    state: "Lagos",
    apiParams: { city: "Victoria Island" },
    tagline:
      "Lagos's business district: serviced apartments beside the offices, embassies and restaurants.",
    intro:
      "Victoria Island is where Lagos does business: banks, embassies and " +
      "corporate headquarters share the island with some of the city's best " +
      "restaurants and hotels. Shortlets here suit business travellers who " +
      "want a serviced apartment within walking or short-drive distance of " +
      "meetings, with Eko Atlantic and Bar Beach nearby.",
    areas: ["Oniru", "Eko Atlantic", "Adeola Odeku", "Ozumba Mbadiwe"],
    faqs: [
      {
        question: "Why book a shortlet in Victoria Island instead of a hotel?",
        answer:
          "A serviced apartment gives you a kitchen, a living room and more " +
          "space than a comparable hotel room, usually at a better nightly " +
          "rate for stays of three nights or more — while staying inside the " +
          "business district.",
      },
    ],
  },
  {
    slug: "ikoyi",
    name: "Ikoyi",
    state: "Lagos",
    apiParams: { city: "Ikoyi" },
    tagline:
      "Old-money Lagos — quiet, leafy streets and the city's most exclusive apartments.",
    intro:
      "Ikoyi is Lagos at its most exclusive: tree-lined streets, waterfront " +
      "towers in Banana Island and Osborne, and a calm that Victoria Island " +
      "and Lekki can't offer. Shortlets here trend larger and more premium, " +
      "suited to families, executives and longer stays.",
    areas: ["Banana Island", "Osborne", "Old Ikoyi", "Parkview Estate"],
    faqs: [
      {
        question: "What makes Ikoyi shortlets different from Lekki?",
        answer:
          "Ikoyi apartments are generally larger, quieter and more premium " +
          "than the Lekki corridor's — think full-service towers and estate " +
          "homes rather than high-turnover studio blocks — with nightly " +
          "rates to match.",
      },
    ],
  },
  {
    slug: "ikeja",
    name: "Ikeja",
    state: "Lagos",
    apiParams: { city: "Ikeja" },
    tagline:
      "Mainland Lagos's capital — GRA calm, airport access and honest value.",
    intro:
      "Ikeja is the smart mainland choice: minutes from Murtala Muhammed " +
      "Airport, anchored by the quiet estates of Ikeja GRA, and typically " +
      "20–40% cheaper per night than comparable island apartments. Ideal for " +
      "early flights, business at Alausa and visits to family on the " +
      "mainland.",
    areas: ["Ikeja GRA", "Alausa", "Maryland", "Opebi", "Allen Avenue"],
    faqs: [
      {
        question: "Is Ikeja a good area for a shortlet near the Lagos airport?",
        answer:
          "Yes — Ikeja GRA is the closest established shortlet cluster to " +
          "Murtala Muhammed Airport, usually 10–20 minutes door to door, and " +
          "its serviced apartments cost noticeably less than equivalents on " +
          "the island.",
      },
    ],
  },
  {
    slug: "abuja",
    name: "Abuja",
    state: "Federal Capital Territory",
    apiParams: { city: "Abuja" },
    tagline:
      "Nigeria's capital — planned, green and calm, with serviced apartments across its best districts.",
    intro:
      "Abuja's shortlets cluster in Maitama, Wuse 2, Jabi and Gwarinpa — " +
      "planned districts with good roads, steady power and quick access to " +
      "government offices, the airport road and Jabi Lake Mall. The city " +
      "suits business stays, relocations and anyone who wants Lagos comfort " +
      "without Lagos traffic.",
    areas: ["Maitama", "Wuse 2", "Jabi", "Gwarinpa", "Asokoro", "Katampe"],
    faqs: [
      {
        question: "Which Abuja districts are best for serviced apartments?",
        answer:
          "Maitama and Asokoro are the most premium, Wuse 2 is central with " +
          "the best restaurants, and Jabi and Gwarinpa offer newer builds at " +
          "friendlier nightly rates near Jabi Lake and the airport " +
          "expressway.",
      },
      {
        question: "How do Abuja shortlet prices compare to Lagos?",
        answer:
          "Like-for-like, Abuja nightly rates usually sit slightly below " +
          "Lagos island prices — a modern one-bedroom in Wuse 2 or Jabi " +
          "typically costs less than its Victoria Island equivalent, with " +
          "Maitama at parity.",
      },
    ],
  },
  {
    slug: "port-harcourt",
    name: "Port Harcourt",
    state: "Rivers",
    apiParams: { city: "Port Harcourt" },
    tagline:
      "The Garden City — oil-and-gas business stays and family visits, GRA comfort included.",
    intro:
      "Port Harcourt's short-stay demand is driven by the energy industry and " +
      "diaspora visits, and its best apartments sit in the GRA phases and " +
      "around Peter Odili Road — serviced, gated and close to the airport " +
      "road. Aparte verifies every Port Harcourt listing before it goes " +
      "live.",
    areas: ["GRA Phase 2", "GRA Phase 3", "Peter Odili Road", "Trans Amadi"],
    faqs: [
      {
        question: "Where should I stay short-term in Port Harcourt?",
        answer:
          "The GRA phases are the established choice — quiet, gated and " +
          "central — while Peter Odili Road offers newer apartment blocks " +
          "closer to the waterfront and nightlife.",
      },
    ],
  },
];

export function getShortletCity(slug: string): ShortletCity | undefined {
  return SHORTLET_CITIES.find((c) => c.slug === slug);
}
