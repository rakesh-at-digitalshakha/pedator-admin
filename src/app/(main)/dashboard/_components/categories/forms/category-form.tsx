"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export type CategoryFormValues = {
  name: string;
  description?: string;
  status?: boolean;
};

export function CategoryForm({
  initialValues,
  onSubmit,
  onCancel,
  loading,
}: {
  initialValues: CategoryFormValues;
  onSubmit: (values: CategoryFormValues) => Promise<void> | void;
  onCancel: () => void;
  loading?: boolean;
}) {
  const [values, setValues] = useState<CategoryFormValues>(initialValues);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="category-name">Name</Label>
        <Input
          id="category-name"
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          placeholder="Enter category name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="category-description">Description</Label>
        <Textarea
          id="category-description"
          value={values.description || ""}
          onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
          placeholder="Enter category description"
          rows={3}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="category-status">Active</Label>
        <Switch
          id="category-status"
          checked={!!values.status}
          onCheckedChange={(checked) => setValues((v) => ({ ...v, status: checked }))}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={() => onSubmit(values)} disabled={loading || !values.name.trim()}>
          Save
        </Button>
      </div>
    </div>
  );
}
