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
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { CloudinaryImageUpload } from "@/components/ui/cloudinary-image-upload";
import { CloudinaryDocUpload } from "@/components/ui/cloudinary-doc-upload";
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

    const rawDocuments = formData.get("documents") as string;
    let documentsArr: string[] | undefined;
    if (rawDocuments) {
      try { documentsArr = JSON.parse(rawDocuments); } catch { documentsArr = [rawDocuments]; }
    }

    const learnerData: CreateLearnerRequest = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      fullName: (formData.get("fullName") as string) || undefined,
      username: (formData.get("username") as string) || undefined,
      email: formData.get("email") as string,
      mobile: formData.get("mobile") as string,
      password: formData.get("password") as string,
      dob: (formData.get("dob") as string) || undefined,
      occupation: (formData.get("occupation") as string) || undefined,
      description: (formData.get("description") as string) || undefined,
      aboutUser: (formData.get("aboutUser") as string) || undefined,
      profileImage: (formData.get("profileImage") as string) || undefined,
      idCard: (formData.get("idCard") as string) || undefined,
      documents: documentsArr,
      isBlocked: formData.get("isBlocked") === "true",
      isVerified: formData.get("isVerified") === "true",
      isEmailVerified: formData.get("isEmailVerified") === "true",
      isMobileVerified: formData.get("isMobileVerified") === "true",
      isInitialProfileCompleted: formData.get("isInitialProfileCompleted") === "true",
      isLandingProfileInfoCompleted: formData.get("isLandingProfileInfoCompleted") === "true",
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

    const rawDocuments = formData.get("documents") as string;
    let documentsArr: string[] | undefined;
    if (rawDocuments) {
      try { documentsArr = JSON.parse(rawDocuments); } catch { documentsArr = [rawDocuments]; }
    }

    const updateData: Partial<LearnerUser> = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      fullName: (formData.get("fullName") as string) || undefined,
      username: (formData.get("username") as string) || undefined,
      email: formData.get("email") as string,
      mobile: parseInt(formData.get("mobile") as string),
      dob: (formData.get("dob") as string) || undefined,
      occupation: (formData.get("occupation") as string) || undefined,
      description: (formData.get("description") as string) || undefined,
      aboutUser: (formData.get("aboutUser") as string) || undefined,
      profileImage: (formData.get("profileImage") as string) || undefined,
      idCard: (formData.get("idCard") as string) || undefined,
      documents: documentsArr,
      isBlocked: formData.get("isBlocked") === "true",
      isEmailVerified: formData.get("isEmailVerified") === "true",
      isMobileVerified: formData.get("isMobileVerified") === "true",
      isInitialProfileCompleted: formData.get("isInitialProfileCompleted") === "true",
      isLandingProfileInfoCompleted: formData.get("isLandingProfileInfoCompleted") === "true",
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
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Failed to load learners: {errorMessage}</span>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
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
            <div className="grid gap-6 py-4">

              {/* Basic Information */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Basic Information</h3>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="c-firstName">First Name *</Label>
                    <Input id="c-firstName" name="firstName" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="c-lastName">Last Name *</Label>
                    <Input id="c-lastName" name="lastName" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="c-fullName">Full Name</Label>
                    <Input id="c-fullName" name="fullName" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="c-username">Username</Label>
                    <Input id="c-username" name="username" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="c-email">Email *</Label>
                  <Input id="c-email" name="email" type="email" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="c-mobile">Mobile Number *</Label>
                    <Input id="c-mobile" name="mobile" type="tel" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="c-password">Password *</Label>
                    <Input id="c-password" name="password" type="password" required minLength={6} />
                  </div>
                </div>
              </div>

              {/* Media */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Profile Image</h3>
                <Separator />
                <div className="grid gap-2">
                  <Label>Profile Image</Label>
                  <CloudinaryImageUpload name="profileImage" folder="learners/profile" />
                </div>
              </div>

              {/* Personal Details */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Personal Details</h3>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="c-dob">Date of Birth</Label>
                    <Input id="c-dob" name="dob" type="date" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="c-occupation">Occupation</Label>
                    <Input id="c-occupation" name="occupation" placeholder="e.g. Student, Engineer" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="c-description">Description</Label>
                  <Textarea id="c-description" name="description" rows={2} placeholder="Short description" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="c-aboutUser">About User</Label>
                  <Textarea id="c-aboutUser" name="aboutUser" rows={3} placeholder="Detailed bio" />
                </div>
              </div>

              {/* ID & Documents */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">ID &amp; Documents</h3>
                <Separator />
                <div className="grid gap-2">
                  <Label>ID Card</Label>
                  <CloudinaryImageUpload name="idCard" folder="learners/id" />
                </div>
                <div className="grid gap-2">
                  <Label>Documents</Label>
                  <CloudinaryDocUpload name="documents" multiple />
                </div>
              </div>

              {/* Status & Verification */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Status &amp; Verification</h3>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Account Status</Label>
                    <Select name="isBlocked" defaultValue="false">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="false">Active</SelectItem>
                        <SelectItem value="true">Blocked</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Verified</Label>
                    <Select name="isVerified" defaultValue="false">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Verified</SelectItem>
                        <SelectItem value="false">Unverified</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Email Verified</Label>
                    <Select name="isEmailVerified" defaultValue="false">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Mobile Verified</Label>
                    <Select name="isMobileVerified" defaultValue="false">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Initial Profile Completed</Label>
                    <Select name="isInitialProfileCompleted" defaultValue="false">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Landing Profile Completed</Label>
                    <Select name="isLandingProfileInfoCompleted" defaultValue="false">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
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
          <form key={editingLearner?._id} onSubmit={handleUpdateLearner}>
            <DialogHeader>
              <DialogTitle>Edit Learner</DialogTitle>
              <DialogDescription>Update learner details</DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">

              {/* Basic Information */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Basic Information</h3>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="e-firstName">First Name</Label>
                    <Input id="e-firstName" name="firstName" defaultValue={editingLearner?.firstName || ""} required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="e-lastName">Last Name</Label>
                    <Input id="e-lastName" name="lastName" defaultValue={editingLearner?.lastName || ""} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="e-fullName">Full Name</Label>
                    <Input id="e-fullName" name="fullName" defaultValue={editingLearner?.fullName || ""} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="e-username">Username</Label>
                    <Input id="e-username" name="username" defaultValue={editingLearner?.username || ""} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="e-email">Email</Label>
                  <Input id="e-email" name="email" type="email" defaultValue={editingLearner?.email || ""} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="e-mobile">Mobile Number</Label>
                  <Input id="e-mobile" name="mobile" type="tel" defaultValue={editingLearner?.mobile?.toString() || ""} required />
                </div>
              </div>

              {/* Media */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Profile Image</h3>
                <Separator />
                <div className="grid gap-2">
                  <Label>Profile Image</Label>
                  <CloudinaryImageUpload name="profileImage" folder="learners/profile" defaultValue={editingLearner?.profileImage} />
                </div>
              </div>

              {/* Personal Details */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Personal Details</h3>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="e-dob">Date of Birth</Label>
                    <Input id="e-dob" name="dob" type="date" defaultValue={editingLearner?.dob ? editingLearner.dob.slice(0, 10) : ""} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="e-occupation">Occupation</Label>
                    <Input id="e-occupation" name="occupation" defaultValue={editingLearner?.occupation || ""} placeholder="e.g. Student, Engineer" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="e-description">Description</Label>
                  <Textarea id="e-description" name="description" rows={2} defaultValue={editingLearner?.description || ""} placeholder="Short description" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="e-aboutUser">About User</Label>
                  <Textarea id="e-aboutUser" name="aboutUser" rows={3} defaultValue={editingLearner?.aboutUser || ""} placeholder="Detailed bio" />
                </div>
              </div>

              {/* Wallet (read-only) */}
              {(editingLearner?.realWallet !== undefined || editingLearner?.virtualWallet !== undefined) && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Wallet</h3>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Real Wallet</Label>
                      <Input value={editingLearner?.realWallet ?? 0} readOnly className="bg-muted" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Virtual Wallet</Label>
                      <Input value={editingLearner?.virtualWallet ?? 0} readOnly className="bg-muted" />
                    </div>
                  </div>
                </div>
              )}

              {/* Enrolled Courses warning */}
              {editingLearner?.enrolledCourses && editingLearner.enrolledCourses.length > 0 && (
                <Alert>
                  <AlertCircle className="size-4" />
                  <AlertDescription>
                    This learner is enrolled in {editingLearner.enrolledCourses.length} course(s). Enrollments must be removed before deletion.
                  </AlertDescription>
                </Alert>
              )}

              {/* ID & Documents */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">ID &amp; Documents</h3>
                <Separator />
                <div className="grid gap-2">
                  <Label>ID Card</Label>
                  <CloudinaryImageUpload name="idCard" folder="learners/id" defaultValue={editingLearner?.idCard} />
                </div>
                <div className="grid gap-2">
                  <Label>Documents</Label>
                  <CloudinaryDocUpload
                    name="documents"
                    multiple
                    defaultValue={editingLearner?.documents}
                  />
                </div>
              </div>

              {/* Status & Verification */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Status &amp; Verification</h3>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Account Status</Label>
                    <Select name="isBlocked" defaultValue={editingLearner?.isBlocked ? "true" : "false"}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="false">Active</SelectItem>
                        <SelectItem value="true">Blocked</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Email Verified</Label>
                    <Select name="isEmailVerified" defaultValue={editingLearner?.isEmailVerified ? "true" : "false"}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Mobile Verified</Label>
                    <Select name="isMobileVerified" defaultValue={editingLearner?.isMobileVerified ? "true" : "false"}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Initial Profile Completed</Label>
                    <Select name="isInitialProfileCompleted" defaultValue={editingLearner?.isInitialProfileCompleted ? "true" : "false"}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Landing Profile Completed</Label>
                    <Select name="isLandingProfileInfoCompleted" defaultValue={editingLearner?.isLandingProfileInfoCompleted ? "true" : "false"}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
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