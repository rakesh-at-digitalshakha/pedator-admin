"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber, formatCurrency } from "@/lib/utils";
import type { DashboardOverview } from "@/hooks/api/use-analytics";

interface KPICardsProps {
  data?: DashboardOverview;
  isLoading?: boolean;
}

export function KPICards({ data, isLoading }: KPICardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  const overview = data?.data?.overview;
  const last24Hours = data?.data?.last24Hours;

  const cards = [
    {
      title: "Total Learners",
      value: formatNumber(overview?.totalLearners),
      change: `+${formatNumber(last24Hours?.newLearners)} today`,
    },
    {
      title: "Total Mentors",
      value: formatNumber(overview?.totalMentors),
      change: `+${formatNumber(last24Hours?.newMentors)} today`,
    },
    {
      title: "Total Courses",
      value: formatNumber(overview?.totalCourses),
      change: `+${formatNumber(last24Hours?.newCourses)} today`,
    },
    {
      title: "Total Revenue",
      value: formatCurrency(overview?.totalRevenue),
      change: "Lifetime earnings",
    },
    {
      title: "Enrollments",
      value: formatNumber(overview?.totalEnrollments),
      change: `+${formatNumber(last24Hours?.newEnrollments)} today`,
    },
    {
      title: "Active Sessions",
      value: formatNumber(overview?.activeSessions),
      change: "Currently active",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{card.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
