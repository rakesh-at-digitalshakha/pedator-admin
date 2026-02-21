"use client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/types";

// Types for analytics responses
export type RevenueAnalytics = {
  totalRevenue: number;
  platformCommission: number;
  revenueByType: Array<{ _id: string; totalAmount: number; count: number }>;
  revenueOverTime: Array<{ _id: string; totalRevenue: number; transactionCount: number }>;
  revenueByCategory: Array<{ _id: string; totalRevenue: number; courseCount: number }>;
};

export type UserGrowthAnalytics = {
  totalUsers: {
    learners: number;
    mentors: number;
    total: number;
  };
  activeUsers: {
    learners: number;
    mentors: number;
  };
  retentionRate: string;
  learnerGrowth: Array<{ _id: string; newUsers: number }>;
  mentorGrowth: Array<{ _id: string; newMentors: number }>;
};

export type EngagementAnalytics = {
  sessionCompletionRate: string;
  averageRatingTrend: Array<{ _id: string; avgRating: number; reviewCount: number }>;
  popularCourses: Array<{ _id: string; title: string; averageRating: number }>;
  popularMentors: Array<{ _id: string; fullName: string; averageRating: number }>;
  stats: {
    totalBookings: number;
    totalSessions: number;
    completedSessions: number;
  };
};

export type CoursePerformanceAnalytics = {
  courseStats: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  };
  topCoursesByRevenue: Array<{
    _id: string;
    title: string;
    totalRevenue: number;
    bookingCount: number;
    averageRating: number;
  }>;
};

export type DashboardOverview = {
  overview: {
    totalLearners: number;
    totalMentors: number;
    totalCourses: number;
    totalRevenue: number;
    activeSessions: number;
  };
  pendingApprovals: {
    mentors: number;
    courses: number;
  };
  last24Hours: {
    newLearners: number;
    newMentors: number;
    newCourses: number;
  };
};

export function useDashboardOverview() {
  return useQuery({
    queryKey: ["analytics", "dashboard"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<DashboardOverview>>("/admin/analytics/dashboard");
      return response.data;
    },
  });
}

export function useRevenueAnalytics(params?: Record<string, string | number | boolean>) {
  const qs = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";
  return useQuery({
    queryKey: ["analytics", "revenue", params],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<RevenueAnalytics>>(`/admin/analytics/revenue${qs}`);
      return response.data;
    },
  });
}

export function useUserAnalytics(params?: Record<string, string | number | boolean>) {
  const qs = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";
  return useQuery({
    queryKey: ["analytics", "users", params],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<UserGrowthAnalytics>>(`/admin/analytics/users${qs}`);
      return response.data;
    },
  });
}

export function useEngagementAnalytics(params?: Record<string, string | number | boolean>) {
  const qs = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";
  return useQuery({
    queryKey: ["analytics", "engagement", params],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<EngagementAnalytics>>(`/admin/analytics/engagement${qs}`);
      return response.data;
    },
  });
}

export function useCourseAnalytics(params?: Record<string, string | number | boolean>) {
  const qs = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";
  return useQuery({
    queryKey: ["analytics", "courses", params],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<CoursePerformanceAnalytics>>(`/admin/analytics/courses${qs}`);
      return response.data;
    },
  });
}

export function useGenerateReport() {
  return useMutation({
    mutationKey: ["reports", "generate"],
    mutationFn: async (payload: unknown) => {
      const response = await apiClient.post("/admin/reports/generate", payload);
      return response.data;
    },
    onSuccess: () => toast.success("Report generated"),
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useExportReport() {
  return useMutation({
    mutationKey: ["reports", "export"],
    mutationFn: async (payload: unknown) => {
      const response = await apiClient.post("/admin/reports/export", payload);
      return response.data;
    },
    onSuccess: () => toast.success("Report exported"),
    onError: (e: Error) => toast.error(e.message),
  });
}
