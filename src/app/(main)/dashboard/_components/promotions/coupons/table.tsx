"use client";
import { useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { useCoupons, useCreateCoupon } from "@/hooks/api/use-promotions";
import { useCouponColumns, type CouponRow } from "./columns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function CouponsTable() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useCoupons({ search });
  const create = useCreateCoupon();
  const columns = useCouponColumns();
  const rows: CouponRow[] = (data?.data ?? []).map((c: any) => ({
    id: c.id,
    code: c.code,
    discount: c.discount ?? 0,
    expiresAt: c.expiresAt,
  }));
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search coupons"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
        <Button onClick={() => create.mutate({ code: "NEW10", discount: 10 })}>Create Sample</Button>
      </div>
      <DataTable columns={columns} data={rows} isLoading={isLoading} />
    </div>
  );
}
