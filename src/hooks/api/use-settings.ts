"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/types";

const BASE = "/admin";

export function usePlatformSettings() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<any>>(`${BASE}/settings`);
      return response.data;
    }
  });
  const update = useMutation({
    mutationKey: ["settings", "update"],
    mutationFn: async (payload: unknown) => {
      const response = await apiClient.put<ApiResponse<any>>(`${BASE}/settings`, payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Settings updated");
      qc.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return { query, update };
}

export function usePaymentGatewaySettings() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["settings", "payment"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<any>>(`${BASE}/settings/payment-gateways`);
      return response.data;
    },
  });
  const update = useMutation({
    mutationKey: ["settings", "payment", "update"],
    mutationFn: async (payload: unknown) => {
      const response = await apiClient.put<ApiResponse<any>>(`${BASE}/settings/payment-gateways`, payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Payment gateways updated");
      qc.invalidateQueries({ queryKey: ["settings", "payment"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return { query, update };
}

export function useMaintenanceMode() {
  return useMutation({
    mutationKey: ["settings", "maintenance"],
    mutationFn: async (payload: { enabled: boolean }) => {
      const response = await apiClient.post<ApiResponse<any>>(`${BASE}/settings/maintenance`, payload);
      return response.data;
    },
    onSuccess: () => toast.success("Maintenance mode toggled"),
    onError: (e: Error) => toast.error(e.message),
  });
}
