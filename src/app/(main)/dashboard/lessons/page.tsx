import { Metadata } from "next";

import { LessonsTable } from "@/app/(main)/dashboard/_components/categories/lessons-table";

export const metadata: Metadata = {
  title: "Lessons",
  description: "Manage course lessons",
};

export default function LessonsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Lessons</h1>
        <p className="text-muted-foreground mt-2">Manage lesson level categorization and keep links to modules.</p>
      </div>

      <LessonsTable />
    </div>
  );
}
