"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

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
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type { Transaction } from "@/types/api";

const statusColors: Record<Transaction["status"], "default" | "secondary" | "destructive" | "outline"> = {
  completed: "default",
  pending: "secondary",
  failed: "destructive",
  refunded: "outline",
};

const typeLabels: Record<Transaction["type"], string> = {
  purchase: "Purchase",
  mentor_earning: "Mentor Earning",
  platform_fee: "Platform Fee",
  withdrawal: "Withdrawal",
  deposit: "Deposit",
  refund: "Refund",
};

export const transactionColumns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "_id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Transaction ID" />,
    cell: ({ row }) => {
      const id = row.getValue<string>("_id");
      return (
        <div className="text-muted-foreground font-mono text-xs">
          {id.length > 8 ? `${id.slice(0, 8)}...` : id}
        </div>
      );
    },
  },
  {
    accessorKey: "userId",
    header: "User",
    cell: ({ row }) => {
      const userId = row.getValue<Transaction["userId"]>("userId");
      if (typeof userId === "object" && userId !== null) {
        const name = userId.firstName || userId.lastName
          ? `${userId.firstName || ""} ${userId.lastName || ""}`.trim()
          : userId.email || "Unknown";
        return (
          <div className="flex flex-col">
            <div className="font-medium">{name}</div>
            {userId.email && (
              <div className="text-muted-foreground text-xs">{userId.email}</div>
            )}
          </div>
        );
      }
      return <div className="text-muted-foreground text-sm">{String(userId).slice(0, 8)}...</div>;
    },
    enableSorting: false,
  },
  {
    accessorKey: "courseId",
    header: "Course",
    cell: ({ row }) => {
      const courseId = row.original.courseId;
      if (typeof courseId === "object" && courseId !== null) {
        return (
          <div className="font-medium">{courseId.title || "N/A"}</div>
        );
      }
      return <div className="text-muted-foreground text-sm">{courseId ? String(courseId).slice(0, 8) : "N/A"}...</div>;
    },
    enableSorting: false,
  },
  {
    accessorKey: "type",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
    cell: ({ row }) => {
      const type = row.getValue<Transaction["type"]>("type");
      return <div className="font-medium">{typeLabels[type]}</div>;
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
    cell: ({ row }) => {
      const amount = row.getValue<number>("amount");
      return <div className="font-semibold tabular-nums">${amount.toLocaleString()}</div>;
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.getValue<Transaction["status"]>("status");
      return (
        <Badge variant={statusColors[status]} className="capitalize">
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "userModel",
    header: "User Type",
    cell: ({ row }) => {
      const userModel = row.getValue<Transaction["userModel"]>("userModel");
      return <Badge variant="outline">{userModel}</Badge>;
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const description = row.getValue<string>("description");
      return <div className="text-muted-foreground max-w-[300px] truncate">{description}</div>;
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return (
        <div className="text-sm">
          {date.toLocaleDateString()} {date.toLocaleTimeString()}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const transaction = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="size-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(transaction._id)}>
              Copy transaction ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
