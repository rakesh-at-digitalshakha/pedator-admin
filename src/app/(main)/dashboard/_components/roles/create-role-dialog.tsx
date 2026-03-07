"use client";

import * as React from "react";

import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCreateRole } from "@/hooks/api";
import type { CreateRoleRequest } from "@/types/api";

import { PermissionEditor } from "./permission-editor";

type ApiError = Error & { response?: { data?: { message?: string } } };

const EMPTY_FORM: CreateRoleRequest = { name: "", description: "", permissions: [] };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resources: string[];
  actions: string[];
};

export function CreateRoleDialog({ open, onOpenChange, resources, actions }: Props) {
  const [form, setForm] = React.useState<CreateRoleRequest>({ ...EMPTY_FORM });
  const { mutate: createRole, isPending } = useCreateRole();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Role name is required");
      return;
    }
    createRole(form, {
      onSuccess: () => {
        toast.success(`Role "${form.name}" created`);
        onOpenChange(false);
        setForm({ ...EMPTY_FORM });
      },
      onError: (err: ApiError) => {
        toast.error(err.response?.data?.message ?? "Failed to create role");
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 size-4" />
          New Role
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="pb-3">
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>
              Define a role name and assign granular permissions across resources.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="create-name">Role Name *</Label>
                <Input
                  id="create-name"
                  placeholder="e.g. content-manager"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="create-desc">Description</Label>
                <Input
                  id="create-desc"
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
                value={form.permissions ?? []}
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
              {isPending ? "Creating..." : "Create Role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
