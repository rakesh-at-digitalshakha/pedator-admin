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
import type { PlatformReview } from "@/types/api";

export const platformReviewColumns = (
  onApprove: (id: string) => void,
  onReject: (id: string) => void,
  onDelete: (id: string) => void,
): ColumnDef<PlatformReview>[] => [
  {
    accessorKey: "userId",
    header: ({ column }) => <DataTableColumnHeader column={column} title="User" />,
    cell: ({ row }) => {
      const user = row.original.userId;
      return (
        <div>
          <div className="font-medium">
            {user.firstName || ""} {user.lastName || ""}
          </div>
          <div className="text-muted-foreground text-sm">{user.email}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "userModel",
    header: ({ column }) => <DataTableColumnHeader column={column} title="User Type" />,
    cell: ({ row }) => {
      const userModel = row.getValue("userModel") as string;
      return <Badge variant="outline">{userModel === "learners" ? "Learner" : "Mentor"}</Badge>;
    },
  },
  {
    accessorKey: "rating",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Rating" />,
    cell: ({ row }) => {
      const rating = row.getValue("rating");
      return (
        <div className="flex items-center gap-1">
          <Star className="size-4 fill-yellow-400 text-yellow-400" />
          <span className="font-medium">{rating}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "review",
    header: "Review",
    cell: ({ row }) => {
      const review = row.getValue("review");
      return <div className="max-w-md truncate">{review}</div>;
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.getValue("status") as boolean;
      return <Badge variant={status ? "default" : "secondary"}>{status ? "Approved" : "Pending"}</Badge>;
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
            <DropdownMenuSeparator />
            {!review.status && (
              <DropdownMenuItem onClick={() => onApprove(review._id)}>Approve review</DropdownMenuItem>
            )}
            {review.status && <DropdownMenuItem onClick={() => onReject(review._id)}>Reject review</DropdownMenuItem>}
            <DropdownMenuItem onClick={() => onDelete(review._id)} className="text-destructive">
              Delete review
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
