"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Check, X, Eye } from "lucide-react";
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
import { useApproveMentor, useRejectMentor } from "@/hooks/api";
import type { MentorUser } from "@/types/api";

type MentorColumnsProps = {
  onApprove?: (mentor: MentorUser) => void;
  onReject?: (mentor: MentorUser, reason?: string) => void;
  onView?: (mentor: MentorUser) => void;
  isApproving?: boolean;
  isRejecting?: boolean;
};

export const mentorColumns = ({
  onApprove,
  onReject,
  onView,
  isApproving = false,
  isRejecting = false,
}: MentorColumnsProps = {}): ColumnDef<MentorUser>[] => [
  {
    accessorKey: "firstName",
    header: "Name",
    cell: ({ row }) => {
      const firstName = row.getValue("firstName") as string;
      const lastName = row.original.lastName;
      return (
        <div>
          <div className="font-medium">{firstName} {lastName}</div>
          <div className="text-sm text-muted-foreground">{row.original.email}</div>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone",
    cell: ({ row }) => {
      const phone = row.getValue("phoneNumber") as string;
      const mobile = row.original.mobile;
      return <div>{phone || mobile?.toString() || "-"}</div>;
    },
    enableSorting: false,
  },
  {
    accessorKey: "bio",
    header: "Bio",
    cell: ({ row }) => {
      const bio = row.getValue("bio") as string;
      return (
        <div className="max-w-md truncate text-muted-foreground">
          {bio || "-"}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "createdAt",
    header: "Registered",
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
      const rejectionReason = row.original.rejectionReason;

      if (isApproved) {
        return <Badge variant="default">Approved</Badge>;
      } else if (isRejected) {
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
      return <Badge variant="secondary">Pending Approval</Badge>;
    },
    enableSorting: false,
  },
  {
    id: "actions",
    header: "Actions",
    cell: function ActionsCell({ row }) {
      const mentor = row.original;
      const isPending = isApproving || isRejecting;
      const canApprove = !mentor.isProfileApproved; // Allow approving both pending and rejected mentors
      const canReject = !mentor.isProfileApproved && !mentor.isProfileRejected; // Only reject pending mentors

      const handleApprove = () => {
        if (onApprove) {
          onApprove(mentor);
        } else {
          toast.error("Approve handler not configured");
        }
      };

      const handleReject = () => {
        if (onReject) {
          onReject(mentor);
        } else {
          toast.error("Reject handler not configured");
        }
      };

      const handleView = () => {
        if (onView) {
          onView(mentor);
        }
      };

      return (
        <div className="flex items-center gap-2">
          {canApprove && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleApprove}
              disabled={isPending}
              className="gap-2"
            >
              <Check className="size-4" />
              {mentor.isProfileRejected ? "Re-approve" : "Approve"}
            </Button>
          )}
          {canReject && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReject}
              disabled={isPending}
              className="gap-2 text-destructive hover:text-destructive"
            >
              <X className="size-4" />
              Reject
            </Button>
          )}
          {mentor.isProfileApproved && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleView}
              className="gap-2"
            >
              <Eye className="size-4" />
              View
            </Button>
          )}
        </div>
      );
    },
    enableSorting: false,
  },
];
