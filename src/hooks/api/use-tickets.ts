"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const BASE = "/api/v1/admin";

async function getJSON<T>(url: string) {
  const res = await fetch(url, { credentials: "include" });
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

export function useTickets(params?: Record<string, string | number | boolean>) {
  const qs = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";
  return useQuery({ queryKey: ["tickets", params], queryFn: () => getJSON(`${BASE}/tickets${qs}`) });
}

export function useTicket(id?: string) {
  return useQuery({
    enabled: !!id,
    queryKey: ["tickets", "detail", id],
    queryFn: () => getJSON(`${BASE}/tickets/${id}`),
  });
}

export function useAssignTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["tickets", "assign"],
    mutationFn: (vars: { id: string; adminId: string }) =>
      patchJSON(`${BASE}/tickets/${vars.id}/assign`, { adminId: vars.adminId }),
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
    mutationFn: (vars: { id: string; status: string }) =>
      patchJSON(`${BASE}/tickets/${vars.id}/status`, { status: vars.status }),
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
    mutationFn: (vars: { id: string; message: string }) =>
      patchJSON(`${BASE}/tickets/${vars.id}/reply`, { message: vars.message }),
    onSuccess: () => toast.success("Replied to ticket"),
    onError: (e: Error) => toast.error(e.message),
  });
}
