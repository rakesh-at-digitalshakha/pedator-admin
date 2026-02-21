"use client";

import * as React from "react";

import { Plus, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/data-table/data-table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { useGetAllAdmins, useCreateAdmin, useUpdateAdmin, useResetAdminPassword } from "@/hooks/api";
import type { AdminFilters, AdminUser, UpdateAdminRequest } from "@/types/api";

import { adminUsersColumns } from "./admin-users-columns";

export function AdminUsersTable() {
  const [filters, setFilters] = React.useState<AdminFilters>({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    order: "desc",
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [editingAdmin, setEditingAdmin] = React.useState<AdminUser | null>(null);
  const [searchValue, setSearchValue] = React.useState("");
  const [createFormData, setCreateFormData] = React.useState({
    email: "",
    password: "",
    role: "admin" as "admin" | "super-admin",
  });
  const [editFormData, setEditFormData] = React.useState<UpdateAdminRequest>({
    email: "",
    role: "admin",
  });
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = React.useState(false);
  const [adminToReset, setAdminToReset] = React.useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = React.useState("");

  const { data: adminsData, isLoading, error } = useGetAllAdmins(filters);
  const { mutate: createAdmin, isPending: isCreating } = useCreateAdmin();
  const { mutate: updateAdmin, isPending: isUpdating } = useUpdateAdmin();
  const { mutate: resetAdminPassword, isPending: isResetting } = useResetAdminPassword();

  const admins = adminsData?.data ?? [];

  const handleEdit = React.useCallback((admin: AdminUser) => {
    setEditingAdmin(admin);
    setIsEditDialogOpen(true);
  }, []);

  const handleResetPasswordClick = React.useCallback((admin: AdminUser) => {
    setAdminToReset(admin);
    setNewPassword("");
    setIsResetPasswordDialogOpen(true);
  }, []);

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToReset) return;

    resetAdminPassword(
      {
        id: adminToReset._id,
        password: newPassword,
      },
      {
        onSuccess: () => {
          toast.success("Password reset successfully");
          setIsResetPasswordDialogOpen(false);
          setAdminToReset(null);
          setNewPassword("");
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "Failed to reset password");
        },
      },
    );
  };

  // Sync edit form data when editing admin changes
  React.useEffect(() => {
    if (editingAdmin) {
      setEditFormData({
        email: editingAdmin.email,
        role: editingAdmin.role,
      });
    }
  }, [editingAdmin]);

  const columns = React.useMemo(
    () =>
      adminUsersColumns({
        onEdit: handleEdit,
        onResetPassword: handleResetPasswordClick,
        onDeleteSuccess: () => {
          // Query invalidation will automatically refetch
        },
      }),
    [handleEdit, handleResetPasswordClick],
  );

  const table = useDataTableInstance({
    data: admins,
    columns,
    getRowId: (row) => row._id,
  });

  // Debounced search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        search: searchValue || undefined,
        page: 1, // Reset to first page on search
      }));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue]);

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    createAdmin(createFormData, {
      onSuccess: () => {
        toast.success("Admin created successfully");
        setIsCreateDialogOpen(false);
        setCreateFormData({ email: "", password: "", role: "admin" });
        // Query invalidation will automatically refetch
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to create admin");
      },
    });
  };

  const handleUpdateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;

    updateAdmin(
      {
        id: editingAdmin._id,
        data: editFormData,
      },
      {
        onSuccess: () => {
          toast.success("Admin updated successfully");
          setIsEditDialogOpen(false);
          setEditingAdmin(null);
          setEditFormData({ email: "", role: "admin" });
          // Query invalidation will automatically refetch
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "Failed to update admin");
        },
      },
    );
  };

  const handleRoleFilterChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      role: value === "all" ? undefined : (value as "admin" | "super-admin"),
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
          <CardTitle>Admin Users</CardTitle>
          <CardDescription className="text-destructive">Failed to load admins</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Admin Users</CardTitle>
            <CardDescription>
              {adminsData?.total ?? 0} total admin{(adminsData?.total ?? 0) !== 1 ? "s" : ""}
            </CardDescription>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 size-4" />
                Add Admin
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreateAdmin}>
                <DialogHeader>
                  <DialogTitle>Create New Admin</DialogTitle>
                  <DialogDescription>Add a new admin user to the platform.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="create-email">Email</Label>
                    <Input
                      id="create-email"
                      type="email"
                      value={createFormData.email}
                      onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="create-password">Password</Label>
                    <Input
                      id="create-password"
                      type="password"
                      value={createFormData.password}
                      onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="create-role">Role</Label>
                    <Select
                      value={createFormData.role}
                      onValueChange={(value: any) => setCreateFormData({ ...createFormData, role: value })}
                    >
                      <SelectTrigger id="create-role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="super-admin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? "Creating..." : "Create Admin"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <Input
              placeholder="Search by email..."
              className="max-w-sm"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <Select value={filters.role || "all"} onValueChange={handleRoleFilterChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="super-admin">Super Admin</SelectItem>
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
                <div className="flex w-full items-center gap-8 lg:ml-auto lg:w-fit">
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
                    Page {filters.page ?? 1} of {adminsData?.pages ?? 1}
                  </div>
                  <div className="ml-auto flex items-center gap-2 lg:ml-0">
                    <Button
                      variant="outline"
                      className="hidden size-8 lg:flex"
                      size="icon"
                      onClick={() => setFilters((prev) => ({ ...prev, page: 1 }))}
                      disabled={(filters.page ?? 1) === 1}
                    >
                      <span className="sr-only">Go to first page</span>
                      <ChevronsLeft className="size-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="size-8"
                      size="icon"
                      onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, (prev.page ?? 1) - 1) }))}
                      disabled={(filters.page ?? 1) === 1}
                    >
                      <span className="sr-only">Go to previous page</span>
                      <ChevronLeft className="size-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="size-8"
                      size="icon"
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          page: Math.min(adminsData?.pages ?? 1, (prev.page ?? 1) + 1),
                        }))
                      }
                      disabled={(filters.page ?? 1) >= (adminsData?.pages ?? 1)}
                    >
                      <span className="sr-only">Go to next page</span>
                      <ChevronRight className="size-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="hidden size-8 lg:flex"
                      size="icon"
                      onClick={() => setFilters((prev) => ({ ...prev, page: adminsData?.pages ?? 1 }))}
                      disabled={(filters.page ?? 1) >= (adminsData?.pages ?? 1)}
                    >
                      <span className="sr-only">Go to last page</span>
                      <ChevronsRight className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            // Reset form when dialog closes
            setEditingAdmin(null);
            setEditFormData({ email: "", role: "admin" });
          }
        }}
      >
        <DialogContent>
          <form onSubmit={handleUpdateAdmin}>
            <DialogHeader>
              <DialogTitle>Edit Admin</DialogTitle>
              <DialogDescription>Update admin user details.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select
                  value={editFormData.role}
                  onValueChange={(value: any) => setEditFormData({ ...editFormData, role: value })}
                >
                  <SelectTrigger id="edit-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="super-admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? "Updating..." : "Update Admin"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog
        open={isResetPasswordDialogOpen}
        onOpenChange={(open) => {
          setIsResetPasswordDialogOpen(open);
          if (!open) {
            setAdminToReset(null);
            setNewPassword("");
          }
        }}
      >
        <DialogContent>
          <form onSubmit={handleResetPasswordSubmit}>
            <DialogHeader>
              <DialogTitle>Reset Admin Password</DialogTitle>
              <DialogDescription>Enter a new password for {adminToReset?.email}.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min. 6 chars)"
                  required
                  minLength={6}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsResetPasswordDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isResetting}>
                {isResetting ? "Resetting..." : "Reset Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
