"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/types";

const BASE = "/admin";

export function useTestSeries(params?: Record<string, string | number | boolean>) {
  const qs = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";
  return useQuery({
    queryKey: ["test-series", params],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<any>>(`${BASE}/test-series${qs}`);
      return response.data;
    }
  });
}

export function useTestSeriesDetail(id?: string) {
  return useQuery({
    enabled: !!id,
    queryKey: ["test-series", "detail", id],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<any>>(`${BASE}/test-series/${id}`);
      return response.data;
    },
  });
}

export function useTestSeriesResults(id?: string) {
  return useQuery({
    enabled: !!id,
    queryKey: ["test-series", "results", id],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<any>>(`${BASE}/test-series/${id}/results`);
      return response.data;
    },
  });
}

export function useDeleteTestSeries() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["test-series", "delete"],
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<ApiResponse<any>>(`${BASE}/test-series/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Test series deleted");
      qc.invalidateQueries({ queryKey: ["test-series"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
