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
    header: "Category",
    cell: ({ row }) => {
      const course = row.original;
      return <span className="text-sm">{course.categoryId.name}</span>;
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
                  price: course.price,
                  status: course.status,
                }}
                categories={categoriesData?.data || []}
                subCategories={(subCategoriesData?.data || []).map((s: any) => ({
                  _id: s._id,
                  name: s.name,
                  categoryId: s.categoryId,
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
