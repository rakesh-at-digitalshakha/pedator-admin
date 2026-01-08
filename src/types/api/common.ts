/**
 * Common API types used across the application
 */

export type ApiResponse<T> = {
  status: string;
  message: string;
  data?: T;
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
};

export type ApiError = {
  status: string;
  message: string;
  error?: string;
};

export type PaginationParams = {
  page?: number;
  limit?: number;
};
