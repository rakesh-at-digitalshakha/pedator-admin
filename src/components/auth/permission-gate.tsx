"use client";

import { ShieldOff } from "lucide-react";

import { usePermissions, type PermissionAction } from "@/hooks/use-permissions";

interface PermissionGateProps {
  /** The backend resource name (e.g. "mentors", "courses"). Pass null to always render. */
  resource: string | null | undefined;
  /** Actions required — defaults to ["read"]. All must pass (AND logic). */
  actions?: PermissionAction[];
  /** Require ANY action instead of ALL (OR logic). Default false. */
  requireAny?: boolean;
  /** Rendered when the user has permission. */
  children: React.ReactNode;
  /** Optional fallback UI. Defaults to null (renders nothing). */
  fallback?: React.ReactNode;
}

/**
 * PermissionGate — conditionally renders `children` based on the current
 * admin's role permissions.
 *
 * @example
 * <PermissionGate resource="mentors" actions={["update"]}>
 *   <EditButton />
 * </PermissionGate>
 *
 * @example
 * <PermissionGate resource="admins" actions={["create"]} fallback={<DisabledButton />}>
 *   <CreateAdminButton />
 * </PermissionGate>
 */
export function PermissionGate({
  resource,
  actions = ["read"],
  requireAny = false,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { canAccess, canAny, can, isSuperAdmin } = usePermissions();

  if (isSuperAdmin || !resource) return <>{children}</>;

  const hasPermission = requireAny
    ? canAny(resource, actions)
    : actions.every((a) => can(resource, a));

  return hasPermission ? <>{children}</> : <>{fallback}</>;
}

// ─── Route-level access denied block ─────────────────────────────────────────
export function AccessDeniedBlock() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 py-20 text-center">
      <ShieldOff className="text-muted-foreground size-12" />
      <div>
        <h2 className="text-xl font-semibold">Access Restricted</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          You don&apos;t have permission to view this section.
          <br />
          Contact your super-admin to request access.
        </p>
      </div>
    </div>
  );
}
