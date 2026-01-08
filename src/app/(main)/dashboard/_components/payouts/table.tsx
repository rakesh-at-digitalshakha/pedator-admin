"use client";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { usePendingPayouts } from "@/hooks/api/use-payouts";
import { usePayoutColumns, type PayoutRow } from "./columns";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";

export default function PayoutsTable() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);
  const params = useMemo(() => ({ search, status: status ?? "" }), [search, status]);
  const { data, isLoading } = usePendingPayouts(params);
  const columns = usePayoutColumns();

  const apiData = data as any;
  const rows: PayoutRow[] = (apiData?.data ?? []).map((p: any) => ({
    id: p.id,
    userId: p.userId,
    amount: p.amount ?? 0,
    status: p.status ?? "pending",
    createdAt: p.createdAt ?? "",
  }));

  const table = useDataTableInstance<PayoutRow, any>({ data: rows, columns });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Search payouts"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
        <Select onValueChange={(v) => setStatus(v)} value={status}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DataTable table={table} columns={columns} />
    </div>
  );
}
