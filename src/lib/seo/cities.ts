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
 * Abuja districts and the newer cities use `location` instead, which ORs the
 * term across city, state, address and landmark. Hosts file "Maitama" as the
 * city about as often as they file "Abuja" with Maitama in the address, so an
 * equality-style `city` filter would show half the stock. Comma-separate
 * spellings ("Wuse 2,Wuse II"): each term is matched on its own.
 *
 * A page with no stock is `noindex` until its first verified listing (see
 * `robotsFor` in app/shortlets/[segment]/page.tsx), so adding a city costs
 * nothing in index quality. Its copy must still be true on the day the first
 * listing lands: no prices we have not seen, no amenity promises a host has
 * not made. Pick new cities from GET /admin/properties/search-demand, which
 * ranks the places guests searched for and we could not serve.
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
    // Not { city: "Abuja" }: a Gwarinpa flat filed city="Gwarinpa",
    // state="FCT" never matched it, the Lagos problem again.
    apiParams: { location: "Abuja,Federal Capital Territory,FCT" },
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
    slug: "maitama",
    name: "Maitama",
    state: "Federal Capital Territory",
    apiParams: { location: "Maitama" },
    tagline:
      "Abuja's diplomatic district — quiet streets, embassies and the city's most established homes.",
    intro:
      "Maitama is home to many of Abuja's embassies and high commissions, " +
      "and to some of the city's oldest and most settled residential " +
      "streets. Shortlets here suit diplomatic and government business, " +
      "relocations and anyone who wants a calm base a short drive from the " +
      "Central Business District and Wuse 2.",
    areas: ["Maitama Extension", "Aguiyi Ironsi Street", "Gana Street", "Mississippi Street"],
    faqs: [
      {
        question: "Is Maitama a good base for business in Abuja?",
        answer:
          "Yes. Maitama sits next to the Central Business District and Wuse 2, " +
          "so most ministries, embassies and corporate offices are a short " +
          "drive away, and the district itself is among the quietest in the " +
          "city.",
      },
    ],
  },
  {
    slug: "wuse-2",
    name: "Wuse 2",
    state: "Federal Capital Territory",
    apiParams: { location: "Wuse 2,Wuse II" },
    tagline:
      "Central Abuja's busiest district for restaurants, shopping and short business trips.",
    intro:
      "Wuse 2 is the part of Abuja most visitors end up in: the restaurants " +
      "and lounges along Aminu Kano Crescent, Banex Plaza and Adetokunbo " +
      "Ademola Crescent, and quick access to the Central Business District. " +
      "Shortlets here trade some quiet for being able to walk to dinner.",
    areas: ["Aminu Kano Crescent", "Adetokunbo Ademola Crescent", "Banex", "Berger"],
    faqs: [
      {
        question: "Should I stay in Wuse 2 or Maitama?",
        answer:
          "Wuse 2 if you want restaurants, shops and nightlife within a few " +
          "minutes, Maitama if you want a quieter residential street. The two " +
          "districts border each other, so neither is far from the other.",
      },
    ],
  },
  {
    slug: "jabi",
    name: "Jabi",
    state: "Federal Capital Territory",
    apiParams: { location: "Jabi" },
    tagline:
      "Newer apartments around Jabi Lake, with the mall and the airport road close by.",
    intro:
      "Jabi has grown up around Jabi Lake and Jabi Lake Mall, and its " +
      "shortlets tend to be newer apartment blocks with easy access to Utako, " +
      "Wuse and the road to the airport. It suits families, longer stays " +
      "and travellers who want to be near shopping without being in the " +
      "centre.",
    areas: ["Jabi Lake", "Utako", "Jabi District", "Dakibiyu"],
    faqs: [
      {
        question: "What is near a shortlet in Jabi?",
        answer:
          "Jabi Lake and Jabi Lake Mall are the landmarks, with Utako's " +
          "offices and markets next door and Wuse a short drive east. Check " +
          "each listing's map once your booking is confirmed for the exact " +
          "location.",
      },
    ],
  },
  {
    slug: "gwarinpa",
    name: "Gwarinpa",
    state: "Federal Capital Territory",
    // "Gwarimpa" is the spelling half of Abuja types.
    apiParams: { location: "Gwarinpa,Gwarimpa" },
    tagline:
      "One of Nigeria's largest housing estates, with roomier homes for families and long stays.",
    intro:
      "Gwarinpa is one of the largest housing estates in Nigeria, laid out " +
      "along numbered avenues off the Kubwa Expressway. Its shortlets are " +
      "usually larger flats and houses rather than city-centre apartments, " +
      "which makes it a practical choice for families, groups and stays of " +
      "a week or more.",
    areas: ["1st Avenue", "3rd Avenue", "6th Avenue", "Life Camp", "Kado"],
    faqs: [
      {
        question: "How far is Gwarinpa from central Abuja?",
        answer:
          "Gwarinpa is north-west of the city centre, off the Kubwa " +
          "Expressway. Allow extra time at rush hour if you need to reach " +
          "Wuse or the Central Business District each morning.",
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
  {
    slug: "ibadan",
    name: "Ibadan",
    state: "Oyo",
    apiParams: { location: "Ibadan" },
    tagline:
      "Oyo's capital — settled GRA neighbourhoods close to the university and the teaching hospital.",
    intro:
      "Ibadan's short stays cluster in its established residential areas: " +
      "Old and New Bodija, Jericho GRA, Agodi GRA and Oluyole Estate. Most " +
      "visitors come for the University of Ibadan, University College " +
      "Hospital, family events or business at the state secretariat, and " +
      "want a quiet home rather than a hotel room.",
    areas: ["Bodija", "Jericho GRA", "Agodi GRA", "Oluyole Estate", "Ring Road", "Akobo"],
    faqs: [
      {
        question: "Which part of Ibadan should I stay in?",
        answer:
          "Bodija and Agodi GRA put you closest to the University of Ibadan " +
          "and University College Hospital, Jericho GRA is the quietest, and " +
          "Oluyole and Ring Road are convenient for the south of the city and " +
          "the road to Lagos.",
      },
    ],
  },
  {
    slug: "enugu",
    name: "Enugu",
    state: "Enugu",
    apiParams: { location: "Enugu" },
    tagline:
      "The Coal City — the South-East's calmest base for business, family visits and events.",
    intro:
      "Enugu is the South-East's administrative centre and its most " +
      "relaxed city to stay in. Shortlets sit mostly in Independence Layout, " +
      "the GRA, New Haven and Trans-Ekulu, within reach of Akanu Ibiam " +
      "International Airport. Demand peaks around December, when the " +
      "diaspora comes home.",
    areas: ["Independence Layout", "GRA", "New Haven", "Trans-Ekulu", "Achara Layout"],
    faqs: [
      {
        question: "When should I book a shortlet in Enugu?",
        answer:
          "Early, if you are travelling in December. Christmas homecoming " +
          "and weddings fill the best areas weeks ahead, while most of the " +
          "year you can usually book a few days out.",
      },
    ],
  },
  {
    slug: "asaba",
    name: "Asaba",
    state: "Delta",
    apiParams: { location: "Asaba" },
    tagline:
      "Delta's capital on the Niger — across the bridge from Onitsha, with its own airport.",
    intro:
      "Asaba sits on the west bank of the River Niger, linked to Onitsha by " +
      "the Niger Bridge and the Second Niger Bridge, and served by Asaba " +
      "International Airport. It is the state capital, a regular film " +
      "location for Nollywood productions, and a quieter base than Onitsha " +
      "for business on either side of the river.",
    areas: ["Asaba GRA", "Okpanam Road", "DBS Road", "Summit Road", "Nnebisi Road"],
    faqs: [
      {
        question: "Is Asaba a good base for business in Onitsha?",
        answer:
          "Many visitors use it that way: Asaba is calmer and its " +
          "residential areas are easier to stay in, and Onitsha is across the " +
          "river by bridge. Leave time for bridge traffic at peak hours.",
      },
    ],
  },
  {
    slug: "ogun",
    name: "Ogun",
    state: "Ogun",
    // State-wide on purpose: stock here is spread between Abeokuta and the
    // Lagos-border towns, and either city filter alone would miss half.
    apiParams: { state: "Ogun" },
    tagline:
      "From Abeokuta to the Lagos-Ibadan Expressway towns — stays across Ogun State.",
    intro:
      "Ogun's short stays fall into two groups: Abeokuta, the state capital " +
      "and home of Olumo Rock, and the towns along the Lagos-Ibadan " +
      "Expressway such as Mowe, Ibafo and Sagamu, which serve visitors to " +
      "Redemption Camp, the industrial areas around Ota, and people who " +
      "want to stay just outside Lagos.",
    areas: ["Abeokuta", "Mowe", "Ibafo", "Sagamu", "Ota", "Ijebu-Ode"],
    faqs: [
      {
        question: "Where should I stay for an event at Redemption Camp?",
        answer:
          "Mowe and Ibafo are the closest towns on the Lagos-Ibadan " +
          "Expressway. Large programmes at the camp fill nearby stays early, " +
          "so book as soon as your dates are fixed.",
      },
    ],
  },
];

export function getShortletCity(slug: string): ShortletCity | undefined {
  return SHORTLET_CITIES.find((c) => c.slug === slug);
}
