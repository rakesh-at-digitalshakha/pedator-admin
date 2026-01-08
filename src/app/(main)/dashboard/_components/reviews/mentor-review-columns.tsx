"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Star, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type { MentorReview } from "@/types/api";

export const mentorReviewColumns = (): ColumnDef<MentorReview>[] => [
  {
    accessorKey: "learnerId",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Learner" />,
    cell: ({ row }) => {
      const learner = row.original.learnerId;
      return (
        <div>
          <div className="font-medium">
            {learner.firstName} {learner.lastName}
          </div>
          <div className="text-muted-foreground text-sm">{learner.email}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "mentorId",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Mentor" />,
    cell: ({ row }) => {
      const mentor = row.original.mentorId;
      return (
        <div>
          <div className="font-medium">
            {mentor.firstName} {mentor.lastName}
          </div>
          <div className="text-muted-foreground text-sm">{mentor.email}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "courseId.title",
    header: "Course",
    cell: ({ row }) => {
      const course = row.original.courseId;
      return course ? <div className="text-sm font-medium">{course.title}</div> : <span className="text-muted-foreground text-sm">N/A</span>;
    },
  },
  {
    accessorKey: "averageRating",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Rating" />,
    cell: ({ row }) => {
      const rating = row.getValue("averageRating") as number;
      return (
        <div className="flex items-center gap-1">
          <Star className="size-4 fill-yellow-400 text-yellow-400" />
          <span className="font-medium">{rating.toFixed(1)}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "comment",
    header: "Review",
    cell: ({ row }) => {
      const comment = row.getValue("comment") as string;
      return <div className="max-w-md truncate">{comment}</div>;
    },
  },
  {
    accessorKey: "ratings",
    header: "Details",
    cell: ({ row }) => {
      const ratings = row.original.ratings;
      return (
        <div className="text-muted-foreground text-xs space-y-0.5">
          <div>Comm: {ratings.communication}/5</div>
          <div>Knowledge: {ratings.knowledge}/5</div>
          <div>Clarity: {ratings.clarity}/5</div>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
    cell: ({ row }) => {
      const date = row.getValue("createdAt");
      return <div>{format(new Date(date as string), "MMM d, yyyy")}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const review = row.original;

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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(review._id)}>
              Copy review ID
            </DropdownMenuItem>
            {review.mentorReply && (
              <>
                <DropdownMenuSeparator />
                <div className="p-2">
                  <div className="text-muted-foreground text-xs font-medium mb-1">Mentor Reply:</div>
                  <div className="text-xs">{review.mentorReply}</div>
                  {review.repliedAt && (
                    <div className="text-muted-foreground text-xs mt-1">
                      {format(new Date(review.repliedAt), "MMM d, yyyy")}
                    </div>
                  )}
                </div>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
