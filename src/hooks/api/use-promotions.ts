"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const BASE = "/admin";

async function getJSON<T>(url: string) {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as T;
}
async function postJSON<T>(url: string, body?: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body ?? {}),
  });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as T;
}
async function putJSON<T>(url: string, body?: unknown) {
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body ?? {}),
  });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as T;
}
async function delJSON<T>(url: string) {
  const res = await fetch(url, { method: "DELETE", credentials: "include" });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as T;
}

// Coupons
export function useCoupons(params?: Record<string, string | number | boolean>) {
  const qs = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";
  return useQuery({ queryKey: ["promotions", "coupons", params], queryFn: () => getJSON(`${BASE}/coupons${qs}`) });
}
export function useCreateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["promotions", "coupons", "create"],
    mutationFn: (payload: unknown) => postJSON(`${BASE}/coupons`, payload),
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
    mutationFn: (vars: { id: string; data: unknown }) => putJSON(`${BASE}/coupons/${vars.id}`, vars.data),
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
    mutationFn: (id: string) => delJSON(`${BASE}/coupons/${id}`),
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
  return useQuery({ queryKey: ["promotions", "campaigns", params], queryFn: () => getJSON(`${BASE}/promotions${qs}`) });
}
export function useCreatePromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["promotions", "campaigns", "create"],
    mutationFn: (payload: unknown) => postJSON(`${BASE}/promotions`, payload),
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
  return useQuery({ queryKey: ["promotions", "banners", params], queryFn: () => getJSON(`${BASE}/banners${qs}`) });
}
export function useCreateBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["promotions", "banners", "create"],
    mutationFn: (payload: unknown) => postJSON(`${BASE}/banners`, payload),
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
    mutationFn: (vars: { id: string; data: unknown }) => putJSON(`${BASE}/banners/${vars.id}`, vars.data),
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
    mutationFn: (id: string) => delJSON(`${BASE}/banners/${id}`),
    onSuccess: () => {
      toast.success("Banner deleted");
      qc.invalidateQueries({ queryKey: ["promotions", "banners"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
