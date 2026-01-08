import { Metadata } from "next";

import { BookingsTable } from "../_components/bookings/bookings-table";

export const metadata: Metadata = {
  title: "Bookings Management",
  description: "Manage course bookings and sessions",
};

export default function BookingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bookings Management</h1>
        <p className="text-muted-foreground mt-2">Monitor and manage all course bookings and sessions</p>
      </div>

      <BookingsTable />
    </div>
  );
}
