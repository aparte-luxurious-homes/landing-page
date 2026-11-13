// Storage keys
export const STORAGE_KEYS = {
  BOOKING: 'aparte_last_booking',
  EXPIRY: 'aparte_booking_expiry',
} as const;

// Expiry settings (12 hours in milliseconds)
export const BOOKING_EXPIRY_HOURS = 12;
export const BOOKING_EXPIRY_MS = BOOKING_EXPIRY_HOURS * 60 * 60 * 1000;

// Default booking values
export const DEFAULT_BOOKING_VALUES = {
  adults: 1,
  children: 0,
  pets: 0,
} as const;

// Error messages
export const BOOKING_ERRORS = {
  NOT_FOUND: 'Booking not found',
  EXPIRED: 'Booking has expired',
  INVALID: 'Invalid booking data',
} as const;