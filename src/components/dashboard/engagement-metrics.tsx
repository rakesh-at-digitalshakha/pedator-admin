"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import type { EngagementAnalytics } from "@/hooks/api/use-analytics";

interface EngagementMetricsProps {
  data?: EngagementAnalytics;
  isLoading?: boolean;
}

export function EngagementMetrics({ data, isLoading }: EngagementMetricsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Engagement Metrics</CardTitle>
        <CardDescription>Key engagement indicators</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <>
            <Skeleton className="h-6" />
            <Skeleton className="h-6" />
            <Skeleton className="h-6" />
          </>
        ) : data?.data ? (
          <>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Session Completion</span>
                <span className="font-semibold">{data.data.sessionCompletionRate}</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${parseFloat(data.data.sessionCompletionRate) || 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-2">Total Stats</div>
              <div className="space-y-1">
                <p className="text-sm">
                  <span className="text-muted-foreground">Bookings:</span>{" "}
                  <span className="font-semibold">{formatNumber(data.data.stats?.totalBookings)}</span>
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Sessions:</span>{" "}
                  <span className="font-semibold">{formatNumber(data.data.stats?.totalSessions)}</span>
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Completed:</span>{" "}
                  <span className="font-semibold">{formatNumber(data.data.stats?.completedSessions)}</span>
                </p>
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
