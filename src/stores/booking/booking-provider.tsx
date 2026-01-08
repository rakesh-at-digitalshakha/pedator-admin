"use client";

import { createContext, useContext, useRef, type ReactNode } from "react";
import { useStore } from "zustand";

import { createBookingStore, type BookingState } from "./booking-store";

export type BookingStoreApi = ReturnType<typeof createBookingStore>;

export const BookingStoreContext = createContext<BookingStoreApi | undefined>(undefined);

export interface BookingStoreProviderProps {
  children: ReactNode;
}

export const BookingStoreProvider = ({ children }: BookingStoreProviderProps) => {
  const storeRef = useRef<BookingStoreApi | null>(null);
  if (storeRef.current == null) {
    storeRef.current = createBookingStore();
  }

  return <BookingStoreContext.Provider value={storeRef.current}>{children}</BookingStoreContext.Provider>;
};

export const useBookingStore = <T,>(selector: (store: BookingState) => T): T => {
  const bookingStoreContext = useContext(BookingStoreContext);

  if (!bookingStoreContext) {
    throw new Error("useBookingStore must be used within BookingStoreProvider");
  }

  return useStore(bookingStoreContext, selector);
};
