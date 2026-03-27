"use client";

import { useMemo, useState } from "react";
import { AlertCircle, Edit, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  useCreateModule,
  useDeleteModule,
  useGetAllModules,
  useGetAllSubCategories,
  useGetAllCourses,
  useUpdateModule,
} from "@/hooks/api";
import type { CourseModule } from "@/types/api";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { ModuleForm, type ModuleFormValues } from "./forms/module-form";

export function ModulesTable() {
  const { data: modulesData, isLoading: modulesLoading } = useGetAllModules();
  const { data: subCategoriesData, isLoading: subCategoriesLoading } = useGetAllSubCategories();
  const { data: coursesData } = useGetAllCourses({ limit: 10000 });

  const createModuleMutation = useCreateModule();
  const updateModuleMutation = useUpdateModule();
  const deleteModuleMutation = useDeleteModule();

  const modulesInUse = useMemo(() => {
    const moduleIds = new Set<string>();
    coursesData?.data?.data?.forEach((course) => {
      if (course.moduleId?._id) {
        moduleIds.add(course.moduleId._id);
      }
    });
    return moduleIds;
  }, [coursesData]);

  const [showModuleDialog, setShowModuleDialog] = useState(false);
  const [editingModule, setEditingModule] = useState<CourseModule | null>(null);
  const [moduleForm, setModuleForm] = useState<ModuleFormValues>({
    subCategoryId: "",
    name: "",
    description: "",
    order: 0,
    status: true,
  });

  const handleCreateModule = async () => {
    try {
      if (editingModule) {
        await updateModuleMutation.mutateAsync({
          id: editingModule._id,
          data: moduleForm,
        });
        toast.success("Module updated successfully");
      } else {
        await createModuleMutation.mutateAsync(moduleForm);
        toast.success("Module created successfully");
      }
      setShowModuleDialog(false);
      setEditingModule(null);
      setModuleForm({ subCategoryId: "", name: "", description: "", order: 0, status: true });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save module");
    }
  };

  const handleDeleteModule = async (module: CourseModule) => {
    if (modulesInUse.has(module._id)) {
      toast.error("Cannot delete module. It is being used in one or more courses.");
      return;
    }

    if (confirm(`Are you sure you want to delete \"${module.name}\"?`)) {
      try {
        await deleteModuleMutation.mutateAsync(module._id);
        toast.success("Module deleted successfully");
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to delete module");
      }
    }
  };

  const openEditModule = (module: CourseModule) => {
    setEditingModule(module);
    setModuleForm({
      subCategoryId: module.subCategoryId,
      name: module.name,
      description: module.description || "",
      order: module.order ?? 0,
      status: module.status ?? true,
    });
    setShowModuleDialog(true);
  };

  if (modulesLoading || subCategoriesLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Modules</CardTitle>
              <CardDescription>Create and manage course modules</CardDescription>
            </div>
            <Button
              onClick={() => {
                setEditingModule(null);
                setModuleForm({ subCategoryId: "", name: "", description: "", order: 0, status: true });
                setShowModuleDialog(true);
              }}
              disabled={!subCategoriesData?.data?.length}
              title={!subCategoriesData?.data?.length ? "Create a subcategory first" : ""}
            >
              <Plus className="mr-2 size-4" />
              Add Module
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!subCategoriesData?.data?.length ? (
            <Alert>
              <AlertCircle className="size-4" />
              <AlertDescription>You need to create at least one subcategory before adding modules.</AlertDescription>
            </Alert>
          ) : modulesData?.data?.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No modules found. Create your first module.</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Parent Subcategory</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead className="w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modulesData?.data?.map((module) => {
                    const parentSubCategory = subCategoriesData?.data?.find((subCategory) => subCategory._id === module.subCategoryId);
                    const coursesUsingCount = coursesData?.data?.data?.filter(
                      (course) => course.moduleId?._id === module._id
                    ).length || 0;
                    const isInUse = modulesInUse.has(module._id);

                    return (
                      <TableRow key={module._id}>
                        <TableCell className="font-medium">{module.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{parentSubCategory?.name || module.subCategoryName || "-"}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-md truncate">{module.description || "-"}</TableCell>
                        <TableCell>{module.order ?? 0}</TableCell>
                        <TableCell>
                          <Badge variant={module.status ? "default" : "secondary"}>
                            {module.status ? "Active" : "Inactive"}
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
                            <Button variant="ghost" size="icon" onClick={() => openEditModule(module)}>
                              <Edit className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteModule(module)}
                              disabled={isInUse}
                              title={isInUse ? "Cannot delete: Module is used in courses" : "Delete module"}
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
              {modulesInUse.size > 0 && (
                <Alert className="mt-4">
                  <AlertCircle className="size-4" />
                  <AlertDescription>
                    Some modules cannot be deleted because they are being used in courses.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={showModuleDialog} onOpenChange={setShowModuleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingModule ? "Edit" : "Create"} Module</DialogTitle>
            <DialogDescription>{editingModule ? "Update" : "Add a new"} course module</DialogDescription>
          </DialogHeader>
          <ModuleForm
            initialValues={moduleForm}
            subCategories={(subCategoriesData?.data || []).map((subCategory) => ({
              _id: subCategory._id,
              name: subCategory.name,
            }))}
            onCancel={() => setShowModuleDialog(false)}
            onSubmit={async (values) => {
              setModuleForm(values);
              await handleCreateModule();
            }}
            loading={createModuleMutation.isPending || updateModuleMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
