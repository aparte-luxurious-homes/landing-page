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
import SpeakerIcon from '@mui/icons-material/Speaker';
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
 * Order matters: the first entry whose keyword appears in the name wins, so
 * put more specific keywords before more general ones.
 */
const RULES: Array<{ keywords: string[]; Icon: SvgIconComponent }> = [
  { keywords: ['wifi', 'wi fi', 'internet'], Icon: WifiIcon },
  { keywords: ['jacuzzi', 'hot tub'], Icon: HotTubIcon },
  { keywords: ['pool', 'swimming'], Icon: PoolIcon },
  { keywords: ['air cond', 'aircon', 'ac unit'], Icon: AcUnitIcon },
  { keywords: ['tv', 'television', 'netflix'], Icon: TvIcon },
  { keywords: ['gym', 'fitness'], Icon: FitnessCenterIcon },
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

/** The icon component for an amenity name; HomeIcon when nothing matches. */
export function amenityIconFor(name?: string | null): SvgIconComponent {
  const normalised = normalise(name ?? '');
  if (!normalised) return HomeIcon;
  const hit = RULES.find((rule) =>
    rule.keywords.some((keyword) => normalised.includes(keyword))
  );
  return hit?.Icon ?? HomeIcon;
}
