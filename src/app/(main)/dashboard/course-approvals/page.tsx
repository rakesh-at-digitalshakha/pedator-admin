import { Metadata } from "next";

import { CourseApprovalsTable } from "../_components/courses/course-approvals-table";

export const metadata: Metadata = {
  title: "Course Approvals",
  description: "Review and approve pending course applications",
};

export default function CourseApprovalsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Course Approvals</h1>
        <p className="text-muted-foreground mt-2">Review and approve pending course applications</p>
      </div>

      <CourseApprovalsTable />
    </div>
  );
}
