"use client";

import { AuthGuard } from "@/components/auth/auth-guard";

interface DashboardAuthWrapperProps {
  children: React.ReactNode;
}

/**
 * Client-side wrapper that provides auth protection for dashboard routes
 */
export function DashboardAuthWrapper({ children }: DashboardAuthWrapperProps) {
  return <AuthGuard>{children}</AuthGuard>;
}
