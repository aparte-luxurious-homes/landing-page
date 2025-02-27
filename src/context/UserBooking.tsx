import React, { createContext, useContext, useState, ReactNode } from "react";

interface BookingDetails {
  id: string;
  title: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  pets: number;
  nights: number;
  basePrice: number;
  totalChargingFee: number;
  unitImage: string;
  unitId: number;
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

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [booking, setBooking] = useState<BookingDetails | null>(null);

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