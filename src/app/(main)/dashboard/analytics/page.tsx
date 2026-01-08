"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import * as Recharts from "recharts";
import {
  useRevenueAnalytics,
  useUserAnalytics,
  useEngagementAnalytics,
  useCourseAnalytics,
} from "@/hooks/api/use-analytics";

export default function AnalyticsPage() {
  const revenue = useRevenueAnalytics({ range: "30d" });
  const users = useUserAnalytics({ range: "30d" });
  const engagement = useEngagementAnalytics({ range: "30d" });
  const courses = useCourseAnalytics({ range: "30d" });

  const revenueData = (revenue.data?.data ?? []).map((d: any) => ({
    date: d.date ?? d.day ?? "",
    amount: d.amount ?? d.total ?? 0,
  }));
  const usersData = (users.data?.data ?? []).map((d: any) => ({
    date: d.date ?? d.day ?? "",
    count: d.count ?? d.total ?? 0,
  }));
  const engagementData = (engagement.data?.data ?? []).map((d: any) => ({
    label: d.label ?? d.metric ?? "",
    value: d.value ?? 0,
  }));
  const coursesData = (courses.data?.data ?? []).map((d: any) => ({
    label: d.category ?? d.label ?? "",
    value: d.value ?? d.count ?? 0,
  }));

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Revenue (Last 30 days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{ amount: { label: "Amount", color: "hsl(222.2, 47.4%, 11.2%)" } }}>
            <Recharts.LineChart data={revenueData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <Recharts.CartesianGrid strokeDasharray="3 3" />
              <Recharts.XAxis dataKey="date" />
              <Recharts.YAxis />
              <Recharts.Line type="monotone" dataKey="amount" stroke="var(--color-amount)" dot={false} />
              <Recharts.Tooltip />
            </Recharts.LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>New Users (Last 30 days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{ count: { label: "Users", color: "hsl(221, 83%, 53%)" } }}>
            <Recharts.BarChart data={usersData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <Recharts.CartesianGrid strokeDasharray="3 3" />
              <Recharts.XAxis dataKey="date" />
              <Recharts.YAxis />
              <Recharts.Bar dataKey="count" fill="var(--color-count)" />
              <Recharts.Tooltip />
            </Recharts.BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Engagement Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{ value: { label: "Value", color: "hsl(142, 76%, 36%)" } }}>
            <Recharts.BarChart data={engagementData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <Recharts.CartesianGrid strokeDasharray="3 3" />
              <Recharts.XAxis dataKey="label" />
              <Recharts.YAxis />
              <Recharts.Bar dataKey="value" fill="var(--color-value)" />
              <Recharts.Tooltip />
            </Recharts.BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Courses by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{ value: { label: "Courses", color: "hsl(27, 96%, 61%)" } }}>
            <Recharts.BarChart data={coursesData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <Recharts.CartesianGrid strokeDasharray="3 3" />
              <Recharts.XAxis dataKey="label" />
              <Recharts.YAxis />
              <Recharts.Bar dataKey="value" fill="var(--color-value)" />
              <Recharts.Tooltip />
            </Recharts.BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
