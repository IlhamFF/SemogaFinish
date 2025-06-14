
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, TrendingUp, DollarSign, BookOpenCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

const pimpinanStats = [
  { title: "Total Students", value: "1250", icon: Users, color: "text-primary", change: "+5% from last month" },
  { title: "Teacher Performance", value: "92%", icon: TrendingUp, color: "text-green-500", change: "+2% from last quarter" },
  { title: "Budget Utilization", value: "78%", icon: DollarSign, color: "text-yellow-500", change: "On track" },
  { title: "Curriculum Completion", value: "85%", icon: BookOpenCheck, color: "text-indigo-500", change: "Target: 90%" },
];

const enrollmentData = [
  { month: "Jan", students: 800 },
  { month: "Feb", students: 850 },
  { month: "Mar", students: 900 },
  { month: "Apr", students: 920 },
  { month: "May", students: 950 },
  { month: "Jun", students: 1000 },
];
const chartConfig = {
  students: {
    label: "Students",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;


export default function PimpinanDashboardPage() {
  const { user } = useAuth();

  if (!user || (user.role !== 'pimpinan' && user.role !== 'superadmin')) {
    return <p>Access Denied. You must be a Pimpinan to view this page.</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold">Pimpinan Dashboard</h1>
      <p className="text-muted-foreground">Welcome, {user.name || user.email}! Overview of institutional performance and key metrics.</p>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {pimpinanStats.map((card) => (
          <Card key={card.title} className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-1">
        <Card className="shadow-lg col-span-1">
          <CardHeader>
            <CardTitle>Student Enrollment Trend</CardTitle>
            <CardDescription>Monthly student enrollment over the past 6 months.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer config={chartConfig} className="w-full h-full">
              <BarChart accessibilityLayer data={enrollmentData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <XAxis dataKey="month" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="students" fill="var(--color-students)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
       <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Key Performance Indicators (KPIs)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <h3 className="font-semibold">Graduation Rate</h3>
                    <p className="text-2xl text-green-600">88%</p>
                    <p className="text-xs text-muted-foreground">+3% from last year</p>
                </div>
                 <div>
                    <h3 className="font-semibold">Student Retention</h3>
                    <p className="text-2xl text-primary">95%</p>
                    <p className="text-xs text-muted-foreground">Stable</p>
                </div>
                 <div>
                    <h3 className="font-semibold">Faculty Satisfaction</h3>
                    <p className="text-2xl text-yellow-600">4.2 / 5.0</p>
                    <p className="text-xs text-muted-foreground">Survey Q2 2024</p>
                </div>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
