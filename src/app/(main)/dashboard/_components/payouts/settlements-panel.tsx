"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { CheckCircle2, RefreshCw } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  usePendingSettlements,
  useSettleBooking,
  type SettlementRow,
} from "@/hooks/api/use-payouts";

export default function SettlementsPanel() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [settling, setSettling] = useState<SettlementRow | null>(null);

  const settleMutation = useSettleBooking();

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const params = useMemo(
    () => ({
      page,
      limit: 10,
      ...(search ? { search } : {}),
    }),
    [page, search],
  );

  const { data, isLoading, isFetching, refetch } = usePendingSettlements(params);
  const rows: SettlementRow[] = Array.isArray((data as any)?.data) ? (data as any).data : [];
  const pagination = (data as any)?.pagination;
  const totalPages = Math.max(1, pagination?.totalPages || 1);
  const totalMentor = rows.reduce((s, r) => s + (r.mentorEarning || 0), 0);
  const totalFee = rows.reduce((s, r) => s + (r.platformFee || 0), 0);

  const confirmSettle = async () => {
    if (!settling) return;
    await settleMutation.mutateAsync(settling.bookingId || settling.id);
    setSettling(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Class settlements</h2>
          <p className="text-sm text-muted-foreground">
            Completed classes awaiting settle. Settle moves mentor earning to{" "}
            <strong>Available</strong> and credits platform fee to the admin wallet.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Awaiting settle</div>
          <div className="text-2xl font-bold text-amber-600">{pagination?.total ?? rows.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Mentor earnings (page)</div>
          <div className="text-2xl font-bold">{formatCurrency(totalMentor)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Platform fees (page)</div>
          <div className="text-2xl font-bold text-emerald-600">{formatCurrency(totalFee)}</div>
        </Card>
      </div>

      <Input
        placeholder="Search mentor, learner, course, reference…"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        className="max-w-md"
      />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Unsettled completed classes</CardTitle>
          <CardDescription>
            After a class ends it appears here (mentor Unsettled tab). Settle to release Available balance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : rows.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No completed classes waiting for settlement.
            </p>
          ) : (
            <div className="space-y-3">
              {rows.map((row) => (
                <div
                  key={row.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">
                        {row.reference || String(row.id).slice(-8).toUpperCase()}
                      </span>
                      <Badge variant="outline">Unsettled</Badge>
                    </div>
                    <div className="font-medium">{row.courseTitle}</div>
                    <div className="text-sm text-muted-foreground">
                      Mentor: {row.mentorName} · Learner: {row.learnerName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {row.updatedAt
                        ? `Completed ${format(new Date(row.updatedAt), "dd MMM yyyy, HH:mm")}`
                        : null}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-sm">
                      Mentor{" "}
                      <span className="font-semibold">{formatCurrency(row.mentorEarning)}</span>
                    </div>
                    <div className="text-sm text-emerald-600">
                      Platform fee{" "}
                      <span className="font-semibold">{formatCurrency(row.platformFee)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Class total {formatCurrency(row.amount)}
                    </div>
                    <Button size="sm" className="mt-2" onClick={() => setSettling(row)}>
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Settle
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!settling} onOpenChange={(open) => !open && setSettling(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Settle this class?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Release{" "}
                  <span className="font-semibold text-foreground">
                    {formatCurrency(settling?.mentorEarning ?? 0)}
                  </span>{" "}
                  to <span className="font-semibold text-foreground">{settling?.mentorName}</span>{" "}
                  Available wallet, and credit{" "}
                  <span className="font-semibold text-foreground">
                    {formatCurrency(settling?.platformFee ?? 0)}
                  </span>{" "}
                  platform fee.
                </p>
                <div className="rounded-md border bg-muted/40 p-3 text-xs space-y-1">
                  <div>Course: {settling?.courseTitle}</div>
                  <div>Learner: {settling?.learnerName}</div>
                  <div>Class total: {formatCurrency(settling?.amount ?? 0)}</div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={settleMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={settleMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                confirmSettle();
              }}
            >
              {settleMutation.isPending ? "Settling…" : "Settle now"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
