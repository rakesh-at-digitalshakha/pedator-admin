"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CloudinaryImageUpload } from "@/components/ui/cloudinary-image-upload";
import { CloudinaryVideoUpload } from "@/components/ui/cloudinary-video-upload";
import { CloudinaryDocUpload } from "@/components/ui/cloudinary-doc-upload";

export type CourseFormValues = {
  title: string;
  description: string;
  categoryId: string;
  subCategoryId?: string;
  moduleId?: string;
  lessonId?: string;
  duration: number | string;
  price: number | string;
  status?: boolean;
  mentorId?: string;
  coverImage?: string;
  video?: string;
  keyTopics?: string;
  startDate?: string;
  endDate?: string;
  tags?: string[];
  keypointsOfCourse?: string[];
  images?: string[];
  documents?: string[];
  faqs?: Array<{ question: string; answer: string }>;
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
  const [tagsInput, setTagsInput] = useState((initialValues.tags || []).join(", "));
  const [keypointsInput, setKeypointsInput] = useState((initialValues.keypointsOfCourse || []).join(", "));
  const [imagesInput, setImagesInput] = useState((initialValues.images || []).join(", "));
  const [faqsInput, setFaqsInput] = useState(
    (initialValues.faqs || [])
      .map((faq) => `${faq.question} | ${faq.answer}`)
      .join("\n")
  );

  const filteredSubCats = (subCategories || []).filter((s) => s.categoryId === values.categoryId);
  const filteredModules = (modules || []).filter((m) => m.subCategoryId === values.subCategoryId);
  const filteredLessons = (lessons || []).filter((l) => l.moduleId === values.moduleId);

  const parseCommaSeparated = (raw: string) =>
    raw
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const parseFaqLines = (raw: string) =>
    raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [question, ...answerParts] = line.split("|");
        return {
          question: (question || "").trim(),
          answer: answerParts.join("|").trim(),
        };
      })
      .filter((faq) => faq.question && faq.answer);

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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Cover Image</Label>
          <CloudinaryImageUpload
            name="coverImage"
            value={values.coverImage || ""}
            onChange={(url) => setValues((v) => ({ ...v, coverImage: url }))}
            folder="pedator/courses/images"
            label="Course cover image"
          />
        </div>
        <div className="space-y-2">
          <Label>Course Video</Label>
          <CloudinaryVideoUpload
            name="video"
            value={values.video || ""}
            onChange={(url) => setValues((v) => ({ ...v, video: url }))}
            folder="pedator/courses/videos"
            label="Course video"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="course-start-date">Start Date</Label>
          <Input
            id="course-start-date"
            type="date"
            value={values.startDate || ""}
            onChange={(e) => setValues((v) => ({ ...v, startDate: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="course-end-date">End Date</Label>
          <Input
            id="course-end-date"
            type="date"
            value={values.endDate || ""}
            onChange={(e) => setValues((v) => ({ ...v, endDate: e.target.value }))}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="course-key-topics">Key Topic ID</Label>
        <Input
          id="course-key-topics"
          value={values.keyTopics || ""}
          onChange={(e) => setValues((v) => ({ ...v, keyTopics: e.target.value }))}
          placeholder="Enter key topic ObjectId"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="course-tags">Tags</Label>
        <Input
          id="course-tags"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="e.g. beginner, interview, javascript"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="course-keypoints">Key Points of Course</Label>
        <Textarea
          id="course-keypoints"
          value={keypointsInput}
          onChange={(e) => setKeypointsInput(e.target.value)}
          placeholder="Comma separated key points"
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="course-images">Additional Image URLs</Label>
        <Textarea
          id="course-images"
          value={imagesInput}
          onChange={(e) => setImagesInput(e.target.value)}
          placeholder="Comma separated Cloudinary image URLs"
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label>Documents</Label>
        <CloudinaryDocUpload
          name="documents"
          multiple
          value={values.documents || []}
          onChange={(next) => {
            const list = Array.isArray(next) ? next : next ? [next] : [];
            setValues((v) => ({ ...v, documents: list }));
          }}
          folder="pedator/courses/documents"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="course-faqs">FAQs</Label>
        <Textarea
          id="course-faqs"
          value={faqsInput}
          onChange={(e) => setFaqsInput(e.target.value)}
          placeholder="One per line: Question | Answer"
          rows={4}
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="course-duration">Duration</Label>
          <Select
            value={String(values.duration || "")}
            onValueChange={(value) => setValues((v) => ({ ...v, duration: Number(value) }))}
          >
            <SelectTrigger id="course-duration">
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="45">45 minutes</SelectItem>
              <SelectItem value="60">60 minutes</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
          onClick={() =>
            onSubmit({
              ...values,
              duration: Number(values.duration),
              price: Number(values.price),
              tags: parseCommaSeparated(tagsInput),
              keypointsOfCourse: parseCommaSeparated(keypointsInput),
              images: parseCommaSeparated(imagesInput),
              faqs: parseFaqLines(faqsInput),
            })
          }
          disabled={
            loading ||
            !values.title.trim() ||
            !values.description.trim() ||
            !values.categoryId ||
            !values.subCategoryId ||
            !values.moduleId ||
            !values.lessonId ||
            !values.duration ||
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
