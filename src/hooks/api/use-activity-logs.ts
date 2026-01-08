"use client";
import { useQuery } from "@tanstack/react-query";

const BASE = "/admin";

async function getJSON<T>(url: string) {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as T;
}

export function useActivityLogs(params?: Record<string, string | number | boolean>) {
  const qs = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";
  return useQuery({ queryKey: ["activity-logs", params], queryFn: () => getJSON(`${BASE}/activity-logs${qs}`) });
}

export function useAdminActions(adminId?: string, params?: Record<string, string | number | boolean>) {
  const qs = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";
  return useQuery({
    enabled: !!adminId,
    queryKey: ["activity-logs", "admin", adminId, params],
    queryFn: () => getJSON(`${BASE}/activity-logs/${adminId}${qs}`),
  });
}

export function useLoginHistory(params?: Record<string, string | number | boolean>) {
  const qs = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";
  return useQuery({ queryKey: ["login-history", params], queryFn: () => getJSON(`${BASE}/login-history${qs}`) });
}
