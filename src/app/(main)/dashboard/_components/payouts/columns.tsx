"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { format, formatDistanceToNow } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Eye,
  MoreHorizontal,
  Building2,
} from "lucide-react";
import type { PayoutBankDetails } from "@/hooks/api/use-payouts";

export type PayoutRow = {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  amount: number;
  status: string;
  bankAccount?: string;
  bankDetails?: PayoutBankDetails | null;
  requestedAt?: string;
  processedAt?: string | null;
  rejectionReason?: string | null;
  reference?: string;
  description?: string;
};

const STATUS_CONFIG = {
  pending: { color: "outline" as const, label: "Pending", icon: Clock },
  completed: { color: "default" as const, label: "Completed", icon: CheckCircle },
  rejected: { color: "destructive" as const, label: "Rejected", icon: XCircle },
  approved: { color: "secondary" as const, label: "Approved", icon: CheckCircle },
  failed: { color: "destructive" as const, label: "Rejected", icon: XCircle },
};

function maskAccount(account?: string | null) {
  if (!account) return "N/A";
  const s = String(account);
  if (s.length <= 4) return `****${s}`;
  return `${s.slice(0, 4)}••••${s.slice(-4)}`;
}

export interface PayoutColumnCallbacks {
  onView: (payout: PayoutRow) => void;
  onApprove: (payout: PayoutRow) => void;
  onReject: (payout: PayoutRow) => void;
}

export function getPayoutColumns(callbacks: PayoutColumnCallbacks): ColumnDef<PayoutRow, any>[] {
  return [
    {
      accessorKey: "reference",
      header: "Reference",
      cell: ({ row }) => (
        <div>
          <div className="font-medium font-mono text-sm">
            {row.original.reference || String(row.original.id).slice(-8).toUpperCase()}
          </div>
          <div className="text-xs text-muted-foreground truncate max-w-[140px]">
            {row.original.description || "Withdrawal"}
          </div>
        </div>
      ),
    },
    {
      id: "user",
      header: "Mentor",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 min-w-[140px]">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
            <User className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <div className="font-medium truncate">{row.original.userName || "—"}</div>
            <div className="text-xs text-muted-foreground font-mono truncate">
              {row.original.userId ? String(row.original.userId).slice(-8) : "—"}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <div className="font-semibold tabular-nums text-base">
          {formatCurrency(row.original.amount)}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status || "pending";
        const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
        const Icon = config.icon;
        return (
          <Badge variant={config.color} className="gap-1">
            <Icon className="w-3 h-3" />
            {config.label}
          </Badge>
        );
      },
    },
    {
      id: "bank",
      header: "Bank",
      cell: ({ row }) => {
        const bank = row.original.bankDetails;
        return (
          <div className="text-xs min-w-[120px]">
            <div className="flex items-center gap-1 font-medium">
              <Building2 className="w-3 h-3 text-muted-foreground shrink-0" />
              <span className="truncate">{bank?.bankName || "—"}</span>
            </div>
            <div className="font-mono text-muted-foreground mt-0.5">
              {maskAccount(bank?.accountNumber || row.original.bankAccount)}
            </div>
            {bank?.ifscCode && (
              <div className="text-muted-foreground">{bank.ifscCode}</div>
            )}
          </div>
        );
      },
    },
    {
      id: "timeline",
      header: "Requested",
      cell: ({ row }) => {
        const at = row.original.requestedAt;
        if (!at) return <span className="text-xs text-muted-foreground">—</span>;
        const d = new Date(at);
        return (
          <div className="text-xs">
            <div className="font-medium">{format(d, "dd MMM yyyy")}</div>
            <div className="text-muted-foreground">
              {formatDistanceToNow(d, { addSuffix: true })}
            </div>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const isPending = row.original.status === "pending";
        return (
          <div className="flex items-center gap-1 justify-end">
            {isPending && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                  onClick={() => callbacks.onApprove(row.original)}
                >
                  <CheckCircle className="w-3.5 h-3.5 mr-1" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-destructive border-destructive/30 hover:bg-destructive/5"
                  onClick={() => callbacks.onReject(row.original)}
                >
                  <XCircle className="w-3.5 h-3.5 mr-1" />
                  Reject
                </Button>
              </>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => callbacks.onView(row.original)}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                {isPending && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => callbacks.onApprove(row.original)}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve payout
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => callbacks.onReject(row.original)}
                      className="text-destructive focus:text-destructive"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject & refund
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}
