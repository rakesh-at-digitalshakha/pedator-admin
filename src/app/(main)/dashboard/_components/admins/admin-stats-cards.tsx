"use client";

import { TrendingDown, TrendingUp, Users, UserCheck, DollarSign, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAdminStats } from "@/hooks/api";

export function AdminStatsCards() {
  const { data: stats, isLoading, error } = useGetAdminStats();

  if (error) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardDescription className="text-destructive">Failed to load statistics</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  const statsData = stats?.data;

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Mentors</CardDescription>
          <CardTitle className="flex items-center gap-2 text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            <Users className="text-muted-foreground size-5" />
            {statsData?.totalMentors?.toLocaleString() ?? 0}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <UserCheck className="size-3" />
              Active
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">Total registered mentors</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Pending Approvals</CardDescription>
          <CardTitle className="flex items-center gap-2 text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            <Users className="text-muted-foreground size-5" />
            {statsData?.pendingMentors?.toLocaleString() ?? 0}
          </CardTitle>
          <CardAction>
            {(statsData?.pendingMentors ?? 0) > 0 ? (
              <Badge variant="secondary">Action Required</Badge>
            ) : (
              <Badge variant="outline">All Clear</Badge>
            )}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">Mentors awaiting approval</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Learners</CardDescription>
          <CardTitle className="flex items-center gap-2 text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            <Users className="text-muted-foreground size-5" />
            {statsData?.totalLearners?.toLocaleString() ?? 0}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUp className="size-3" />
              Active
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">Total registered learners</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Revenue</CardDescription>
          <CardTitle className="flex items-center gap-2 text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            <DollarSign className="text-muted-foreground size-5" />${statsData?.totalRevenue?.toLocaleString() ?? 0}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUp className="size-3" />
              All Time
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">Total platform revenue</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Monthly Revenue</CardDescription>
          <CardTitle className="flex items-center gap-2 text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            <DollarSign className="text-muted-foreground size-5" />${statsData?.monthlyRevenue?.toLocaleString() ?? 0}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUp className="size-3" />
              Last 30 Days
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">Revenue from last 30 days</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Platform Balance</CardDescription>
          <CardTitle className="flex items-center gap-2 text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            <Wallet className="text-muted-foreground size-5" />${statsData?.platformBalance?.toLocaleString() ?? 0}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <Wallet className="size-3" />
              Available
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">Total admin wallet balance</div>
        </CardFooter>
      </Card>
    </div>
  );
}
