

"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import {
  useDashboardOverview,
  useRevenueAnalytics,
  useUserAnalytics,
  useEngagementAnalytics,
  useCourseAnalytics,
} from "@/hooks/api/use-analytics";
import { KPICards } from "@/components/dashboard/kpi-cards";
import { RevenueCharts } from "@/components/dashboard/revenue-charts";
import { UserGrowthChart } from "@/components/dashboard/user-growth-chart";
import { PopularCoursesChart } from "@/components/dashboard/popular-courses-chart";
import { CourseStatusChart } from "@/components/dashboard/course-status-chart";
import { EngagementMetrics } from "@/components/dashboard/engagement-metrics";
import { UserStatistics } from "@/components/dashboard/user-statistics";
import { TopMentors } from "@/components/dashboard/top-mentors";

export default function DashboardPage() {
  const { data: overview, isLoading: overviewLoading, error: overviewError } = useDashboardOverview();
  const { data: revenue, isLoading: revenueLoading } = useRevenueAnalytics();
  const { data: userGrowth, isLoading: userLoading } = useUserAnalytics();
  const { data: engagement, isLoading: engagementLoading } = useEngagementAnalytics();
  const { data: courseAnalytics, isLoading: courseLoading } = useCourseAnalytics();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's your analytics overview.</p>
      </div>

      {/* Error Alert */}
      {overviewError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load dashboard data. Please try refreshing the page.</AlertDescription>
        </Alert>
      )}

      {/* KPI Cards */}
      <KPICards data={overview} isLoading={overviewLoading} />

      {/* Revenue Charts */}
      <RevenueCharts data={revenue} isLoading={revenueLoading} />

      {/* User Growth and Popular Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UserGrowthChart data={userGrowth} isLoading={userLoading} />
        <PopularCoursesChart data={engagement} isLoading={engagementLoading} />
      </div>

      {/* Course Status, Engagement Metrics, and User Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CourseStatusChart data={courseAnalytics} isLoading={courseLoading} />
        <EngagementMetrics data={engagement} isLoading={engagementLoading} />
        <UserStatistics data={userGrowth} isLoading={userLoading} />
      </div>

      {/* Top Mentors */}
      <TopMentors data={engagement} isLoading={engagementLoading} />
    </div>
  );
}