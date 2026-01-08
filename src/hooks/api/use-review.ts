/**
 * Review Management API hooks
 * Handles course reviews, platform reviews, and mentor reviews
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import type {
  ApiResponse,
  MentorReview,
  MentorReviewFilters,
  MentorReplyRequest,
  PaginationParams,
  PlatformReview,
  Review,
  ReviewFilters,
  UpdatePlatformReviewStatusRequest,
} from "@/types/api";

/**
 * Get course reviews
 */
export const useGetCourseReviews = (courseId: string, params?: PaginationParams) => {
  return useQuery({
    queryKey: ["reviews", courseId, params],
    queryFn: async () => {
      const urlParams = new URLSearchParams();
      if (params?.page) urlParams.append("page", params.page.toString());
      if (params?.limit) urlParams.append("limit", params.limit.toString());

      const response = await apiClient.get<ApiResponse<Review[]>>(
        `/reviews/course/${courseId}?${urlParams.toString()}`,
      );
      return response.data;
    },
    enabled: !!courseId,
  });
};

/**
 * Get platform reviews
 */
export const useGetPlatformReviews = (filters?: ReviewFilters) => {
  return useQuery({
    queryKey: ["platform-reviews", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());
      if (filters?.status !== undefined) params.append("status", filters.status.toString());
      if (filters?.userModel) params.append("userModel", filters.userModel);
      if (filters?.search) params.append("search", filters.search);
      if (filters?.sortBy) params.append("sortBy", filters.sortBy);
      if (filters?.order) params.append("order", filters.order);

      const response = await apiClient.get<ApiResponse<{ data: PlatformReview[]; total: number; page: number; pages: number; count: number }>>(`/platform-reviews?${params.toString()}`);
      return response.data;
    },
  });
};

/**
 * Update platform review status
 */
export const useUpdatePlatformReviewStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdatePlatformReviewStatusRequest }) => {
      const response = await apiClient.patch<ApiResponse<PlatformReview>>(`/platform-reviews/${id}/status`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform-reviews"] });
    },
  });
};

/**
 * Delete platform review
 */
export const useDeletePlatformReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<ApiResponse<void>>(`/platform-reviews/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform-reviews"] });
    },
  });
};

/**
 * Get mentor reviews (Admin)
 */
export const useGetMentorReviews = (filters?: MentorReviewFilters) => {
  return useQuery({
    queryKey: ["mentor-reviews", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());
      if (filters?.mentorId) params.append("mentorId", filters.mentorId);
      if (filters?.learnerId) params.append("learnerId", filters.learnerId);
      if (filters?.courseId) params.append("courseId", filters.courseId);
      if (filters?.search) params.append("search", filters.search);
      if (filters?.sortBy) params.append("sortBy", filters.sortBy);
      if (filters?.order) params.append("order", filters.order);

      const response = await apiClient.get<ApiResponse<{ data: MentorReview[]; total: number; page: number; pages: number; count: number }>>(`/admin/mentor-reviews?${params.toString()}`);
      return response.data;
    },
  });
};

/**
 * Get mentor reviews by mentor ID
 */
export const useGetMentorReviewsByMentorId = (mentorId: string, params?: PaginationParams) => {
  return useQuery({
    queryKey: ["mentor-reviews", "mentor", mentorId, params],
    queryFn: async () => {
      const urlParams = new URLSearchParams();
      if (params?.page) urlParams.append("page", params.page.toString());
      if (params?.limit) urlParams.append("limit", params.limit.toString());

      const response = await apiClient.get<ApiResponse<MentorReview[]>>(
        `/mentor/review/mentor/${mentorId}?${urlParams.toString()}`,
      );
      return response.data;
    },
    enabled: !!mentorId,
  });
};

/**
 * Submit mentor reply to review
 */
export const useSubmitMentorReply = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, data }: { reviewId: string; data: MentorReplyRequest }) => {
      const response = await apiClient.post<ApiResponse<MentorReview>>(`/mentor/review/${reviewId}/reply`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentor-reviews"] });
    },
  });
};

/**
 * Delete mentor review
 */
export const useDeleteMentorReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId: string) => {
      const response = await apiClient.delete<ApiResponse<void>>(`/mentor/review/${reviewId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentor-reviews"] });
    },
  });
};
