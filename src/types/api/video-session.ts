/**
 * Video session types
 */

import type { PaginationParams } from "./common";

export type VideoSession = {
  _id: string;
  slotBookingId?: string;
  bookingId: {
    _id: string;
    learnerId: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    mentorId: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  courseId?: string;
  learnerId?: string;
  mentorId?: string;
  transactionId?: string;
  roomSid?: string;
  status: "scheduled" | "ongoing" | "completed" | "cancelled" | "pending" | "active" | "ended" | "failed";
  participants?: Array<{
    userId: string;
    userModel: "learners" | "mentors";
  }>;
  startTime: string;
  endTime?: string;
  duration?: number;
  recordingUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export type VideoSessionFilters = PaginationParams & {
  status?: "pending" | "active" | "ended" | "failed" | "scheduled" | "ongoing" | "completed" | "cancelled";
  mentorId?: string;
  learnerId?: string;
  search?: string;
  sortBy?: "createdAt" | "startTime" | "duration" | "status";
  order?: "asc" | "desc";
};

export type CreateVideoSessionRequest = {
  slotBookingId: string;
  courseId?: string;
  startTime: string;
};

export type JoinVideoSessionRequest = {
  userId: string;
  userModel: "learners" | "mentors";
};

export type EndVideoSessionRequest = {
  endTime: string;
  recordingUrl?: string;
};
