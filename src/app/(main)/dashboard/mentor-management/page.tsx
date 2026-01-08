import { Metadata } from "next";

import { AllMentorsTable } from "../_components/mentors/all-mentors-table";

export const metadata: Metadata = {
  title: "Mentors",
  description: "Manage all mentors - view, edit, approve, and delete mentors",
};

export default function MentorManagementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mentors Management</h1>
        <p className="text-muted-foreground mt-2">View and manage all mentors. Edit, approve, reject, or delete mentors.</p>
      </div>

      <AllMentorsTable />
    </div>
  );
}
