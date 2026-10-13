"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";

import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/types";

const BASE = "/admin";

function apiErrorMessage(e: unknown, fallback: string) {
  if (e instanceof AxiosError) {
    const msg = (e.response?.data as { message?: string } | undefined)?.message;
    return msg ?? e.message ?? fallback;
  }
  if (e instanceof Error) return e.message;
  return fallback;
}

export type PayoutBankDetails = {
  accountNumber?: string | null;
  accountHolderName?: string | null;
  bankName?: string | null;
  ifscCode?: string | null;
  accountType?: string | null;
};

export type PayoutApiRow = {
  id: string;
  _id?: string;
  userId: string | { _id?: string };
  userName?: string;
  amount: number;
  status: string;
  bankAccount?: string;
  bankDetails?: PayoutBankDetails | null;
  requestedAt?: string;
  processedAt?: string | null;
  rejectionReason?: string | null;
  reference?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type PayoutSummary = {
  pending: { count: number; amount: number };
  completed: { count: number; amount: number };
  rejected: { count: number; amount: number };
  all: { count: number; amount: number };
};

export type SettlementRow = {
  id: string;
  bookingId: string;
  mentorId: string;
  mentorName: string;
  learnerId: string;
  learnerName: string;
  courseId: string;
  courseTitle: string;
  amount: number;
  mentorEarning: number;
  platformFee: number;
  bookingStatus: string;
  adminApprovalStatus: string;
  paymentStatus: string;
  bookingDate?: string;
  updatedAt?: string;
  reference?: string;
};

export function usePayoutSummary() {
  return useQuery({
    queryKey: ["payouts", "summary"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<PayoutSummary>>(`${BASE}/payouts/summary`);
      return response.data.data;
    },
    staleTime: 15_000,
    retry: 1,
  });
}

export function usePendingPayouts(params?: Record<string, string | number | boolean>) {
  const cleaned = Object.fromEntries(
    Object.entries(params || {}).filter(([, v]) => v !== undefined && v !== null && v !== ""),
  );
  const qs = Object.keys(cleaned).length
    ? `?${new URLSearchParams(cleaned as Record<string, string>).toString()}`
    : "";

  return useQuery({
    queryKey: ["payouts", "pending", cleaned],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<PayoutApiRow[]>>(`${BASE}/payouts/pending${qs}`);
      return response.data;
    },
    staleTime: 10_000,
    retry: 1,
  });
}

export function usePendingSettlements(params?: Record<string, string | number | boolean>) {
  const cleaned = Object.fromEntries(
    Object.entries(params || {}).filter(([, v]) => v !== undefined && v !== null && v !== ""),
  );
  const qs = Object.keys(cleaned).length
    ? `?${new URLSearchParams(cleaned as Record<string, string>).toString()}`
    : "";

  return useQuery({
    queryKey: ["settlements", "pending", cleaned],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<SettlementRow[]>>(
        `${BASE}/settlements/pending${qs}`,
      );
      return response.data;
    },
    staleTime: 10_000,
    retry: 1,
  });
}

export function useSettleBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["settlements", "settle"],
    mutationFn: async (bookingId: string) => {
      const response = await apiClient.post<ApiResponse<unknown>>(
        `${BASE}/slot-bookings/${bookingId}/settle`,
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Class settled — mentor available balance & platform fee updated");
      qc.invalidateQueries({ queryKey: ["settlements"] });
      qc.invalidateQueries({ queryKey: ["payouts"] });
      qc.invalidateQueries({ queryKey: ["platform-wallet"] });
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (e: unknown) => toast.error(apiErrorMessage(e, "Failed to settle class")),
  });
}

export function useApprovePayout() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["payouts", "approve"],
    mutationFn: async (id: string) => {
      const response = await apiClient.post<ApiResponse<unknown>>(`${BASE}/payouts/${id}/approve`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Payout approved — mentor withdrawal marked completed");
      qc.invalidateQueries({ queryKey: ["payouts"] });
    },
    onError: (e: unknown) => toast.error(apiErrorMessage(e, "Failed to approve payout")),
  });
}

export function useRejectPayout() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["payouts", "reject"],
    mutationFn: async (vars: { id: string; reason?: string }) => {
      const response = await apiClient.post<ApiResponse<unknown>>(`${BASE}/payouts/${vars.id}/reject`, {
        reason: vars.reason,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Payout rejected — amount refunded to mentor wallet");
      qc.invalidateQueries({ queryKey: ["payouts"] });
    },
    onError: (e: unknown) => toast.error(apiErrorMessage(e, "Failed to reject payout")),
  });
}

export function usePayoutHistory(params?: Record<string, string | number | boolean>) {
  const qs = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";
  return useQuery({
    queryKey: ["payouts", "history", params],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<unknown>>(`${BASE}/payouts/history${qs}`);
      return response.data;
    },
  });
}

export function usePlatformWallet() {
  return useQuery({
    queryKey: ["platform-wallet"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<any>>(`${BASE}/platform-wallet`);
      return response.data.data;
    },
    staleTime: 15_000,
  });
}

export function usePlatformWalletSummary() {
  return useQuery({
    queryKey: ["platform-wallet", "summary"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<any>>(`${BASE}/platform-wallet/summary`);
      return response.data.data;
    },
    staleTime: 15_000,
  });
}

export function usePlatformTransactions(params?: Record<string, string | number>) {
  const cleaned = Object.fromEntries(
    Object.entries(params || {}).filter(([, v]) => v !== undefined && v !== null && v !== ""),
  );
  const qs = Object.keys(cleaned).length
    ? `?${new URLSearchParams(cleaned as Record<string, string>).toString()}`
    : "";
  return useQuery({
    queryKey: ["platform-wallet", "transactions", cleaned],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<any>>(`${BASE}/platform-wallet/transactions${qs}`);
      return response.data.data;
    },
  });
}
