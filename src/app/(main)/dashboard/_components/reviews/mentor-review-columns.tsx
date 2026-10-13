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

import type { ReviewDecisionTarget } from "./review-decision-dialog";

export const mentorReviewColumns = (
  onDecide: (target: ReviewDecisionTarget) => void,
): ColumnDef<MentorReview>[] => [
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
      const rating = (row.getValue("averageRating") as number) ?? 0;
      return (
        <div className="flex items-center gap-1">
          <Star className="size-4 fill-yellow-400 text-yellow-400" />
          <span className="font-medium">{rating.toFixed(1)}</span>
        </div>
      );
    },
  },
  {
    id: "moderation",
    header: "Requests",
    cell: ({ row }) => {
      const review = row.original;
      const report = review.report?.status;
      const deletion = review.deletionRequest?.status;
      if (!report && !deletion && !review.isHidden) {
        return <span className="text-muted-foreground text-sm">—</span>;
      }
      return (
        <div className="flex flex-col items-start gap-1">
          {review.isHidden ? <Badge variant="secondary">Hidden</Badge> : null}
          {report ? <Badge variant={report === "pending" ? "outline" : "default"}>Report {report}</Badge> : null}
          {deletion ? (
            <Badge variant={deletion === "pending" ? "outline" : "default"}>Deletion {deletion}</Badge>
          ) : null}
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
      if (!ratings) return <span className="text-muted-foreground text-sm">—</span>;
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
            {review.report?.status === "pending" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDecide({ reviewId: review._id, kind: "report", action: "approve" })}>
                  Approve report
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDecide({ reviewId: review._id, kind: "report", action: "reject" })}>
                  Reject report
                </DropdownMenuItem>
              </>
            )}
            {review.deletionRequest?.status === "pending" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDecide({ reviewId: review._id, kind: "deletion", action: "approve" })}
                  className="text-destructive"
                >
                  Approve deletion
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDecide({ reviewId: review._id, kind: "deletion", action: "reject" })}
                >
                  Reject deletion
                </DropdownMenuItem>
              </>
            )}
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
