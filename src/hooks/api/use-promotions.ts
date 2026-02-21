"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/types";

const BASE = "/admin";

// Coupons
export function useCoupons(params?: Record<string, string | number | boolean>) {
  const qs = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";
  return useQuery({
    queryKey: ["promotions", "coupons", params],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<any>>(`${BASE}/coupons${qs}`);
      return response.data;
    }
  });
}
export function useCreateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["promotions", "coupons", "create"],
    mutationFn: async (payload: unknown) => {
      const response = await apiClient.post<ApiResponse<any>>(`${BASE}/coupons`, payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Coupon created");
      qc.invalidateQueries({ queryKey: ["promotions", "coupons"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
export function useUpdateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["promotions", "coupons", "update"],
    mutationFn: async (vars: { id: string; data: unknown }) => {
      const response = await apiClient.put<ApiResponse<any>>(`${BASE}/coupons/${vars.id}`, vars.data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Coupon updated");
      qc.invalidateQueries({ queryKey: ["promotions", "coupons"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
export function useDeleteCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["promotions", "coupons", "delete"],
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<ApiResponse<any>>(`${BASE}/coupons/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Coupon deleted");
      qc.invalidateQueries({ queryKey: ["promotions", "coupons"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// Promotion campaigns
export function usePromotions(params?: Record<string, string | number | boolean>) {
  const qs = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";
  return useQuery({
    queryKey: ["promotions", "campaigns", params],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<any>>(`${BASE}/promotions${qs}`);
      return response.data;
    }
  });
}
export function useCreatePromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["promotions", "campaigns", "create"],
    mutationFn: async (payload: unknown) => {
      const response = await apiClient.post<ApiResponse<any>>(`${BASE}/promotions`, payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Promotion created");
      qc.invalidateQueries({ queryKey: ["promotions", "campaigns"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// Banners
export function useBanners(params?: Record<string, string | number | boolean>) {
  const qs = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";
  return useQuery({
    queryKey: ["promotions", "banners", params],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<any>>(`${BASE}/banners${qs}`);
      return response.data;
    }
  });
}
export function useCreateBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["promotions", "banners", "create"],
    mutationFn: async (payload: unknown) => {
      const response = await apiClient.post<ApiResponse<any>>(`${BASE}/banners`, payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Banner uploaded");
      qc.invalidateQueries({ queryKey: ["promotions", "banners"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
export function useUpdateBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["promotions", "banners", "update"],
    mutationFn: async (vars: { id: string; data: unknown }) => {
      const response = await apiClient.put<ApiResponse<any>>(`${BASE}/banners/${vars.id}`, vars.data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Banner updated");
      qc.invalidateQueries({ queryKey: ["promotions", "banners"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
export function useDeleteBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["promotions", "banners", "delete"],
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<ApiResponse<any>>(`${BASE}/banners/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Banner deleted");
      qc.invalidateQueries({ queryKey: ["promotions", "banners"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
