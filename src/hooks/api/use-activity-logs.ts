"use client";
import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/types";

const BASE = "/admin";

export function useActivityLogs(params?: Record<string, string | number | boolean>) {
  const qs = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";
  return useQuery({
    queryKey: ["activity-logs", params],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<any>>(`${BASE}/activity-logs${qs}`);
      return response.data;
    }
  });
}

export function useAdminActions(adminId?: string, params?: Record<string, string | number | boolean>) {
  const qs = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";
  return useQuery({
    enabled: !!adminId,
    queryKey: ["activity-logs", "admin", adminId, params],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<any>>(`${BASE}/activity-logs/${adminId}${qs}`);
      return response.data;
    },
  });
}

export function useLoginHistory(params?: Record<string, string | number | boolean>) {
  const qs = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";
  return useQuery({
    queryKey: ["login-history", params],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<any>>(`${BASE}/login-history${qs}`);
      return response.data;
    }
  });
}
