"use client";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { useTickets } from "@/hooks/api/use-tickets";
import { useTicketColumns, type TicketRow } from "./columns";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";

export default function TicketsTable() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);
  const params = useMemo(() => ({ search, status: status ?? "" }), [search, status]);
  const { data, isLoading } = useTickets(params);
  const columns = useTicketColumns();

  const rows: TicketRow[] = (data?.data ?? []).map((t: any) => ({
    id: t.id,
    subject: t.subject ?? `Ticket ${t.id}`,
    category: t.category ?? "",
    status: t.status ?? "open",
    createdAt: t.createdAt ?? "",
    assignedTo: t.assignedTo ?? "",
  }));

  const table = useDataTableInstance<TicketRow, any>({ data: rows, columns });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Search tickets"
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
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DataTable table={table} columns={columns} />
    </div>
  );
}
