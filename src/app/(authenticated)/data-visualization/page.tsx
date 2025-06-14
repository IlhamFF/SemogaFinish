
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";

const mockData = [
  { id: "TASK-8782", title: "Physics Midterm Grades", status: "Completed", priority: "High", lastUpdated: "2024-07-15" },
  { id: "TASK-7878", title: "Student Attendance Report - June", status: "In Progress", priority: "Medium", lastUpdated: "2024-07-20" },
  { id: "TASK-1234", title: "Math Curriculum Review", status: "Pending", priority: "High", lastUpdated: "2024-07-01" },
  { id: "TASK-4567", title: "School Event Participation", status: "Completed", priority: "Low", lastUpdated: "2024-06-28" },
  { id: "TASK-9876", title: "Library Book Inventory", status: "To Do", priority: "Medium", lastUpdated: "2024-07-22" },
];

const statusVariantMap: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  "Completed": "default",
  "In Progress": "secondary",
  "Pending": "outline",
  "To Do": "destructive",
};

export default function DataVisualizationPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold">Data Visualization</h1>
      <p className="text-muted-foreground">
        Hello {user?.name || user?.email}, here's an overview of relevant data. 
        {user?.role === 'admin' && " You have access to comprehensive system data."}
        {user?.role === 'guru' && " You can view data related to your courses and students."}
        {user?.role === 'siswa' && " You can see your academic progress and course information."}
        {user?.role === 'pimpinan' && " You have access to institutional analytics and reports."}
      </p>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Sample Data Table</CardTitle>
          <CardDescription>This is a placeholder table demonstrating data display capabilities.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead className="text-right">Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariantMap[item.status] || "default"}>{item.status}</Badge>
                  </TableCell>
                  <TableCell>
                     <Badge variant={item.priority === "High" ? "destructive" : item.priority === "Medium" ? "secondary" : "outline"}>
                        {item.priority}
                     </Badge>
                  </TableCell>
                  <TableCell className="text-right">{item.lastUpdated}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

       {/* Placeholder for charts -  can be expanded based on roles */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Data Chart (Placeholder)</CardTitle>
          <CardDescription>A visual representation of data will be shown here.</CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center bg-muted/50 rounded-md">
          <p className="text-muted-foreground">Chart will be displayed here</p>
        </CardContent>
      </Card>
    </div>
  );
}
