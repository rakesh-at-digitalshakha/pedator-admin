"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { useDeleteBanner } from "@/hooks/api/use-promotions";

export type BannerRow = { id: string; title?: string; imageUrl?: string };

export function useBannerColumns(): ColumnDef<BannerRow, any>[] {
  const del = useDeleteBanner();
  return [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "title", header: "Title" },
    { accessorKey: "imageUrl", header: "Image" },
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
