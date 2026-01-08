"use client";
import CouponsTable from "@/app/(main)/dashboard/_components/promotions/coupons/table";
import BannersTable from "@/app/(main)/dashboard/_components/promotions/banners/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PromotionsPage() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Coupons</CardTitle>
        </CardHeader>
        <CardContent>
          <CouponsTable />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Banners</CardTitle>
        </CardHeader>
        <CardContent>
          <BannersTable />
        </CardContent>
      </Card>
    </div>
  );
}
