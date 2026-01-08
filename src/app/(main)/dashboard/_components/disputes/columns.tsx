"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUpdateDisputeStatus, useResolveDispute } from "@/hooks/api/use-disputes";

export type Dispute = {
  id: string;
  title: string;
  category?: string;
  status: string; // pending | investigating | resolved
  createdAt?: string;
  learnerId?: string;
  mentorId?: string;
};

export function useDisputeColumns(): ColumnDef<Dispute, any>[] {
  const updateStatus = useUpdateDisputeStatus();
  const resolve = useResolveDispute();
  return [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "title", header: "Title" },
    { accessorKey: "category", header: "Category" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.status === "resolved"
              ? "secondary" // fallback mapping (no success variant defined)
              : row.original.status === "investigating"
                ? "secondary"
                : "outline"
          }
        >
          {row.original.status}
        </Badge>
      ),
    },
    { accessorKey: "createdAt", header: "Created" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => updateStatus.mutate({ id: row.original.id, status: "investigating" })}
          >
            Investigate
          </Button>
          <Button size="sm" onClick={() => resolve.mutate({ id: row.original.id, action: "resolved" })}>
            Resolve
          </Button>
        </div>
      ),
    },
  ];
}
