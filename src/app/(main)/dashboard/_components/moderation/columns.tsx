"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSuspendUser, useBanUser, useUnbanUser } from "@/hooks/api/use-moderation";

export type FlaggedContent = {
  id: string;
  title: string;
  userId: string;
  reason?: string;
  status?: string; // flagged | reviewed
  createdAt?: string;
};

export function useModerationColumns(): ColumnDef<FlaggedContent, any>[] {
  const suspend = useSuspendUser();
  const ban = useBanUser();
  const unban = useUnbanUser();
  return [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "title", header: "Title" },
    { accessorKey: "userId", header: "User" },
    { accessorKey: "reason", header: "Reason" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "reviewed" ? "secondary" : "outline"}>
          {row.original.status ?? "flagged"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => suspend.mutate({ id: row.original.userId })}>
            Suspend
          </Button>
          <Button size="sm" variant="destructive" onClick={() => ban.mutate({ id: row.original.userId })}>
            Ban
          </Button>
          <Button size="sm" onClick={() => unban.mutate({ id: row.original.userId })}>
            Unban
          </Button>
        </div>
      ),
    },
  ];
}
