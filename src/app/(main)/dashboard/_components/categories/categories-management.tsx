"use client";

import { useState, useMemo } from "react";
import { Plus, Edit, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import {
  useGetAllCategories,
  useGetAllSubCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CategoryForm, type CategoryFormValues } from "./forms/category-form";
import { SubCategoryForm, type SubCategoryFormValues } from "./forms/subcategory-form";
import type { Category, SubCategory } from "@/types/api";

export function CategoriesManagement() {
  const { data: categoriesData, isLoading: categoriesLoading } = useGetAllCategories();
  const { data: subCategoriesData, isLoading: subCategoriesLoading } = useGetAllSubCategories();
  const { data: coursesData } = useGetAllCourses({ limit: 10000 }); // Fetch all courses to check usage

  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();
  const createSubCategoryMutation = useCreateSubCategory();
  const updateSubCategoryMutation = useUpdateSubCategory();
  const deleteSubCategoryMutation = useDeleteSubCategory();

  // Check which categories have subcategories
  const categoriesWithSubcategories = useMemo(() => {
    const categoryIds = new Set<string>();
    subCategoriesData?.data?.forEach((subCat) => {
      categoryIds.add(subCat.categoryId);
    });
    return categoryIds;
  }, [subCategoriesData]);

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

  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showSubCategoryDialog, setShowSubCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);

  const [categoryForm, setCategoryForm] = useState<CategoryFormValues>({
    name: "",
    description: "",
    icon: "",
    status: true,
  });

  const [subCategoryForm, setSubCategoryForm] = useState<SubCategoryFormValues>({
    categoryId: "",
    name: "",
    description: "",
    status: true,
  });

  const handleCreateCategory = async (values: CategoryFormValues) => {
    try {
      if (editingCategory) {
        await updateCategoryMutation.mutateAsync({
          id: editingCategory._id,
          data: values,
        });
        toast.success("Category updated successfully");
      } else {
        await createCategoryMutation.mutateAsync(values);
        toast.success("Category created successfully");
      }
      setShowCategoryDialog(false);
      setCategoryForm({ name: "", description: "", icon: "", status: true });
      setEditingCategory(null);
    } catch (error) {
      toast.error("Failed to save category");
    }
  };

  const handleCreateSubCategory = async (values: SubCategoryFormValues) => {
    try {
      if (editingSubCategory) {
        await updateSubCategoryMutation.mutateAsync({
          id: editingSubCategory._id,
          data: values,
        });
        toast.success("Sub-category updated successfully");
      } else {
        await createSubCategoryMutation.mutateAsync(values);
        toast.success("Sub-category created successfully");
      }
      setShowSubCategoryDialog(false);
      setSubCategoryForm({ categoryId: "", name: "", description: "", status: true });
      setEditingSubCategory(null);
    } catch (error) {
      toast.error("Failed to save sub-category");
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    // Check if category has subcategories
    if (categoriesWithSubcategories.has(category._id)) {
      toast.error("Cannot delete category. Please delete all subcategories first.");
      return;
    }

    if (confirm(`Are you sure you want to delete "${category.name}"?`)) {
      try {
        await deleteCategoryMutation.mutateAsync(category._id);
        toast.success("Category deleted successfully");
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to delete category");
      }
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

  const openEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || "",
      icon: category.icon || "",
      status: category.status ?? true,
    });
    setShowCategoryDialog(true);
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

  const canDeleteCategory = (categoryId: string) => {
    return !categoriesWithSubcategories.has(categoryId);
  };

  const canDeleteSubCategory = (subCategoryId: string) => {
    return !subcategoriesInUse.has(subCategoryId);
  };

  if (categoriesLoading || subCategoriesLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Categories Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Categories</h2>
          <p className="text-muted-foreground">Manage course categories. Delete all subcategories before deleting a category.</p>
        </div>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Categories</CardTitle>
                <CardDescription>Create and manage course categories</CardDescription>
              </div>
              <Button
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryForm({ name: "", description: "", icon: "", status: true });
                  setShowCategoryDialog(true);
                }}
              >
                <Plus className="mr-2 size-4" />
                Add Category
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {categoriesData?.data?.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">No categories found. Create your first category.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Subcategories</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoriesData?.data?.map((category) => {
                    const hasSubcategories = categoriesWithSubcategories.has(category._id);
                    const subCategoriesCount = subCategoriesData?.data?.filter(
                      (sc) => sc.categoryId === category._id
                    ).length || 0;
                    
                    return (
                      <TableRow key={category._id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell className="text-muted-foreground max-w-md truncate">
                          {category.description || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={hasSubcategories ? "default" : "outline"}>
                            {subCategoriesCount} {subCategoriesCount === 1 ? "subcategory" : "subcategories"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={category.status ? "default" : "secondary"}>
                            {category.status ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => openEditCategory(category)}>
                              <Edit className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteCategory(category)}
                              disabled={!canDeleteCategory(category._id)}
                              title={!canDeleteCategory(category._id) ? "Cannot delete: Category has subcategories" : "Delete category"}
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
            )}
            {categoriesData?.data && categoriesData.data.length > 0 && categoriesWithSubcategories.size > 0 && (
              <Alert className="mt-4">
                <AlertCircle className="size-4" />
                <AlertDescription>
                  Some categories cannot be deleted because they have subcategories. Please delete all subcategories first.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Subcategories Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Subcategories</h2>
          <p className="text-muted-foreground">Manage course subcategories. Cannot delete subcategories that are used in courses.</p>
        </div>
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
      </div>

      {/* Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit" : "Create"} Category</DialogTitle>
            <DialogDescription>{editingCategory ? "Update" : "Add a new"} course category</DialogDescription>
          </DialogHeader>
          <CategoryForm
            initialValues={categoryForm}
            onCancel={() => setShowCategoryDialog(false)}
            onSubmit={async (values) => {
              await handleCreateCategory(values);
            }}
            loading={createCategoryMutation.isPending || updateCategoryMutation.isPending}
          />
        </DialogContent>
      </Dialog>

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
              await handleCreateSubCategory(values);
            }}
            loading={createSubCategoryMutation.isPending || updateSubCategoryMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
