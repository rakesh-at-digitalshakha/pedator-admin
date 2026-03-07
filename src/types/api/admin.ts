/**
 * Admin user types and related operations
 */

import type { PaginationParams } from "./common";

export type Permission = {
  resource: string;
  actions: ("create" | "read" | "update" | "delete" | "download")[];
};

export type Role = {
  _id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  isSystem: boolean;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminUser = {
  _id: string;
  name?: string;
  email: string;
  phoneNumber?: string;
  designation?: string;
  profilePicture?: string;
  role: Role;           // populated role document
  status: boolean;
  wallet?: number;       // not present on admin model — optional
  realWallet?: number;
  virtualWallet?: number;
  fcmToken?: string;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateAdminRequest = {
  email: string;
  password: string;
  role: string;         // roleId (ObjectId string)
  name?: string;
  phoneNumber?: string;
  designation?: string;
};

export type UpdateAdminRequest = {
  role?: string;        // roleId (ObjectId string)
  name?: string;
  phoneNumber?: string;
  designation?: string;
};

export type CreateRoleRequest = {
  name: string;
  description?: string;
  permissions: Permission[];
};

export type UpdateRoleRequest = Partial<CreateRoleRequest>;

export type AdminFilters = PaginationParams & {
  role?: string;
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
