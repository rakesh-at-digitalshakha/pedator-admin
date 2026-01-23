"use client";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { useDisputes } from "@/hooks/api/use-disputes";
import { useDisputeColumns, type Dispute } from "./columns";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";

export default function DisputesTable() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);
  const params = useMemo(() => ({ search, status: status ?? "" }), [search, status]);
  const { data, isLoading } = useDisputes(params);
  const columns = useDisputeColumns();

  const apiData = data as any;
  const rows: Dispute[] = (apiData?.data ?? []).map((d: any) => ({
    id: d.id,
    title: d.title ?? `Dispute ${d.id}`,
    category: d.category ?? "",
    status: d.status ?? "pending",
    createdAt: d.createdAt ?? "",
    learnerId: d.learnerId,
    mentorId: d.mentorId,
  }));

  const table = useDataTableInstance<Dispute, any>({ data: rows, columns });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Search disputes"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
        <Select onValueChange={(v) => setStatus(v === "all" ? undefined : v)} value={status || "all"}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="investigating">Investigating</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* Server-side pagination: extend params with page/limit if backend supports */}
      <DataTable table={table} columns={columns} />
    </div>
  );
}
