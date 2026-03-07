"use client";

import * as React from "react";
import { Plus, Edit, Trash2, Check, X, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/data-table/data-table";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { CloudinaryImageUpload } from "@/components/ui/cloudinary-image-upload";
import { CloudinaryVideoUpload } from "@/components/ui/cloudinary-video-upload";
import { CloudinaryDocUpload } from "@/components/ui/cloudinary-doc-upload";
import {
  useGetAllMentors,
  useCreateMentor,
  useUpdateMentor,
  useDeleteMentor,
  useApproveMentor,
  useRejectMentor,
  useGetCountries,
  useGetCities,
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
  const [selectedCreateCountryId, setSelectedCreateCountryId] = React.useState<string>("");
  const [selectedEditCountryId, setSelectedEditCountryId] = React.useState<string>("");

  const { data: countries = [], isLoading: countriesLoading } = useGetCountries();
  const { data: createCities = [] } = useGetCities(selectedCreateCountryId || undefined);
  const { data: editCities = [] } = useGetCities(selectedEditCountryId || undefined);

  // Sync edit-form country when a mentor is loaded for editing
  React.useEffect(() => {
    setSelectedEditCountryId(editingMentor?.country ?? "");
  }, [editingMentor?._id]);

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

  const handleDeactivate = React.useCallback((mentor: MentorUser) => {
    const action = mentor.isDeactivated ? "reactivate" : "deactivate";
    if (confirm(`Are you sure you want to ${action} ${mentor.firstName} ${mentor.lastName}?`)) {
      updateMentor(
        {
          id: mentor._id,
          data: { isDeactivated: !mentor.isDeactivated },
        },
        {
          onSuccess: () => {
            toast.success(
              `${mentor.firstName} ${mentor.lastName} has been ${action}d successfully`
            );
          },
          onError: (error: any) => {
            toast.error(error.response?.data?.message || `Failed to ${action} mentor`);
          },
        }
      );
    }
  }, [updateMentor]);

  const columns = React.useMemo(
    () =>
      allMentorsColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
        onApprove: handleApprove,
        onReject: handleReject,
        onDeactivate: handleDeactivate,
        isApproving,
        isRejecting,
      }),
    [handleEdit, handleDelete, handleApprove, handleReject, handleDeactivate, isApproving, isRejecting],
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
    const ocupationsRaw = (formData.get("ocupations") as string) || "";
    const mentorData: CreateMentorRequest = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      displayName: (formData.get("displayName") as string) || undefined,
      email: formData.get("email") as string,
      mobile: parseInt(formData.get("mobile") as string),
      password: formData.get("password") as string,
      dob: (formData.get("dob") as string) || undefined,
      description: (formData.get("description") as string) || undefined,
      bio: (formData.get("bio") as string) || undefined,
      signUpMotivation: (formData.get("signUpMotivation") as string) || undefined,
      commitmentOfTeachingHour: (formData.get("commitmentOfTeachingHour") as string) || undefined,
      ocupations: ocupationsRaw ? ocupationsRaw.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
      profileImage: (formData.get("profileImage") as string) || undefined,
      livePhoto: (formData.get("livePhoto") as string) || undefined,
      introVideo: (formData.get("introVideo") as string) || undefined,
      documents: (() => { try { return JSON.parse((formData.get("documents") as string) || "[]") as string[]; } catch { return []; } })(),
      country: selectedCreateCountryId || undefined,
      city: (formData.get("city") as string) || undefined,
      address: (formData.get("address") as string) || undefined,
      postalCode: (formData.get("postalCode") as string) || undefined,
      numberOfExperience: formData.get("numberOfExperience")
        ? parseInt(formData.get("numberOfExperience") as string)
        : undefined,
      idCardType: (formData.get("idCardType") as string) || undefined,
      idCard: (formData.get("idCard") as string) || undefined,
      isEmailVerified: formData.get("isEmailVerified") === "true",
      isMobileVerified: formData.get("isMobileVerified") === "true",
      isProfileCompleted: formData.get("isProfileCompleted") === "true",
      isIdCardApproved: formData.get("isIdCardApproved") === "true",
      isFullyVerified: formData.get("isFullyVerified") === "true",
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
    const ocupationsRaw = (formData.get("ocupations") as string) || "";
    const updateData: Partial<MentorUser> = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      displayName: (formData.get("displayName") as string) || undefined,
      username: (formData.get("username") as string) || undefined,
      email: formData.get("email") as string,
      mobile: formData.get("mobile") ? parseInt(formData.get("mobile") as string) : undefined,
      phoneNumber: (formData.get("phoneNumber") as string) || undefined,
      dob: (formData.get("dob") as string) || undefined,
      description: (formData.get("description") as string) || undefined,
      bio: (formData.get("bio") as string) || undefined,
      signUpMotivation: (formData.get("signUpMotivation") as string) || undefined,
      commitmentOfTeachingHour: (formData.get("commitmentOfTeachingHour") as string) || undefined,
      ocupations: ocupationsRaw ? ocupationsRaw.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
      profileImage: (formData.get("profileImage") as string) || undefined,
      livePhoto: (formData.get("livePhoto") as string) || undefined,
      introVideo: (formData.get("introVideo") as string) || undefined,
      country: selectedEditCountryId || undefined,
      city: (formData.get("city") as string) || undefined,
      address: (formData.get("address") as string) || undefined,
      postalCode: formData.get("postalCode") ? parseInt(formData.get("postalCode") as string) : undefined,
      documents: (() => { try { return JSON.parse((formData.get("documents") as string) || "[]") as string[]; } catch { return []; } })(),
      numberOfExperience: formData.get("numberOfExperience")
        ? parseInt(formData.get("numberOfExperience") as string)
        : undefined,
      idCardType: (formData.get("idCardType") as string) || undefined,
      idCard: (formData.get("idCard") as string) || undefined,
      isEmailVerified: formData.get("isEmailVerified") === "true",
      isMobileVerified: formData.get("isMobileVerified") === "true",
      isProfileCompleted: formData.get("isProfileCompleted") === "true",
      isIdCardApproved: formData.get("isIdCardApproved") === "true",
      isFullyVerified: formData.get("isFullyVerified") === "true",
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleCreateMentor}>
            <DialogHeader>
              <DialogTitle>Create New Mentor</DialogTitle>
              <DialogDescription>Add a new mentor to the platform</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Basic Info */}
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Basic Information</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="create-firstName">First Name *</Label>
                  <Input id="create-firstName" name="firstName" placeholder="John" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="create-lastName">Last Name *</Label>
                  <Input id="create-lastName" name="lastName" placeholder="Doe" required />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-displayName">Display Name</Label>
                <Input id="create-displayName" name="displayName" placeholder="Optional public name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="create-email">Email *</Label>
                  <Input id="create-email" name="email" type="email" placeholder="john@example.com" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="create-mobile">Mobile Number *</Label>
                  <Input id="create-mobile" name="mobile" type="tel" placeholder="+1234567890" required />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-password">Password *</Label>
                <Input id="create-password" name="password" type="password" required minLength={6} />
              </div>

              {/* Media */}
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground pt-2">Media</p>
              <div className="grid gap-2">
                <Label>Profile Image</Label>
                <CloudinaryImageUpload name="profileImage" folder="pedator/mentors/profile" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Live Photo</Label>
                  <CloudinaryImageUpload name="livePhoto" folder="pedator/mentors/live" />
                </div>
                <div className="grid gap-2">
                  <Label>Intro Video</Label>
                  <CloudinaryVideoUpload name="introVideo" folder="pedator/mentors/videos" />
                </div>
              </div>

              {/* Personal Details */}
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground pt-2">Personal Details</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="create-dob">Date of Birth</Label>
                  <Input id="create-dob" name="dob" type="date" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="create-numberOfExperience">Years of Experience</Label>
                  <Input id="create-numberOfExperience" name="numberOfExperience" type="number" min={0} max={50} placeholder="0" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-description">Short Description</Label>
                <Textarea id="create-description" name="description" placeholder="Brief description shown in listings..." rows={2} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-bio">Bio</Label>
                <Textarea id="create-bio" name="bio" placeholder="Full mentor bio..." rows={3} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-signUpMotivation">Sign Up Motivation</Label>
                <Textarea id="create-signUpMotivation" name="signUpMotivation" placeholder="Why do you want to teach?" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="create-commitmentOfTeachingHour">Teaching Hours / Week</Label>
                  <Input id="create-commitmentOfTeachingHour" name="commitmentOfTeachingHour" placeholder="e.g. 10" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="create-ocupations">Occupations</Label>
                  <Input id="create-ocupations" name="ocupations" placeholder="Engineer, Writer (comma-separated)" />
                </div>
              </div>

              {/* Location */}
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground pt-2">Location</p>
              <div className="grid gap-2">
                <Label htmlFor="create-country">Country</Label>
                <Select
                  value={selectedCreateCountryId}
                  onValueChange={(val) => { setSelectedCreateCountryId(val); }}
                  disabled={countriesLoading}
                >
                  <SelectTrigger id="create-country">
                    <SelectValue placeholder={countriesLoading ? "Loading..." : "Select country"} />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="create-city">City</Label>
                  <Select name="city" disabled={!selectedCreateCountryId || createCities.length === 0}>
                    <SelectTrigger id="create-city">
                      <SelectValue placeholder={!selectedCreateCountryId ? "Select country first" : "Select city"} />
                    </SelectTrigger>
                    <SelectContent>
                      {createCities.map((c) => (
                        <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="create-postalCode">Postal Code</Label>
                  <Input id="create-postalCode" name="postalCode" placeholder="e.g. 10001" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-address">Address</Label>
                <Input id="create-address" name="address" placeholder="Street address" />
              </div>

              {/* ID Verification */}
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground pt-2">ID Verification</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="create-idCardType">ID Card Type</Label>
                  <Select name="idCardType" defaultValue="">
                    <SelectTrigger id="create-idCardType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aadhaar Card">Aadhaar Card</SelectItem>
                      <SelectItem value="Pan Card">Pan Card</SelectItem>
                      <SelectItem value="Driving License">Driving License</SelectItem>
                      <SelectItem value="Passport">Passport</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>ID Card Image</Label>
                  <CloudinaryImageUpload name="idCard" folder="pedator/mentors/id-cards" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Documents</Label>
                <CloudinaryDocUpload name="documents" multiple folder="pedator/mentors/documents" />
              </div>

              {/* Status */}
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground pt-2">Status &amp; Verification</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="create-isProfileApproved">Profile Approval</Label>
                  <Select name="isProfileApproved" defaultValue="false">
                    <SelectTrigger id="create-isProfileApproved"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Approved</SelectItem>
                      <SelectItem value="false">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="create-isEmailVerified">Email Verified</Label>
                  <Select name="isEmailVerified" defaultValue="false">
                    <SelectTrigger id="create-isEmailVerified"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="create-isMobileVerified">Mobile Verified</Label>
                  <Select name="isMobileVerified" defaultValue="false">
                    <SelectTrigger id="create-isMobileVerified"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="create-isIdCardApproved">ID Card Approved</Label>
                  <Select name="isIdCardApproved" defaultValue="false">
                    <SelectTrigger id="create-isIdCardApproved"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="create-isProfileCompleted">Profile Completed</Label>
                  <Select name="isProfileCompleted" defaultValue="false">
                    <SelectTrigger id="create-isProfileCompleted"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="create-isFullyVerified">Fully Verified</Label>
                  <Select name="isFullyVerified" defaultValue="false">
                    <SelectTrigger id="create-isFullyVerified"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <form key={editingMentor?._id} onSubmit={handleUpdateMentor}>
            <DialogHeader>
              <DialogTitle>Edit Mentor</DialogTitle>
              <DialogDescription>Update mentor details</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Basic Info */}
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Basic Information</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-firstName">First Name</Label>
                  <Input id="edit-firstName" name="firstName" defaultValue={editingMentor?.firstName ?? ""} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-lastName">Last Name</Label>
                  <Input id="edit-lastName" name="lastName" defaultValue={editingMentor?.lastName ?? ""} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-displayName">Display Name</Label>
                  <Input id="edit-displayName" name="displayName" defaultValue={editingMentor?.displayName ?? ""} placeholder="Optional public name" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-username">Username</Label>
                  <Input id="edit-username" name="username" defaultValue={editingMentor?.username ?? ""} placeholder="@username" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input id="edit-email" name="email" type="email" defaultValue={editingMentor?.email ?? ""} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-mobile">Mobile Number</Label>
                  <Input id="edit-mobile" name="mobile" type="tel" defaultValue={editingMentor?.mobile?.toString() ?? ""} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-phoneNumber">Phone Number</Label>
                <Input id="edit-phoneNumber" name="phoneNumber" type="tel" defaultValue={editingMentor?.phoneNumber ?? ""} />
              </div>

              {/* Media */}
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground pt-2">Media</p>
              <div className="grid gap-2">
                <Label>Profile Image</Label>
                <CloudinaryImageUpload name="profileImage" folder="pedator/mentors/profile" defaultValue={editingMentor?.profileImage ?? ""} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Live Photo</Label>
                  <CloudinaryImageUpload name="livePhoto" folder="pedator/mentors/live" defaultValue={editingMentor?.livePhoto ?? ""} />
                </div>
                <div className="grid gap-2">
                  <Label>Intro Video</Label>
                  <CloudinaryVideoUpload name="introVideo" folder="pedator/mentors/videos" defaultValue={editingMentor?.introVideo ?? ""} />
                </div>
              </div>

              {/* Personal Details */}
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground pt-2">Personal Details</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-dob">Date of Birth</Label>
                  <Input
                    id="edit-dob"
                    name="dob"
                    type="date"
                    defaultValue={editingMentor?.dob ? editingMentor.dob.substring(0, 10) : ""}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-numberOfExperience">Years of Experience</Label>
                  <Input
                    id="edit-numberOfExperience"
                    name="numberOfExperience"
                    type="number"
                    min={0}
                    max={50}
                    defaultValue={editingMentor?.numberOfExperience?.toString() ?? ""}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Short Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  defaultValue={editingMentor?.description ?? ""}
                  placeholder="Brief description shown in listings..."
                  rows={2}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-bio">Bio</Label>
                <Textarea
                  id="edit-bio"
                  name="bio"
                  defaultValue={editingMentor?.bio ?? ""}
                  placeholder="Full mentor bio..."
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-signUpMotivation">Sign Up Motivation</Label>
                <Textarea
                  id="edit-signUpMotivation"
                  name="signUpMotivation"
                  defaultValue={editingMentor?.signUpMotivation ?? ""}
                  placeholder="Why do you want to teach?"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-commitmentOfTeachingHour">Teaching Hours / Week</Label>
                  <Input
                    id="edit-commitmentOfTeachingHour"
                    name="commitmentOfTeachingHour"
                    defaultValue={editingMentor?.commitmentOfTeachingHour ?? ""}
                    placeholder="e.g. 10"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-ocupations">Occupations</Label>
                  <Input
                    id="edit-ocupations"
                    name="ocupations"
                    defaultValue={editingMentor?.ocupations?.join(", ") ?? ""}
                    placeholder="Engineer, Writer (comma-separated)"
                  />
                </div>
              </div>

              {/* Location */}
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground pt-2">Location</p>
              <div className="grid gap-2">
                <Label htmlFor="edit-country">Country</Label>
                <Select
                  value={selectedEditCountryId}
                  onValueChange={(val) => setSelectedEditCountryId(val)}
                  disabled={countriesLoading}
                >
                  <SelectTrigger id="edit-country">
                    <SelectValue placeholder={countriesLoading ? "Loading..." : "Select country"} />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-city">City</Label>
                  <Select name="city" defaultValue={editingMentor?.city ?? ""} disabled={!selectedEditCountryId || editCities.length === 0}>
                    <SelectTrigger id="edit-city">
                      <SelectValue placeholder={!selectedEditCountryId ? "Select country first" : "Select city"} />
                    </SelectTrigger>
                    <SelectContent>
                      {editCities.map((c) => (
                        <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-postalCode">Postal Code</Label>
                  <Input id="edit-postalCode" name="postalCode" defaultValue={editingMentor?.postalCode?.toString() ?? ""} placeholder="e.g. 10001" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-address">Address</Label>
                <Input id="edit-address" name="address" defaultValue={editingMentor?.address ?? ""} placeholder="Street address" />
              </div>

              {/* ID Verification */}
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground pt-2">ID Verification</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-idCardType">ID Card Type</Label>
                  <Select name="idCardType" defaultValue={editingMentor?.idCardType ?? ""}>
                    <SelectTrigger id="edit-idCardType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aadhaar Card">Aadhaar Card</SelectItem>
                      <SelectItem value="Pan Card">Pan Card</SelectItem>
                      <SelectItem value="Driving License">Driving License</SelectItem>
                      <SelectItem value="Passport">Passport</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>ID Card Image</Label>
                  <CloudinaryImageUpload name="idCard" folder="pedator/mentors/id-cards" defaultValue={editingMentor?.idCard ?? ""} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Documents</Label>
                <CloudinaryDocUpload name="documents" multiple folder="pedator/mentors/documents" defaultValue={editingMentor?.documents ?? []} />
              </div>

              {/* Status & Verification */}
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground pt-2">Status &amp; Verification</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-isBlocked">Account Status</Label>
                  <Select name="isBlocked" defaultValue={editingMentor?.isBlocked ? "true" : "false"}>
                    <SelectTrigger id="edit-isBlocked"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">Active</SelectItem>
                      <SelectItem value="true">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-isEmailVerified">Email Verified</Label>
                  <Select name="isEmailVerified" defaultValue={editingMentor?.isEmailVerified ? "true" : "false"}>
                    <SelectTrigger id="edit-isEmailVerified"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-isMobileVerified">Mobile Verified</Label>
                  <Select name="isMobileVerified" defaultValue={editingMentor?.isMobileVerified ? "true" : "false"}>
                    <SelectTrigger id="edit-isMobileVerified"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-isIdCardApproved">ID Card Approved</Label>
                  <Select name="isIdCardApproved" defaultValue={editingMentor?.isIdCardApproved ? "true" : "false"}>
                    <SelectTrigger id="edit-isIdCardApproved"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-isProfileCompleted">Profile Completed</Label>
                  <Select name="isProfileCompleted" defaultValue={editingMentor?.isProfileCompleted ? "true" : "false"}>
                    <SelectTrigger id="edit-isProfileCompleted"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-isFullyVerified">Fully Verified</Label>
                  <Select name="isFullyVerified" defaultValue={editingMentor?.isFullyVerified ? "true" : "false"}>
                    <SelectTrigger id="edit-isFullyVerified"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {editingMentor?.isProfileRejected && editingMentor?.rejectionReason && (
                <div className="grid gap-2">
                  <Label>Rejection Reason (read-only)</Label>
                  <Textarea
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
