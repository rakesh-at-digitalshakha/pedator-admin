import { Metadata } from "next";

import { AllCoursesTable } from "../_components/courses/all-courses-table";

export const metadata: Metadata = {
  title: "All Courses",
  description: "Manage all courses on the platform",
};

export default function AllCoursesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">All Courses</h1>
        <p className="text-muted-foreground mt-2">Manage all courses, view details, edit, and delete courses</p>
      </div>

      <AllCoursesTable />
    </div>
  );
}
