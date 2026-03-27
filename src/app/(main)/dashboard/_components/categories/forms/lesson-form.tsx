"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export type LessonFormValues = {
  moduleId: string;
  name: string;
  description?: string;
  order?: number;
  status?: boolean;
};

export function LessonForm({
  initialValues,
  modules,
  onSubmit,
  onCancel,
  loading,
}: {
  initialValues: LessonFormValues;
  modules: Array<{ _id: string; name: string }>;
  onSubmit: (values: LessonFormValues) => Promise<void> | void;
  onCancel: () => void;
  loading?: boolean;
}) {
  const [values, setValues] = useState<LessonFormValues>(initialValues);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="parent-module">Parent Module</Label>
        <Select
          value={values.moduleId || ""}
          onValueChange={(value) => setValues((v) => ({ ...v, moduleId: value }))}
        >
          <SelectTrigger id="parent-module">
            <SelectValue placeholder="Select a module" />
          </SelectTrigger>
          <SelectContent>
            {modules.map((module) => (
              <SelectItem key={module._id} value={module._id}>
                {module.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="lesson-name">Name</Label>
        <Input
          id="lesson-name"
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          placeholder="Enter lesson name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="lesson-description">Description</Label>
        <Textarea
          id="lesson-description"
          value={values.description || ""}
          onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
          placeholder="Enter lesson description"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="lesson-order">Order</Label>
          <Input
            id="lesson-order"
            type="number"
            min={0}
            value={values.order ?? 0}
            onChange={(e) => setValues((v) => ({ ...v, order: Number(e.target.value) }))}
            placeholder="0"
          />
        </div>

        <div className="flex items-center justify-between pt-7">
          <Label htmlFor="lesson-status">Active</Label>
          <Switch
            id="lesson-status"
            checked={!!values.status}
            onCheckedChange={(checked) => setValues((v) => ({ ...v, status: checked }))}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={() => onSubmit(values)} disabled={loading || !values.name.trim() || !values.moduleId}>
          Save
        </Button>
      </div>
    </div>
  );
}
