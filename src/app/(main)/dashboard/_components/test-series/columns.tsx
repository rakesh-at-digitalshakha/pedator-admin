"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { useDeleteTestSeries } from "@/hooks/api/use-test-series";

export type TestSeriesRow = { id: string; title?: string; createdAt?: string };

export function useTestSeriesColumns(): ColumnDef<TestSeriesRow, any>[] {
  const del = useDeleteTestSeries();
  return [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "title", header: "Title" },
    { accessorKey: "createdAt", header: "Created" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button size="sm" variant="outline" onClick={() => del.mutate(row.original.id)}>
          Delete
        </Button>
      ),
    },
  ];
}
