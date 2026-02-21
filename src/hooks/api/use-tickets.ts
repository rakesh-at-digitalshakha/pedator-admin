"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/types";

const BASE = "/admin";

export function useTickets(params?: Record<string, string | number | boolean>) {
  const qs = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";
  return useQuery({
    queryKey: ["tickets", params],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<any>>(`${BASE}/tickets${qs}`);
      return response.data;
    }
  });
}

export function useTicket(id?: string) {
  return useQuery({
    enabled: !!id,
    queryKey: ["tickets", "detail", id],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<any>>(`${BASE}/tickets/${id}`);
      return response.data;
    },
  });
}

export function useAssignTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["tickets", "assign"],
    mutationFn: async (vars: { id: string; adminId: string }) => {
      const response = await apiClient.patch<ApiResponse<any>>(`${BASE}/tickets/${vars.id}/assign`, { adminId: vars.adminId });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Ticket assigned");
      qc.invalidateQueries({ queryKey: ["tickets"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateTicketStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["tickets", "status"],
    mutationFn: async (vars: { id: string; status: string }) => {
      const response = await apiClient.patch<ApiResponse<any>>(`${BASE}/tickets/${vars.id}/status`, { status: vars.status });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Ticket status updated");
      qc.invalidateQueries({ queryKey: ["tickets"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useReplyTicket() {
  return useMutation({
    mutationKey: ["tickets", "reply"],
    mutationFn: async (vars: { id: string; message: string }) => {
      const response = await apiClient.patch<ApiResponse<any>>(`${BASE}/tickets/${vars.id}/reply`, { message: vars.message });
      return response.data;
    },
    onSuccess: () => toast.success("Replied to ticket"),
    onError: (e: Error) => toast.error(e.message),
  });
}
