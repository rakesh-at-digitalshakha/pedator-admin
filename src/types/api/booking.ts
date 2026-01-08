/**
 * Booking types and related operations
 */

import type { PaginationParams } from "./common";

export type Booking = {
  _id: string;
  learnerId: {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
    mobile?: number;
  };
  courseId: {
    _id: string;
    title: string;
    price?: number;
    description?: string;
  };
  mentorId: {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
    mobile?: number;
  };
  courseSlotId: {
    _id: string;
    slotDate: string;
    startTime: string;
    endTime: string;
  };
  bookingDate: string;
  bookingStatus: "pending" | "accepted" | "rejected" | "completed" | "cancelled" | "missed";
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  amount?: number;
  razorpayDetails?: {
    orderId?: string;
    paymentId?: string;
    signature?: string;
    amount?: number;
  };
  isRescheduled?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type BookingFilters = PaginationParams & {
  status?: Booking["bookingStatus"];
  mentorId?: string;
  learnerId?: string;
  courseId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: "bookingDate" | "createdAt";
  order?: "asc" | "desc";
};

export type CreateBookingRequest = {
  courseId: string;
  courseSlotId: string;
  learnerId: string;
  bookingDate: string;
  bookingStatus?: Booking["bookingStatus"];
  paymentStatus?: Booking["paymentStatus"];
  amount?: number;
};

export type UpdateBookingRequest = {
  courseId?: string;
  courseSlotId?: string;
  learnerId?: string;
  bookingDate?: string;
  bookingStatus?: Booking["bookingStatus"];
  paymentStatus?: Booking["paymentStatus"];
  amount?: number;
};
