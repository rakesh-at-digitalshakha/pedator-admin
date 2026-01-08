"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAssignTicket, useUpdateTicketStatus } from "@/hooks/api/use-tickets";

export type TicketRow = {
  id: string;
  subject: string;
  category?: string;
  status: string; // open | assigned | resolved
  createdAt?: string;
  assignedTo?: string;
};

export function useTicketColumns(): ColumnDef<TicketRow, any>[] {
  const assign = useAssignTicket();
  const updateStatus = useUpdateTicketStatus();
  return [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "subject", header: "Subject" },
    { accessorKey: "category", header: "Category" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.status === "resolved"
              ? "success"
              : row.original.status === "assigned"
                ? "secondary"
                : "outline"
          }
        >
          {row.original.status}
        </Badge>
      ),
    },
    { accessorKey: "assignedTo", header: "Assignee" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => assign.mutate({ id: row.original.id, adminId: "me" })}>
            Assign to me
          </Button>
          <Button size="sm" onClick={() => updateStatus.mutate({ id: row.original.id, status: "resolved" })}>
            Resolve
          </Button>
        </div>
      ),
    },
  ];
}
