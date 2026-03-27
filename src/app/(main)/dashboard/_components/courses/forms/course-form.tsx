"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type CourseFormValues = {
  title: string;
  description: string;
  categoryId: string;
  subCategoryId?: string;
  moduleId?: string;
  lessonId?: string;
  price: number | string;
  status?: boolean;
  mentorId?: string;
};

export function CourseForm({
  initialValues,
  categories,
  subCategories,
  modules,
  lessons,
  mentors,
  onSubmit,
  onCancel,
  loading,
  showMentorField = false,
}: {
  initialValues: CourseFormValues;
  categories: Array<{ _id: string; name: string }>;
  subCategories?: Array<{ _id: string; name: string; categoryId: string }>;
  modules?: Array<{ _id: string; name: string; subCategoryId: string }>;
  lessons?: Array<{ _id: string; name: string; moduleId: string }>;
  mentors?: Array<{ _id: string; firstName: string; lastName: string }>;
  onSubmit: (values: CourseFormValues) => Promise<void> | void;
  onCancel: () => void;
  loading?: boolean;
  showMentorField?: boolean;
}) {
  const [values, setValues] = useState<CourseFormValues>(initialValues);

  const filteredSubCats = (subCategories || []).filter((s) => s.categoryId === values.categoryId);
  const filteredModules = (modules || []).filter((m) => m.subCategoryId === values.subCategoryId);
  const filteredLessons = (lessons || []).filter((l) => l.moduleId === values.moduleId);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="course-title">Title</Label>
        <Input
          id="course-title"
          value={values.title}
          onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
          placeholder="Enter course title"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="course-description">Description</Label>
        <Textarea
          id="course-description"
          value={values.description}
          onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
          placeholder="Enter course description"
          rows={3}
        />
      </div>
      {showMentorField && mentors && (
        <div className="space-y-2">
          <Label htmlFor="course-mentor">Mentor</Label>
          <Select
            value={values.mentorId || ""}
            onValueChange={(value) => setValues((v) => ({ ...v, mentorId: value }))}
          >
            <SelectTrigger id="course-mentor">
              <SelectValue placeholder="Select a mentor" />
            </SelectTrigger>
            <SelectContent>
              {mentors.map((m) => (
                <SelectItem key={m._id} value={m._id}>
                  {m.firstName} {m.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="course-category">Category</Label>
          <Select
            value={values.categoryId || ""}
            onValueChange={(value) =>
              setValues((v) => ({
                ...v,
                categoryId: value,
                subCategoryId: undefined,
                moduleId: undefined,
                lessonId: undefined,
              }))
            }
          >
            <SelectTrigger id="course-category">
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
          <Label htmlFor="course-subcategory">Sub-Category</Label>
          <Select
            value={values.subCategoryId || ""}
            onValueChange={(value) => setValues((v) => ({ ...v, subCategoryId: value, moduleId: undefined, lessonId: undefined }))}
          >
            <SelectTrigger id="course-subcategory">
              <SelectValue placeholder="Select a sub-category" />
            </SelectTrigger>
            <SelectContent>
              {filteredSubCats.map((s) => (
                <SelectItem key={s._id} value={s._id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="course-module">Module</Label>
          <Select
            value={values.moduleId || ""}
            onValueChange={(value) => setValues((v) => ({ ...v, moduleId: value, lessonId: undefined }))}
          >
            <SelectTrigger id="course-module">
              <SelectValue placeholder="Select a module" />
            </SelectTrigger>
            <SelectContent>
              {filteredModules.map((module) => (
                <SelectItem key={module._id} value={module._id}>
                  {module.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="course-lesson">Lesson</Label>
          <Select
            value={values.lessonId || ""}
            onValueChange={(value) => setValues((v) => ({ ...v, lessonId: value }))}
          >
            <SelectTrigger id="course-lesson">
              <SelectValue placeholder="Select a lesson" />
            </SelectTrigger>
            <SelectContent>
              {filteredLessons.map((lesson) => (
                <SelectItem key={lesson._id} value={lesson._id}>
                  {lesson.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="course-price">Price</Label>
          <Input
            id="course-price"
            type="number"
            value={values.price}
            onChange={(e) => setValues((v) => ({ ...v, price: e.target.value }))}
            placeholder="Enter price"
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="course-status">Active</Label>
          <Switch
            id="course-status"
            checked={!!values.status}
            onCheckedChange={(checked) => setValues((v) => ({ ...v, status: checked }))}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={() => onSubmit({ ...values, price: Number(values.price) })}
          disabled={
            loading ||
            !values.title.trim() ||
            !values.description.trim() ||
            !values.categoryId ||
            !values.subCategoryId ||
            !values.price ||
            (showMentorField && !values.mentorId)
          }
        >
          Save
        </Button>
      </div>
    </div>
  );
}
