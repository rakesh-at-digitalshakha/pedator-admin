"use client";

import * as React from "react";
import { Check, X, AlertCircle, Search } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DataTable } from "@/components/data-table/data-table";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { useGetUnapprovedMentors, useApproveMentor, useRejectMentor } from "@/hooks/api";
import type { MentorFilters, MentorUser } from "@/types/api";

import { mentorColumns } from "./mentor-columns";

export function MentorsTable() {
  const [filters, setFilters] = React.useState<MentorFilters>({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    order: "desc",
  });
  const [searchValue, setSearchValue] = React.useState("");

  const { data: mentorsData, isLoading, error } = useGetUnapprovedMentors(filters);
  const { mutate: approve, isPending: isApproving } = useApproveMentor();
  const { mutate: reject, isPending: isRejecting } = useRejectMentor();

  const [showRejectDialog, setShowRejectDialog] = React.useState(false);
  const [rejectingMentor, setRejectingMentor] = React.useState<MentorUser | null>(null);
  const [rejectionReason, setRejectionReason] = React.useState("");

  const mentors = mentorsData?.data ?? [];
  
  const handleApprove = React.useCallback((mentor: MentorUser) => {
    approve(mentor._id, {
      onSuccess: () => {
        toast.success(`${mentor.firstName} ${mentor.lastName} has been approved`);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to approve mentor");
      },
    });
  }, [approve]);

  const handleRejectClick = React.useCallback((mentor: MentorUser) => {
    setRejectingMentor(mentor);
    setRejectionReason("");
    setShowRejectDialog(true);
  }, []);

  const handleRejectConfirm = React.useCallback(() => {
    if (!rejectingMentor) return;

    reject(
      { mentorId: rejectingMentor._id, rejectionReason: rejectionReason || undefined },
      {
        onSuccess: () => {
          toast.success(`${rejectingMentor.firstName} ${rejectingMentor.lastName} has been rejected`);
          setShowRejectDialog(false);
          setRejectingMentor(null);
          setRejectionReason("");
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "Failed to reject mentor");
        },
      },
    );
  }, [reject, rejectingMentor, rejectionReason]);

  const handleView = React.useCallback((mentor: MentorUser) => {
    // TODO: Implement view mentor details
    toast.info("View mentor details - Coming soon");
  }, []);

  const columns = React.useMemo(
    () =>
      mentorColumns({
        onApprove: handleApprove,
        onReject: handleRejectClick,
        onView: handleView,
        isApproving,
        isRejecting,
      }),
    [handleApprove, handleRejectClick, handleView, isApproving, isRejecting],
  );

  const table = useDataTableInstance({
    data: mentors,
    columns,
    getRowId: (row) => row._id,
  });

  // Debounced search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        search: searchValue || undefined,
        page: 1,
      }));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue]);

  const handleSortChange = (sortBy: string, order: "asc" | "desc") => {
    setFilters((prev) => ({
      ...prev,
      sortBy: sortBy as "createdAt" | "firstName" | "email",
      order,
      page: 1,
    }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setFilters((prev) => ({ ...prev, limit: pageSize, page: 1 }));
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Mentor Approvals</CardTitle>
          <CardDescription className="text-destructive">Failed to load mentors</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Mentor Approvals</CardTitle>
          <CardDescription>Loading mentors...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const pendingCount = mentorsData?.total ?? 0;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Pending Mentor Approvals</CardTitle>
              <CardDescription>
                {pendingCount} mentor{pendingCount !== 1 ? "s" : ""} awaiting approval
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {pendingCount === 0 && !isLoading ? (
            <Alert>
              <AlertCircle className="size-4" />
              <AlertDescription>
                No mentors pending approval. All mentor registration requests have been processed.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {/* Search and Filters */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    className="pl-8"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                  />
                </div>
                <Select
                  value={`${filters.sortBy || "createdAt"}-${filters.order || "desc"}`}
                  onValueChange={(value) => {
                    const [sortBy, order] = value.split("-");
                    handleSortChange(sortBy, order as "asc" | "desc");
                  }}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt-desc">Newest First</SelectItem>
                    <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                    <SelectItem value="firstName-asc">Name (A-Z)</SelectItem>
                    <SelectItem value="firstName-desc">Name (Z-A)</SelectItem>
                    <SelectItem value="email-asc">Email (A-Z)</SelectItem>
                    <SelectItem value="email-desc">Email (Z-A)</SelectItem>
                  </SelectContent>
                </Select>
                <div className="ml-auto">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFilters({ page: 1, limit: 10, sortBy: "createdAt", order: "desc" });
                      setSearchValue("");
                    }}
                  >
                    Reset Filters
                  </Button>
                </div>
              </div>

              {/* Table */}
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <>
                  <DataTable table={table} columns={columns} />
                  <div className="flex items-center justify-between px-4 py-2">
                    <div className="text-muted-foreground hidden text-sm lg:flex">
                      Showing {mentors.length} of {mentorsData?.total ?? 0} mentors
                    </div>
                    <div className="flex w-full items-center gap-8 lg:w-fit lg:ml-auto">
                      <div className="hidden items-center gap-2 lg:flex">
                        <Label htmlFor="rows-per-page" className="text-sm font-medium">
                          Rows per page
                        </Label>
                        <Select
                          value={`${filters.limit ?? 10}`}
                          onValueChange={(value) => handlePageSizeChange(Number(value))}
                        >
                          <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                            <SelectValue placeholder={filters.limit ?? 10} />
                          </SelectTrigger>
                          <SelectContent side="top">
                            {[10, 20, 30, 40, 50].map((pageSize) => (
                              <SelectItem key={pageSize} value={`${pageSize}`}>
                                {pageSize}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex w-fit items-center justify-center text-sm font-medium">
                        Page {filters.page ?? 1} of {mentorsData?.pages ?? 1}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-8"
                          onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, (prev.page ?? 1) - 1) }))}
                          disabled={(filters.page ?? 1) === 1}
                        >
                          <span className="sr-only">Previous page</span>
                          ←
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-8"
                          onClick={() =>
                            setFilters((prev) => ({
                              ...prev,
                              page: Math.min(mentorsData?.pages ?? 1, (prev.page ?? 1) + 1),
                            }))
                          }
                          disabled={(filters.page ?? 1) >= (mentorsData?.pages ?? 1)}
                        >
                          <span className="sr-only">Next page</span>
                          →
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Mentor</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject {rejectingMentor?.firstName} {rejectingMentor?.lastName}? You can provide an optional reason.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="rejectionReason">Rejection Reason (Optional)</Label>
              <Textarea
                id="rejectionReason"
                placeholder="Enter reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectingMentor(null);
                setRejectionReason("");
              }}
              disabled={isRejecting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={isRejecting}
              className="gap-2"
            >
              <X className="size-4" />
              {isRejecting ? "Rejecting..." : "Reject Mentor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
