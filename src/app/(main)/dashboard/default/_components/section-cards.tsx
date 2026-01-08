"use client";

import { TrendingUp, Users, BookOpen, DollarSign } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardOverview } from "@/hooks/api/use-analytics";

export function SectionCards() {
  const { data: overview, isLoading, error } = useDashboardOverview();

  if (error) {
    return (
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <Card className="col-span-full">
          <CardHeader>
            <CardDescription className="text-destructive">Failed to load dashboard data</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="@container/card">
            <CardHeader>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32 mt-2" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  const data = overview?.data;
  const totalUsers = (data?.overview.totalLearners || 0) + (data?.overview.totalMentors || 0);
  const newUsers24h = (data?.last24Hours.newLearners || 0) + (data?.last24Hours.newMentors || 0);

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Revenue</CardDescription>
          <CardTitle className="flex items-center gap-2 text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            <DollarSign className="size-5 text-muted-foreground" />
            ${(data?.overview.totalRevenue || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUp className="size-3" />
              All Time
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Total platform revenue <TrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">From all completed transactions</div>
        </CardFooter>
      </Card>
      
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Users</CardDescription>
          <CardTitle className="flex items-center gap-2 text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            <Users className="size-5 text-muted-foreground" />
            {totalUsers.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {newUsers24h > 0 ? (
                <>
                  <TrendingUp className="size-3" />
                  +{newUsers24h} today
                </>
              ) : (
                "Active"
              )}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {data?.overview.totalLearners || 0} Learners, {data?.overview.totalMentors || 0} Mentors
          </div>
          <div className="text-muted-foreground">
            {newUsers24h > 0 ? `${newUsers24h} new users in last 24 hours` : "Total registered users"}
          </div>
        </CardFooter>
      </Card>
      
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Courses</CardDescription>
          <CardTitle className="flex items-center gap-2 text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            <BookOpen className="size-5 text-muted-foreground" />
            {(data?.overview.totalCourses || 0).toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {data?.pendingApprovals.courses ? (
                <>
                  {data.pendingApprovals.courses} pending
                </>
              ) : (
                "Active"
              )}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {data?.last24Hours.newCourses || 0} new courses today
          </div>
          <div className="text-muted-foreground">
            {data?.overview.totalEnrollments || 0} total enrollments
          </div>
        </CardFooter>
      </Card>
      
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Pending Approvals</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {((data?.pendingApprovals.mentors || 0) + (data?.pendingApprovals.courses || 0)).toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              Requires attention
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {data?.pendingApprovals.mentors || 0} mentors, {data?.pendingApprovals.courses || 0} courses
          </div>
          <div className="text-muted-foreground">Awaiting admin review</div>
        </CardFooter>
      </Card>
    </div>
  );
}
