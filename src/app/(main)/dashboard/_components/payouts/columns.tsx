"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApprovePayout, useRejectPayout } from "@/hooks/api/use-payouts";

export type PayoutRow = {
  id: string;
  userId: string;
  amount: number;
  status: string; // pending | approved | rejected
  createdAt?: string;
};

export function usePayoutColumns(): ColumnDef<PayoutRow, any>[] {
  const approve = useApprovePayout();
  const reject = useRejectPayout();
  return [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "userId", header: "User" },
    { accessorKey: "amount", header: "Amount" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.status === "approved"
              ? "secondary"
              : row.original.status === "rejected"
                ? "destructive"
                : "outline"
          }
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => approve.mutate(row.original.id)}>
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => reject.mutate({ id: row.original.id, reason: "insufficient docs" })}
          >
            Reject
          </Button>
        </div>
      ),
    },
  ];
}
