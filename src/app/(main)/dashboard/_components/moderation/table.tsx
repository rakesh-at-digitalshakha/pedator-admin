"use client";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/data-table/data-table";
import { useFlaggedContent } from "@/hooks/api/use-moderation";
import { useModerationColumns, type FlaggedContent } from "./columns";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function ModerationTable() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [severity, setSeverity] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [reviewingContent, setReviewingContent] = useState<FlaggedContent | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  const params = useMemo(
    () => ({ search, status: status ?? "", severity: severity ?? "", page, limit }),
    [search, status, severity, page, limit]
  );

  const { data, isLoading } = useFlaggedContent(params);
  const columns = useModerationColumns((content) => setReviewingContent(content));

  const apiData = data as any;
  const rows: FlaggedContent[] = (apiData?.data ?? []).map((c: any) => ({
    id: c._id || c.id,
    title: c.title ?? `Content ${c._id}`,
    userId: c.userId,
    reason: c.reason ?? "",
    status: c.status ?? "flagged",
    severity: c.severity ?? "medium",
    contentType: c.contentType ?? "unknown",
    createdAt: c.createdAt ?? "",
    reviewedAt: c.reviewedAt,
    reviewedBy: c.reviewedBy,
  }));

  const table = useDataTableInstance<FlaggedContent, any>({ data: rows, columns });

  const totalFlagged = apiData?.pagination?.total || 0;
  const totalPages = Math.ceil(totalFlagged / limit);
  const flaggedCount = rows.filter((r) => r.status === "flagged").length;
  const reviewedCount = rows.filter((r) => r.status === "reviewed").length;
  const rejectedCount = rows.filter((r) => r.status === "rejected").length;

  const activeFilters: { label: string; key: string; value: string }[] = [];
  if (search) activeFilters.push({ label: `Search: ${search}`, key: "search", value: search });
  if (status) activeFilters.push({ label: `Status: ${status}`, key: "status", value: status });
  if (severity) activeFilters.push({ label: `Severity: ${severity}`, key: "severity", value: severity });

  const handleClearFilter = (key: string) => {
    if (key === "search") setSearch("");
    if (key === "status") setStatus(undefined);
    if (key === "severity") setSeverity(undefined);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Total Flagged</div>
            <div className="text-2xl font-bold">{totalFlagged}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Pending Review</div>
            <div className="text-2xl font-bold text-blue-600">{flaggedCount}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Reviewed</div>
            <div className="text-2xl font-bold text-yellow-600">{reviewedCount}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Rejected</div>
            <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
          </Card>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap gap-3 items-center">
          <Input
            placeholder="Search content"
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
              <SelectItem value="flagged">Flagged</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select
            onValueChange={(v) => {
              setSeverity(v || undefined);
              setPage(1);
            }}
            value={severity || ""}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
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
                setSeverity(undefined);
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
            Page {page} of {totalPages} • Showing {rows.length} of {totalFlagged}
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

      {/* Review Content Modal */}
      <Dialog open={!!reviewingContent} onOpenChange={(open) => !open && (setReviewingContent(null), setReviewNotes(""))}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Flagged Content</DialogTitle>
            <DialogDescription>
              {reviewingContent?.title}
            </DialogDescription>
          </DialogHeader>
          {reviewingContent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Content ID</div>
                  <div className="font-medium">#{reviewingContent.id}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">User ID</div>
                  <div className="font-medium">{reviewingContent.userId}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Type</div>
                  <Badge>{reviewingContent.contentType}</Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Severity</div>
                  <Badge variant="destructive">{reviewingContent.severity}</Badge>
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-2">Flagged Reason</div>
                <div className="bg-muted p-3 rounded">{reviewingContent.reason}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-2">Review Notes</div>
                <Textarea
                  placeholder="Add your review notes..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => (setReviewingContent(null), setReviewNotes(""))}>
                  Cancel
                </Button>
                <Button variant="default">Approve</Button>
                <Button variant="destructive">Reject</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
