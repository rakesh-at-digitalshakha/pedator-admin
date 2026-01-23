"use client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

const BASE = "/api/v1/admin";

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

export function useBulkImportUsers() {
  return useMutation({
    mutationKey: ["bulk", "users", "import"],
    mutationFn: (payload: unknown) => postJSON(`${BASE}/users/bulk-import`, payload),
    onSuccess: () => toast.success("Users imported"),
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useBulkExportUsers() {
  return useMutation({
    mutationKey: ["bulk", "users", "export"],
    mutationFn: (payload?: unknown) => postJSON(`${BASE}/users/bulk-export`, payload),
    onSuccess: () => toast.success("Users export started"),
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useBulkSendNotifications() {
  return useMutation({
    mutationKey: ["bulk", "notifications", "send"],
    mutationFn: (payload: unknown) => postJSON(`${BASE}/notifications/bulk-send`, payload),
    onSuccess: () => toast.success("Notifications sent"),
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useBulkApproveCourses() {
  return useMutation({
    mutationKey: ["bulk", "courses", "approve"],
    mutationFn: (payload: { courseIds: string[] }) => postJSON(`${BASE}/courses/bulk-approve`, payload),
    onSuccess: () => toast.success("Courses approved"),
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useBulkApproveMentors() {
  return useMutation({
    mutationKey: ["bulk", "mentors", "approve"],
    mutationFn: (payload: { mentorIds: string[] }) => postJSON(`${BASE}/mentors/bulk-approve`, payload),
    onSuccess: () => toast.success("Mentors approved"),
    onError: (e: Error) => toast.error(e.message),
  });
}
