"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const BASE = "/api/v1/admin";

async function getJSON<T>(url: string) {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as T;
}

async function delJSON<T>(url: string) {
  const res = await fetch(url, { method: "DELETE", credentials: "include" });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as T;
}

export function useTestSeries(params?: Record<string, string | number | boolean>) {
  const qs = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";
  return useQuery({ queryKey: ["test-series", params], queryFn: () => getJSON(`${BASE}/test-series${qs}`) });
}

export function useTestSeriesDetail(id?: string) {
  return useQuery({
    enabled: !!id,
    queryKey: ["test-series", "detail", id],
    queryFn: () => getJSON(`${BASE}/test-series/${id}`),
  });
}

export function useTestSeriesResults(id?: string) {
  return useQuery({
    enabled: !!id,
    queryKey: ["test-series", "results", id],
    queryFn: () => getJSON(`${BASE}/test-series/${id}/results`),
  });
}

export function useDeleteTestSeries() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["test-series", "delete"],
    mutationFn: (id: string) => delJSON(`${BASE}/test-series/${id}`),
    onSuccess: () => {
      toast.success("Test series deleted");
      qc.invalidateQueries({ queryKey: ["test-series"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
