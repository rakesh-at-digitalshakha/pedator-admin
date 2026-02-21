"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import type { EngagementAnalytics } from "@/hooks/api/use-analytics";

interface TopMentorsProps {
  data?: EngagementAnalytics;
  isLoading?: boolean;
}

export function TopMentors({ data, isLoading }: TopMentorsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Mentors</CardTitle>
        <CardDescription>Most popular mentors by bookings and ratings</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-60" />
        ) : data?.data?.popularMentors && data.data.popularMentors.length > 0 ? (
          <div className="space-y-4">
            {data.data.popularMentors.map((mentor, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{mentor.fullName}</p>
                    <p className="text-xs text-muted-foreground">{formatNumber(mentor.bookingCount)} bookings</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-yellow-500">
                    ★ {(mentor.averageRating || 0).toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">Average rating</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-60 flex items-center justify-center text-muted-foreground">
            No data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
