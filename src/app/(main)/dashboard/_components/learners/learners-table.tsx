"use client";

import * as React from "react";
import { Plus, Edit, Trash2, Search, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/data-table/data-table";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import {
  useGetAllLearners,
  useCreateLearner,
  useUpdateLearner,
  useDeleteLearner,
} from "@/hooks/api";
import type { CreateLearnerRequest, LearnerFilters, LearnerUser } from "@/types/api";
import { learnerColumns } from "./learner-columns";

export function LearnersTable() {
  const [filters, setFilters] = React.useState<LearnerFilters>({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    order: "desc",
  });
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [editingLearner, setEditingLearner] = React.useState<LearnerUser | null>(null);
  const [searchValue, setSearchValue] = React.useState("");

  const { data: learnersData, isLoading, error } = useGetAllLearners(filters);

  // Log error details for debugging
  React.useEffect(() => {
    if (error) {
      console.error("Learners fetch error:", error);
    }
  }, [error]);
  const { mutate: createLearner, isPending: isCreating } = useCreateLearner();
  const { mutate: updateLearner, isPending: isUpdating } = useUpdateLearner();
  const { mutate: deleteLearner, isPending: isDeleting } = useDeleteLearner();

  const learners = learnersData?.data ?? [];

  const handleEdit = React.useCallback((learner: LearnerUser) => {
    setEditingLearner(learner);
    setIsEditDialogOpen(true);
  }, []);

  const handleDelete = React.useCallback((learner: LearnerUser) => {
    if (confirm(`Are you sure you want to delete ${learner.firstName} ${learner.lastName}?`)) {
      deleteLearner(learner._id, {
        onSuccess: () => {
          toast.success("Learner deleted successfully");
        },
        onError: (error: any) => {
          const errorMessage = error.response?.data?.message || "Failed to delete learner";
          toast.error(errorMessage);
          
          // Show enrollment error if learner is enrolled in courses
          if (error.response?.data?.enrollmentCount) {
            toast.error(
              `Cannot delete learner. Learner is enrolled in ${error.response.data.enrollmentCount} course(s). Please remove enrollments first.`,
              { duration: 5000 }
            );
          }
        },
      });
    }
  }, [deleteLearner]);

  const columns = React.useMemo(
    () =>
      learnerColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
        isDeleting,
      }),
    [handleEdit, handleDelete, isDeleting],
  );

  const table = useDataTableInstance({
    data: learners,
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

  const handleStatusFilterChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      status: value === "all" ? undefined : (value as "active" | "blocked" | "verified" | "unverified"),
      page: 1,
    }));
  };

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

  const handleCreateLearner = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const learnerData: CreateLearnerRequest = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      mobile: formData.get("mobile") as string,
      password: formData.get("password") as string,
      isBlocked: formData.get("isBlocked") === "true",
      isVerified: formData.get("isVerified") === "true",
    };

    createLearner(learnerData, {
      onSuccess: () => {
        toast.success("Learner created successfully");
        setIsCreateDialogOpen(false);
        (e.target as HTMLFormElement).reset();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to create learner");
      },
    });
  };

  const handleUpdateLearner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLearner) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const updateData: Partial<LearnerUser> = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      mobile: parseInt(formData.get("mobile") as string),
      isBlocked: formData.get("isBlocked") === "true",
    };

    updateLearner(
      {
        id: editingLearner._id,
        data: updateData,
      },
      {
        onSuccess: () => {
          toast.success("Learner updated successfully");
          setIsEditDialogOpen(false);
          setEditingLearner(null);
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "Failed to update learner");
        },
      },
    );
  };

  if (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : (error as any)?.response?.data?.message || (error as any)?.message || "Unknown error occurred";
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>Learners</CardTitle>
          <CardDescription className="text-destructive">
            Failed to load learners: {errorMessage}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Learners</CardTitle>
              <CardDescription>
                {learnersData?.total ?? 0} total learner{(learnersData?.total ?? 0) !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
              <Plus className="size-4" />
              Create Learner
            </Button>
          </div>
        </CardHeader>
        <CardContent>
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
              <Select value={filters.status || "all"} onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                </SelectContent>
              </Select>
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
                    Showing {learners.length} of {learnersData?.total ?? 0} learners
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
                      Page {filters.page ?? 1} of {learnersData?.pages ?? 1}
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
                            page: Math.min(learnersData?.pages ?? 1, (prev.page ?? 1) + 1),
                          }))
                        }
                        disabled={(filters.page ?? 1) >= (learnersData?.pages ?? 1)}
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
        </CardContent>
      </Card>

      {/* Create Learner Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleCreateLearner}>
            <DialogHeader>
              <DialogTitle>Create New Learner</DialogTitle>
              <DialogDescription>Add a new learner to the platform</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="create-firstName">First Name *</Label>
                  <Input id="create-firstName" name="firstName" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="create-lastName">Last Name *</Label>
                  <Input id="create-lastName" name="lastName" required />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-email">Email *</Label>
                <Input id="create-email" name="email" type="email" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-mobile">Mobile Number *</Label>
                <Input id="create-mobile" name="mobile" type="tel" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-password">Password *</Label>
                <Input id="create-password" name="password" type="password" required minLength={6} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-isVerified">Verification Status</Label>
                <Select name="isVerified" defaultValue="true">
                  <SelectTrigger id="create-isVerified">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Verified</SelectItem>
                    <SelectItem value="false">Unverified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-isBlocked">Status</Label>
                <Select name="isBlocked" defaultValue="false">
                  <SelectTrigger id="create-isBlocked">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">Active</SelectItem>
                    <SelectItem value="true">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "Creating..." : "Create Learner"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Learner Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setEditingLearner(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleUpdateLearner}>
            <DialogHeader>
              <DialogTitle>Edit Learner</DialogTitle>
              <DialogDescription>Update learner details</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    defaultValue={editingLearner?.firstName || ""}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    defaultValue={editingLearner?.lastName || ""}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={editingLearner?.email || ""}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  defaultValue={editingLearner?.mobile?.toString() || ""}
                  required
                />
              </div>
              {editingLearner?.enrolledCourses && editingLearner.enrolledCourses.length > 0 && (
                <Alert>
                  <AlertCircle className="size-4" />
                  <AlertDescription>
                    This learner is enrolled in {editingLearner.enrolledCourses.length} course(s). Enrollments must be removed before deletion.
                  </AlertDescription>
                </Alert>
              )}
              <div className="grid gap-2">
                <Label htmlFor="isBlocked">Status</Label>
                <Select name="isBlocked" defaultValue={editingLearner?.isBlocked ? "true" : "false"}>
                  <SelectTrigger id="isBlocked">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">Active</SelectItem>
                    <SelectItem value="true">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? "Updating..." : "Update Learner"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}