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
import type { Course } from "@/types/api";

type AllCoursesColumnsProps = {
  onEdit?: (course: Course) => void;
  onDelete?: (course: Course) => void;
  onApprove?: (course: Course) => void;
  onReject?: (course: Course) => void;
  isDeleting?: boolean;
  isApproving?: boolean;
  isRejecting?: boolean;
};

export const allCoursesColumns = ({
  onEdit,
  onDelete,
  onApprove,
  onReject,
  isDeleting = false,
  isApproving = false,
  isRejecting = false,
}: AllCoursesColumnsProps = {}): ColumnDef<Course>[] => [
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
    header: "Hierarchy",
    cell: ({ row }) => {
      const course = row.original;
      return (
        <div className="flex max-w-xs flex-col text-sm">
          <span>{course.categoryId?.name || "-"}</span>
          <span className="text-muted-foreground text-xs">{course.subCategoryId?.name || "-"}</span>
          <span className="text-muted-foreground text-xs">{course.moduleId?.name || "-"}</span>
          <span className="text-muted-foreground text-xs">{course.lessonId?.name || "-"}</span>
        </div>
      );
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
    accessorKey: "isCourseApproved",
    header: "Status",
    cell: ({ row }) => {
      const course = row.original;
      if (course.isCourseRejected) {
        return <Badge variant="destructive">Rejected</Badge>;
      }
      if (course.isCourseApproved) {
        return <Badge variant="default">Approved</Badge>;
      }
      return <Badge variant="secondary">Pending</Badge>;
    },
    enableSorting: false,
  },
  {
    accessorKey: "averageRating",
    header: "Rating",
    cell: ({ row }) => {
      const rating = row.getValue<number | undefined>("averageRating");
      const reviews = row.original.numberOfReviews || 0;
      return <span className="text-sm">{rating ? `${rating.toFixed(1)} (${reviews})` : "No reviews"}</span>;
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
      const course = row.original;
      const canApprove = !course.isCourseApproved || course.isCourseRejected;
      const canReject = !course.isCourseRejected;

      const handleEdit = () => {
        onEdit?.(course);
      };

      const handleDelete = () => {
        onDelete?.(course);
      };

      const handleApprove = () => {
        onApprove?.(course);
      };

      const handleReject = () => {
        onReject?.(course);
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="size-8 p-0" disabled={isDeleting || isApproving || isRejecting}>
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(course._id)}>
              Copy course ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {canApprove && (
              <DropdownMenuItem onClick={handleApprove} disabled={isApproving || isRejecting}>
                <Check className="mr-2 size-4" />
                {course.isCourseRejected ? "Re-approve course" : "Approve course"}
              </DropdownMenuItem>
            )}
            {canReject && (
              <DropdownMenuItem onClick={handleReject} disabled={isApproving || isRejecting}>
                <X className="mr-2 size-4" />
                Reject course
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleEdit} disabled={isApproving || isRejecting}>
              <Edit className="mr-2 size-4" />
              Edit course
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} disabled={isDeleting || isApproving || isRejecting} className="text-destructive">
              <Trash2 className="mr-2 size-4" />
              Delete course
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
