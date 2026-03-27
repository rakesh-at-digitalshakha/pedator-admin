"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export type ModuleFormValues = {
  subCategoryId: string;
  name: string;
  description?: string;
  order?: number;
  status?: boolean;
};

export function ModuleForm({
  initialValues,
  subCategories,
  onSubmit,
  onCancel,
  loading,
}: {
  initialValues: ModuleFormValues;
  subCategories: Array<{ _id: string; name: string }>;
  onSubmit: (values: ModuleFormValues) => Promise<void> | void;
  onCancel: () => void;
  loading?: boolean;
}) {
  const [values, setValues] = useState<ModuleFormValues>(initialValues);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="parent-subcategory">Parent Subcategory</Label>
        <Select
          value={values.subCategoryId || ""}
          onValueChange={(value) => setValues((v) => ({ ...v, subCategoryId: value }))}
        >
          <SelectTrigger id="parent-subcategory">
            <SelectValue placeholder="Select a subcategory" />
          </SelectTrigger>
          <SelectContent>
            {subCategories.map((subCategory) => (
              <SelectItem key={subCategory._id} value={subCategory._id}>
                {subCategory.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="module-name">Name</Label>
        <Input
          id="module-name"
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          placeholder="Enter module name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="module-description">Description</Label>
        <Textarea
          id="module-description"
          value={values.description || ""}
          onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
          placeholder="Enter module description"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="module-order">Order</Label>
          <Input
            id="module-order"
            type="number"
            min={0}
            value={values.order ?? 0}
            onChange={(e) => setValues((v) => ({ ...v, order: Number(e.target.value) }))}
            placeholder="0"
          />
        </div>

        <div className="flex items-center justify-between pt-7">
          <Label htmlFor="module-status">Active</Label>
          <Switch
            id="module-status"
            checked={!!values.status}
            onCheckedChange={(checked) => setValues((v) => ({ ...v, status: checked }))}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={() => onSubmit(values)} disabled={loading || !values.name.trim() || !values.subCategoryId}>
          Save
        </Button>
      </div>
    </div>
  );
}
