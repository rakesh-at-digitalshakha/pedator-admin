"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useApprovePayout, useRejectPayout } from "@/hooks/api/use-payouts";
import { formatDistanceToNow } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { CheckCircle, XCircle, Clock, DollarSign, User, Eye } from "lucide-react";

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

export function usePayoutColumns(onView?: (payout: PayoutRow) => void): ColumnDef<PayoutRow, any>[] {
  const approveMutation = useApprovePayout();
  const rejectMutation = useRejectPayout();
  const [approveId, setApproveId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);

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
      header: "Mentee/Teacher",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{row.original.userName || row.original.userId}</div>
            <div className="text-xs text-muted-foreground">{row.original.userId}</div>
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
          ${row.original.amount.toFixed(2)}
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
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost">
                ⋮
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView?.(row.original)}>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {row.original.status === "pending" && (
                <>
                  <DropdownMenuItem onClick={() => setApproveId(row.original.id)}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRejectId(row.original.id)} className="text-destructive">
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialog open={approveId === row.original.id} onOpenChange={(open) => !open && setApproveId(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Approve Payout?</AlertDialogTitle>
                <AlertDialogDescription>
                  Approve ${row.original.amount.toFixed(2)} payout to {row.original.userName || row.original.userId}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    approveMutation.mutate(row.original.id);
                    setApproveId(null);
                  }}
                >
                  Approve
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog open={rejectId === row.original.id} onOpenChange={(open) => !open && setRejectId(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reject Payout?</AlertDialogTitle>
                <AlertDialogDescription>
                  Reject ${row.original.amount.toFixed(2)} payout request. User will be notified.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => {
                    rejectMutation.mutate({ id: row.original.id, reason: "Insufficient documentation" });
                    setRejectId(null);
                  }}
                >
                  Reject
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      ),
    },
  ];
}
