"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";

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
import type { LearnerUser } from "@/types/api";

type LearnerColumnsProps = {
  onEdit?: (learner: LearnerUser) => void;
  onDelete?: (learner: LearnerUser) => void;
  isDeleting?: boolean;
};

export const learnerColumns = ({
  onEdit,
  onDelete,
  isDeleting = false,
}: LearnerColumnsProps = {}): ColumnDef<LearnerUser>[] => [
  {
    accessorKey: "firstName",
    header: "Name",
    cell: ({ row }) => {
      const learner = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium">
            {learner.firstName} {learner.lastName}
          </span>
          <span className="text-muted-foreground text-xs">{learner.email}</span>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "mobile",
    header: "Mobile",
    cell: ({ row }) => <span>{row.getValue("mobile") || "-"}</span>,
    enableSorting: false,
  },
  {
    accessorKey: "isBlocked",
    header: "Status",
    cell: ({ row }) => {
      const isBlocked = row.getValue("isBlocked") as boolean;
      const isVerified = row.original.isVerified;
      return (
        <div className="flex flex-col gap-1">
          <Badge variant={isBlocked ? "destructive" : "default"}>
            {isBlocked ? "Blocked" : "Active"}
          </Badge>
          {!isVerified && (
            <Badge variant="secondary" className="w-fit">
              Unverified
            </Badge>
          )}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "wallet",
    header: "Wallet",
    cell: ({ row }) => {
      const wallet = row.getValue("wallet") as number;
      return <span className="font-medium tabular-nums">₹{wallet?.toFixed(2) ?? "0.00"}</span>;
    },
    enableSorting: false,
  },
  {
    accessorKey: "enrolledCourses",
    header: "Enrolled Courses",
    cell: ({ row }) => {
      const courses = row.getValue("enrolledCourses") as string[] | undefined;
      const count = courses?.length ?? 0;
      return (
        <span className="text-muted-foreground" title={`${count} enrolled course${count !== 1 ? "s" : ""}`}>
          {count}
        </span>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return <span className="text-muted-foreground text-sm">{date.toLocaleDateString()}</span>;
    },
    enableSorting: false,
  },
  {
    id: "actions",
    cell: function ActionsCell({ row }) {
      const learner = row.original;
      const isPending = isDeleting;

      const handleEdit = () => {
        onEdit?.(learner);
      };

      const handleDelete = () => {
        onDelete?.(learner);
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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(learner._id)}>
              Copy learner ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleEdit}>
              <Edit className="mr-2 size-4" />
              Edit learner
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} disabled={isPending} className="text-destructive">
              <Trash2 className="mr-2 size-4" />
              Delete learner
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];