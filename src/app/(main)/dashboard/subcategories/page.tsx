import { Metadata } from "next";

import { SubcategoriesTable } from "../_components/categories/subcategories-table";

export const metadata: Metadata = {
  title: "Subcategories",
  description: "Manage course subcategories",
};

export default function SubcategoriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Subcategories</h1>
        <p className="text-muted-foreground mt-2">Manage course subcategories. Cannot delete subcategories that are used in courses.</p>
      </div>

      <SubcategoriesTable />
    </div>
  );
}
