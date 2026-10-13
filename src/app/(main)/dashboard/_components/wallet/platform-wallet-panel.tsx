"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { ArrowDownLeft, ArrowUpRight, RefreshCw, Wallet } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import {
  usePlatformWallet,
  usePlatformWalletSummary,
  usePlatformTransactions,
} from "@/hooks/api/use-payouts";
import { TransactionsTable } from "./transactions-table";

export function PlatformWalletPanel() {
  const [sourceType, setSourceType] = useState<string>("all");
  const [page, setPage] = useState(1);

  const { data: wallet, isLoading: walletLoading, refetch: refetchWallet } = usePlatformWallet();
  const { data: summary, refetch: refetchSummary } = usePlatformWalletSummary();
  const { data: txData, isLoading: txLoading, refetch: refetchTx } = usePlatformTransactions({
    page,
    limit: 15,
    ...(sourceType !== "all" ? { sourceType } : {}),
  });

  const transactions = txData?.transactions ?? [];
  const pagination = txData?.pagination;
  const stats = useMemo(() => {
    const list = summary?.transactionStats || [];
    const pick = (type: string) => {
      const row = list.find((s: any) => s._id === type);
      return { count: row?.count || 0, amount: row?.totalAmount || 0 };
    };
    return {
      fees: pick("platform_fee"),
      refunds: pick("refund"),
      withdrawals: pick("withdrawal"),
    };
  }, [summary]);

  const refresh = () => {
    refetchWallet();
    refetchSummary();
    refetchTx();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Platform wallet</h2>
          <p className="text-sm text-muted-foreground">
            Earnings (class settle fees) and deductions (refunds / withdrawals).
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5" /> Balance
            </CardDescription>
            <CardTitle className="text-2xl">
              {walletLoading ? <Skeleton className="h-8 w-24" /> : formatCurrency(wallet?.totalBalance ?? 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1 text-emerald-600">
              <ArrowDownLeft className="w-3.5 h-3.5" /> Fee earnings
            </CardDescription>
            <CardTitle className="text-2xl text-emerald-600">
              {formatCurrency(stats.fees.amount)}
            </CardTitle>
            <p className="text-xs text-muted-foreground">{stats.fees.count} credits</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1 text-amber-600">
              <ArrowUpRight className="w-3.5 h-3.5" /> Refunds
            </CardDescription>
            <CardTitle className="text-2xl text-amber-600">
              {formatCurrency(stats.refunds.amount)}
            </CardTitle>
            <p className="text-xs text-muted-foreground">{stats.refunds.count} debits</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Lifetime earnings</CardDescription>
            <CardTitle className="text-2xl">
              {formatCurrency(wallet?.totalEarnings ?? 0)}
            </CardTitle>
            <p className="text-xs text-muted-foreground">{wallet?.totalTransactions ?? 0} txns</p>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base">Platform ledger</CardTitle>
            <CardDescription>Credits from settles, debits from refunds</CardDescription>
          </div>
          <Select
            value={sourceType}
            onValueChange={(v) => {
              setSourceType(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="platform_fee">Fee earnings</SelectItem>
              <SelectItem value="refund">Refunds</SelectItem>
              <SelectItem value="withdrawal">Withdrawals</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {txLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No platform transactions yet.</p>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx: any) => {
                const isCredit = tx.transactionType === "credit";
                return (
                  <div
                    key={tx._id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3"
                  >
                    <div className="min-w-0">
                      <div className="font-medium truncate">{tx.description || tx.sourceType}</div>
                      <div className="text-xs text-muted-foreground">
                        {tx.createdAt ? format(new Date(tx.createdAt), "dd MMM yyyy, HH:mm") : "—"}
                        {tx.relatedMentorId?.firstName
                          ? ` · ${tx.relatedMentorId.firstName} ${tx.relatedMentorId.lastName || ""}`
                          : ""}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={isCredit ? "default" : "destructive"}>
                        {isCredit ? "Earning" : "Deduction"}
                      </Badge>
                      <span className={`font-semibold tabular-nums ${isCredit ? "text-emerald-600" : "text-red-600"}`}>
                        {isCredit ? "+" : "−"}
                        {formatCurrency(tx.amount || 0)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {pagination && (
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-muted-foreground">
                Page {pagination.page} of {pagination.pages || 1}
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
                  disabled={page >= (pagination.pages || 1)}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-2">All user transactions</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Purchases, mentor earnings, withdrawals across learners and mentors.
        </p>
        <TransactionsTable />
      </div>
    </div>
  );
}
