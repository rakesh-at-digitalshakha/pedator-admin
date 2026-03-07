"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle, XCircle, Clock, DollarSign, User, Eye, MoreHorizontal } from "lucide-react";

export type PayoutRow = {
  id: string;
  userId: string;
  userName?: string;
  amount: number;
  status: string; // pending | approved | rejected | processing | completed
  bankAccount?: string;
  requestedAt?: string;
  processedAt?: string;
  rejectionReason?: string;
  reference?: string;
};

const STATUS_CONFIG = {
  pending: { color: "outline", label: "Pending", icon: Clock },
  approved: { color: "secondary", label: "Approved", icon: CheckCircle },
  rejected: { color: "destructive", label: "Rejected", icon: XCircle },
  processing: { color: "default", label: "Processing", icon: Clock },
  completed: { color: "default", label: "Completed", icon: CheckCircle },
};

export interface PayoutColumnCallbacks {
  onView:    (payout: PayoutRow) => void;
  onApprove: (payout: PayoutRow) => void;
  onReject:  (payout: PayoutRow) => void;
}

/** Pure column definitions — no hooks, no dialogs. All mutations live in the table component. */
export function getPayoutColumns(callbacks: PayoutColumnCallbacks): ColumnDef<PayoutRow, any>[] {
  return [
    {
      accessorKey: "reference",
      header: "Reference",
      cell: ({ row }) => (
        <div>
          <div className="font-medium font-mono text-sm">#{row.original.id}</div>
          <div className="text-xs text-muted-foreground">{row.original.reference}</div>
        </div>
      ),
    },
    {
      id: "user",
      header: "Mentor / User",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-muted-foreground shrink-0" />
          <div>
            <div className="font-medium">{row.original.userName || "—"}</div>
            <div className="text-xs text-muted-foreground font-mono">{row.original.userId.slice(-8)}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <div className="flex items-center gap-1 font-bold">
          <DollarSign className="w-4 h-4" />
          {formatCurrency(row.original.amount)}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status || "pending";
        const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
        return (
          <Badge variant={config.color as any}>
            {config.label}
          </Badge>
        );
      },
    },
    {
      id: "bankAccount",
      header: "Bank Account",
      cell: ({ row }) => (
        <div className="text-xs font-mono">
          {row.original.bankAccount ? row.original.bankAccount.substring(0, 4) + "***" : "N/A"}
        </div>
      ),
    },
    {
      id: "timeline",
      header: "Requested",
      cell: ({ row }) => (
        <div className="text-xs text-muted-foreground">
          {row.original.requestedAt
            ? formatDistanceToNow(new Date(row.original.requestedAt), { addSuffix: true })
            : "N/A"}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => callbacks.onView(row.original)}>
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </DropdownMenuItem>
            {row.original.status === "pending" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => callbacks.onApprove(row.original)}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => callbacks.onReject(row.original)}
                  className="text-destructive"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
