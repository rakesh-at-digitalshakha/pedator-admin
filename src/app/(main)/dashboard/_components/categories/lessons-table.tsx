"use client";

import { useMemo, useState } from "react";
import { AlertCircle, Edit, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  useCreateLesson,
  useDeleteLesson,
  useGetAllLessons,
  useGetAllModules,
  useGetAllCourses,
  useUpdateLesson,
} from "@/hooks/api";
import type { CourseLesson } from "@/types/api";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { LessonForm, type LessonFormValues } from "./forms/lesson-form";

export function LessonsTable() {
  const { data: lessonsData, isLoading: lessonsLoading } = useGetAllLessons();
  const { data: modulesData, isLoading: modulesLoading } = useGetAllModules();
  const { data: coursesData } = useGetAllCourses({ limit: 10000 });

  const createLessonMutation = useCreateLesson();
  const updateLessonMutation = useUpdateLesson();
  const deleteLessonMutation = useDeleteLesson();

  const lessonsInUse = useMemo(() => {
    const lessonIds = new Set<string>();
    coursesData?.data?.data?.forEach((course) => {
      if (course.lessonId?._id) {
        lessonIds.add(course.lessonId._id);
      }
    });
    return lessonIds;
  }, [coursesData]);

  const [showLessonDialog, setShowLessonDialog] = useState(false);
  const [editingLesson, setEditingLesson] = useState<CourseLesson | null>(null);
  const [lessonForm, setLessonForm] = useState<LessonFormValues>({
    moduleId: "",
    name: "",
    description: "",
    contentType: "video",
    contentUrl: "",
    duration: 0,
    order: 0,
    status: true,
  });

  const handleCreateLesson = async () => {
    try {
      if (editingLesson) {
        await updateLessonMutation.mutateAsync({
          id: editingLesson._id,
          data: lessonForm,
        });
        toast.success("Lesson updated successfully");
      } else {
        await createLessonMutation.mutateAsync(lessonForm);
        toast.success("Lesson created successfully");
      }
      setShowLessonDialog(false);
      setEditingLesson(null);
      setLessonForm({
        moduleId: "",
        name: "",
        description: "",
        contentType: "video",
        contentUrl: "",
        duration: 0,
        order: 0,
        status: true,
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save lesson");
    }
  };

  const handleDeleteLesson = async (lesson: CourseLesson) => {
    if (lessonsInUse.has(lesson._id)) {
      toast.error("Cannot delete lesson. It is being used in one or more courses.");
      return;
    }

    if (confirm(`Are you sure you want to delete \"${lesson.name}\"?`)) {
      try {
        await deleteLessonMutation.mutateAsync(lesson._id);
        toast.success("Lesson deleted successfully");
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to delete lesson");
      }
    }
  };

  const openEditLesson = (lesson: CourseLesson) => {
    setEditingLesson(lesson);
    setLessonForm({
      moduleId: lesson.moduleId,
      name: lesson.name,
      description: lesson.description || "",
      contentType: lesson.contentType || "video",
      contentUrl: lesson.contentUrl || "",
      duration: lesson.duration ?? 0,
      order: lesson.order ?? 0,
      status: lesson.status ?? true,
    });
    setShowLessonDialog(true);
  };

  if (lessonsLoading || modulesLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Lessons</CardTitle>
              <CardDescription>Create and manage course lessons</CardDescription>
            </div>
            <Button
              onClick={() => {
                setEditingLesson(null);
                setLessonForm({
                  moduleId: "",
                  name: "",
                  description: "",
                  contentType: "video",
                  contentUrl: "",
                  duration: 0,
                  order: 0,
                  status: true,
                });
                setShowLessonDialog(true);
              }}
              disabled={!modulesData?.data?.length}
              title={!modulesData?.data?.length ? "Create a module first" : ""}
            >
              <Plus className="mr-2 size-4" />
              Add Lesson
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!modulesData?.data?.length ? (
            <Alert>
              <AlertCircle className="size-4" />
              <AlertDescription>You need to create at least one module before adding lessons.</AlertDescription>
            </Alert>
          ) : lessonsData?.data?.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No lessons found. Create your first lesson.</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Parent Module</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead className="w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lessonsData?.data?.map((lesson) => {
                    const parentModule = modulesData?.data?.find((module) => module._id === lesson.moduleId);
                    const coursesUsingCount = coursesData?.data?.data?.filter(
                      (course) => course.lessonId?._id === lesson._id
                    ).length || 0;
                    const isInUse = lessonsInUse.has(lesson._id);

                    return (
                      <TableRow key={lesson._id}>
                        <TableCell className="font-medium">{lesson.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{parentModule?.name || lesson.moduleName || "-"}</Badge>
                        </TableCell>
                        <TableCell className="capitalize">{lesson.contentType || "video"}</TableCell>
                        <TableCell>{lesson.duration ? `${lesson.duration} min` : "-"}</TableCell>
                        <TableCell>{lesson.order ?? 0}</TableCell>
                        <TableCell>
                          <Badge variant={lesson.status ? "default" : "secondary"}>
                            {lesson.status ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {isInUse ? (
                            <Badge variant="destructive">
                              Used in {coursesUsingCount} {coursesUsingCount === 1 ? "course" : "courses"}
                            </Badge>
                          ) : (
                            <Badge variant="outline">Not in use</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => openEditLesson(lesson)}>
                              <Edit className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteLesson(lesson)}
                              disabled={isInUse}
                              title={isInUse ? "Cannot delete: Lesson is used in courses" : "Delete lesson"}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {lessonsInUse.size > 0 && (
                <Alert className="mt-4">
                  <AlertCircle className="size-4" />
                  <AlertDescription>
                    Some lessons cannot be deleted because they are being used in courses.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={showLessonDialog} onOpenChange={setShowLessonDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingLesson ? "Edit" : "Create"} Lesson</DialogTitle>
            <DialogDescription>{editingLesson ? "Update" : "Add a new"} course lesson</DialogDescription>
          </DialogHeader>
          <LessonForm
            initialValues={lessonForm}
            modules={(modulesData?.data || []).map((module) => ({ _id: module._id, name: module.name }))}
            onCancel={() => setShowLessonDialog(false)}
            onSubmit={async (values) => {
              setLessonForm(values);
              await handleCreateLesson();
            }}
            loading={createLessonMutation.isPending || updateLessonMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
