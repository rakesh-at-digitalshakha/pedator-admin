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
import { useGetPendingCourses, useApproveCourse, useRejectCourse } from "@/hooks/api";
import type { CourseFilters, Course } from "@/types/api";

import { courseApprovalsColumns } from "./course-approvals-columns";

export function CourseApprovalsTable() {
  const [filters, setFilters] = React.useState<CourseFilters>({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    order: "desc",
  });
  const [searchValue, setSearchValue] = React.useState("");

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

  const { data: coursesData, isLoading, error } = useGetPendingCourses(filters);
  const { mutate: approve, isPending: isApproving } = useApproveCourse();
  const { mutate: reject, isPending: isRejecting } = useRejectCourse();

  const [showRejectDialog, setShowRejectDialog] = React.useState(false);
  const [rejectingCourse, setRejectingCourse] = React.useState<Course | null>(null);
  const [rejectionReason, setRejectionReason] = React.useState("");

  const courses = coursesData?.data ?? [];

  const handleApprove = React.useCallback((course: Course) => {
    approve(course._id, {
      onSuccess: () => {
        toast.success(`Course "${course.title}" has been approved`);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to approve course");
      },
    });
  }, [approve]);

  const handleRejectClick = React.useCallback((course: Course) => {
    setRejectingCourse(course);
    setRejectionReason("");
    setShowRejectDialog(true);
  }, []);

  const handleRejectConfirm = React.useCallback(() => {
    if (!rejectingCourse) return;

    reject(
      { courseId: rejectingCourse._id, rejectionReason: rejectionReason || undefined },
      {
        onSuccess: () => {
          toast.success(`Course "${rejectingCourse.title}" has been rejected`);
          setShowRejectDialog(false);
          setRejectingCourse(null);
          setRejectionReason("");
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "Failed to reject course");
        },
      }
    );
  }, [rejectingCourse, rejectionReason, reject]);

  const handleSortChange = React.useCallback((sortBy: string, order: "asc" | "desc") => {
    setFilters((prev) => ({
      ...prev,
      sortBy: sortBy as "price" | "createdAt" | "averageRating",
      order,
      page: 1,
    }));
  }, []);

  const handlePageChange = React.useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const columns = React.useMemo(
    () =>
      courseApprovalsColumns({
        onApprove: handleApprove,
        onReject: handleRejectClick,
        isApproving: isApproving,
        isRejecting: isRejecting,
      }),
    [handleApprove, handleRejectClick, isApproving, isRejecting]
  );

  // Create table instance at top level to follow Rules of Hooks
  const table = useDataTableInstance({
    data: courses,
    columns,
    getRowId: (row) => row._id,
    enableRowSelection: false,
  });

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>Failed to load pending courses</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error ? error.message : "An unknown error occurred"}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setSearchValue("");
            setFilters({ page: 1, limit: 10, sortBy: "createdAt", order: "desc" });
          }}
        >
          Reset Filters
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : courses.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Pending Courses</CardTitle>
            <CardDescription>There are no courses awaiting approval at this time.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          <DataTable 
            columns={columns} 
            data={courses} 
            isLoading={isLoading}
            table={table}
          />
          {coursesData?.data && coursesData.data.pages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-muted-foreground text-sm">
                Showing {((filters.page ?? 1) - 1) * (filters.limit ?? 10) + 1} to{" "}
                {Math.min((filters.page ?? 1) * (filters.limit ?? 10), coursesData.data.total ?? 0)} of{" "}
                {coursesData.data.total ?? 0} courses
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
                  Page {filters.page ?? 1} of {coursesData?.data?.pages ?? 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(Math.min(coursesData?.data?.pages ?? 1, (filters.page ?? 1) + 1))}
                  disabled={(filters.page ?? 1) >= (coursesData?.data?.pages ?? 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Course</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting {rejectingCourse?.title}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">Rejection Reason</Label>
              <Textarea
                id="rejectionReason"
                placeholder="Enter rejection reason..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)} disabled={isRejecting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRejectConfirm} disabled={!rejectionReason.trim() || isRejecting}>
              {isRejecting ? "Rejecting..." : "Reject Course"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
