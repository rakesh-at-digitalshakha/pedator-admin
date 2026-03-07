/**
 * usePermissions – read the current admin's role and derive helper functions.
 *
 * Roles are stored on the AdminStore as `user.role` (populated from the backend).
 * Super-admin detection: role name contains "super" (case-insensitive).
 */
import { useAdminStore } from "@/stores/admin/admin-provider";
import type { Permission } from "@/types/api";

export type PermissionAction = "create" | "read" | "update" | "delete" | "download";

export function usePermissions() {
  const user = useAdminStore((state) => state.user);
  const role = user?.role;

  /**
   * True when the user is a super-admin and bypasses all permission checks.
   */
  const isSuperAdmin =
    !role
      ? false
      : role.name?.toLowerCase().includes("super") ||
        (role.isSystem && (role.permissions ?? []).length >= 10); // system role with broad permissions

  /**
   * Check a single resource + action.
   */
  const can = (resource: string, action: PermissionAction): boolean => {
    if (!role) return false;
    if (isSuperAdmin) return true;
    const perm = role.permissions?.find((p: Permission) => p.resource === resource);
    return perm?.actions.includes(action) ?? false;
  };

  /**
   * Check if user has ANY of the given actions on a resource.
   * If no actions array is provided, defaults to checking `read`.
   */
  const canAny = (resource: string, actions?: PermissionAction[]): boolean => {
    if (!role) return false;
    if (isSuperAdmin) return true;
    const effectiveActions = actions ?? (["read"] as PermissionAction[]);
    return effectiveActions.some((a) => can(resource, a));
  };

  /**
   * Shorthand: can the user view (read) a given resource?
   * Passing null / undefined means "no restriction" → always true.
   */
  const canAccess = (resource: string | null | undefined): boolean => {
    if (!resource) return true;
    return canAny(resource, ["read"]);
  };

  /**
   * All resources this user can read — useful for filtering sidebar items.
   */
  const accessibleResources: Set<string> = isSuperAdmin
    ? new Set(["*"])
    : new Set(
        (role?.permissions ?? [])
          .filter((p: Permission) => p.actions.includes("read"))
          .map((p: Permission) => p.resource),
      );

  return {
    user,
    role,
    isSuperAdmin,
    can,
    canAny,
    canAccess,
    accessibleResources,
  };
}
