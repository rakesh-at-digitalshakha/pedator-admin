"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { CoursePerformanceAnalytics } from "@/hooks/api/use-analytics";

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#ec4899"];

interface CourseStatusChartProps {
  data?: CoursePerformanceAnalytics;
  isLoading?: boolean;
}

export function CourseStatusChart({ data, isLoading }: CourseStatusChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Status</CardTitle>
        <CardDescription>Distribution of course approvals</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-80" />
        ) : data?.data?.courseStats ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: "Approved", value: data.data.courseStats.approved },
                  { name: "Pending", value: data.data.courseStats.pending },
                  { name: "Rejected", value: data.data.courseStats.rejected },
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            No data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
