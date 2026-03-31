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
} from "@/hooks/api";

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
import { CategoryForm, type CategoryFormValues } from "./forms/category-form";
import type { Category } from "@/types/api";

export function CategoriesTable() {
  const { data: categoriesData, isLoading } = useGetAllCategories();
  const { data: subCategoriesData } = useGetAllSubCategories(); // Need to check if category has subcategories

  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  // Check which categories have subcategories
  const categoriesWithSubcategories = useMemo(() => {
    const categoryIds = new Set<string>();
    subCategoriesData?.data?.forEach((subCat) => {
      categoryIds.add(subCat.categoryId);
    });
    return categoryIds;
  }, [subCategoriesData]);

  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [categoryForm, setCategoryForm] = useState<CategoryFormValues>({
    name: "",
    description: "",
    icon: "",
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
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save category");
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

  const canDeleteCategory = (categoryId: string) => {
    return !categoriesWithSubcategories.has(categoryId);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
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
            <>
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
              {categoriesData?.data && categoriesData.data.length > 0 && categoriesWithSubcategories.size > 0 && (
                <Alert className="mt-4">
                  <AlertCircle className="size-4" />
                  <AlertDescription>
                    Some categories cannot be deleted because they have subcategories. Please delete all subcategories first.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </CardContent>
      </Card>

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
    </>
  );
}
