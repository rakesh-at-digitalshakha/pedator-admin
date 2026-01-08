"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { useDeleteCoupon } from "@/hooks/api/use-promotions";

export type CouponRow = { id: string; code: string; discount: number; expiresAt?: string };

export function useCouponColumns(): ColumnDef<CouponRow, any>[] {
  const del = useDeleteCoupon();
  return [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "code", header: "Code" },
    { accessorKey: "discount", header: "Discount %" },
    { accessorKey: "expiresAt", header: "Expires" },
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
