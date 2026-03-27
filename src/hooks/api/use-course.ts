/**
 * Course Management API hooks
 * Handles course approval, rejection, and management
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import type { ApiResponse, Course, CourseFilters, CreateCourseRequest, UpdateCourseRequest } from "@/types/api";

/**
 * Get all courses with filters (Admin)
 */
export const useGetAllCourses = (filters?: CourseFilters) => {
  return useQuery({
    queryKey: ["courses", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());
      if (filters?.status) params.append("status", filters.status);
      if (filters?.categoryId) params.append("categoryId", filters.categoryId);
      if (filters?.subCategoryId) params.append("subCategoryId", filters.subCategoryId);
      if (filters?.moduleId) params.append("moduleId", filters.moduleId);
      if (filters?.lessonId) params.append("lessonId", filters.lessonId);
      if (filters?.mentorId) params.append("mentorId", filters.mentorId);
      if (filters?.search) params.append("search", filters.search);
      if (filters?.sortBy) params.append("sortBy", filters.sortBy);
      if (filters?.order) params.append("order", filters.order);
      if (filters?.minPrice) params.append("minPrice", filters.minPrice.toString());
      if (filters?.maxPrice) params.append("maxPrice", filters.maxPrice.toString());

      const response = await apiClient.get<ApiResponse<{ data: Course[]; total: number; page: number; pages: number; count: number }>>(`/admin/courses?${params.toString()}`);
      return response.data;
    },
  });
};

/**
 * Get course by ID
 */
export const useGetCourseById = (id: string) => {
  return useQuery({
    queryKey: ["course", id],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Course>>(`/course/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

/**
 * Approve course
 */
export const useApproveCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      const response = await apiClient.patch<ApiResponse<Course>>(`/admin/courses/${courseId}/approve`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
};

/**
 * Reject course
 */
export const useRejectCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, rejectionReason }: { courseId: string; rejectionReason: string }) => {
      const response = await apiClient.patch<ApiResponse<Course>>(`/admin/courses/${courseId}/reject`, {
        rejectionReason,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["courses", "pending"] });
    },
  });
};

/**
 * Update course (Admin)
 */
export const useUpdateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCourseRequest }) => {
      const response = await apiClient.put<ApiResponse<Course>>(`/admin/courses/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
};

/**
 * Delete course (Soft delete)
 */
export const useDeleteCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<ApiResponse<void>>(`/admin/courses/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
};

/**
 * Get pending courses (not approved)
 */
export const useGetPendingCourses = (filters?: CourseFilters) => {
  return useQuery({
    queryKey: ["courses", "pending", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());
      if (filters?.search) params.append("search", filters.search);
      if (filters?.sortBy) params.append("sortBy", filters.sortBy);
      if (filters?.order) params.append("order", filters.order);
      params.append("status", "pending");

      const response = await apiClient.get<ApiResponse<{ data: Course[]; total: number; page: number; pages: number; count: number }>>(`/admin/courses?${params.toString()}`);
      return response.data;
    },
  });
};

/**
 * Create course (Admin)
 */
export const useCreateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCourseRequest) => {
      const response = await apiClient.post<ApiResponse<Course>>("/admin/courses", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
};
