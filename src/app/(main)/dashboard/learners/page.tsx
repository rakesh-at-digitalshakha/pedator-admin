import { Metadata } from "next";

import { LearnersTable } from "../_components/learners/learners-table";

export const metadata: Metadata = {
  title: "Learners Management",
  description: "Manage learners and their enrollments",
};

export default function LearnersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Learners Management</h1>
        <p className="text-muted-foreground mt-2">View and manage all learners registered on the platform</p>
      </div>

      <LearnersTable />
    </div>
  );
}
