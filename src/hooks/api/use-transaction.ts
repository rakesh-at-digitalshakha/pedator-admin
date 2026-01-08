/**
 * Transaction & Wallet Management API hooks
 * Handles transactions, withdrawals, and wallet operations
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";

import { apiClient } from "@/lib/api/client";
import type {
  AdminUser,
  ApiResponse,
  Transaction,
  TransactionFilters,
  UpdateWalletRequest,
  WithdrawRequest,
} from "@/types/api";

/**
 * Get all transactions
 */
export const useGetAllTransactions = (filters?: TransactionFilters) => {
  return useQuery({
    queryKey: ["transactions", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());
      if (filters?.type) params.append("type", filters.type);
      if (filters?.status) params.append("status", filters.status);
      if (filters?.userId) params.append("userId", filters.userId);
      if (filters?.userModel) params.append("userModel", filters.userModel);
      if (filters?.startDate) params.append("startDate", filters.startDate);
      if (filters?.endDate) params.append("endDate", filters.endDate);
      if (filters?.search) params.append("search", filters.search);
      if (filters?.sortBy) params.append("sortBy", filters.sortBy);
      if (filters?.order) params.append("order", filters.order);

      const response = await apiClient.get<ApiResponse<{ data: Transaction[]; total: number; page: number; pages: number; count: number }>>(`/admin/transactions?${params.toString()}`);
      return response.data;
    },
  });
};

/**
 * Get transaction by ID
 */
export const useGetTransactionById = (id: string) => {
  return useQuery({
    queryKey: ["transaction", id],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Transaction>>(`/admin/transactions/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

/**
 * Withdraw funds
 */
export const useWithdraw = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<Transaction>, AxiosError, WithdrawRequest>({
    mutationFn: async (data) => {
      const response = await apiClient.post<ApiResponse<Transaction>>("/admin/withdraw", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
};

/**
 * Update admin wallet (Super Admin only)
 */
export const useUpdateWallet = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<AdminUser>, AxiosError, UpdateWalletRequest>({
    mutationFn: async (data) => {
      const response = await apiClient.patch<ApiResponse<AdminUser>>("/admin/wallet", data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      queryClient.invalidateQueries({ queryKey: ["admin", variables.adminId] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
};
