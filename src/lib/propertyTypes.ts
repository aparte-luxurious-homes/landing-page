/**
 * The single property-type vocabulary.
 *
 * Four copies of this list used to exist and two of them were wrong:
 * `PropertyTypesList` derived its filter value from the visible title
 * (`"Hotel Room".toUpperCase()` → `"HOTEL ROOM"`, which matches no row), and
 * mobile `PropertyType` emitted the *label* rather than the value. The API
 * enum is `DUPLEX | BUNGALOW | VILLA | APARTMENT | HOTEL | EVENT_CENTRE |
 * OTHERS`, so the
 * value and the label must be stored separately — deriving one from the other
 * is exactly the bug.
 *
 * Deliberately icon-free: this module is imported by server components, and
 * pulling @mui/icons-material in here would drag the icon package into their
 * bundles. Client components map `value` → icon locally (see CategoryRow).
 */

export interface PropertyTypeOption {
  /** The API enum value. Sent as `property_type`. */
  value: string;
  /** What a guest reads. Never upper-cased into a filter value. */
  label: string;
}

export const PROPERTY_TYPES: PropertyTypeOption[] = [
  { value: 'APARTMENT', label: 'Apartment' },
  { value: 'VILLA', label: 'Villa' },
  { value: 'HOTEL', label: 'Hotel Room' },
  { value: 'DUPLEX', label: 'Duplex' },
  { value: 'BUNGALOW', label: 'Bungalow' },
  // A venue hire, not a stay: priced per session and measured in seating /
  // standing capacity rather than beds. Surfaces here so the one vocabulary
  // still covers every value the API can return.
  { value: 'EVENT_CENTRE', label: 'Event Centre' },
  { value: 'OTHERS', label: 'Other' },
];

/** Label for a stored value, falling back to a readable form of the raw value. */
export const propertyTypeLabel = (value?: string | null): string => {
  if (!value) return '';
  const match = PROPERTY_TYPES.find((t) => t.value === value);
  if (match) return match.label;
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
};
