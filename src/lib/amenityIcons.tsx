import AcUnitIcon from '@mui/icons-material/AcUnit';
import BoltIcon from '@mui/icons-material/Bolt';
import DeckIcon from '@mui/icons-material/Deck';
import ElevatorIcon from '@mui/icons-material/Elevator';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import HomeIcon from '@mui/icons-material/Home';
import HotTubIcon from '@mui/icons-material/HotTub';
import KingBedIcon from '@mui/icons-material/KingBed';
import KitchenIcon from '@mui/icons-material/Kitchen';
import LocalLaundryServiceIcon from '@mui/icons-material/LocalLaundryService';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import PoolIcon from '@mui/icons-material/Pool';
import SecurityIcon from '@mui/icons-material/Security';
import SpaIcon from '@mui/icons-material/Spa';
import SpeakerIcon from '@mui/icons-material/Speaker';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import TvIcon from '@mui/icons-material/Tv';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import WifiIcon from '@mui/icons-material/Wifi';
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import type { SvgIconComponent } from '@mui/icons-material';

/**
 * Amenity name → icon.
 *
 * Matched by normalised SUBSTRING CONTAINMENT, not by dictionary lookup.
 * Amenity names are free-text admin input and production holds several
 * spellings of the same thing — "WiFi", "FREE WIFI", "Wi-Fi"; "Pool",
 * "SWIMMING POOL"; "Air Conditioning", "AIR CONDITIONER". The previous exact-
 * key map was written against names that mostly do not exist, so almost
 * everything fell through to the default icon.
 *
 * This mirrors the backend's own convention — see
 * api-v1/services/properties/nl_search/synonyms.py, which resolves amenity
 * concepts against `normalize(amenity.name)` by containment for the same
 * reason.
 *
 * Order matters: the first matching entry wins, so put specific rules before
 * general ones.
 *
 * `words` matches whole words only. Short keywords need it — "spa" as a
 * substring also matches "spacious", "tv" matches nothing useful mid-word but
 * "ac" would match "terrace". `keywords` stays substring-matched for longer,
 * unambiguous stems where partial forms are the point ("park" → "parking").
 */
const RULES: Array<{
  keywords?: string[];
  words?: string[];
  Icon: SvgIconComponent;
}> = [
  { keywords: ['wifi', 'wi fi', 'internet'], Icon: WifiIcon },
  { keywords: ['jacuzzi', 'hot tub'], Icon: HotTubIcon },
  // Before the pool rule on purpose: the catalogue contains "POOL (SNOOKER)",
  // which containment would otherwise hand a swimming-pool icon.
  { keywords: ['snooker', 'billiard', 'pool table'], Icon: SportsEsportsIcon },
  { keywords: ['pool', 'swimming'], Icon: PoolIcon },
  { words: ['spa'], keywords: ['massage', 'sauna'], Icon: SpaIcon },
  { keywords: ['air cond', 'aircon'], words: ['ac'], Icon: AcUnitIcon },
  { keywords: ['television', 'netflix'], words: ['tv'], Icon: TvIcon },
  { keywords: ['fitness'], words: ['gym'], Icon: FitnessCenterIcon },
  { keywords: ['security', 'cctv', 'guard'], Icon: SecurityIcon },
  { keywords: ['speaker', 'sound', 'audio'], Icon: SpeakerIcon },
  { keywords: ['generator', 'electric', 'power', 'inverter'], Icon: BoltIcon },
  { keywords: ['kitchen'], Icon: KitchenIcon },
  { keywords: ['bed'], Icon: KingBedIcon },
  { keywords: ['park', 'garage'], Icon: LocalParkingIcon },
  { keywords: ['wash', 'laundry', 'dryer'], Icon: LocalLaundryServiceIcon },
  { keywords: ['lift', 'elevator'], Icon: ElevatorIcon },
  { keywords: ['balcony', 'roof', 'terrace', 'garden', 'patio'], Icon: DeckIcon },
  { keywords: ['water', 'borehole'], Icon: WaterDropIcon },
  { keywords: ['desk', 'workspace', 'office'], Icon: WorkspacesIcon },
];

/** Lower-case, strip punctuation, collapse whitespace. */
const normalise = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/**
 * Names that must never reach a guest, matched as normalised substrings.
 *
 * Amenity names are free-text admin input and the field gets used as a
 * scratchpad — production currently holds an amenity literally called
 * "APARTE LUXURIOUS HOME 9 FLATS ", which is a property name carrying the
 * retired precursor brand. That brand is non-negotiably banned from all
 * guest-facing copy (see lib/seo/config.ts and
 * api-v1/docs/seo-luxury-strip-spec.md), and "luxurious" is off-limits on its
 * own terms too: the platform sells reliability, not luxury.
 *
 * This is a display guard, NOT a data fix. The offending rows still need
 * deleting or renaming in the admin — this only stops free-text input from
 * publishing the retired brand in the meantime.
 */
const BANNED_SUBSTRINGS = ['luxurious'];

/** False for empty names and for anything carrying banned brand/positioning. */
export function isPublishableAmenity(name?: string | null): boolean {
  const normalised = normalise(name ?? '');
  if (!normalised) return false;
  return !BANNED_SUBSTRINGS.some((banned) => normalised.includes(banned));
}

/** The icon component for an amenity name; HomeIcon when nothing matches. */
export function amenityIconFor(name?: string | null): SvgIconComponent {
  const normalised = normalise(name ?? '');
  if (!normalised) return HomeIcon;
  const tokens = new Set(normalised.split(' '));

  const hit = RULES.find(
    (rule) =>
      rule.keywords?.some((keyword) => normalised.includes(keyword)) ||
      rule.words?.some((word) => tokens.has(word))
  );
  return hit?.Icon ?? HomeIcon;
}
