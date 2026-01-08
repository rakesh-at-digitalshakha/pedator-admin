"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Trash2, Edit, Check, X } from "lucide-react";

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
import type { MentorUser } from "@/types/api";

type AllMentorsColumnsProps = {
  onEdit?: (mentor: MentorUser) => void;
  onDelete?: (mentor: MentorUser) => void;
  onApprove?: (mentor: MentorUser) => void;
  onReject?: (mentor: MentorUser) => void;
  isApproving?: boolean;
  isRejecting?: boolean;
};

export const allMentorsColumns = ({
  onEdit,
  onDelete,
  onApprove,
  onReject,
  isApproving = false,
  isRejecting = false,
}: AllMentorsColumnsProps = {}): ColumnDef<MentorUser>[] => [
  {
    accessorKey: "firstName",
    header: "First Name",
    cell: ({ row }) => <div className="font-medium">{row.getValue("firstName")}</div>,
    enableSorting: false,
  },
  {
    accessorKey: "lastName",
    header: "Last Name",
    cell: ({ row }) => <div>{row.getValue("lastName")}</div>,
    enableSorting: false,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("email")}</div>,
    enableSorting: false,
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone",
    cell: ({ row }) => <div>{row.getValue("phoneNumber") || "-"}</div>,
    enableSorting: false,
  },
  {
    accessorKey: "wallet",
    header: "Wallet",
    cell: ({ row }) => {
      const wallet = row.getValue<number>("wallet");
      return <div className="font-semibold tabular-nums">${wallet?.toLocaleString() ?? 0}</div>;
    },
    enableSorting: false,
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return <div className="text-sm">{date.toLocaleDateString()}</div>;
    },
    enableSorting: false,
  },
  {
    accessorKey: "isProfileApproved",
    header: "Status",
    cell: ({ row }) => {
      const isApproved = row.getValue("isProfileApproved");
      const isRejected = row.original.isProfileRejected;
      const isBlocked = row.original.isBlocked;
      const rejectionReason = row.original.rejectionReason;

      if (isBlocked) {
        return <Badge variant="destructive">Blocked</Badge>;
      }
      if (isApproved) {
        return <Badge variant="default">Approved</Badge>;
      }
      if (isRejected) {
        return (
          <div className="flex flex-col gap-1">
            <Badge variant="destructive">Rejected</Badge>
            {rejectionReason && (
              <div className="text-xs text-muted-foreground max-w-[200px] truncate" title={rejectionReason}>
                {rejectionReason}
              </div>
            )}
          </div>
        );
      }
      return <Badge variant="secondary">Pending</Badge>;
    },
    enableSorting: false,
  },
  {
    id: "actions",
    cell: function ActionsCell({ row }) {
      const mentor = row.original;
      const isPending = isApproving || isRejecting;

      const handleEdit = () => {
        onEdit?.(mentor);
      };

      const handleDelete = () => {
        onDelete?.(mentor);
      };

      const handleApprove = () => {
        onApprove?.(mentor);
      };

      const handleReject = () => {
        onReject?.(mentor);
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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(mentor._id)}>
              Copy mentor ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleEdit}>
              <Edit className="mr-2 size-4" />
              Edit mentor
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {/* Approve action - show for pending or rejected mentors */}
            {!mentor.isProfileApproved && (
              <DropdownMenuItem onClick={handleApprove} disabled={isPending}>
                <Check className="mr-2 size-4" />
                {mentor.isProfileRejected ? "Approve (Re-activate)" : "Approve Mentor"}
              </DropdownMenuItem>
            )}
            {/* Reject action - show for pending mentors only */}
            {!mentor.isProfileApproved && !mentor.isProfileRejected && (
              <DropdownMenuItem onClick={handleReject} disabled={isPending} className="text-destructive">
                <X className="mr-2 size-4" />
                Reject Mentor
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleDelete} disabled={isPending} className="text-destructive">
              <Trash2 className="mr-2 size-4" />
              Delete mentor
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
