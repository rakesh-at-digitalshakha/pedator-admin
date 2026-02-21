"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/types";

const BASE = "/admin";

export function useCommissionRates() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["payouts", "commission"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<any>>(`${BASE}/commission-rates`);
      return response.data;
    }
  });
  const update = useMutation({
    mutationKey: ["payouts", "commission", "update"],
    mutationFn: async (vars: { id: string; data: unknown }) => {
      const response = await apiClient.put<ApiResponse<any>>(`${BASE}/commission-rates/${vars.id}`, vars.data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Commission rate updated");
      qc.invalidateQueries({ queryKey: ["payouts", "commission"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return { query, update };
}

export function usePendingPayouts(params?: Record<string, string | number | boolean>) {
  const qs = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";
  return useQuery({
    queryKey: ["payouts", "pending", params],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<any>>(`${BASE}/payouts/pending${qs}`);
      return response.data;
    }
  });
}

export function useApprovePayout() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["payouts", "approve"],
    mutationFn: async (id: string) => {
      const response = await apiClient.post<ApiResponse<any>>(`${BASE}/payouts/${id}/approve`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Payout approved");
      qc.invalidateQueries({ queryKey: ["payouts"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useRejectPayout() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["payouts", "reject"],
    mutationFn: async (vars: { id: string; reason?: string }) => {
      const response = await apiClient.post<ApiResponse<any>>(`${BASE}/payouts/${vars.id}/reject`, { reason: vars.reason });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Payout rejected");
      qc.invalidateQueries({ queryKey: ["payouts"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function usePayoutHistory(params?: Record<string, string | number | boolean>) {
  const qs = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";
  return useQuery({
    queryKey: ["payouts", "history", params],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<any>>(`${BASE}/payouts/history${qs}`);
      return response.data;
    }
  });
}
