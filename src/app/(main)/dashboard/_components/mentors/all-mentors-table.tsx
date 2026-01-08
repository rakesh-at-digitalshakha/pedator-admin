"use client";

import * as React from "react";
import { Plus, Edit, Trash2, Check, X, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  useGetAllMentors,
  useCreateMentor,
  useUpdateMentor,
  useDeleteMentor,
  useApproveMentor,
  useRejectMentor,
} from "@/hooks/api";
import type { CreateMentorRequest, MentorFilters, MentorUser } from "@/types/api";
import { allMentorsColumns } from "./all-mentors-columns";

export function AllMentorsTable() {
  const [filters, setFilters] = React.useState<MentorFilters>({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    order: "desc",
  });
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [editingMentor, setEditingMentor] = React.useState<MentorUser | null>(null);
  const [searchValue, setSearchValue] = React.useState("");

  const { data: mentorsData, isLoading, error } = useGetAllMentors(filters);
  const { mutate: createMentor, isPending: isCreating } = useCreateMentor();
  const { mutate: updateMentor, isPending: isUpdating } = useUpdateMentor();
  const { mutate: deleteMentor, isPending: isDeleting } = useDeleteMentor();
  const { mutate: approveMentor, isPending: isApproving } = useApproveMentor();
  const { mutate: rejectMentor, isPending: isRejecting } = useRejectMentor();

  const mentors = mentorsData?.data ?? [];

  const handleEdit = React.useCallback((mentor: MentorUser) => {
    setEditingMentor(mentor);
    setIsEditDialogOpen(true);
  }, []);

  const handleDelete = React.useCallback((mentor: MentorUser) => {
    if (confirm(`Are you sure you want to delete ${mentor.firstName} ${mentor.lastName}?`)) {
      deleteMentor(mentor._id, {
        onSuccess: () => {
          toast.success("Mentor deleted successfully");
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "Failed to delete mentor");
        },
      });
    }
  }, [deleteMentor]);

  const handleApprove = React.useCallback((mentor: MentorUser) => {
    const isRejected = mentor.isProfileRejected;
    approveMentor(mentor._id, {
      onSuccess: () => {
        toast.success(
          `${mentor.firstName} ${mentor.lastName} has been ${isRejected ? "re-approved" : "approved"}`
        );
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to approve mentor");
      },
    });
  }, [approveMentor]);

  const [showRejectDialog, setShowRejectDialog] = React.useState(false);
  const [rejectingMentor, setRejectingMentor] = React.useState<MentorUser | null>(null);
  const [rejectionReason, setRejectionReason] = React.useState("");

  const handleReject = React.useCallback((mentor: MentorUser) => {
    setRejectingMentor(mentor);
    setRejectionReason("");
    setShowRejectDialog(true);
  }, []);

  const handleRejectConfirm = React.useCallback(() => {
    if (!rejectingMentor) return;

    rejectMentor(
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
  }, [rejectMentor, rejectingMentor, rejectionReason]);

  const columns = React.useMemo(
    () =>
      allMentorsColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
        onApprove: handleApprove,
        onReject: handleReject,
        isApproving,
        isRejecting,
      }),
    [handleEdit, handleDelete, handleApprove, handleReject, isApproving, isRejecting],
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

  const handleStatusFilterChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      status: value === "all" ? undefined : (value as "approved" | "pending" | "rejected"),
      page: 1,
    }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setFilters((prev) => ({ ...prev, limit: pageSize, page: 1 }));
  };

  const handleCreateMentor = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const mentorData: CreateMentorRequest = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      mobile: parseInt(formData.get("mobile") as string),
      password: formData.get("password") as string,
      phoneNumber: formData.get("phoneNumber") as string || undefined,
      bio: formData.get("bio") as string || undefined,
      isProfileApproved: formData.get("isProfileApproved") === "true",
    };

    createMentor(mentorData, {
      onSuccess: () => {
        toast.success("Mentor created successfully");
        setIsCreateDialogOpen(false);
        // Reset form
        (e.target as HTMLFormElement).reset();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to create mentor");
      },
    });
  };

  const handleUpdateMentor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMentor) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const updateData: Partial<MentorUser> = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      phoneNumber: formData.get("phoneNumber") as string,
      bio: formData.get("bio") as string,
      isBlocked: formData.get("isBlocked") === "true",
    };

    updateMentor(
      {
        id: editingMentor._id,
        data: updateData,
      },
      {
        onSuccess: () => {
          toast.success("Mentor updated successfully");
          setIsEditDialogOpen(false);
          setEditingMentor(null);
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "Failed to update mentor");
        },
      },
    );
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mentors</CardTitle>
          <CardDescription className="text-destructive">Failed to load mentors</CardDescription>
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
              <CardTitle>All Mentors</CardTitle>
              <CardDescription>
                {mentorsData?.total ?? 0} total mentor{(mentorsData?.total ?? 0) !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
              <Plus className="size-4" />
              Create Mentor
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
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={`${filters.sortBy || "createdAt"}-${filters.order || "desc"}`}
                onValueChange={(value) => {
                  const [sortBy, order] = value.split("-");
                  setFilters((prev) => ({
                    ...prev,
                    sortBy: sortBy as "createdAt" | "firstName" | "email",
                    order: order as "asc" | "desc",
                    page: 1,
                  }));
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
        </CardContent>
      </Card>

      {/* Create Mentor Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleCreateMentor}>
            <DialogHeader>
              <DialogTitle>Create New Mentor</DialogTitle>
              <DialogDescription>Add a new mentor to the platform</DialogDescription>
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
                <Label htmlFor="create-phoneNumber">Phone Number (Optional)</Label>
                <Input id="create-phoneNumber" name="phoneNumber" type="tel" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-bio">Bio (Optional)</Label>
                <textarea
                  id="create-bio"
                  name="bio"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  rows={4}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-isProfileApproved">Approval Status</Label>
                <Select name="isProfileApproved" defaultValue="true">
                  <SelectTrigger id="create-isProfileApproved">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Approved</SelectItem>
                    <SelectItem value="false">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "Creating..." : "Create Mentor"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setEditingMentor(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleUpdateMentor}>
            <DialogHeader>
              <DialogTitle>Edit Mentor</DialogTitle>
              <DialogDescription>Update mentor details</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    defaultValue={editingMentor?.firstName || ""}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    defaultValue={editingMentor?.lastName || ""}
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
                  defaultValue={editingMentor?.email || ""}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  defaultValue={editingMentor?.phoneNumber || editingMentor?.mobile?.toString() || ""}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bio">Bio</Label>
                <textarea
                  id="bio"
                  name="bio"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  defaultValue={editingMentor?.bio || ""}
                  rows={4}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="isBlocked">Status</Label>
                <Select name="isBlocked" defaultValue={editingMentor?.isBlocked ? "true" : "false"}>
                  <SelectTrigger id="isBlocked">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">Active</SelectItem>
                    <SelectItem value="true">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editingMentor?.isProfileRejected && editingMentor?.rejectionReason && (
                <div className="grid gap-2">
                  <Label htmlFor="rejectionReason">Rejection Reason</Label>
                  <Textarea
                    id="rejectionReason"
                    readOnly
                    value={editingMentor.rejectionReason}
                    className="bg-muted"
                    rows={3}
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? "Updating..." : "Update Mentor"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
