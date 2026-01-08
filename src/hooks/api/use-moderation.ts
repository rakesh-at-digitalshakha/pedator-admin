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

export function useFlaggedContent(params?: Record<string, string | number | boolean>) {
  const qs = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";
  return useQuery({
    queryKey: ["moderation", "flagged", params],
    queryFn: () => getJSON(`${BASE}/flagged-content${qs}`),
  });
}

export function useFlagContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["moderation", "flag"],
    mutationFn: (vars: { id: string; reason?: string }) =>
      postJSON(`${BASE}/content/${vars.id}/flag`, { reason: vars.reason }),
    onSuccess: () => {
      toast.success("Content flagged");
      qc.invalidateQueries({ queryKey: ["moderation", "flagged"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useSuspendUser() {
  return useMutation({
    mutationKey: ["moderation", "suspend"],
    mutationFn: (vars: { id: string; reason?: string }) => postJSON(`${BASE}/users/${vars.id}/suspend`, vars),
    onSuccess: () => toast.success("User suspended"),
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useBanUser() {
  return useMutation({
    mutationKey: ["moderation", "ban"],
    mutationFn: (vars: { id: string; reason?: string }) => postJSON(`${BASE}/users/${vars.id}/ban`, vars),
    onSuccess: () => toast.success("User banned"),
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUnbanUser() {
  return useMutation({
    mutationKey: ["moderation", "unban"],
    mutationFn: (vars: { id: string }) =>
      fetch(`${BASE}/users/${vars.id}/ban`, { method: "DELETE", credentials: "include" }).then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return r.json();
      }),
    onSuccess: () => toast.success("User unbanned"),
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useModerationLogs(params?: Record<string, string | number | boolean>) {
  const qs = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";
  return useQuery({ queryKey: ["moderation", "logs", params], queryFn: () => getJSON(`${BASE}/moderation-logs${qs}`) });
}
