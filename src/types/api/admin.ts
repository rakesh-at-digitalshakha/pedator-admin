/**
 * Admin user types and related operations
 */

import type { PaginationParams } from "./common";

export type AdminUser = {
  _id: string;
  name?: string;
  email: string;
  phoneNumber?: string;
  profilePicture?: string;
  role: "admin" | "super-admin";
  status: boolean;
  wallet: number;
  realWallet: number;
  virtualWallet: number;
  fcmToken?: string;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateAdminRequest = {
  email: string;
  password: string;
  role: "admin" | "super-admin";
};

export type UpdateAdminRequest = {
  email?: string;
  role?: "admin" | "super-admin";
};

export type AdminFilters = PaginationParams & {
  role?: "admin" | "super-admin";
  search?: string;
  sortBy?: string;
  order?: "asc" | "desc";
};

export type AdminStats = {
  totalMentors: number;
  totalLearners: number;
  pendingMentors: number;
  totalRevenue: number;
  monthlyRevenue: number;
  platformBalance: number;
  totalCourses?: number;
  activeCourses?: number;
  totalBookings?: number;
  completedBookings?: number;
};
