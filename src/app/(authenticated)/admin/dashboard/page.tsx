
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3, Users, Bell, BookOpenText } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

const statCards = [
  { title: "Total Users", value: "150", icon: Users, color: "text-primary", link: ROUTES.ADMIN_USERS },
  { title: "Courses", value: "25", icon: BookOpenText, color: "text-green-500" },
  { title: "Pending Verifications", value: "5", icon: Users, color: "text-yellow-500", link: ROUTES.ADMIN_USERS },
  { title: "System Alerts", value: "2", icon: Bell, color: "text-red-500" },
];

export default function AdminDashboardPage() {
  const { user } = useAuth();

  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return <p>Access Denied. You must be an admin to view this page.</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold">Admin Dashboard</h1>
      <p className="text-muted-foreground">Welcome, {user.name || user.email}! Manage users, settings, and view system overview.</p>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.title} className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              {card.link ? (
                <Link href={card.link} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                  View details &rarr;
                </Link>
              ) : (
                 <p className="text-xs text-muted-foreground">Updated recently</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Overview of recent system events.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-center justify-between">
                <span className="text-sm">New user registered: siswa_baru@example.com</span>
                <span className="text-xs text-muted-foreground">2 mins ago</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-sm">Guru updated profile: guru_hebat@example.com</span>
                <span className="text-xs text-muted-foreground">1 hour ago</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-sm">System maintenance scheduled.</span>
                <span className="text-xs text-muted-foreground">Tomorrow</span>
              </li>
            </ul>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Perform common tasks quickly.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
             <Link href={ROUTES.ADMIN_USERS} className="block">
                <Button variant="outline" className="w-full justify-start text-left h-auto py-3">
                  <Users className="mr-3 h-5 w-5" />
                  <div>
                    <p className="font-semibold">Manage Users</p>
                    <p className="text-xs text-muted-foreground">View, add, or edit users.</p>
                  </div>
                </Button>
             </Link>
             <Button variant="outline" className="w-full justify-start text-left h-auto py-3">
                <BarChart3 className="mr-3 h-5 w-5" />
                 <div>
                    <p className="font-semibold">View Reports</p>
                    <p className="text-xs text-muted-foreground">Access system analytics.</p>
                  </div>
            </Button>
             <Button variant="outline" className="w-full justify-start text-left h-auto py-3">
                <Bell className="mr-3 h-5 w-5" />
                <div>
                    <p className="font-semibold">Send Announcement</p>
                    <p className="text-xs text-muted-foreground">Notify all users.</p>
                  </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

