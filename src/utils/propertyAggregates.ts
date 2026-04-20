// Index-signature variant so call sites passing narrower unit shapes (e.g. the
// search-results `{ price_per_night: string }` projection) still type-check.
// TS "weak type" detection would otherwise reject any object that happens to
// lack bedroom_count/bathroom_count/max_guests.
export interface UnitLike {
  bedroom_count?: number;
  bathroom_count?: number;
  max_guests?: number;
  [key: string]: unknown;
}

export interface PropertyAggregates {
  bedroomRange: [number, number];
  bathroomRange: [number, number];
  maxGuests: number;
  hasData: boolean;
}

const EMPTY: PropertyAggregates = {
  bedroomRange: [0, 0],
  bathroomRange: [0, 0],
  maxGuests: 0,
  hasData: false,
};

export function aggregateUnitStats(units?: UnitLike[] | null): PropertyAggregates {
  if (!units || units.length === 0) return EMPTY;

  const bedrooms = units
    .map((u) => Number(u.bedroom_count) || 0)
    .filter((n) => n > 0);
  const bathrooms = units
    .map((u) => Number(u.bathroom_count) || 0)
    .filter((n) => n > 0);
  const guests = units
    .map((u) => Number(u.max_guests) || 0)
    .filter((n) => n > 0);

  const bedroomRange: [number, number] = bedrooms.length
    ? [Math.min(...bedrooms), Math.max(...bedrooms)]
    : [0, 0];
  const bathroomRange: [number, number] = bathrooms.length
    ? [Math.min(...bathrooms), Math.max(...bathrooms)]
    : [0, 0];
  const maxGuests = guests.length ? Math.max(...guests) : 0;

  const hasData = bedrooms.length > 0 || bathrooms.length > 0 || guests.length > 0;

  return { bedroomRange, bathroomRange, maxGuests, hasData };
}

export function formatRange(range: [number, number]): string {
  const [min, max] = range;
  if (max === 0) return "";
  if (min === max) return `${min}`;
  return `${min}–${max}`;
}
