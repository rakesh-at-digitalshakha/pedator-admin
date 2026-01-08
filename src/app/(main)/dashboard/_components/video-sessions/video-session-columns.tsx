"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Video } from "lucide-react";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { VideoSession } from "@/types/api";

export const videoSessionColumns: ColumnDef<VideoSession>[] = [
  {
    accessorKey: "bookingId.learnerId",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Learner" />,
    cell: ({ row }) => {
      const learner = row.original.bookingId.learnerId;
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
    accessorKey: "bookingId.mentorId",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Mentor" />,
    cell: ({ row }) => {
      const mentor = row.original.bookingId.mentorId;
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
    accessorKey: "startTime",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Start Time" />,
    cell: ({ row }) => {
      const startTime = row.getValue("startTime") as string | undefined;
      if (!startTime) {
        return <span className="text-muted-foreground text-sm">Not started</span>;
      }
      const date = new Date(startTime);
      return (
        <div>
          <div>{format(date, "MMM d, yyyy")}</div>
          <div className="text-muted-foreground text-sm">{format(date, "h:mm a")}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "duration",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Duration" />,
    cell: ({ row }) => {
      const duration = row.getValue("duration") as number | undefined;
      if (!duration) {
        return <span className="text-muted-foreground text-sm">N/A</span>;
      }
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      return (
        <div>
          {hours > 0 && `${hours}h `}
          {minutes}m
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const statusColors: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
        completed: "default",
        ongoing: "secondary",
        scheduled: "outline",
        cancelled: "destructive",
        pending: "outline",
        active: "secondary",
        ended: "default",
        failed: "destructive",
      };
      return (
        <Badge variant={statusColors[status] || "outline"}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "recordingUrl",
    header: "Recording",
    cell: ({ row }) => {
      const recordingUrl = row.getValue("recordingUrl") as string | undefined;
      return recordingUrl ? (
        <Button variant="ghost" size="sm" asChild>
          <a href={recordingUrl} target="_blank" rel="noopener noreferrer">
            <Video className="mr-2 size-4" />
            View
          </a>
        </Button>
      ) : (
        <span className="text-muted-foreground text-sm">No recording</span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const session = row.original;

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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(session._id)}>
              Copy session ID
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(session.bookingId._id)}>
              Copy booking ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View session details</DropdownMenuItem>
            {session.recordingUrl && (
              <DropdownMenuItem asChild>
                <a href={session.recordingUrl} target="_blank" rel="noopener noreferrer">
                  Open recording
                </a>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
