import { Metadata } from "next";

import { MentorsTable } from "../_components/mentors/mentors-table";

export const metadata: Metadata = {
  title: "Mentor Approvals",
  description: "Review and approve mentor registration requests",
};

export default function MentorApprovalsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mentor Approvals</h1>
        <p className="text-muted-foreground mt-2">Review and approve pending mentor registration requests</p>
      </div>
      <MentorsTable />
    </div>
  );
}
