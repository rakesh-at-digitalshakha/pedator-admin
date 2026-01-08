/**
 * Video Session Management API hooks
 * Handles video session tracking and management
 */

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import type { ApiResponse, VideoSession, VideoSessionFilters } from "@/types/api";

/**
 * Get all video sessions
 */
export const useGetAllVideoSessions = (filters?: VideoSessionFilters) => {
  return useQuery({
    queryKey: ["video-sessions", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());
      if (filters?.status) params.append("status", filters.status);
      if (filters?.mentorId) params.append("mentorId", filters.mentorId);
      if (filters?.learnerId) params.append("learnerId", filters.learnerId);
      if (filters?.search) params.append("search", filters.search);
      if (filters?.sortBy) params.append("sortBy", filters.sortBy);
      if (filters?.order) params.append("order", filters.order);

      const response = await apiClient.get<ApiResponse<{ data: VideoSession[]; total: number; page: number; pages: number; count: number }>>(`/admin/video-sessions?${params.toString()}`);
      return response.data;
    },
  });
};

/**
 * Get video session by ID
 */
export const useGetVideoSessionById = (sessionId: string) => {
  return useQuery({
    queryKey: ["video-session", sessionId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<VideoSession>>(`/video-sessions/${sessionId}`);
      return response.data;
    },
    enabled: !!sessionId,
  });
};
