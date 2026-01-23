"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import * as Recharts from "recharts";
import { Users, DollarSign, BookOpen } from "lucide-react";

// Mock data for charts
const revenueData = [
  { date: "Jan 1", amount: 2400 },
  { date: "Jan 5", amount: 2210 },
  { date: "Jan 10", amount: 2290 },
  { date: "Jan 15", amount: 2000 },
  { date: "Jan 20", amount: 2181 },
  { date: "Jan 25", amount: 2500 },
  { date: "Jan 30", amount: 2100 },
];

const usersData = [
  { date: "Jan 1", count: 45 },
  { date: "Jan 5", count: 52 },
  { date: "Jan 10", count: 48 },
  { date: "Jan 15", count: 61 },
  { date: "Jan 20", count: 55 },
  { date: "Jan 25", count: 67 },
  { date: "Jan 30", count: 72 },
];

const engagementData = [
  { label: "Course Views", value: 2400 },
  { label: "Enrollments", value: 1398 },
  { label: "Sessions", value: 9800 },
  { label: "Completions", value: 3908 },
  { label: "Ratings", value: 4800 },
];

const coursesData = [
  { label: "Web Development", value: 45 },
  { label: "Mobile Dev", value: 32 },
  { label: "Data Science", value: 28 },
  { label: "Design", value: 20 },
  { label: "Other", value: 15 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Learners</p>
                <h3 className="text-2xl font-bold">2,543</h3>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Mentors</p>
                <h3 className="text-2xl font-bold">384</h3>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <h3 className="text-2xl font-bold">₹58.4K</h3>
              </div>
              <DollarSign className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Courses</p>
                <h3 className="text-2xl font-bold">156</h3>
              </div>
              <BookOpen className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
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
    </div>
  );
}
