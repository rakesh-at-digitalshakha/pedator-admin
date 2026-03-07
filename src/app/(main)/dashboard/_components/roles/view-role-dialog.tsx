"use client";

import { ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Role } from "@/types/api";

import { PermissionEditor } from "./permission-editor";

type Props = {
  role: Role | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resources: string[];
  actions: string[];
  onEdit: (role: Role) => void;
};

export function ViewRoleDialog({ role, open, onOpenChange, resources, actions, onEdit }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader className="pb-3">
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5" />
            {role?.name}
            {role?.isSystem && <Badge variant="outline">System</Badge>}
          </DialogTitle>
          <DialogDescription>{role?.description ?? "No description provided."}</DialogDescription>
        </DialogHeader>
        <PermissionEditor
          value={role?.permissions ?? []}
          onChange={() => {}}
          resources={resources}
          actions={actions}
          disabled
        />
        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {role && !role.isSystem && (
            <Button
              onClick={() => {
                onOpenChange(false);
                onEdit(role);
              }}
            >
              Edit Role
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
