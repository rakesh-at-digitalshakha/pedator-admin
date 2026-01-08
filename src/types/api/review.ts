/**
 * Review and rating types
 */

import type { PaginationParams } from "./common";

/**
 * Course Review type
 */
export type Review = {
  _id: string;
  learnerId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  courseId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
};

/**
 * Platform Review type (for app/platform feedback)
 */
export type PlatformReview = {
  _id: string;
  userId: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  userModel: "learners" | "mentors";
  rating: number;
  review: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
};

/**
 * Mentor Review type (detailed ratings for mentor performance)
 */
export type MentorReview = {
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
  sessionId?: string;
  testSeriesId?: string;
  courseId?: {
    _id: string;
    title: string;
  };
  ratings: {
    communication: number;
    knowledge: number;
    engagement: number;
    clarity: number;
    supportiveness: number;
  };
  averageRating: number;
  comment: string;
  mentorReply?: string;
  repliedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type ReviewFilters = PaginationParams & {
  status?: boolean;
  userModel?: "learners" | "mentors";
  search?: string;
  sortBy?: "createdAt" | "rating" | "review";
  order?: "asc" | "desc";
};

export type MentorReviewFilters = PaginationParams & {
  mentorId?: string;
  learnerId?: string;
  courseId?: string;
  search?: string;
  sortBy?: "createdAt" | "averageRating" | "updatedAt";
  order?: "asc" | "desc";
};

export type UpdatePlatformReviewStatusRequest = {
  status: boolean;
};

export type MentorReplyRequest = {
  mentorReply: string;
};
