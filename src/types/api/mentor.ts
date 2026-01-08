/**
 * Mentor user types and related operations
 */

import type { PaginationParams } from "./common";

export type MentorUser = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: number;
  phoneNumber?: string;
  profileImage?: string;
  bio?: string;
  education?: Array<{
    country: string;
    collegeOrUniversity: string;
    title: string;
    major: string;
    year: string;
  }>;
  skills?: Array<{
    name: string;
    level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  }>;
  languages?: Array<{
    name: string;
    level: "BASIC" | "INTERMEDIATE" | "ADVANCED" | "NATIVE";
  }>;
  isProfileApproved: boolean;
  isProfileRejected: boolean;
  rejectionReason?: string;
  isBlocked?: boolean;
  blockReason?: string;
  isDeleted: boolean;
  wallet: number;
  totalEarnings?: number;
  approvedAt?: string;
  rejectedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type ApproveMentorRequest = {
  mentorId: string;
};

export type CreateMentorRequest = {
  firstName: string;
  lastName: string;
  email: string;
  mobile: number;
  password: string;
  phoneNumber?: string;
  bio?: string;
  isProfileApproved?: boolean;
};

export type RejectMentorRequest = {
  mentorId: string;
  rejectionReason?: string;
};

export type MentorFilters = PaginationParams & {
  status?: "approved" | "pending" | "rejected";
  search?: string;
  sortBy?: "createdAt" | "firstName" | "email";
  order?: "asc" | "desc";
};
