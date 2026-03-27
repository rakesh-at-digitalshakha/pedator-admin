"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle, MoreHorizontal, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  useApproveCourse,
  useRejectCourse,
  useDeleteCourse,
  useUpdateCourse,
  useGetAllCategories,
  useGetAllLessons,
  useGetAllModules,
  useGetAllSubCategories,
} from "@/hooks/api";
import type { Course } from "@/types/api";

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { CourseForm } from "./forms/course-form";

export const courseColumns: ColumnDef<Course>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Course" />,
    cell: ({ row }) => {
      const course = row.original;
      return (
        <div className="flex max-w-xs flex-col">
          <span className="truncate font-medium">{course.title}</span>
          <span className="text-muted-foreground text-xs">
            by {course.mentorId.firstName} {course.mentorId.lastName}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "categoryId.name",
    header: "Hierarchy",
    cell: ({ row }) => {
      const course = row.original;
      return (
        <div className="flex max-w-xs flex-col text-sm">
          <span>{course.categoryId?.name || "-"}</span>
          <span className="text-muted-foreground text-xs">{course.subCategoryId?.name || "-"}</span>
          <span className="text-muted-foreground text-xs">{course.moduleId?.name || "-"}</span>
          <span className="text-muted-foreground text-xs">{course.lessonId?.name || "-"}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Price" />,
    cell: ({ row }) => {
      const price = row.getValue("price") as number;
      return <span className="font-medium">₹{price.toFixed(2)}</span>;
    },
  },
  {
    accessorKey: "isCourseApproved",
    header: "Status",
    cell: ({ row }) => {
      const course = row.original;
      if (course.isCourseRejected) {
        return <Badge variant="destructive">Rejected</Badge>;
      }
      if (course.isCourseApproved) {
        return <Badge variant="default">Approved</Badge>;
      }
      return <Badge variant="secondary">Pending</Badge>;
    },
  },
  {
    accessorKey: "averageRating",
    header: "Rating",
    cell: ({ row }) => {
      const rating = row.getValue("averageRating") as number | undefined;
      const reviews = row.original.numberOfReviews || 0;
      return <span className="text-sm">{rating ? `${rating.toFixed(1)} (${reviews})` : "No reviews"}</span>;
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return <span className="text-muted-foreground text-sm">{date.toLocaleDateString()}</span>;
    },
  },
  {
    id: "actions",
    cell: function Cell({ row }) {
      const course = row.original;
      const approveMutation = useApproveCourse();
      const rejectMutation = useRejectCourse();
      const deleteMutation = useDeleteCourse();
      const updateMutation = useUpdateCourse();
      const [showRejectDialog, setShowRejectDialog] = useState(false);
      const [rejectionReason, setRejectionReason] = useState("");
      const [showEditDialog, setShowEditDialog] = useState(false);
      const { data: categoriesData } = useGetAllCategories();
      const { data: subCategoriesData } = useGetAllSubCategories();
      const { data: modulesData } = useGetAllModules();
      const { data: lessonsData } = useGetAllLessons();

      const handleApprove = async () => {
        try {
          await approveMutation.mutateAsync(course._id);
          toast.success("Course approved successfully");
        } catch (error) {
          toast.error("Failed to approve course");
        }
      };

      const handleReject = async () => {
        try {
          await rejectMutation.mutateAsync({
            courseId: course._id,
            rejectionReason,
          });
          toast.success("Course rejected");
          setShowRejectDialog(false);
          setRejectionReason("");
        } catch (error) {
          toast.error("Failed to reject course");
        }
      };

      const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this course?")) {
          try {
            await deleteMutation.mutateAsync(course._id);
            toast.success("Course deleted successfully");
          } catch (error) {
            toast.error("Failed to delete course");
          }
        }
      };

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="size-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(course._id)}>
                Copy course ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowEditDialog(true)}>Edit course</DropdownMenuItem>
              <DropdownMenuSeparator />
              {!course.isCourseApproved && !course.isCourseRejected && (
                <>
                  <DropdownMenuItem onClick={handleApprove}>
                    <CheckCircle className="mr-2 size-4" />
                    Approve course
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowRejectDialog(true)}>
                    <XCircle className="mr-2 size-4" />
                    Reject course
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                Delete course
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Course</DialogTitle>
              </DialogHeader>
              <CourseForm
                initialValues={{
                  title: course.title,
                  description: course.description,
                  categoryId: course.categoryId._id,
                  subCategoryId: course.subCategoryId?._id,
                  moduleId: course.moduleId?._id,
                  lessonId: course.lessonId?._id,
                  duration: course.duration,
                  price: course.price,
                  status: course.status,
                  coverImage: course.coverImage,
                  video: course.video,
                  keyTopics:
                    typeof course.keyTopics === "string"
                      ? course.keyTopics
                      : course.keyTopics?._id,
                  startDate: course.startDate ? course.startDate.slice(0, 10) : "",
                  endDate: course.endDate ? course.endDate.slice(0, 10) : "",
                  tags: course.tags || [],
                  keypointsOfCourse: course.keypointsOfCourse || [],
                  images: course.images || [],
                  documents: course.documents || [],
                  faqs: course.faqs || [],
                }}
                categories={categoriesData?.data || []}
                subCategories={(subCategoriesData?.data || []).map((s: any) => ({
                  _id: s._id,
                  name: s.name,
                  categoryId: s.categoryId,
                }))}
                modules={(modulesData?.data ?? []).map((module: any) => ({
                  _id: module._id,
                  name: module.name,
                  subCategoryId: module.subCategoryId?._id ?? module.subCategoryId,
                }))}
                lessons={(lessonsData?.data ?? []).map((lesson: any) => ({
                  _id: lesson._id,
                  name: lesson.name,
                  moduleId: lesson.moduleId?._id ?? lesson.moduleId,
                }))}
                loading={updateMutation.isPending}
                onCancel={() => setShowEditDialog(false)}
                onSubmit={async (values) => {
                  try {
                    const payload: any = {
                      title: values.title,
                      description: values.description,
                      price: Number(values.price),
                      status: values.status,
                      categoryId: values.categoryId,
                      subCategoryId: values.subCategoryId,
                      moduleId: values.moduleId,
                      lessonId: values.lessonId,
                      duration: Number(values.duration),
                      coverImage: values.coverImage,
                      video: values.video,
                      keyTopics: values.keyTopics,
                      startDate: values.startDate,
                      endDate: values.endDate,
                      tags: values.tags,
                      keypointsOfCourse: values.keypointsOfCourse,
                      images: values.images,
                      documents: values.documents,
                      faqs: values.faqs,
                    };
                    await updateMutation.mutateAsync({ id: course._id, data: payload });
                    toast.success("Course updated successfully");
                    setShowEditDialog(false);
                  } catch (error) {
                    toast.error("Failed to update course");
                  }
                }}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reject Course</DialogTitle>
                <DialogDescription>Please provide a reason for rejecting this course.</DialogDescription>
              </DialogHeader>
              <Textarea
                placeholder="Enter rejection reason..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleReject} disabled={!rejectionReason.trim()}>
                  Reject Course
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      );
    },
  },
];
