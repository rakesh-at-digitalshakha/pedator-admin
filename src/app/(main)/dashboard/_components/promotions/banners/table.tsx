"use client";
import { DataTable } from "@/components/data-table/data-table";
import { useBanners } from "@/hooks/api/use-promotions";
import { useBannerColumns, type BannerRow } from "./columns";

export default function BannersTable() {
  const { data, isLoading } = useBanners();
  const columns = useBannerColumns();
  const apiData = data as any;
  const rows: BannerRow[] = (apiData?.data ?? []).map((b: any) => ({ id: b.id, title: b.title, imageUrl: b.imageUrl }));
  return <DataTable columns={columns} data={rows} isLoading={isLoading} />;
}
