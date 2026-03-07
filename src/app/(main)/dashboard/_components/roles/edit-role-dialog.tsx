"use client";

import * as React from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
import { Separator } from "@/components/ui/separator";
import { useUpdateRole } from "@/hooks/api";
import type { Permission, Role, UpdateRoleRequest } from "@/types/api";

import { PermissionEditor } from "./permission-editor";

type ApiError = Error & { response?: { data?: { message?: string } } };

type Props = {
  role: Role | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resources: string[];
  actions: string[];
};

export function EditRoleDialog({ role, open, onOpenChange, resources, actions }: Props) {
  const [form, setForm] = React.useState<UpdateRoleRequest>({});
  const { mutate: updateRole, isPending } = useUpdateRole();

  React.useEffect(() => {
    if (role) {
      setForm({
        name: role.name,
        description: role.description ?? "",
        permissions: role.permissions ? JSON.parse(JSON.stringify(role.permissions)) : [],
      });
    }
  }, [role]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    updateRole(
      { id: role._id, data: form },
      {
        onSuccess: () => {
          toast.success(`Role "${form.name ?? role.name}" updated`);
          onOpenChange(false);
        },
        onError: (err: ApiError) => {
          toast.error(err.response?.data?.message ?? "Failed to update role");
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="pb-3">
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Update role details and permissions.
              {role?.isSystem && (
                <span className="ml-2 text-amber-600 dark:text-amber-400">
                  (System role — name cannot be changed)
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="edit-name">Role Name *</Label>
                <Input
                  id="edit-name"
                  placeholder="e.g. content-manager"
                  value={form.name ?? ""}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  disabled={role?.isSystem}
                  className={role?.isSystem ? "cursor-not-allowed opacity-60" : ""}
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="edit-desc">Description</Label>
                <Input
                  id="edit-desc"
                  placeholder="Describe what this role can do"
                  value={form.description ?? ""}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
            </div>
            <Separator />
            <div className="grid gap-1.5">
              <Label>Permissions</Label>
              <PermissionEditor
                value={(form.permissions as Permission[]) ?? []}
                onChange={(permissions) => setForm({ ...form, permissions })}
                resources={resources}
                actions={actions}
              />
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
