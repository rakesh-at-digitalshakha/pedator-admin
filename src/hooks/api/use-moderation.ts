"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/types";

const BASE = "/admin";

export function useFlaggedContent(params?: Record<string, string | number | boolean>) {
  const qs = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";
  return useQuery({
    queryKey: ["moderation", "flagged", params],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<any>>(`${BASE}/moderation/flagged${qs}`);
      return response.data;
    },
    staleTime: 30_000,
    retry: 1,
  });
}

export function useFlagContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["moderation", "flag"],
    mutationFn: async (vars: { id: string; reason?: string }) => {
      const response = await apiClient.post<ApiResponse<any>>(`${BASE}/content/${vars.id}/flag`, { reason: vars.reason });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Content flagged");
      qc.invalidateQueries({ queryKey: ["moderation", "flagged"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useSuspendUser() {
  return useMutation({
    mutationKey: ["moderation", "suspend"],
    mutationFn: async (vars: { id: string; reason?: string }) => {
      const response = await apiClient.post<ApiResponse<any>>(`${BASE}/users/${vars.id}/suspend`, vars);
      return response.data;
    },
    onSuccess: () => toast.success("User suspended"),
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useBanUser() {
  return useMutation({
    mutationKey: ["moderation", "ban"],
    mutationFn: async (vars: { id: string; reason?: string }) => {
      const response = await apiClient.post<ApiResponse<any>>(`${BASE}/users/${vars.id}/ban`, vars);
      return response.data;
    },
    onSuccess: () => toast.success("User banned"),
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUnbanUser() {
  return useMutation({
    mutationKey: ["moderation", "unban"],
    mutationFn: async (vars: { id: string }) => {
      const response = await apiClient.delete<ApiResponse<any>>(`${BASE}/users/${vars.id}/ban`);
      return response.data;
    },
    onSuccess: () => toast.success("User unbanned"),
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useModerationLogs(params?: Record<string, string | number | boolean>) {
  const qs = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";
  return useQuery({
    queryKey: ["moderation", "logs", params],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<any>>(`${BASE}/moderation-logs${qs}`);
      return response.data;
    }
  });
}
