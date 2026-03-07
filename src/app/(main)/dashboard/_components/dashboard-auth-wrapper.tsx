"use client";

import { usePathname } from "next/navigation";

import { AuthGuard } from "@/components/auth/auth-guard";
import { AccessDeniedBlock } from "@/components/auth/permission-gate";
import { usePermissions } from "@/hooks/use-permissions";
import { getRouteResource } from "@/lib/permissions/route-permissions";
import { useAdminStore } from "@/stores/admin/admin-provider";

function RoutePermissionGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { canAccess, isSuperAdmin } = usePermissions();
  const user = useAdminStore((state) => state.user);

  // User not loaded yet — let AuthGuard handle redirect logic
  if (!user) return <>{children}</>;

  // Super-admins bypass all checks
  if (isSuperAdmin) return <>{children}</>;

  const requiredResource = getRouteResource(pathname);

  // Route not in map OR no resource required → unrestricted
  if (requiredResource === undefined || requiredResource === null) return <>{children}</>;

  // Check read permission
  if (!canAccess(requiredResource)) return <AccessDeniedBlock />;

  return <>{children}</>;
}

interface DashboardAuthWrapperProps {
  children: React.ReactNode;
}

/**
 * Client-side wrapper that provides auth protection + route-level permission
 * checks for all dashboard routes.
 */
export function DashboardAuthWrapper({ children }: DashboardAuthWrapperProps) {
  return (
    <AuthGuard>
      <RoutePermissionGuard>{children}</RoutePermissionGuard>
    </AuthGuard>
  );
}
