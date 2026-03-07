import { RolesTable } from "../_components/roles/roles-table";

export default function RoleManagementPage() {
  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div>
        <h1 className="text-2xl font-bold">Role Management</h1>
        <p className="text-muted-foreground">
          Create and manage dynamic roles with granular resource-level permissions (create, read, update, delete,
          download).
        </p>
      </div>
      <RolesTable />
    </div>
  );
}
