"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const BASE = "/api/v1/admin";

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

async function patchJSON<T>(url: string, body?: unknown) {
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body ?? {}),
  });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as T;
}

export function useDisputes(params?: Record<string, string | number | boolean>) {
  const qs = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";
  return useQuery({ queryKey: ["disputes", params], queryFn: () => getJSON(`${BASE}/disputes${qs}`) });
}

export function useDispute(id?: string) {
  return useQuery({
    enabled: !!id,
    queryKey: ["disputes", "detail", id],
    queryFn: () => getJSON(`${BASE}/disputes/${id}`),
  });
}

export function useUpdateDisputeStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["disputes", "status"],
    mutationFn: (vars: { id: string; status: string }) =>
      patchJSON(`${BASE}/disputes/${vars.id}/status`, { status: vars.status }),
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
    mutationFn: (vars: { id: string; action: string; notes?: string }) =>
      postJSON(`${BASE}/disputes/${vars.id}/resolve`, vars),
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
    mutationFn: (vars: { id: string; message: string }) =>
      postJSON(`${BASE}/disputes/${vars.id}/message`, { message: vars.message }),
    onSuccess: () => toast.success("Message sent"),
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useProcessRefund() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["refunds", "process"],
    mutationFn: (payload: { bookingId?: string; amount: number; reason?: string }) =>
      postJSON(`${BASE}/refunds`, payload),
    onSuccess: () => {
      toast.success("Refund processed");
      qc.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
