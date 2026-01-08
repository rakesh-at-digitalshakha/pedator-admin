"use client";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { useFlaggedContent } from "@/hooks/api/use-moderation";
import { useModerationColumns, type FlaggedContent } from "./columns";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";

export default function ModerationTable() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);
  const params = useMemo(() => ({ search, status: status ?? "" }), [search, status]);
  const { data, isLoading } = useFlaggedContent(params);
  const columns = useModerationColumns();

  const apiData = data as any;
  const rows: FlaggedContent[] = (apiData?.data ?? []).map((c: any) => ({
    id: c.id,
    title: c.title ?? `Content ${c.id}`,
    userId: c.userId,
    reason: c.reason ?? "",
    status: c.status ?? "flagged",
    createdAt: c.createdAt ?? "",
  }));

  const table = useDataTableInstance<FlaggedContent, any>({ data: rows, columns });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Search content"
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
            <SelectItem value="flagged">Flagged</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DataTable table={table} columns={columns} />
    </div>
  );
}
