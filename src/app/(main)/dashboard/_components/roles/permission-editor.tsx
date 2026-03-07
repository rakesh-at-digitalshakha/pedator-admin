"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { Permission } from "@/types/api";

type PermissionAction = "create" | "read" | "update" | "delete" | "download";

// Fallback constants (mirrored from backend role.model.js)
export const DEFAULT_RESOURCES = [
  "admins",
  "mentors",
  "learners",
  "courses",
  "bookings",
  "transactions",
  "reports",
  "support",
  "disputes",
  "coupons",
  "banners",
  "reviews",
  "notifications",
  "video_sessions",
  "platform_wallet",
] as const;

export const DEFAULT_ACTIONS = ["create", "read", "update", "delete", "download"] as const;

type Props = {
  value: Permission[];
  onChange: (permissions: Permission[]) => void;
  resources?: string[];
  actions?: string[];
  disabled?: boolean;
};

export function PermissionEditor({
  value,
  onChange,
  resources = [...DEFAULT_RESOURCES],
  actions = [...DEFAULT_ACTIONS],
  disabled = false,
}: Props) {
  /** Check if a specific resource+action is checked */
  const isChecked = (resource: string, action: string): boolean => {
    const entry = value.find((p) => p.resource === resource);
    return entry ? entry.actions.includes(action as PermissionAction) : false;
  };

  /** Toggle a single checkbox */
  const toggle = (resource: string, action: string) => {
    if (disabled) return;
    const existing = value.find((p) => p.resource === resource);
    if (!existing) {
      onChange([...value, { resource, actions: [action as PermissionAction] }]);
      return;
    }
    const hasAction = existing.actions.includes(action as PermissionAction);
    const newActions = hasAction
      ? existing.actions.filter((a) => a !== action)
      : [...existing.actions, action as PermissionAction];
    if (newActions.length === 0) {
      onChange(value.filter((p) => p.resource !== resource));
    } else {
      onChange(value.map((p) => (p.resource === resource ? { ...p, actions: newActions } : p)));
    }
  };

  /** Toggle an entire row (select/deselect all actions for a resource) */
  const toggleRow = (resource: string) => {
    if (disabled) return;
    const entry = value.find((p) => p.resource === resource);
    const allSelected = entry?.actions.length === actions.length;
    const next = value.filter((p) => p.resource !== resource);
    if (!allSelected) {
      next.push({ resource, actions: [...actions] as PermissionAction[] });
    }
    onChange(next);
  };

  /** Toggle an entire column (select/deselect an action for all resources) */
  const toggleColumn = (action: string) => {
    if (disabled) return;
    const allSelected = resources.every((r) => isChecked(r, action));
    const next = resources
      .map((resource) => {
        const existing = value.find((p) => p.resource === resource);
        let acts = existing ? [...existing.actions] : [];
        if (allSelected) {
          acts = acts.filter((a) => a !== action);
        } else if (!acts.includes(action as PermissionAction)) {
          acts.push(action as PermissionAction);
        }
        return { resource, actions: acts };
      })
      .filter((p) => p.actions.length > 0);
    onChange(next);
  };

  /** Select all / clear all */
  const selectAll = () => {
    if (disabled) return;
    onChange(resources.map((resource) => ({ resource, actions: [...actions] as PermissionAction[] })));
  };

  const clearAll = () => {
    if (disabled) return;
    onChange([]);
  };

  const getRowPermissionCount = (resource: string) => {
    const entry = value.find((p) => p.resource === resource);
    return entry?.actions.length ?? 0;
  };

  return (
    <div className="space-y-2">
      {/* Quick actions */}
      {!disabled && (
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={selectAll}>
            Select All
          </Button>
          <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={clearAll}>
            Clear All
          </Button>
          <span className="ml-auto text-xs text-muted-foreground">
            {value.reduce((acc, p) => acc + p.actions.length, 0)} permission
            {value.reduce((acc, p) => acc + p.actions.length, 0) !== 1 ? "s" : ""} selected
          </span>
        </div>
      )}

      {/* Matrix table */}
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-2 py-1.5 text-left font-medium text-muted-foreground">Resource</th>
              {actions.map((action) => (
                <th key={action} className="px-2 py-1.5 text-center font-medium text-muted-foreground">
                  {disabled ? (
                    <span className="capitalize">{action}</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleColumn(action)}
                      className="capitalize hover:text-foreground transition-colors"
                      title={`Toggle '${action}' for all resources`}
                    >
                      {action}
                    </button>
                  )}
                </th>
              ))}
              <th className="px-2 py-1.5 text-center font-medium text-muted-foreground">All</th>
            </tr>
          </thead>
          <tbody>
            {resources.map((resource, i) => {
              const count = getRowPermissionCount(resource);
              return (
                <tr key={resource} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                  <td className="px-2 py-1">
                    <div className="flex items-center gap-1.5">
                      <span className="capitalize font-medium">{resource.replace(/_/g, " ")}</span>
                      {count > 0 && (
                        <Badge variant="secondary" className="px-1 py-0 text-[10px] leading-tight">
                          {count}
                        </Badge>
                      )}
                    </div>
                  </td>
                  {actions.map((action) => (
                    <td key={action} className="px-2 py-1 text-center">
                      <Checkbox
                        className="size-3.5"
                        checked={isChecked(resource, action)}
                        onCheckedChange={() => toggle(resource, action)}
                        disabled={disabled}
                        aria-label={`${action} on ${resource}`}
                      />
                    </td>
                  ))}
                  <td className="px-2 py-1 text-center">
                    {disabled ? (
                      <Checkbox className="size-3.5" checked={count === actions.length} disabled />
                    ) : (
                      <Checkbox
                        className="size-3.5"
                        checked={count === actions.length}
                        onCheckedChange={() => toggleRow(resource)}
                        aria-label={`All permissions for ${resource}`}
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
