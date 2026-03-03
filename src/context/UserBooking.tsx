import React, { createContext, useState, ReactNode, useEffect, useCallback, useMemo } from "react";
import { BookingDetails } from "../types/booking";
import { STORAGE_KEYS, BOOKING_EXPIRY_MS } from "../constant/booking";
import { isValidBooking, safelyParseStorage, cleanupExpiredBooking, calculateNights } from "../utils/bookings";

// Define the context type
interface BookingContextType {
  // State
  booking: BookingDetails | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setBooking: React.Dispatch<React.SetStateAction<BookingDetails | null>>;
  clearBooking: () => void;
  updateBooking: (updates: Partial<BookingDetails>) => void;
  refreshBooking: () => void;
}

// Create the context
const BookingContext = createContext<BookingContextType | undefined>(undefined);

// Provider props
interface BookingProviderProps {
  children: ReactNode;
  onError?: (error: string) => void;
}

export const BookingProvider = ({ children, onError }: BookingProviderProps) => {
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('BookingProvider rendered with booking:', booking, 'isLoading:', isLoading, 'error:', error);

  // Load booking from storage on mount
  useEffect(() => {
    const loadBooking = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get data from storage
        const savedBooking = safelyParseStorage<BookingDetails>(STORAGE_KEYS.BOOKING);
        const expiry = safelyParseStorage<number>(STORAGE_KEYS.EXPIRY);

        // Check if booking exists and hasn't expired
        if (savedBooking && expiry && Date.now() < expiry) {
          if (isValidBooking(savedBooking)) {
            setBooking(savedBooking);
          } else {
            // Invalid booking data
            cleanupExpiredBooking();
            setError('Invalid booking data');
            onError?.('Invalid booking data');
          }
        } else {
          // Expired or no booking
          cleanupExpiredBooking();
        }
      } catch (err) {
        console.error('Failed to load booking:', err);
        setError('Failed to load booking');
        onError?.('Failed to load booking');
        cleanupExpiredBooking();
      } finally {
        setIsLoading(false);
      }
    };

    loadBooking();
  }, [onError]);

  // Save to storage whenever booking changes
  useEffect(() => {
    if (booking && isValidBooking(booking)) {
      try {
        localStorage.setItem(STORAGE_KEYS.BOOKING, JSON.stringify(booking));
        localStorage.setItem(STORAGE_KEYS.EXPIRY, JSON.stringify(Date.now() + BOOKING_EXPIRY_MS));
        setError(null);
      } catch (err) {
        console.error('Failed to save booking:', err);
        setError('Failed to save booking');
        onError?.('Failed to save booking');
      }
    } else if (booking === null) {
      // Explicitly cleared
      cleanupExpiredBooking();
    }
  }, [booking, onError]);

  // Clear booking
  const clearBooking = useCallback(() => {
    setBooking(null);
    setError(null);
  }, []);

  // Update booking partially
  const updateBooking = useCallback((updates: Partial<BookingDetails>) => {
    setBooking(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      
      // Recalculate nights if dates changed
      if (updates.check_in_date || updates.check_out_date) {
        updated.nights = calculateNights(
          updates.check_in_date || prev.check_in_date,
          updates.check_out_date || prev.check_out_date
        );
      }
      
      return updated;
    });
  }, []);

  // Refresh booking from storage
  const refreshBooking = useCallback(() => {
    const savedBooking = safelyParseStorage<BookingDetails>(STORAGE_KEYS.BOOKING);
    const expiry = safelyParseStorage<number>(STORAGE_KEYS.EXPIRY);

    if (savedBooking && expiry && Date.now() < expiry && isValidBooking(savedBooking)) {
      setBooking(savedBooking);
      setError(null);
    } else {
      setBooking(null);
      cleanupExpiredBooking();
    }
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    booking,
    isLoading,
    error,
    setBooking,
    clearBooking,
    updateBooking,
    refreshBooking,
  }), [booking, isLoading, error, clearBooking, updateBooking, refreshBooking]);

  return (
    <BookingContext.Provider value={contextValue}>
      {children}
    </BookingContext.Provider>
  );
};

// Export the context for the hook
export { BookingContext };