import { AdminUsersTable } from "../_components/admins/admin-users-table";

export default function AdminManagementPage() {
  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Management</h1>
        <p className="text-muted-foreground">Manage admin users and their permissions</p>
      </div>
      <AdminUsersTable />
    </div>
  );
}
