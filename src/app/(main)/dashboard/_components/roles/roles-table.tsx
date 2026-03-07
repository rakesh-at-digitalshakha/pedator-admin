"use client";

import * as React from "react";

import { DataTable } from "@/components/data-table/data-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAllRoles, useGetRoleMeta } from "@/hooks/api";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import type { Role } from "@/types/api";

import { CreateRoleDialog } from "./create-role-dialog";
import { EditRoleDialog } from "./edit-role-dialog";
import { DEFAULT_ACTIONS, DEFAULT_RESOURCES } from "./permission-editor";
import { rolesColumns } from "./roles-columns";
import { ViewRoleDialog } from "./view-role-dialog";

type ApiListResponse<T> = { data?: T };
type MetaShape = { resources?: string[]; actions?: string[] };

function getRoles(data: unknown): Role[] {
  return (data as ApiListResponse<Role[]>)?.data ?? [];
}

function getMeta(data: unknown): MetaShape {
  return (data as ApiListResponse<MetaShape>)?.data ?? {};
}

export function RolesTable() {
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [editingRole, setEditingRole] = React.useState<Role | null>(null);
  const [viewingRole, setViewingRole] = React.useState<Role | null>(null);

  const { data: rolesData, isLoading, error } = useGetAllRoles();
  const { data: metaData } = useGetRoleMeta();

  const roles = getRoles(rolesData);
  const meta = getMeta(metaData);
  const resources = meta.resources ?? [...DEFAULT_RESOURCES];
  const actions = meta.actions ?? [...DEFAULT_ACTIONS];

  const handleEdit = React.useCallback((role: Role) => setEditingRole(role), []);
  const handleView = React.useCallback((role: Role) => setViewingRole(role), []);

  const columns = React.useMemo(
    () => rolesColumns({ onEdit: handleEdit, onView: handleView, onDeleteSuccess: () => {} }),
    [handleEdit, handleView],
  );

  const table = useDataTableInstance({ data: roles, columns, getRowId: (row) => row._id });

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Role Management</CardTitle>
          <CardDescription className="text-destructive">Failed to load roles</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const roleCount = roles.length;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Roles</CardTitle>
              <CardDescription>
                {roleCount} role{roleCount !== 1 ? "s" : ""} — define permissions per resource
              </CardDescription>
            </div>
            <CreateRoleDialog
              open={isCreateOpen}
              onOpenChange={setIsCreateOpen}
              resources={resources}
              actions={actions}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={`skel-${i}`} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <DataTable table={table} columns={columns} />
          )}
        </CardContent>
      </Card>

      <EditRoleDialog
        role={editingRole}
        open={editingRole !== null}
        onOpenChange={(open) => {
          if (!open) setEditingRole(null);
        }}
        resources={resources}
        actions={actions}
      />

      <ViewRoleDialog
        role={viewingRole}
        open={viewingRole !== null}
        onOpenChange={(open) => {
          if (!open) setViewingRole(null);
        }}
        resources={resources}
        actions={actions}
        onEdit={handleEdit}
      />
    </>
  );
}
