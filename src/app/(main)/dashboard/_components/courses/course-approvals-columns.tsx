"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Check, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Course } from "@/types/api";

type CourseApprovalsColumnsProps = {
  onApprove?: (course: Course) => void;
  onReject?: (course: Course) => void;
  isApproving?: boolean;
  isRejecting?: boolean;
};

export const courseApprovalsColumns = ({
  onApprove,
  onReject,
  isApproving = false,
  isRejecting = false,
}: CourseApprovalsColumnsProps = {}): ColumnDef<Course>[] => [
  {
    accessorKey: "title",
    header: "Course Title",
    cell: ({ row }) => {
      const course = row.original;
      return (
        <div className="flex max-w-xs flex-col">
          <span className="truncate font-medium">{course.title}</span>
          <span className="text-muted-foreground text-xs">
            by {course.mentorId?.firstName} {course.mentorId?.lastName}
          </span>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "categoryId",
    header: "Category",
    cell: ({ row }) => {
      const course = row.original;
      return <span className="text-sm">{course.categoryId?.name || "-"}</span>;
    },
    enableSorting: false,
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const price = row.getValue<number>("price");
      return <span className="font-medium tabular-nums">₹{price?.toFixed(2) ?? "0.00"}</span>;
    },
    enableSorting: false,
  },
  {
    accessorKey: "createdAt",
    header: "Submitted",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return <div className="text-sm">{date.toLocaleDateString()}</div>;
    },
    enableSorting: false,
  },
  {
    id: "actions",
    cell: function ActionsCell({ row }) {
      const course = row.original;
      const isPending = isApproving || isRejecting;

      const handleApprove = () => {
        onApprove?.(course);
      };

      const handleReject = () => {
        onReject?.(course);
      };

      return (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleApprove}
            disabled={isPending}
            className="h-8"
          >
            <Check className="mr-1 size-4" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleReject}
            disabled={isPending}
            className="h-8"
          >
            <X className="mr-1 size-4" />
            Reject
          </Button>
        </div>
      );
    },
  },
];
