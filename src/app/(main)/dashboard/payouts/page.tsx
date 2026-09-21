"use client";

import PayoutsTable from "@/app/(main)/dashboard/_components/payouts/table";

export default function PayoutsPage() {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <PayoutsTable />
    </div>
  );
}
