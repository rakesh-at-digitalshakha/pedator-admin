"use client";

import { useState, useMemo } from "react";
import { Plus, Edit, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import {
  useGetAllCategories,
  useGetAllSubCategories,
  useCreateSubCategory,
  useUpdateSubCategory,
  useDeleteSubCategory,
} from "@/hooks/api";
import { useGetAllCourses } from "@/hooks/api";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SubCategoryForm, type SubCategoryFormValues } from "./forms/subcategory-form";
import type { SubCategory } from "@/types/api";

export function SubcategoriesTable() {
  const { data: categoriesData, isLoading: categoriesLoading } = useGetAllCategories();
  const { data: subCategoriesData, isLoading: subCategoriesLoading } = useGetAllSubCategories();
  const { data: coursesData } = useGetAllCourses({ limit: 10000 }); // Fetch all courses to check usage

  const createSubCategoryMutation = useCreateSubCategory();
  const updateSubCategoryMutation = useUpdateSubCategory();
  const deleteSubCategoryMutation = useDeleteSubCategory();

  // Check which subcategories are used in courses
  const subcategoriesInUse = useMemo(() => {
    const subCatIds = new Set<string>();
    coursesData?.data?.data?.forEach((course) => {
      if (course.subCategoryId?._id) {
        subCatIds.add(course.subCategoryId._id);
      }
    });
    return subCatIds;
  }, [coursesData]);

  const [showSubCategoryDialog, setShowSubCategoryDialog] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);

  const [subCategoryForm, setSubCategoryForm] = useState<SubCategoryFormValues>({
    categoryId: "",
    name: "",
    description: "",
    status: true,
  });

  const handleCreateSubCategory = async () => {
    try {
      if (editingSubCategory) {
        await updateSubCategoryMutation.mutateAsync({
          id: editingSubCategory._id,
          data: subCategoryForm,
        });
        toast.success("Sub-category updated successfully");
      } else {
        await createSubCategoryMutation.mutateAsync(subCategoryForm);
        toast.success("Sub-category created successfully");
      }
      setShowSubCategoryDialog(false);
      setSubCategoryForm({ categoryId: "", name: "", description: "", status: true });
      setEditingSubCategory(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save sub-category");
    }
  };

  const handleDeleteSubCategory = async (subCategory: SubCategory) => {
    // Check if subcategory is used in courses
    if (subcategoriesInUse.has(subCategory._id)) {
      toast.error("Cannot delete subcategory. It is being used in one or more courses.");
      return;
    }

    if (confirm(`Are you sure you want to delete "${subCategory.name}"?`)) {
      try {
        await deleteSubCategoryMutation.mutateAsync(subCategory._id);
        toast.success("Sub-category deleted successfully");
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to delete sub-category");
      }
    }
  };

  const openEditSubCategory = (subCategory: SubCategory) => {
    setEditingSubCategory(subCategory);
    setSubCategoryForm({
      categoryId: subCategory.categoryId,
      name: subCategory.name,
      description: subCategory.description || "",
      status: subCategory.status ?? true,
    });
    setShowSubCategoryDialog(true);
  };

  const canDeleteSubCategory = (subCategoryId: string) => {
    return !subcategoriesInUse.has(subCategoryId);
  };

  if (categoriesLoading || subCategoriesLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Subcategories</CardTitle>
              <CardDescription>Create and manage course subcategories</CardDescription>
            </div>
            <Button
              onClick={() => {
                setEditingSubCategory(null);
                setSubCategoryForm({ categoryId: "", name: "", description: "", status: true });
                setShowSubCategoryDialog(true);
              }}
              disabled={!categoriesData?.data || categoriesData.data.length === 0}
              title={!categoriesData?.data || categoriesData.data.length === 0 ? "Create a category first" : ""}
            >
              <Plus className="mr-2 size-4" />
              Add Subcategory
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!categoriesData?.data || categoriesData.data.length === 0 ? (
            <Alert>
              <AlertCircle className="size-4" />
              <AlertDescription>
                You need to create at least one category before adding subcategories.
              </AlertDescription>
            </Alert>
          ) : subCategoriesData?.data?.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No subcategories found. Create your first subcategory.</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Parent Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead className="w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subCategoriesData?.data?.map((subCategory) => {
                    const parentCategory = categoriesData?.data?.find((c) => c._id === subCategory.categoryId);
                    const isInUse = subcategoriesInUse.has(subCategory._id);
                    const coursesUsingCount = coursesData?.data?.data?.filter(
                      (course) => course.subCategoryId?._id === subCategory._id
                    ).length || 0;
                    
                    return (
                      <TableRow key={subCategory._id}>
                        <TableCell className="font-medium">{subCategory.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{parentCategory?.name || "-"}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-md truncate">
                          {subCategory.description || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={subCategory.status ? "default" : "secondary"}>
                            {subCategory.status ? "Active" : "Inactive"}
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
                            <Button variant="ghost" size="icon" onClick={() => openEditSubCategory(subCategory)}>
                              <Edit className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteSubCategory(subCategory)}
                              disabled={!canDeleteSubCategory(subCategory._id)}
                              title={!canDeleteSubCategory(subCategory._id) ? "Cannot delete: Subcategory is used in courses" : "Delete subcategory"}
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
              {subcategoriesInUse.size > 0 && (
                <Alert className="mt-4">
                  <AlertCircle className="size-4" />
                  <AlertDescription>
                    Some subcategories cannot be deleted because they are being used in courses. Remove them from courses first.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Sub-Category Dialog */}
      <Dialog open={showSubCategoryDialog} onOpenChange={setShowSubCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSubCategory ? "Edit" : "Create"} Sub-Category</DialogTitle>
            <DialogDescription>{editingSubCategory ? "Update" : "Add a new"} course sub-category</DialogDescription>
          </DialogHeader>
          <SubCategoryForm
            initialValues={subCategoryForm}
            categories={categoriesData?.data || []}
            onCancel={() => setShowSubCategoryDialog(false)}
            onSubmit={async (values) => {
              setSubCategoryForm(values);
              await handleCreateSubCategory();
            }}
            loading={createSubCategoryMutation.isPending || updateSubCategoryMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
