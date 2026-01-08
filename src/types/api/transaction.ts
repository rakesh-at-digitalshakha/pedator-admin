/**
 * Transaction and wallet types
 */

import type { PaginationParams } from "./common";

export type Transaction = {
  _id: string;
  userId: string | {
    _id: string;
    email?: string;
    firstName?: string;
    lastName?: string;
  };
  userModel: "learners" | "mentors" | "adminusers";
  slotId?: string;
  courseId?: string | {
    _id: string;
    title?: string;
  };
  type: "purchase" | "mentor_earning" | "platform_fee" | "withdrawal" | "deposit" | "refund";
  amount: number;
  status: "pending" | "completed" | "failed" | "refunded";
  description: string;
  razorpayDetails?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type WithdrawRequest = {
  amount: number;
};

export type UpdateWalletRequest = {
  adminId: string;
  amount: number;
  type: "add" | "subtract";
  description?: string;
};

export type TransactionFilters = PaginationParams & {
  type?: Transaction["type"];
  status?: Transaction["status"];
  userId?: string;
  userModel?: Transaction["userModel"];
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: "createdAt" | "amount" | "type" | "status";
  order?: "asc" | "desc";
};
