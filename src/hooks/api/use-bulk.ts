"use client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/types";

const BASE = "/admin";

export function useBulkImportUsers() {
  return useMutation({
    mutationKey: ["bulk", "users", "import"],
    mutationFn: async (payload: unknown) => {
      const response = await apiClient.post<ApiResponse<any>>(`${BASE}/users/bulk-import`, payload);
      return response.data;
    },
    onSuccess: () => toast.success("Users imported"),
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useBulkExportUsers() {
  return useMutation({
    mutationKey: ["bulk", "users", "export"],
    mutationFn: async (payload?: unknown) => {
      const response = await apiClient.post<ApiResponse<any>>(`${BASE}/users/bulk-export`, payload);
      return response.data;
    },
    onSuccess: () => toast.success("Users export started"),
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useBulkSendNotifications() {
  return useMutation({
    mutationKey: ["bulk", "notifications", "send"],
    mutationFn: async (payload: unknown) => {
      const response = await apiClient.post<ApiResponse<any>>(`${BASE}/notifications/bulk-send`, payload);
      return response.data;
    },
    onSuccess: () => toast.success("Notifications sent"),
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useBulkApproveCourses() {
  return useMutation({
    mutationKey: ["bulk", "courses", "approve"],
    mutationFn: async (payload: { courseIds: string[] }) => {
      const response = await apiClient.post<ApiResponse<any>>(`${BASE}/courses/bulk-approve`, payload);
      return response.data;
    },
    onSuccess: () => toast.success("Courses approved"),
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useBulkApproveMentors() {
  return useMutation({
    mutationKey: ["bulk", "mentors", "approve"],
    mutationFn: async (payload: { mentorIds: string[] }) => {
      const response = await apiClient.post<ApiResponse<any>>(`${BASE}/mentors/bulk-approve`, payload);
      return response.data;
    },
    onSuccess: () => toast.success("Mentors approved"),
    onError: (e: Error) => toast.error(e.message),
  });
}
