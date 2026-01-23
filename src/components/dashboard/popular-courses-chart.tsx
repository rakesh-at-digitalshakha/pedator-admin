"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { EngagementAnalytics } from "@/hooks/api/use-analytics";

interface PopularCoursesChartProps {
  data?: EngagementAnalytics;
  isLoading?: boolean;
}

export function PopularCoursesChart({ data, isLoading }: PopularCoursesChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Courses</CardTitle>
        <CardDescription>Most popular courses by enrollment</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-80" />
        ) : data?.data?.popularCourses && data.data.popularCourses.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.data.popularCourses}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="title" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="enrollmentCount" fill="#f59e0b" name="Enrollments" />
              <Bar dataKey="averageRating" fill="#10b981" name="Avg Rating" />
            </BarChart>
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
