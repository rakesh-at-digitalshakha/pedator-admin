"use client";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/data-table/data-table";
import { useBanners } from "@/hooks/api/use-promotions";
import { useBannerColumns, type BannerRow } from "./columns";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { BannerEditDialog } from "./edit-dialog";
import { BannerCreateDialog } from "./create-dialog";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

export default function BannersTable() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [editingBanner, setEditingBanner] = useState<BannerRow | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const params = useMemo(
    () => ({ search, status: status ?? "", page, limit }),
    [search, status, page, limit]
  );

  const { data, isLoading } = useBanners(params);
  const columns = useBannerColumns();

  const apiData = data as any;
  const rows: BannerRow[] = (apiData?.data ?? []).map((b: any) => ({
    id: b._id || b.id,
    title: b.title ?? `Banner ${b._id}`,
    imageUrl: b.imageUrl ?? "",
    position: b.position ?? 0,
    startDate: b.startDate,
    endDate: b.endDate,
    isActive: b.isActive ?? false,
    clicks: b.clicks ?? 0,
    impressions: b.impressions ?? 0,
    cta: b.cta ?? "",
    createdAt: b.createdAt ?? "",
  }));

  const table = useDataTableInstance<BannerRow, any>({ data: rows, columns });

  const totalBanners = apiData?.pagination?.total || 0;
  const totalPages = Math.ceil(totalBanners / limit);
  const activeBanners = rows.filter((r) => r.isActive).length;
  const inactiveBanners = rows.filter((r) => !r.isActive).length;

  const activeFilters: { label: string; key: string; value: string }[] = [];
  if (search) activeFilters.push({ label: `Search: ${search}`, key: "search", value: search });
  if (status) activeFilters.push({ label: `Status: ${status}`, key: "status", value: status });

  const handleClearFilter = (key: string) => {
    if (key === "search") setSearch("");
    if (key === "status") setStatus(undefined);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Total Banners</div>
            <div className="text-2xl font-bold">{totalBanners}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Active</div>
            <div className="text-2xl font-bold text-green-600">{activeBanners}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Inactive</div>
            <div className="text-2xl font-bold text-red-600">{inactiveBanners}</div>
          </Card>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap gap-3 items-center">
          <Input
            placeholder="Search banners..."
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
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex-1" />

          <Button onClick={() => setCreateOpen(true)}>
            + New Banner
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
            Page {page} of {totalPages} • Showing {rows.length} of {totalBanners}
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

      {/* Dialogs */}
      <BannerEditDialog
        banner={editingBanner}
        open={!!editingBanner}
        onOpenChange={(open) => !open && setEditingBanner(null)}
      />
      <BannerCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
