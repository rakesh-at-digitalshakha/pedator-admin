/**
 * Learner user types and related operations
 */

import type { PaginationParams } from "./common";

export type LearnerUser = {
  _id: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  username?: string;
  email?: string;
  mobile?: number;
  description?: string;
  aboutUser?: string;
  profileImage?: string;
  idCard?: string;
  documents?: string[];
  dob?: string;
  occupation?: string;
  isVerified: boolean;
  isBlocked: boolean;
  blockReason?: string;
  isEmailVerified?: boolean;
  isMobileVerified?: boolean;
  isInitialProfileCompleted?: boolean;
  isLandingProfileInfoCompleted?: boolean;
  wallet?: number;
  realWallet?: number;
  virtualWallet?: number;
  enrolledCourses: string[];
  savedCourses: string[];
  interestedKeyTopics: string[];
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type LearnerFilters = PaginationParams & {
  status?: "active" | "blocked" | "verified" | "unverified";
  search?: string;
  sortBy?: "createdAt" | "firstName" | "email";
  order?: "asc" | "desc";
};

export type CreateLearnerRequest = {
  firstName: string;
  lastName: string;
  fullName?: string;
  username?: string;
  email: string;
  mobile: number | string;
  password: string;
  description?: string;
  aboutUser?: string;
  profileImage?: string;
  idCard?: string;
  documents?: string[];
  dob?: string;
  occupation?: string;
  isBlocked?: boolean;
  isVerified?: boolean;
  isEmailVerified?: boolean;
  isMobileVerified?: boolean;
  isInitialProfileCompleted?: boolean;
  isLandingProfileInfoCompleted?: boolean;
};
