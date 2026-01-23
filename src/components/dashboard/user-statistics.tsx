"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import type { UserGrowthAnalytics } from "@/hooks/api/use-analytics";

interface UserStatisticsProps {
  data?: UserGrowthAnalytics;
  isLoading?: boolean;
}

export function UserStatistics({ data, isLoading }: UserStatisticsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Statistics</CardTitle>
        <CardDescription>Active users and retention</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <>
            <Skeleton className="h-6" />
            <Skeleton className="h-6" />
          </>
        ) : data?.data ? (
          <>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Users</p>
                <p className="text-2xl font-bold">{formatNumber(data.data.totalUsers?.total)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Learners: {formatNumber(data.data.totalUsers?.learners)} | Mentors:{" "}
                  {formatNumber(data.data.totalUsers?.mentors)}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Users</p>
                <p className="text-2xl font-bold">
                  {formatNumber(
                    (data.data.activeUsers?.learners || 0) + (data.data.activeUsers?.mentors || 0)
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Learners: {formatNumber(data.data.activeUsers?.learners)} | Mentors:{" "}
                  {formatNumber(data.data.activeUsers?.mentors)}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Retention Rate</p>
                <p className="text-2xl font-bold">{data.data.retentionRate}</p>
              </div>
            </div>
          </>
        ) : (
          <div className="h-40 flex items-center justify-center text-muted-foreground">
            No data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
