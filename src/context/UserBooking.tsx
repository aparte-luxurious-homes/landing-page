import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface BookingDetails {
  id: string;
  title: string;
  check_in_date: string;
  check_out_date: string;
  adults: number;
  children: number;
  pets: number;
  nights: number;
  base_price: number;
  caution_fee: number;
  total_charging_fee: number;
  unit_image: string;
  unit_count: number;
  unit_id: string;
  owner?: {
    profile?: {
      firstName: string;
      lastName: string;
    };
  };
}

interface BookingContextType {
  booking: BookingDetails | null;
  setBooking: React.Dispatch<React.SetStateAction<BookingDetails | null>>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

const STORAGE_KEY = 'aparte_last_booking';

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [booking, setBooking] = useState<BookingDetails | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (booking) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(booking));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [booking]);

  return (
    <BookingContext.Provider value={{ booking, setBooking }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
};