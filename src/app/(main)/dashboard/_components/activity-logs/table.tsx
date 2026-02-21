"use client";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/data-table/data-table";
import { useActivityLogs } from "@/hooks/api/use-activity-logs";
import { useActivityLogColumns, type ActivityLog } from "./columns";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { Badge } from "@/components/ui/badge";
import { X, Download } from "lucide-react";

export default function ActivityLogsTable() {
  const [search, setSearch] = useState("");
  const [action, setAction] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);

  const params = useMemo(
    () => ({ search, action: action ?? "", status: status ?? "", page, limit }),
    [search, action, status, page, limit]
  );

  const { data, isLoading } = useActivityLogs(params);
  const columns = useActivityLogColumns();

  const apiData = data as any;
  const rows: ActivityLog[] = (apiData?.data ?? []).map((log: any) => ({
    id: log._id || log.id,
    action: log.action ?? "unknown",
    actor: log.actor ?? "System",
    actorId: log.actorId || log.adminId,
    target: log.target || "System",
    targetId: log.targetId,
    details: log.details || log.description,
    status: log.status || "success",
    timestamp: log.timestamp ?? log.createdAt,
    ipAddress: log.ipAddress,
    userAgent: log.userAgent,
  }));

  const table = useDataTableInstance<ActivityLog, any>({ data: rows, columns });

  const totalLogs = apiData?.pagination?.total || 0;
  const totalPages = Math.ceil(totalLogs / limit);

  const successCount = rows.filter((r) => r.status === "success").length;
  const failedCount = rows.filter((r) => r.status === "failed").length;
  
  // Get unique actions for filtering
  const uniqueActions = Array.from(new Set(rows.map((r) => r.action))).slice(0, 10);

  const activeFilters: { label: string; key: string; value: string }[] = [];
  if (search) activeFilters.push({ label: `Search: ${search}`, key: "search", value: search });
  if (action) activeFilters.push({ label: `Action: ${action}`, key: "action", value: action });
  if (status) activeFilters.push({ label: `Status: ${status}`, key: "status", value: status });

  const handleClearFilter = (key: string) => {
    if (key === "search") setSearch("");
    if (key === "action") setAction(undefined);
    if (key === "status") setStatus(undefined);
  };

  const handleExport = () => {
    const csv = [
      ["Action", "Actor", "Target", "Status", "Timestamp", "IP Address", "Details"].join(","),
      ...rows.map((r) =>
        [
          r.action,
          r.actor,
          r.target,
          r.status,
          r.timestamp ? new Date(r.timestamp).toISOString() : "",
          r.ipAddress || "",
          r.details || "",
        ]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity-logs-${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Actions</div>
          <div className="text-2xl font-bold">{totalLogs}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">This Page</div>
          <div className="text-2xl font-bold">{rows.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Successful</div>
          <div className="text-2xl font-bold text-green-600">{successCount}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Failed</div>
          <div className="text-2xl font-bold text-red-600">{failedCount}</div>
        </Card>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-wrap gap-3 items-center">
        <Input
          placeholder="Search by actor, target..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-64"
        />
        <Select
          onValueChange={(v) => {
            setAction(v === "all" ? undefined : v);
            setPage(1);
          }}
          value={action || "all"}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {uniqueActions.map((act) => (
              <SelectItem key={act} value={act}>
                {act.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
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
              setAction(undefined);
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
          Page {page} of {totalPages} • Showing {rows.length} of {totalLogs}
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
  );
}
