"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/types";

const BASE = "/admin";

export function useDisputes(params?: Record<string, string | number | boolean>) {
  const qs = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";
  return useQuery({
    queryKey: ["disputes", params],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<any>>(`${BASE}/disputes${qs}`);
      return response.data;
    }
  });
}

export function useDispute(id?: string) {
  return useQuery({
    enabled: !!id,
    queryKey: ["disputes", "detail", id],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<any>>(`${BASE}/disputes/${id}`);
      return response.data;
    },
  });
}

export function useUpdateDisputeStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["disputes", "status"],
    mutationFn: async (vars: { id: string; status: string }) => {
      const response = await apiClient.patch<ApiResponse<any>>(`${BASE}/disputes/${vars.id}/status`, { status: vars.status });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Dispute status updated");
      qc.invalidateQueries({ queryKey: ["disputes"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useResolveDispute() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["disputes", "resolve"],
    mutationFn: async (vars: { id: string; action: string; notes?: string }) => {
      const response = await apiClient.post<ApiResponse<any>>(`${BASE}/disputes/${vars.id}/resolve`, vars);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Dispute resolved");
      qc.invalidateQueries({ queryKey: ["disputes"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useMessageDispute() {
  return useMutation({
    mutationKey: ["disputes", "message"],
    mutationFn: async (vars: { id: string; message: string }) => {
      const response = await apiClient.post<ApiResponse<any>>(`${BASE}/disputes/${vars.id}/message`, { message: vars.message });
      return response.data;
    },
    onSuccess: () => toast.success("Message sent"),
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useProcessRefund() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["refunds", "process"],
    mutationFn: async (payload: { bookingId?: string; amount: number; reason?: string }) => {
      const response = await apiClient.post<ApiResponse<any>>(`${BASE}/refunds`, payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Refund processed");
      qc.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
