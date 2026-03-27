import { Metadata } from "next";

import { ModulesTable } from "@/app/(main)/dashboard/_components/categories/modules-table";

export const metadata: Metadata = {
  title: "Modules",
  description: "Manage course modules",
};

export default function ModulesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Modules</h1>
        <p className="text-muted-foreground mt-2">Manage module level categorization and keep links to subcategories.</p>
      </div>

      <ModulesTable />
    </div>
  );
}
