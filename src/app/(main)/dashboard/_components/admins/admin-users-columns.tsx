"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Trash2, Edit, LockKeyhole } from "lucide-react";
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
import { useDeleteAdmin } from "@/hooks/api";
import { formatCurrency } from "@/lib/utils";
import type { AdminUser } from "@/types/api";

type AdminUsersColumnsProps = {
  onEdit?: (admin: AdminUser) => void;
  onResetPassword?: (admin: AdminUser) => void;
  onDeleteSuccess?: () => void;
};

export const adminUsersColumns = ({
  onEdit,
  onResetPassword,
  onDeleteSuccess,
}: AdminUsersColumnsProps = {}): ColumnDef<AdminUser>[] => [
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <div className="font-medium">{row.getValue("email")}</div>,
    enableSorting: false,
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue<AdminUser["role"]>("role");
      return (
        <Badge variant={role === "super-admin" ? "default" : "secondary"} className="capitalize">
          {role === "super-admin" ? "Super Admin" : "Admin"}
        </Badge>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue<boolean>("status");
      return <Badge variant={status ? "default" : "outline"}>{status ? "Active" : "Inactive"}</Badge>;
    },
    enableSorting: false,
  },
  {
    accessorKey: "wallet",
    header: "Wallet Balance",
    cell: ({ row }) => {
      const wallet = row.getValue<number>("wallet");
      return <div className="font-semibold tabular-nums">{formatCurrency(wallet)}</div>;
    },
    enableSorting: false,
  },
  {
    accessorKey: "realWallet",
    header: "Real Wallet",
    cell: ({ row }) => {
      const realWallet = row.getValue<number>("realWallet");
      return <div className="tabular-nums">{formatCurrency(realWallet)}</div>;
    },
    enableSorting: false,
  },
  {
    accessorKey: "virtualWallet",
    header: "Virtual Wallet",
    cell: ({ row }) => {
      const virtualWallet = row.getValue<number>("virtualWallet");
      return <div className="tabular-nums">{formatCurrency(virtualWallet)}</div>;
    },
    enableSorting: false,
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return <div className="text-sm">{date.toLocaleDateString()}</div>;
    },
    enableSorting: false,
  },
  {
    id: "actions",
    cell: function ActionsCell({ row }) {
      const admin = row.original;
      const { mutate: deleteAdmin, isPending } = useDeleteAdmin();

      const handleDelete = () => {
        if (confirm(`Are you sure you want to delete ${admin.email}?`)) {
          deleteAdmin(admin._id, {
            onSuccess: () => {
              toast.success(`${admin.email} has been deleted`);
              onDeleteSuccess?.();
            },
            onError: (error: any) => {
              toast.error(error.response?.data?.message || "Failed to delete admin");
            },
          });
        }
      };

      const handleEdit = () => {
        onEdit?.(admin);
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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(admin._id)}>Copy admin ID</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onResetPassword?.(admin)}>
              <LockKeyhole className="mr-2 size-4" />
              Reset Password
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleEdit}>
              <Edit className="mr-2 size-4" />
              Edit admin
            </DropdownMenuItem>
            {admin.role !== "super-admin" && (
              <DropdownMenuItem onClick={handleDelete} disabled={isPending} className="text-destructive">
                <Trash2 className="mr-2 size-4" />
                Delete admin
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
