"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/data-table/data-table";
import {
  usePendingPayouts,
  useApprovePayout,
  useRejectPayout,
  usePayoutSummary,
} from "@/hooks/api/use-payouts";
import { getPayoutColumns, type PayoutRow } from "./columns";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Download,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  Wallet,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

function mapRow(p: any): PayoutRow {
  const userId =
    typeof p.userId === "object" && p.userId?._id ? String(p.userId._id) : String(p.userId || "");
  return {
    id: String(p._id || p.id),
    userId,
    userName: p.userName || p.mentorName || p.name,
    amount: Number(p.amount) || 0,
    status: p.status === "failed" ? "rejected" : p.status || "pending",
    bankAccount: p.bankAccount,
    bankDetails: p.bankDetails || null,
    requestedAt: p.requestedAt || p.createdAt,
    processedAt: p.processedAt,
    rejectionReason: p.rejectionReason,
    reference: p.reference || String(p._id || p.id).slice(-8).toUpperCase(),
    description: p.description,
  };
}

export default function PayoutsTable() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("pending");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [selectedPayout, setSelectedPayout] = useState<PayoutRow | null>(null);
  const [approvingPayout, setApprovingPayout] = useState<PayoutRow | null>(null);
  const [rejectingPayout, setRejectingPayout] = useState<PayoutRow | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const approveMutation = useApprovePayout();
  const rejectMutation = useRejectPayout();
  const { data: summary, isLoading: summaryLoading, refetch: refetchSummary } = usePayoutSummary();

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const params = useMemo(
    () => ({
      ...(search ? { search } : {}),
      status: status || "pending",
      page,
      limit,
    }),
    [search, status, page, limit]
  );

  const { data, isLoading, isFetching, error, refetch } = usePendingPayouts(params);

  const handleView = useCallback((p: PayoutRow) => setSelectedPayout(p), []);
  const handleApprove = useCallback((p: PayoutRow) => setApprovingPayout(p), []);
  const handleReject = useCallback((p: PayoutRow) => {
    setRejectReason("");
    setRejectingPayout(p);
  }, []);

  const columns = useMemo(
    () => getPayoutColumns({ onView: handleView, onApprove: handleApprove, onReject: handleReject }),
    [handleView, handleApprove, handleReject]
  );

  const apiData = data as any;
  const rows: PayoutRow[] = useMemo(
    () => (Array.isArray(apiData?.data) ? apiData.data.map(mapRow) : []),
    [apiData]
  );

  const table = useDataTableInstance<PayoutRow, any>({ data: rows, columns });

  const totalPayouts = apiData?.pagination?.total || 0;
  const totalPages = Math.max(1, apiData?.pagination?.totalPages || Math.ceil(totalPayouts / limit) || 1);

  const pendingStat = summary?.pending || { count: 0, amount: 0 };
  const completedStat = summary?.completed || { count: 0, amount: 0 };
  const rejectedStat = summary?.rejected || { count: 0, amount: 0 };
  const allStat = summary?.all || { count: 0, amount: 0 };

  const handleRefresh = () => {
    refetch();
    refetchSummary();
  };

  const handleExport = () => {
    const csv = [
      ["Reference", "Mentor", "Amount", "Status", "Bank", "IFSC", "Account", "Requested At", "Description"].join(","),
      ...rows.map((r) =>
        [
          r.reference || r.id,
          r.userName || r.userId,
          r.amount.toFixed(2),
          r.status,
          r.bankDetails?.bankName || "",
          r.bankDetails?.ifscCode || "",
          r.bankDetails?.accountNumber || r.bankAccount || "",
          r.requestedAt ? new Date(r.requestedAt).toISOString() : "",
          r.description || "",
        ]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payouts-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const confirmApprove = async () => {
    if (!approvingPayout) return;
    await approveMutation.mutateAsync(approvingPayout.id);
    setApprovingPayout(null);
    refetchSummary();
  };

  const confirmReject = async () => {
    if (!rejectingPayout) return;
    const reason = rejectReason.trim() || "Rejected by admin";
    await rejectMutation.mutateAsync({ id: rejectingPayout.id, reason });
    setRejectingPayout(null);
    setRejectReason("");
    refetchSummary();
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Payouts</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Review mentor withdrawal requests. Approve to complete payout, or reject to refund their wallet.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isFetching}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport} disabled={rows.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Summary cards — clickable filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              key: "pending",
              label: "Pending review",
              icon: Clock,
              count: pendingStat.count,
              amount: pendingStat.amount,
              className: "text-amber-600",
              ring: status === "pending" ? "ring-2 ring-amber-400" : "",
            },
            {
              key: "completed",
              label: "Completed",
              icon: CheckCircle2,
              count: completedStat.count,
              amount: completedStat.amount,
              className: "text-emerald-600",
              ring: status === "completed" ? "ring-2 ring-emerald-400" : "",
            },
            {
              key: "rejected",
              label: "Rejected",
              icon: XCircle,
              count: rejectedStat.count,
              amount: rejectedStat.amount,
              className: "text-red-600",
              ring: status === "rejected" ? "ring-2 ring-red-400" : "",
            },
            {
              key: "all",
              label: "All payouts",
              icon: Wallet,
              count: allStat.count,
              amount: allStat.amount,
              className: "text-slate-700",
              ring: status === "all" ? "ring-2 ring-slate-400" : "",
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.key}
                type="button"
                onClick={() => {
                  setStatus(card.key);
                  setPage(1);
                }}
                className={`text-left rounded-xl border bg-card p-4 transition hover:bg-muted/40 ${card.ring}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{card.label}</span>
                  <Icon className={`w-4 h-4 ${card.className}`} />
                </div>
                {summaryLoading ? (
                  <Skeleton className="h-8 w-16 mt-2" />
                ) : (
                  <>
                    <div className={`text-2xl font-bold mt-1 ${card.className}`}>{card.count}</div>
                    <div className="text-xs text-muted-foreground mt-1">{formatCurrency(card.amount)}</div>
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <Input
            placeholder="Search mentor, bank, reference..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-72"
          />
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>

          {(search || status !== "pending") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchInput("");
                setSearch("");
                setStatus("pending");
                setPage(1);
              }}
            >
              <X className="w-3 h-3 mr-1" />
              Reset filters
            </Button>
          )}

          {status === "pending" && (
            <Badge variant="secondary" className="gap-1">
              Queue — awaiting admin action
            </Badge>
          )}
        </div>

        {error && (
          <Card className="border-destructive/40 bg-destructive/5">
            <CardContent className="py-4 flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="w-4 h-4" />
              Failed to load payouts. Check API deploy and admin auth, then refresh.
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {status === "pending"
                ? "Approval queue"
                : status === "completed"
                  ? "Completed payouts"
                  : status === "rejected"
                    ? "Rejected payouts"
                    : "All payouts"}
            </CardTitle>
            <CardDescription>
              {status === "pending"
                ? "Approve to mark the withdrawal completed, or reject to refund the mentor’s real wallet."
                : "Historical withdrawal transactions linked to mentor wallets."}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <DataTable table={table} columns={columns} isLoading={isLoading} />
            {!isLoading && rows.length === 0 && (
              <div className="py-10 text-center text-sm text-muted-foreground">
                {status === "pending"
                  ? "No pending withdrawal requests. When a mentor requests a payout, it will appear here for approval."
                  : "No payouts found for this filter."}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {page} of {totalPages} · Showing {rows.length} of {totalPayouts}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isLoading}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isLoading}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Approve confirmation */}
      <AlertDialog open={!!approvingPayout} onOpenChange={(open) => !open && setApprovingPayout(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve payout?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Confirm bank transfer of{" "}
                  <span className="font-semibold text-foreground">
                    {formatCurrency(approvingPayout?.amount ?? 0)}
                  </span>{" "}
                  to <span className="font-semibold text-foreground">{approvingPayout?.userName || "mentor"}</span>.
                </p>
                {approvingPayout?.bankDetails && (
                  <div className="rounded-md border bg-muted/40 p-3 text-xs space-y-1">
                    <div>Bank: {approvingPayout.bankDetails.bankName || "—"}</div>
                    <div>Holder: {approvingPayout.bankDetails.accountHolderName || "—"}</div>
                    <div>Account: {approvingPayout.bankDetails.accountNumber || "—"}</div>
                    <div>IFSC: {approvingPayout.bankDetails.ifscCode || "—"}</div>
                  </div>
                )}
                <p>This marks the withdrawal transaction as <strong>completed</strong>. Funds were already held from the mentor wallet when they requested payout.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={approveMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={approveMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                confirmApprove();
              }}
            >
              {approveMutation.isPending ? "Approving…" : "Approve payout"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject with reason */}
      <Dialog open={!!rejectingPayout} onOpenChange={(open) => !open && setRejectingPayout(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject payout</DialogTitle>
            <DialogDescription>
              Reject {formatCurrency(rejectingPayout?.amount ?? 0)} for{" "}
              {rejectingPayout?.userName || "mentor"}. The amount will be refunded to their real wallet.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="reject-reason">Rejection reason</Label>
            <Textarea
              id="reject-reason"
              placeholder="e.g. Incorrect bank details, verification needed…"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectingPayout(null)} disabled={rejectMutation.isPending}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={rejectMutation.isPending}
              onClick={confirmReject}
            >
              {rejectMutation.isPending ? "Rejecting…" : "Reject & refund"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details */}
      <Dialog open={!!selectedPayout} onOpenChange={(open) => !open && setSelectedPayout(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Payout details</DialogTitle>
            <DialogDescription>
              Ref {selectedPayout?.reference || selectedPayout?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedPayout && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-muted-foreground">Amount</div>
                  <div className="text-xl font-bold">{formatCurrency(selectedPayout.amount)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Status</div>
                  <Badge className="mt-1 capitalize">{selectedPayout.status}</Badge>
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Mentor</div>
                <div className="font-medium">{selectedPayout.userName || "—"}</div>
                <div className="font-mono text-xs text-muted-foreground">{selectedPayout.userId}</div>
              </div>
              <div className="rounded-md border p-3 space-y-1">
                <div className="font-medium mb-1">Bank details</div>
                <div>Bank: {selectedPayout.bankDetails?.bankName || "—"}</div>
                <div>Holder: {selectedPayout.bankDetails?.accountHolderName || "—"}</div>
                <div>Account: {selectedPayout.bankDetails?.accountNumber || selectedPayout.bankAccount || "—"}</div>
                <div>IFSC: {selectedPayout.bankDetails?.ifscCode || "—"}</div>
                <div>Type: {selectedPayout.bankDetails?.accountType || "—"}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-muted-foreground">Requested</div>
                  <div>
                    {selectedPayout.requestedAt
                      ? format(new Date(selectedPayout.requestedAt), "dd MMM yyyy, HH:mm")
                      : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Processed</div>
                  <div>
                    {selectedPayout.processedAt
                      ? format(new Date(selectedPayout.processedAt), "dd MMM yyyy, HH:mm")
                      : "—"}
                  </div>
                </div>
              </div>
              {selectedPayout.description && (
                <div>
                  <div className="text-muted-foreground">Description</div>
                  <div>{selectedPayout.description}</div>
                </div>
              )}
              {selectedPayout.rejectionReason && (
                <div className="rounded-md bg-destructive/10 p-3 text-destructive">
                  <div className="font-medium mb-1">Rejection reason</div>
                  {selectedPayout.rejectionReason}
                </div>
              )}
              {selectedPayout.status === "pending" && (
                <div className="flex gap-2 pt-2">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setSelectedPayout(null);
                      setApprovingPayout(selectedPayout);
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      setSelectedPayout(null);
                      handleReject(selectedPayout);
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
