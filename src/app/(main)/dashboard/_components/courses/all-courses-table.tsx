"use client";

import * as React from "react";

import { Plus, Search, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/data-table/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetAllCourses,
  useUpdateCourse,
  useDeleteCourse,
  useGetAllCategories,
  useGetAllSubCategories,
  useGetAllMentors,
  useCreateCourse,
  useApproveCourse,
  useRejectCourse,
} from "@/hooks/api";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import type { CourseFilters, Course, CreateCourseRequest, UpdateCourseRequest } from "@/types/api";
import { allCoursesColumns } from "./all-courses-columns";
import { CourseForm, type CourseFormValues } from "./forms/course-form";

export function AllCoursesTable() {
  const [filters, setFilters] = React.useState<CourseFilters>({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    order: "desc",
  });
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [editingCourse, setEditingCourse] = React.useState<Course | null>(null);
  const [searchValue, setSearchValue] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");

  // Reject dialog state
  const [showRejectDialog, setShowRejectDialog] = React.useState(false);
  const [rejectingCourse, setRejectingCourse] = React.useState<Course | null>(null);
  const [rejectionReason, setRejectionReason] = React.useState("");

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

  const { data: coursesData, isLoading, error } = useGetAllCourses(filters);
  const { mutate: updateCourse, isPending: isUpdating } = useUpdateCourse();
  const { mutate: deleteCourse, isPending: isDeleting } = useDeleteCourse();
  const { mutate: createCourse, isPending: isCreating } = useCreateCourse();
  const { mutate: approveCourse, isPending: isApproving } = useApproveCourse();
  const { mutate: rejectCourse, isPending: isRejecting } = useRejectCourse();
  const { data: categoriesData } = useGetAllCategories();
  const { data: subCategoriesData } = useGetAllSubCategories();
  const { data: mentorsData } = useGetAllMentors({ page: 1, limit: 100 });

  const courses = coursesData?.data?.data ?? [];

  const handleEdit = React.useCallback((course: Course) => {
    setEditingCourse(course);
    setIsEditDialogOpen(true);
  }, []);

  const handleDelete = React.useCallback((course: Course) => {
    if (confirm(`Are you sure you want to delete "${course.title}"?`)) {
      deleteCourse(course._id, {
        onSuccess: () => {
          toast.success("Course deleted successfully");
        },
        onError: (error: any) => {
          const errorMessage = error.response?.data?.message ?? "Failed to delete course";
          toast.error(errorMessage);
        },
      });
    }
  }, [deleteCourse]);

  const handleStatusChange = React.useCallback((value: string) => {
    setStatusFilter(value);
    setFilters((prev) => ({
      ...prev,
      status: value === "all" ? undefined : (value as "approved" | "pending" | "rejected"),
      page: 1,
    }));
  }, []);

  const handleCategoryChange = React.useCallback((value: string) => {
    setCategoryFilter(value);
    setFilters((prev) => ({
      ...prev,
      categoryId: value === "all" ? undefined : value,
      page: 1,
    }));
  }, []);

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

  const handlePageSizeChange = React.useCallback((pageSize: number) => {
    setFilters((prev) => ({ ...prev, limit: pageSize, page: 1 }));
  }, []);

  const handleApprove = React.useCallback((course: Course) => {
    const isRejected = course.isCourseRejected;
    approveCourse(course._id, {
      onSuccess: () => {
        toast.success(`Course "${course.title}" has been ${isRejected ? "re-approved" : "approved"}`);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message ?? "Failed to approve course");
      },
    });
  }, [approveCourse]);

  const handleReject = React.useCallback((course: Course) => {
    setRejectingCourse(course);
    setRejectionReason(course.rejectionReason ?? "");
    setShowRejectDialog(true);
  }, []);

  const handleRejectConfirm = React.useCallback(() => {
    if (!rejectingCourse) return;
    
    rejectCourse(
      { courseId: rejectingCourse._id, rejectionReason },
      {
        onSuccess: () => {
          toast.success(`Course "${rejectingCourse.title}" has been rejected`);
          setShowRejectDialog(false);
          setRejectingCourse(null);
          setRejectionReason("");
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message ?? "Failed to reject course");
        },
      }
    );
  }, [rejectingCourse, rejectionReason, rejectCourse]);

  const handleSubmitEdit = React.useCallback(
    (values: Partial<CourseFormValues>) => {
      if (!editingCourse) return;

      // Transform form values to API request format
      const updateData: UpdateCourseRequest = {
        title: values.title,
        description: values.description,
        categoryId: values.categoryId,
        subCategoryId: values.subCategoryId,
        mentorId: values.mentorId,
        price: typeof values.price === "string" ? parseFloat(values.price) : values.price,
        status: values.status,
      };

      updateCourse(
        { id: editingCourse._id, data: updateData },
        {
          onSuccess: () => {
            toast.success("Course updated successfully");
            setIsEditDialogOpen(false);
            setEditingCourse(null);
          },
          onError: (error: any) => {
            toast.error(error.response?.data?.message ?? "Failed to update course");
          },
        }
      );
    },
    [editingCourse, updateCourse]
  );

  const handleSubmitCreate = React.useCallback(
    (values: CourseFormValues) => {
      if (!values.mentorId) {
        toast.error("Please select a mentor");
        return;
      }

      const courseData: CreateCourseRequest = {
        title: values.title,
        description: values.description,
        categoryId: values.categoryId,
        subCategoryId: values.subCategoryId,
        mentorId: values.mentorId,
        price: Number(values.price),
        status: values.status ?? true,
      };

      createCourse(courseData, {
        onSuccess: () => {
          toast.success("Course created successfully");
          setIsCreateDialogOpen(false);
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message ?? "Failed to create course");
        },
      });
    },
    [createCourse]
  );

  const columns = React.useMemo(
    () =>
      allCoursesColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
        onApprove: handleApprove,
        onReject: handleReject,
        isDeleting: isDeleting,
        isApproving: isApproving,
        isRejecting: isRejecting,
      }),
    [handleEdit, handleDelete, handleApprove, handleReject, isDeleting, isApproving, isRejecting]
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
          <CardDescription>Failed to load courses</CardDescription>
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-1 flex-wrap items-center gap-4">
          <div className="relative max-w-sm min-w-[200px] flex-1">
            <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
            <Input
              placeholder="Search courses..."
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
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categoriesData?.data?.map((category) => (
                <SelectItem key={category._id} value={category._id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => {
              setSearchValue("");
              setStatusFilter("all");
              setCategoryFilter("all");
              setFilters({ page: 1, limit: 10, sortBy: "createdAt", order: "desc" });
            }}
          >
            Reset Filters
          </Button>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 size-4" />
          Create Course
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <>
          <DataTable columns={columns} data={courses} isLoading={isLoading} table={table} />
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
                  Page {filters.page ?? 1} of {coursesData.data.pages ?? 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(Math.min(coursesData.data.pages ?? 1, (filters.page ?? 1) + 1))}
                  disabled={(filters.page ?? 1) >= (coursesData.data.pages ?? 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Course</DialogTitle>
            <DialogDescription>Create a new course and assign it to a mentor</DialogDescription>
          </DialogHeader>
          <CourseForm
            initialValues={{
              title: "",
              description: "",
              categoryId: "",
              subCategoryId: "",
              price: "",
              status: true,
              mentorId: "",
            }}
            categories={categoriesData?.data ?? []}
            subCategories={(subCategoriesData?.data ?? []).map((s: any) => ({
              _id: s._id,
              name: s.name,
              categoryId: s.categoryId?._id ?? s.categoryId,
            }))}
            mentors={(mentorsData?.data ?? []).filter((m: any) => m.isProfileApproved)}
            showMentorField={true}
            loading={isCreating}
            onCancel={() => setIsCreateDialogOpen(false)}
            onSubmit={handleSubmitCreate}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>Update course details</DialogDescription>
          </DialogHeader>
          {editingCourse && (
            <CourseForm
              initialValues={{
                title: editingCourse.title,
                description: editingCourse.description,
                categoryId: editingCourse.categoryId?._id || "",
                subCategoryId: editingCourse.subCategoryId?._id || "",
                price: editingCourse.price,
                status: editingCourse.status,
                mentorId: editingCourse.mentorId?._id || "",
              }}
              categories={categoriesData?.data || []}
              subCategories={(subCategoriesData?.data || []).map((s: any) => ({
                _id: s._id,
                name: s.name,
                categoryId: s.categoryId?._id || s.categoryId,
              }))}
              mentors={(mentorsData?.data || []).filter((m: any) => m.isProfileApproved)}
              showMentorField={true}
              loading={isUpdating}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setEditingCourse(null);
              }}
              onSubmit={handleSubmitEdit}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Course</DialogTitle>
            <DialogDescription>
              {rejectingCourse && `Are you sure you want to reject "${rejectingCourse.title}"?`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="rejection-reason" className="text-sm font-medium">
                Rejection Reason
              </label>
              <textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)} disabled={isRejecting}>
              Cancel
            </Button>
            <Button onClick={handleRejectConfirm} disabled={isRejecting || !rejectionReason.trim()}>
              {isRejecting ? "Rejecting..." : "Reject Course"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
