/**
 * Course types and related operations
 */

import type { PaginationParams } from "./common";

export type Course = {
  _id: string;
  title: string;
  description: string;
  mentorId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  categoryId: {
    _id: string;
    name: string;
  };
  subCategoryId?: {
    _id: string;
    name: string;
  };
  price: number;
  duration: string;
  isCourseApproved: boolean;
  isCourseRejected: boolean;
  rejectionReason?: string;
  status: boolean;
  averageRating?: number;
  numberOfReviews?: number;
  coverImage?: string;
  images?: string[];
  video?: string;
  documents?: string[];
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
  keypointsOfCourse?: string[];
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CourseFilters = PaginationParams & {
  status?: "approved" | "pending" | "rejected";
  categoryId?: string;
  subCategoryId?: string;
  mentorId?: string;
  search?: string;
  sortBy?: "price" | "createdAt" | "averageRating";
  order?: "asc" | "desc";
  minPrice?: number;
  maxPrice?: number;
};

export type CreateCourseRequest = {
  title: string;
  description: string;
  categoryId: string;
  subCategoryId?: string;
  mentorId: string;
  price: number;
  status?: boolean;
};
