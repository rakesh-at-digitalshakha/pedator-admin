"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Trash2, Edit, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteRole } from "@/hooks/api";
import type { Role } from "@/types/api";

type RolesColumnsProps = {
  onEdit?: (role: Role) => void;
  onView?: (role: Role) => void;
  onDeleteSuccess?: () => void;
};

type ApiError = Error & { response?: { data?: { message?: string } } };

export const rolesColumns = ({
  onEdit,
  onView,
  onDeleteSuccess,
}: RolesColumnsProps = {}): ColumnDef<Role>[] => [
  {
    accessorKey: "name",
    header: "Role Name",
    cell: ({ row }) => {
      const role = row.original;
      return (
        <div className="flex items-center gap-2">
          <span className="font-medium capitalize">{role.name}</span>
          {role.isSystem && (
            <Badge variant="outline" className="text-xs">
              System
            </Badge>
          )}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.getValue("description") || "—"}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "permissions",
    header: "Permissions",
    cell: ({ row }) => {
      const permissions = row.original.permissions ?? [];
      const totalActions = permissions.reduce((acc, p) => acc + (p.actions?.length ?? 0), 0);
      const resourceCount = permissions.filter((p) => (p.actions?.length ?? 0) > 0).length;
      return (
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            <ShieldCheck className="mr-1 size-3" />
            {resourceCount} resource{resourceCount !== 1 ? "s" : ""}
          </Badge>
          <span className="text-xs text-muted-foreground">{totalActions} action{totalActions !== 1 ? "s" : ""}</span>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return <span className="text-sm text-muted-foreground">{date.toLocaleDateString()}</span>;
    },
    enableSorting: false,
  },
  {
    id: "actions",
    cell: function ActionsCell({ row }) {
      const role = row.original;
      const { mutate: deleteRole, isPending } = useDeleteRole();

      const handleDelete = () => {
        if (role.isSystem) {
          toast.error("System roles cannot be deleted");
          return;
        }
        if (confirm(`Delete role "${role.name}"? This cannot be undone.`)) {
          deleteRole(role._id, {
            onSuccess: () => {
              toast.success(`Role "${role.name}" deleted`);
              onDeleteSuccess?.();
            },
            onError: (err: ApiError) => {
              toast.error(err.response?.data?.message ?? "Failed to delete role");
            },
          });
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="size-8 p-0" disabled={isPending}>
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onView?.(role)}>
              <ShieldCheck className="mr-2 size-4" />
              View permissions
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(role._id)}>
              Copy role ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit?.(role)}>
              <Edit className="mr-2 size-4" />
              Edit role
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
              disabled={isPending || role.isSystem}
              className="text-destructive"
            >
              <Trash2 className="mr-2 size-4" />
              Delete role
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
