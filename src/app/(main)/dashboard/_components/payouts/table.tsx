"use client";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/data-table/data-table";
import { usePendingPayouts } from "@/hooks/api/use-payouts";
import { usePayoutColumns, type PayoutRow } from "./columns";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { Badge } from "@/components/ui/badge";
import { X, Download, DollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";

export default function PayoutsTable() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedPayout, setSelectedPayout] = useState<PayoutRow | null>(null);

  const params = useMemo(
    () => ({ search, status: status ?? "", page, limit }),
    [search, status, page, limit]
  );

  const { data, isLoading } = usePendingPayouts(params);
  const columns = usePayoutColumns((payout) => setSelectedPayout(payout));

  const apiData = data as any;
  const rows: PayoutRow[] = (apiData?.data ?? []).map((p: any) => ({
    id: p._id || p.id,
    userId: p.userId,
    userName: p.userName || p.mentorName || p.name,
    amount: p.amount ?? 0,
    status: p.status ?? "pending",
    bankAccount: p.bankAccount,
    requestedAt: p.requestedAt ?? p.createdAt,
    processedAt: p.processedAt,
    rejectionReason: p.rejectionReason,
    reference: p.reference || p.transactionId,
  }));

  const table = useDataTableInstance<PayoutRow, any>({ data: rows, columns });

  const totalPayouts = apiData?.pagination?.total || 0;
  const totalPages = Math.ceil(totalPayouts / limit);

  const pendingCount = rows.filter((r) => r.status === "pending").length;
  const approvedCount = rows.filter((r) => r.status === "approved").length;
  const rejectedCount = rows.filter((r) => r.status === "rejected").length;
  const completedCount = rows.filter((r) => r.status === "completed").length;

  const totalPendingAmount = rows
    .filter((r) => r.status === "pending")
    .reduce((sum, r) => sum + r.amount, 0);
  const totalApprovedAmount = rows
    .filter((r) => r.status === "approved")
    .reduce((sum, r) => sum + r.amount, 0);

  const activeFilters: { label: string; key: string; value: string }[] = [];
  if (search) activeFilters.push({ label: `Search: ${search}`, key: "search", value: search });
  if (status) activeFilters.push({ label: `Status: ${status}`, key: "status", value: status });

  const handleClearFilter = (key: string) => {
    if (key === "search") setSearch("");
    if (key === "status") setStatus(undefined);
  };

  const handleExport = () => {
    const csv = [
      ["ID", "User", "Amount", "Status", "Bank Account", "Requested At"].join(","),
      ...rows.map((r) =>
        [
          r.id,
          r.userName || r.userId,
          r.amount.toFixed(2),
          r.status,
          r.bankAccount || "",
          r.requestedAt ? new Date(r.requestedAt).toISOString() : "",
        ]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payouts-${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Pending</div>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {formatCurrency(totalPendingAmount)}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Approved</div>
            <div className="text-2xl font-bold text-blue-600">{approvedCount}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {formatCurrency(totalApprovedAmount)}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Completed</div>
            <div className="text-2xl font-bold text-green-600">{completedCount}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Rejected</div>
            <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
          </Card>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap gap-3 items-center">
          <Input
            placeholder="Search by user, reference..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-64"
          />
          <Select
            onValueChange={(v) => {
              setStatus(v === "all" ? undefined : v);
              setPage(1);
            }}
            value={status || "all"}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex-1" />

          <Button variant="outline" onClick={handleExport} disabled={rows.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter) => (
              <Badge key={filter.key} variant="secondary" className="gap-1">
                {filter.label}
                <button onClick={() => handleClearFilter(filter.key)}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setStatus(undefined);
              }}
            >
              Clear all
            </Button>
          </div>
        )}

        {/* Table */}
        <Card>
          <DataTable
            table={table}
            columns={columns}
            isLoading={isLoading}
          />
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {page} of {totalPages} • Showing {rows.length} of {totalPayouts}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isLoading}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Payout Details Modal */}
      <Dialog open={!!selectedPayout} onOpenChange={(open) => !open && setSelectedPayout(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payout Details</DialogTitle>
            <DialogDescription>
              #{selectedPayout?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedPayout && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Amount</div>
                  <div className="text-2xl font-bold flex items-center gap-1">
                    <DollarSign className="w-5 h-5" />
                    {selectedPayout.amount.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <Badge>{selectedPayout.status}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">User</div>
                  <div className="font-medium">{selectedPayout.userName || selectedPayout.userId}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Bank Account</div>
                  <div className="font-mono text-sm">{selectedPayout.bankAccount || "N/A"}</div>
                </div>
              </div>
              {selectedPayout.rejectionReason && (
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Rejection Reason</div>
                  <div className="bg-destructive/10 p-3 rounded text-destructive">
                    {selectedPayout.rejectionReason}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
