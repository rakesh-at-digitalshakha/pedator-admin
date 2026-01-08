"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const BASE = "/admin";

async function getJSON<T>(url: string) {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as T;
}

async function putJSON<T>(url: string, body: unknown) {
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

export function usePlatformSettings() {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ["settings"], queryFn: () => getJSON(`${BASE}/settings`) });
  const update = useMutation({
    mutationKey: ["settings", "update"],
    mutationFn: (payload: unknown) => putJSON(`${BASE}/settings`, payload),
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
    queryFn: () => getJSON(`${BASE}/settings/payment-gateways`),
  });
  const update = useMutation({
    mutationKey: ["settings", "payment", "update"],
    mutationFn: (payload: unknown) => putJSON(`${BASE}/settings/payment-gateways`, payload),
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
    mutationFn: (payload: { enabled: boolean }) => postJSON(`${BASE}/settings/maintenance`, payload),
    onSuccess: () => toast.success("Maintenance mode toggled"),
    onError: (e: Error) => toast.error(e.message),
  });
}
