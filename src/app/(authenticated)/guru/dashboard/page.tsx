
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, Users, MessageSquare, CalendarDays } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const guruStats = [
  { title: "My Courses", value: "5", icon: BookOpen, color: "text-primary" },
  { title: "Total Students", value: "120", icon: Users, color: "text-green-500" },
  { title: "Unread Messages", value: "3", icon: MessageSquare, color: "text-yellow-500" },
  { title: "Upcoming Deadlines", value: "2", icon: CalendarDays, color: "text-red-500" },
];

export default function GuruDashboardPage() {
  const { user } = useAuth();

  if (!user || (user.role !== 'guru' && user.role !== 'superadmin')) {
    return <p>Access Denied. You must be a Guru to view this page.</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold">Guru Dashboard</h1>
      <p className="text-muted-foreground">Welcome, {user.name || user.email}! Manage your courses, students, and assignments.</p>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {guruStats.map((card) => (
          <Card key={card.title} className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">View details &rarr;</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
            <CardDescription>Overview of recent student submissions.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-center justify-between">
                <span className="text-sm">Mathematics - Assignment 1 by Siswa Rajin</span>
                <span className="text-xs text-muted-foreground">Graded</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-sm">Physics - Lab Report by Siswa Cerdas</span>
                <span className="text-xs text-red-500">Needs Grading</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-sm">Chemistry - Quiz 2 by Siswa Tekun</span>
                 <span className="text-xs text-muted-foreground">Graded</span>
              </li>
            </ul>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Announcements</CardTitle>
            <CardDescription>Latest school or course announcements.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="bg-accent/50 p-4 rounded-md border border-accent">
                <h3 className="font-semibold text-accent-foreground">Mid-term Exam Schedule Released</h3>
                <p className="text-sm text-muted-foreground mt-1">Please check the notice board for the detailed mid-term exam schedule.</p>
                <p className="text-xs text-muted-foreground mt-2">Posted by Admin - 2 days ago</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
