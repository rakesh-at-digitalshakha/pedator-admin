import { createStore } from "zustand/vanilla";

import type { Booking } from "@/types/api";

export type BookingState = {
  bookings: Booking[];
  selectedBooking: Booking | null;
  setBookings: (bookings: Booking[]) => void;
  setSelectedBooking: (booking: Booking | null) => void;
  addBooking: (booking: Booking) => void;
  updateBooking: (id: string, updates: Partial<Booking>) => void;
  removeBooking: (id: string) => void;
  clearBookings: () => void;
};

export const createBookingStore = (init?: Partial<BookingState>) =>
  createStore<BookingState>()((set) => ({
    bookings: init?.bookings ?? [],
    selectedBooking: init?.selectedBooking ?? null,

    setBookings: (bookings) => set({ bookings }),

    setSelectedBooking: (booking) => set({ selectedBooking: booking }),

    addBooking: (booking) =>
      set((state) => ({
        bookings: [...state.bookings, booking],
      })),

    updateBooking: (id, updates) =>
      set((state) => ({
        bookings: state.bookings.map((booking) => (booking._id === id ? { ...booking, ...updates } : booking)),
        selectedBooking:
          state.selectedBooking?._id === id ? { ...state.selectedBooking, ...updates } : state.selectedBooking,
      })),

    removeBooking: (id) =>
      set((state) => ({
        bookings: state.bookings.filter((booking) => booking._id !== id),
        selectedBooking: state.selectedBooking?._id === id ? null : state.selectedBooking,
      })),

    clearBookings: () => set({ bookings: [], selectedBooking: null }),
  }));
