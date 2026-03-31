"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type SubCategoryFormValues = {
  categoryId: string;
  name: string;
  description?: string;
  status?: boolean;
};

export function SubCategoryForm({
  initialValues,
  categories,
  onSubmit,
  onCancel,
  loading,
}: {
  initialValues: SubCategoryFormValues;
  categories: Array<{ _id: string; name: string }>;
  onSubmit: (values: SubCategoryFormValues) => Promise<void> | void;
  onCancel: () => void;
  loading?: boolean;
}) {
  const [values, setValues] = useState<SubCategoryFormValues>(initialValues);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="parent-category">Parent Category</Label>
        <Select
          value={values.categoryId || ""}
          onValueChange={(value) => setValues((v) => ({ ...v, categoryId: value }))}
        >
          <SelectTrigger id="parent-category">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c._id} value={c._id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="subcategory-name">Name</Label>
        <Input
          id="subcategory-name"
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          placeholder="Enter sub-category name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="subcategory-description">Description</Label>
        <Textarea
          id="subcategory-description"
          value={values.description || ""}
          onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
          placeholder="Enter sub-category description"
          rows={3}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="subcategory-status">Active</Label>
        <Switch
          id="subcategory-status"
          checked={!!values.status}
          onCheckedChange={(checked) => setValues((v) => ({ ...v, status: checked }))}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={() =>
            onSubmit({
              ...values,
              name: values.name.trim(),
              description: values.description?.trim() ?? "",
              categoryId: values.categoryId,
              status: values.status ?? true,
            })
          }
          disabled={loading || !values.name.trim() || !values.categoryId}
        >
          Save
        </Button>
      </div>
    </div>
  );
}
