"use client";
import { DataTable } from "@/components/data-table/data-table";
import { useTestSeries } from "@/hooks/api/use-test-series";
import { useTestSeriesColumns, type TestSeriesRow } from "./columns";

export default function TestSeriesTable() {
  const { data, isLoading } = useTestSeries();
  const columns = useTestSeriesColumns();
  const rows: TestSeriesRow[] = (data?.data ?? []).map((s: any) => ({
    id: s.id,
    title: s.title,
    createdAt: s.createdAt,
  }));
  return <DataTable columns={columns} data={rows} isLoading={isLoading} />;
}
