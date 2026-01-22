/**
 * Learner Management API hooks
 * Handles learner operations and management
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";

import { apiClient } from "@/lib/api/client";
import type { ApiResponse, CreateLearnerRequest, LearnerFilters, LearnerUser } from "@/types/api";

/**
 * Get all learners with filters
 */
export const useGetAllLearners = (filters?: LearnerFilters) => {
  return useQuery({
    queryKey: ["learners", filters?.page, filters?.limit, filters?.status, filters?.search, filters?.sortBy, filters?.order],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (filters?.page) params.append("page", filters.page.toString());
        if (filters?.limit) params.append("limit", filters.limit.toString());
        if (filters?.status) params.append("status", filters.status);
        if (filters?.search) params.append("search", filters.search);
        if (filters?.sortBy) params.append("sortBy", filters.sortBy);
        if (filters?.order) params.append("order", filters.order);

        const response = await apiClient.get<ApiResponse<LearnerUser[]>>(`/admin/learners?${params.toString()}`);
        return response.data;
      } catch (error: any) {
        console.error("Error fetching learners:", error);
        throw error;
      }
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};

/**
 * Get learner by ID
 */
export const useGetLearnerById = (id: string) => {
  return useQuery({
    queryKey: ["learner", id],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<LearnerUser>>(`/admin/learners/${id}`);
      return response.data;
    },
    enabled: !!id,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};

/**
 * Create learner (Admin)
 */
export const useCreateLearner = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<LearnerUser>, AxiosError, CreateLearnerRequest>({
    mutationFn: async (data) => {
      const response = await apiClient.post<ApiResponse<LearnerUser>>("/admin/learners", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learners"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
};

/**
 * Update learner (Admin)
 */
export const useUpdateLearner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<LearnerUser> }) => {
      const response = await apiClient.put<ApiResponse<LearnerUser>>(`/admin/learners/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learners"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["learner"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
};

/**
 * Delete learner (Soft delete)
 */
export const useDeleteLearner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<ApiResponse<void>>(`/admin/learners/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learners"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["learner"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
};
