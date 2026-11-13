import { BookingDetails } from '../types/booking';
import { STORAGE_KEYS } from "../constant/booking";

/**
 * Validates if the parsed data is a valid BookingDetails object
 */
export const isValidBooking = (data: any): data is BookingDetails => {
  if (!data || typeof data !== 'object') return false;
  
  try {
    return (
      typeof data.id === 'string' &&
      typeof data.title === 'string' &&
      typeof data.check_in_date === 'string' &&
      typeof data.check_out_date === 'string' &&
      typeof data.adults === 'number' &&
      typeof data.children === 'number' &&
      typeof data.pets === 'number' &&
      typeof data.nights === 'number' &&
      typeof data.base_price === 'number' &&
      typeof data.caution_fee === 'number' && // Fixed typo here (was ==A=)
      typeof data.total_charging_fee === 'number' &&
      typeof data.unit_image === 'string' &&
      typeof data.unit_count === 'number' &&
      typeof data.unit_id === 'string'
    );
  } catch {
    return false;
  }
};

/**
 * Calculates the number of nights between two dates
 */
export const calculateNights = (checkIn: string, checkOut: string): number => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays || 1; // Minimum 1 night
};

/**
 * Formats a date string to YYYY-MM-DD
 */
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Safely parses JSON from localStorage
 */
export const safelyParseStorage = <T>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error parsing storage key "${key}":`, error);
    return null;
  }
};

/**
 * Cleans up expired booking data
 */
export const cleanupExpiredBooking = (): void => {
  localStorage.removeItem(STORAGE_KEYS.BOOKING);
  localStorage.removeItem(STORAGE_KEYS.EXPIRY);
};