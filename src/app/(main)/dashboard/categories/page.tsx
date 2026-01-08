import { Metadata } from "next";

import { CategoriesTable } from "../_components/categories/categories-table";

export const metadata: Metadata = {
  title: "Categories",
  description: "Manage course categories",
};

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Categories</h1>
        <p className="text-muted-foreground mt-2">Manage course categories. Delete all subcategories before deleting a category.</p>
      </div>

      <CategoriesTable />
    </div>
  );
}
