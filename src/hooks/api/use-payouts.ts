"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const BASE = "/api/v1/admin";

async function getJSON<T>(url: string) {
  const res = await fetch(url, { credentials: "include" });
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

export function useCommissionRates() {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ["payouts", "commission"], queryFn: () => getJSON(`${BASE}/commission-rates`) });
  const update = useMutation({
    mutationKey: ["payouts", "commission", "update"],
    mutationFn: (vars: { id: string; data: unknown }) => putJSON(`${BASE}/commission-rates/${vars.id}`, vars.data),
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
  return useQuery({ queryKey: ["payouts", "pending", params], queryFn: () => getJSON(`${BASE}/payouts/pending${qs}`) });
}

export function useApprovePayout() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["payouts", "approve"],
    mutationFn: (id: string) => postJSON(`${BASE}/payouts/${id}/approve`),
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
    mutationFn: (vars: { id: string; reason?: string }) =>
      postJSON(`${BASE}/payouts/${vars.id}/reject`, { reason: vars.reason }),
    onSuccess: () => {
      toast.success("Payout rejected");
      qc.invalidateQueries({ queryKey: ["payouts"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function usePayoutHistory(params?: Record<string, string | number | boolean>) {
  const qs = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";
  return useQuery({ queryKey: ["payouts", "history", params], queryFn: () => getJSON(`${BASE}/payouts/history${qs}`) });
}
