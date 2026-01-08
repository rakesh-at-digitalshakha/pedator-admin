"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";

import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetPlatformReviews, useUpdatePlatformReviewStatus, useDeletePlatformReview } from "@/hooks/api";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import type { ReviewFilters } from "@/types/api";

import { platformReviewColumns } from "./platform-review-columns";

export function PlatformReviewsTable() {
  const [filters, setFilters] = React.useState<ReviewFilters>({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    order: "desc",
  });
  const [searchValue, setSearchValue] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [userModelFilter, setUserModelFilter] = React.useState<string>("all");

  // Debounced search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        search: searchValue || undefined,
        page: 1,
      }));
    }, 500);

    return () => clearTimeout(timer);
  }, [searchValue]);

  const { data: reviewsData, isLoading, error } = useGetPlatformReviews(filters);
  const updateStatusMutation = useUpdatePlatformReviewStatus();
  const deleteMutation = useDeletePlatformReview();

  const reviews = reviewsData?.data ?? [];

  const handleApprove = async (id: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id, data: { status: true } });
      toast.success("Review approved successfully");
    } catch (error) {
      toast.error("Failed to approve review");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id, data: { status: false } });
      toast.success("Review status updated successfully");
    } catch (error) {
      toast.error("Failed to update review status");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this review?")) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success("Review deleted successfully");
      } catch (error) {
        toast.error("Failed to delete review");
      }
    }
  };

  const handleStatusChange = React.useCallback((value: string) => {
    setStatusFilter(value);
    setFilters((prev) => ({
      ...prev,
      status: value === "all" ? undefined : (value === "approved" ? true : false),
      page: 1,
    }));
  }, []);

  const handleUserModelChange = React.useCallback((value: string) => {
    setUserModelFilter(value);
    setFilters((prev) => ({
      ...prev,
      userModel: value === "all" ? undefined : (value as "learners" | "mentors"),
      page: 1,
    }));
  }, []);

  const handleSortChange = React.useCallback((sortBy: string, order: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: sortBy as ReviewFilters["sortBy"],
      order: order as "asc" | "desc",
    }));
  }, []);

  const handlePageChange = React.useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const handlePageSizeChange = React.useCallback((pageSize: number) => {
    setFilters((prev) => ({ ...prev, limit: pageSize, page: 1 }));
  }, []);

  const resetFilters = React.useCallback(() => {
    setSearchValue("");
    setStatusFilter("all");
    setUserModelFilter("all");
    setFilters({
      page: 1,
      limit: 10,
      sortBy: "createdAt",
      order: "desc",
    });
  }, []);

  const columns = platformReviewColumns(handleApprove, handleReject, handleDelete);

  const table = useDataTableInstance({
    data: reviews,
    columns,
    getRowId: (row) => row._id,
    enableRowSelection: false,
  });

  if (error) {
    return (
      <div className="text-destructive">
        {error instanceof Error ? error.message : "An unknown error occurred"}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reviews..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
          </SelectContent>
        </Select>
        <Select value={userModelFilter} onValueChange={handleUserModelChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by user type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="learners">Learners</SelectItem>
            <SelectItem value="mentors">Mentors</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={`${filters.sortBy || "createdAt"}-${filters.order || "desc"}`}
          onValueChange={(value) => {
            const [sortBy, order] = value.split("-");
            handleSortChange(sortBy, order);
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt-desc">Date (Newest)</SelectItem>
            <SelectItem value="createdAt-asc">Date (Oldest)</SelectItem>
            <SelectItem value="rating-desc">Rating (High to Low)</SelectItem>
            <SelectItem value="rating-asc">Rating (Low to High)</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={resetFilters}>
          Reset Filters
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <>
          <DataTable table={table} columns={columns} isLoading={isLoading} />
          {reviewsData && reviewsData.pages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-muted-foreground text-sm">
                Showing {((filters.page ?? 1) - 1) * (filters.limit ?? 10) + 1} to{" "}
                {Math.min((filters.page ?? 1) * (filters.limit ?? 10), reviewsData.total ?? 0)} of{" "}
                {reviewsData.total ?? 0} reviews
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(Math.max(1, (filters.page ?? 1) - 1))}
                  disabled={(filters.page ?? 1) <= 1}
                >
                  Previous
                </Button>
                <span className="text-muted-foreground text-sm">
                  Page {filters.page ?? 1} of {reviewsData.pages ?? 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(Math.min(reviewsData.pages ?? 1, (filters.page ?? 1) + 1))}
                  disabled={(filters.page ?? 1) >= (reviewsData.pages ?? 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
