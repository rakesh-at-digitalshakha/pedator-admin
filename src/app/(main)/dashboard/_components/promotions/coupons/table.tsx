"use client";
import { useState, useMemo } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { useCoupons, useCreateCoupon } from "@/hooks/api/use-promotions";
import { useCouponColumns, type CouponRow } from "./columns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { Plus, Filter, X } from "lucide-react";
import CreateCouponDialog from "./create-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CouponsTable() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [discountType, setDiscountType] = useState<string>("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [createOpen, setCreateOpen] = useState(false);

  const params = useMemo(
    () => ({
      search,
      ...(status && { isActive: status === "active" }),
      ...(discountType && { discountType }),
      page,
      limit,
    }),
    [search, status, discountType, page, limit]
  );

  const { data, isLoading } = useCoupons(params);
  const columns = useCouponColumns();

  const rows: CouponRow[] = ((data as any)?.data ?? []).map((c: any) => ({
    id: c._id || c.id,
    code: c.code,
    discount: c.discount ?? 0,
    discountType: c.discountType,
    maxUsage: c.maxUsage,
    usedCount: c.usedCount,
    expiresAt: c.expiresAt,
    isActive: c.isActive,
    description: c.description,
    minOrderValue: c.minOrderValue,
    maxDiscount: c.maxDiscount,
    createdAt: c.createdAt,
  }));

  const table = useDataTableInstance<CouponRow, any>({ data: rows, columns });

  const hasFilters = search || status || discountType;
  const totalCoupons = (data as any)?.total ?? rows.length;
  const activeCoupons = rows.filter((c) => c.isActive).length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Coupons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalCoupons}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{activeCoupons}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Inactive
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-muted-foreground">
              {rows.filter((c) => !c.isActive).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Input
              placeholder="Search by code or description..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-64"
            />
            
            <Select value={status || "all"} onValueChange={(v) => { setStatus(v === "all" ? "" : v); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={discountType || "all"} onValueChange={(v) => { setDiscountType(v === "all" ? "" : v); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="fixed">Fixed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={() => setCreateOpen(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            New Coupon
          </Button>
        </div>

        {/* Active Filters Display */}
        {hasFilters && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground">Filters:</span>
            {search && (
              <Badge variant="secondary" className="px-2 py-1">
                Code: {search}
                <button
                  onClick={() => setSearch("")}
                  className="ml-1 hover:text-muted-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {status && (
              <Badge variant="secondary" className="px-2 py-1">
                Status: {status}
                <button
                  onClick={() => setStatus("")}
                  className="ml-1 hover:text-muted-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {discountType && (
              <Badge variant="secondary" className="px-2 py-1">
                Type: {discountType}
                <button
                  onClick={() => setDiscountType("")}
                  className="ml-1 hover:text-muted-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setStatus("");
                setDiscountType("");
                setPage(1);
              }}
              className="h-7"
            >
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          <DataTable 
            table={table} 
            columns={columns} 
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Pagination */}
      {(data as any)?.totalPages && (data as any).totalPages > 1 && (
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm text-muted-foreground">
            Page {page} of {(data as any).totalPages} • Showing {rows.length} of {totalCoupons}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1 || isLoading}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min((data as any).totalPages, page + 1))}
              disabled={page === (data as any).totalPages || isLoading}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Create Dialog */}
      <CreateCouponDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </div>
  );
}
