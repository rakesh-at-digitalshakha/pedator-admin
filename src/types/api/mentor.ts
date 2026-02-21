/**
 * Mentor user types and related operations
 */

import type { PaginationParams } from "./common";

export type MentorUser = {
  _id: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  dob?: string;
  displayName?: string;
  description?: string;
  username?: string;
  profileImage?: string;
  bio?: string;
  signUpMotivation?: string;
  commitmentOfTeachingHour?: string;
  email: string;
  mobile: number;
  phoneNumber?: string;
  password?: string;
  otp?: number;
  otpExpires?: string;
  languages?: Array<{
    name: string;
    level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "NATIVE";
  }>;
  ocupations?: string[];
  skills?: Array<{
    name: string;
    level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  }>;
  education?: Array<{
    country: string;
    collegeOrUniversity: string;
    title: string;
    major: string;
    year: string;
  }>;
  certificates?: Array<{
    certificateOrAward: string;
    certificateFrom: string;
    year: string;
  }>;
  country?: string;
  address?: string;
  city?: string;
  postalCode?: number;
  livePhoto?: string;
  introVideo?: string;
  numberOfExperience?: number;
  joiningDate?: string;
  createdDate?: string;
  isVerified?: boolean;
  isBlocked?: boolean;
  isDeleted?: boolean;
  isDeactivated?: boolean;
  deactivatedAt?: string;
  reactivatedAt?: string;
  isEmailVerified?: boolean;
  isMobileVerified?: boolean;
  isProfileCompleted?: boolean;
  isProfileApproved: boolean;
  isProfileRejected?: boolean;
  rejectionReason?: string;
  idCardType?: string;
  idCard?: string;
  isIdCardApproved?: boolean;
  documents?: string[];
  isFullyVerified?: boolean;
  status?: boolean;
  role?: string;
  realWallet?: number;
  virtualWallet?: number;
  wallet: number;
  bankAccount?: {
    accountNumber?: string;
    ifscCode?: string;
    accountHolderName?: string;
    bankName?: string;
    accountType?: 'savings' | 'current';
    addedAt?: string;
    updatedAt?: string;
  };
  fcmToken?: string;
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
  displayName?: string;
  email: string;
  mobile: number;
  password: string;
  dob?: string;
  description?: string;
  bio?: string;
  country?: string;
  city?: string;
  address?: string;
  postalCode?: string;
  numberOfExperience?: number;
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
