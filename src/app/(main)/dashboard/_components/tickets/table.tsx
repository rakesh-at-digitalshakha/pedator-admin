"use client";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/data-table/data-table";
import { useTickets } from "@/hooks/api/use-tickets";
import { useTicketColumns, type TicketRow } from "./columns";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function TicketsTable() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [priority, setPriority] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedTicket, setSelectedTicket] = useState<TicketRow | null>(null);

  const params = useMemo(
    () => ({ search, status: status ?? "", priority: priority ?? "", page, limit }),
    [search, status, priority, page, limit]
  );

  const { data, isLoading } = useTickets(params);
  const columns = useTicketColumns((ticket) => setSelectedTicket(ticket));

  const apiData = data as any;
  const rows: TicketRow[] = (apiData?.data ?? []).map((t: any) => ({
    id: t._id || t.id,
    subject: t.subject ?? `Ticket ${t._id}`,
    category: t.category ?? "",
    status: t.status ?? "open",
    priority: t.priority ?? "medium",
    createdAt: t.createdAt ?? "",
    updatedAt: t.updatedAt ?? "",
    assignedTo: t.assignedTo ?? "",
    userId: t.userId ?? "",
    description: t.description ?? "",
  }));

  const table = useDataTableInstance<TicketRow, any>({ data: rows, columns });

  const totalTickets = apiData?.pagination?.total || 0;
  const totalPages = Math.ceil(totalTickets / limit);
  const openTickets = rows.filter((r) => r.status === "open").length;
  const assignedTickets = rows.filter((r) => r.status === "assigned").length;
  const resolvedTickets = rows.filter((r) => r.status === "resolved").length;

  const activeFilters: { label: string; key: string; value: string }[] = [];
  if (search) activeFilters.push({ label: `Search: ${search}`, key: "search", value: search });
  if (status) activeFilters.push({ label: `Status: ${status}`, key: "status", value: status });
  if (priority) activeFilters.push({ label: `Priority: ${priority}`, key: "priority", value: priority });

  const handleClearFilter = (key: string) => {
    if (key === "search") setSearch("");
    if (key === "status") setStatus(undefined);
    if (key === "priority") setPriority(undefined);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Total Tickets</div>
            <div className="text-2xl font-bold">{totalTickets}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Open</div>
            <div className="text-2xl font-bold text-blue-600">{openTickets}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Assigned</div>
            <div className="text-2xl font-bold text-yellow-600">{assignedTickets}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Resolved</div>
            <div className="text-2xl font-bold text-green-600">{resolvedTickets}</div>
          </Card>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap gap-3 items-center">
          <Input
            placeholder="Search by subject..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-64"
          />
          <Select
            onValueChange={(v) => {
              setStatus(v || undefined);
              setPage(1);
            }}
            value={status || ""}
          >
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
          <Select
            onValueChange={(v) => {
              setPriority(v || undefined);
              setPage(1);
            }}
            value={priority || ""}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
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
                setPriority(undefined);
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
            Page {page} of {totalPages} • Showing {rows.length} of {totalTickets}
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

      {/* Ticket Details Modal */}
      <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ticket Details</DialogTitle>
            <DialogDescription>
              {selectedTicket?.subject}
            </DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">ID</div>
                  <div className="font-medium">#{selectedTicket.id}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <Badge>{selectedTicket.status}</Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Priority</div>
                  <Badge>{selectedTicket.priority}</Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Category</div>
                  <div className="font-medium">{selectedTicket.category || "General"}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Assigned To</div>
                  <div className="font-medium">{selectedTicket.assignedTo || "Unassigned"}</div>
                </div>
              </div>
              {selectedTicket.description && (
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Description</div>
                  <div className="bg-muted p-3 rounded">{selectedTicket.description}</div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
