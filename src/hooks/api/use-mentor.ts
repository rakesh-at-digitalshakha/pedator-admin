/**
 * Mentor Management API hooks
 * Handles mentor approval, rejection, and management
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";

import { apiClient } from "@/lib/api/client";
import type { ApiResponse, MentorFilters, MentorUser, CreateMentorRequest } from "@/types/api";

const BASE = "/admin";

/**
 * Get all mentors with filters
 */
export const useGetAllMentors = (filters?: MentorFilters) => {
  return useQuery({
    queryKey: ["mentors", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());
      if (filters?.status) params.append("status", filters.status);
      if (filters?.search) params.append("search", filters.search);
      if (filters?.sortBy) params.append("sortBy", filters.sortBy);
      if (filters?.order) params.append("order", filters.order);

      const response = await apiClient.get<ApiResponse<MentorUser[]>>(`${BASE}/mentors?${params.toString()}`);
      return response.data;
    },
  });
};

/**
 * Get mentor by ID
 */
export const useGetMentorById = (id: string) => {
  return useQuery({
    queryKey: ["mentor", id],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<MentorUser>>(`${BASE}/mentors/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

/**
 * Get unapproved mentors with filters
 */
export const useGetUnapprovedMentors = (filters?: MentorFilters) => {
  return useQuery({
    queryKey: ["unapproved-mentors", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());
      if (filters?.search) params.append("search", filters.search);
      if (filters?.sortBy) params.append("sortBy", filters.sortBy);
      if (filters?.order) params.append("order", filters.order);

      const response = await apiClient.get<ApiResponse<MentorUser[]>>(
        `${BASE}/unapproved-mentors?${params.toString()}`
      );
      return response.data;
    },
  });
};

/**
 * Approve mentor
 */
export const useApproveMentor = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<MentorUser>, AxiosError, string>({
    mutationFn: async (mentorId) => {
      const response = await apiClient.patch<ApiResponse<MentorUser>>(`${BASE}/mentors/${mentorId}/approve`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unapproved-mentors"] });
      queryClient.invalidateQueries({ queryKey: ["mentors"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

/**
 * Reject mentor
 */
export const useRejectMentor = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<void>, AxiosError, { mentorId: string; rejectionReason?: string }>({
    mutationFn: async ({ mentorId, rejectionReason }) => {
      const response = await apiClient.patch<ApiResponse<void>>(`${BASE}/mentors/${mentorId}/reject`, {
        rejectionReason,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unapproved-mentors"] });
      queryClient.invalidateQueries({ queryKey: ["mentors"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
};

/**
 * Update mentor (Admin)
 */
export const useUpdateMentor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<MentorUser> }) => {
      const response = await apiClient.put<ApiResponse<MentorUser>>(`${BASE}/mentors/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentors"] });
    },
  });
};

/**
 * Create mentor (Admin)
 */
export const useCreateMentor = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<MentorUser>, AxiosError, CreateMentorRequest>({
    mutationFn: async (data) => {
      const response = await apiClient.post<ApiResponse<MentorUser>>(`${BASE}/mentors`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentors"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
};

/**
 * Delete mentor (Soft delete)
 */
export const useDeleteMentor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<ApiResponse<void>>(`${BASE}/mentors/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentors"] });
    },
  });
};
