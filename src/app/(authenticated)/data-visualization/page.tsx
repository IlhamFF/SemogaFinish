
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { BarChart, Users, BookOpen, Activity, TrendingUp, CheckCircle, PieChart as PieChartIcon, Loader2 } from "lucide-react"; // Added Loader2
import { Bar as RechartsBar, BarChart as RechartsBarChart, PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { ROLES } from "@/lib/constants";
import type { User as AppUser, Role } from "@/types"; // Import User type and Role type
import { useToast } from "@/hooks/use-toast";

const mockDataGenericTable = [
  { id: "TUGAS-8782", title: "Nilai Ujian Tengah Semester Fisika", status: "Selesai", priority: "Tinggi", lastUpdated: "2024-07-15" },
  { id: "TUGAS-7878", title: "Laporan Kehadiran Siswa - Juni", status: "Sedang Berjalan", priority: "Sedang", lastUpdated: "2024-07-20" },
  { id: "TUGAS-1234", title: "Tinjauan Kurikulum Matematika", status: "Tertunda", priority: "Tinggi", lastUpdated: "2024-07-01" },
  { id: "TUGAS-4567", title: "Partisipasi Acara Sekolah", status: "Selesai", priority: "Rendah", lastUpdated: "2024-06-28" },
  { id: "TUGAS-9876", title: "Inventaris Buku Perpustakaan", status: "Akan Dikerjakan", priority: "Sedang", lastUpdated: "2024-07-22" },
];

const statusVariantMap: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  "Selesai": "default",
  "Sedang Berjalan": "secondary",
  "Tertunda": "outline",
  "Akan Dikerjakan": "destructive",
};

const mockAdminUserActivity = [
  { date: "2024-07-01", pendaftaran: 5, login: 25 },
  { date: "2024-07-02", pendaftaran: 3, login: 30 },
  { date: "2024-07-03", pendaftaran: 7, login: 22 },
  { date: "2024-07-04", pendaftaran: 2, login: 35 },
  { date: "2024-07-05", pendaftaran: 4, login: 28 },
];
const adminUserActivityChartConfig = {
  pendaftaran: { label: "Pendaftaran Baru", color: "hsl(var(--chart-1))" },
  login: { label: "Login Harian", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

// Role colors for dynamic chart
const ROLE_COLORS: Record<Role, string> = {
    admin: "hsl(var(--chart-1))",
    guru: "hsl(var(--chart-2))",
    siswa: "hsl(var(--chart-3))",
    pimpinan: "hsl(var(--chart-4))",
    superadmin: "hsl(var(--chart-5))",
};


export default function DataVisualizationPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const fetchAllUsers = useCallback(async () => {
    if (user && (user.role === 'admin' || user.role === 'superadmin')) {
        setIsLoadingUsers(true);
        try {
            const response = await fetch('/api/users');
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Gagal mengambil data pengguna.");
            }
            const data: AppUser[] = await response.json();
            setAllUsers(data);
        } catch (error: any) {
            toast({ title: "Error Data Pengguna", description: error.message, variant: "destructive" });
            setAllUsers([]);
        } finally {
            setIsLoadingUsers(false);
        }
    }
  }, [user, toast]);

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  const adminRoleDistributionData = useMemo(() => {
    if (allUsers.length === 0) return [];
    const roleCounts = allUsers.reduce((acc, currentUser) => {
      acc[currentUser.role] = (acc[currentUser.role] || 0) + 1;
      return acc;
    }, {} as Record<Role, number>);

    return Object.entries(roleCounts).map(([role, count]) => ({
      name: ROLES[role as Role] || role,
      value: count,
      fill: ROLE_COLORS[role as Role] || "hsl(var(--muted))",
    }));
  }, [allUsers]);


  const renderRoleSpecificVisualizations = () => {
    if (!user) return null;

    switch (user.role) {
      case 'admin':
      case 'superadmin':
        return (
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5 text-primary" /> Aktivitas Pengguna</CardTitle>
                <CardDescription>Grafik pendaftaran pengguna baru dan login harian (data mock).</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ChartContainer config={adminUserActivityChartConfig} className="w-full h-full">
                  <RechartsBarChart data={mockAdminUserActivity} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={10} />
                    <YAxis tickLine={false} axisLine={false} fontSize={10}/>
                    <Tooltip content={<ChartTooltipContent />} cursor={{ fill: 'hsl(var(--muted))' }} />
                    <Legend />
                    <RechartsBar dataKey="pendaftaran" fill="var(--color-pendaftaran)" radius={[4, 4, 0, 0]} />
                    <RechartsBar dataKey="login" fill="var(--color-login)" radius={[4, 4, 0, 0]} />
                  </RechartsBarChart>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center"><PieChartIcon className="mr-2 h-5 w-5 text-primary" /> Distribusi Peran Pengguna</CardTitle>
                <CardDescription>Visualisasi jumlah pengguna berdasarkan peran.</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                 {isLoadingUsers && adminRoleDistributionData.length === 0 ? (
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                 ) : adminRoleDistributionData.length > 0 ? (
                    <ChartContainer config={{}} className="w-full h-full max-w-[250px] aspect-square">
                        <RechartsPieChart>
                            <Tooltip content={<ChartTooltipContent hideLabel hideIndicator nameKey="name" />} />
                            <Pie data={adminRoleDistributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                                {adminRoleDistributionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Legend />
                        </RechartsPieChart>
                    </ChartContainer>
                 ) : (
                    <p className="text-muted-foreground">Data pengguna tidak tersedia.</p>
                 )}
              </CardContent>
            </Card>
             <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center"><Activity className="mr-2 h-5 w-5 text-primary" /> Penggunaan Sumber Daya Sistem</CardTitle>
                <CardDescription>Visualisasi penggunaan database, penyimpanan, dan lalu lintas jaringan (placeholder).</CardDescription>
              </CardHeader>
              <CardContent className="h-64 flex items-center justify-center bg-muted/50 rounded-md">
                <p className="text-muted-foreground">[Placeholder Grafik Penggunaan Sumber Daya]</p>
              </CardContent>
            </Card>
          </div>
        );
      case 'guru':
        return (
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center"><TrendingUp className="mr-2 h-5 w-5 text-primary" /> Performa Siswa (Mata Pelajaran Anda)</CardTitle>
                <CardDescription>Distribusi nilai siswa, rata-rata kelas, dan tren peningkatan/penurunan (placeholder).</CardDescription>
              </CardHeader>
              <CardContent className="h-64 flex items-center justify-center bg-muted/50 rounded-md">
                <p className="text-muted-foreground">[Placeholder Grafik Performa Siswa untuk Guru]</p>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center"><CheckCircle className="mr-2 h-5 w-5 text-primary" /> Tingkat Penyelesaian Tugas</CardTitle>
                <CardDescription>Persentase siswa yang mengumpulkan tugas tepat waktu, terlambat, atau belum mengumpulkan (placeholder).</CardDescription>
              </CardHeader>
              <CardContent className="h-64 flex items-center justify-center bg-muted/50 rounded-md">
                <p className="text-muted-foreground">[Placeholder Grafik Penyelesaian Tugas untuk Guru]</p>
              </CardContent>
            </Card>
          </div>
        );
      case 'siswa':
        return (
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center"><BarChart className="mr-2 h-5 w-5 text-primary" /> Kemajuan Akademik Saya</CardTitle>
                <CardDescription>Tren nilai saya per mata pelajaran dari waktu ke waktu (placeholder).</CardDescription>
              </CardHeader>
              <CardContent className="h-64 flex items-center justify-center bg-muted/50 rounded-md">
                <p className="text-muted-foreground">[Placeholder Grafik Tren Nilai Saya untuk Siswa]</p>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center"><BookOpen className="mr-2 h-5 w-5 text-primary" /> Aktivitas Belajar Saya</CardTitle>
                <CardDescription>Waktu yang dihabiskan untuk materi, frekuensi mengerjakan kuis (jika ada data) (placeholder).</CardDescription>
              </CardHeader>
              <CardContent className="h-64 flex items-center justify-center bg-muted/50 rounded-md">
                <p className="text-muted-foreground">[Placeholder Grafik Aktivitas Belajar untuk Siswa]</p>
              </CardContent>
            </Card>
          </div>
        );
      case 'pimpinan':
        return (
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center"><TrendingUp className="mr-2 h-5 w-5 text-primary" /> Performa Akademik Sekolah</CardTitle>
                <CardDescription>Rata-rata nilai per angkatan, perbandingan antar jurusan, tren kelulusan (placeholder).</CardDescription>
              </CardHeader>
              <CardContent className="h-64 flex items-center justify-center bg-muted/50 rounded-md">
                <p className="text-muted-foreground">[Placeholder Grafik Performa Sekolah untuk Pimpinan]</p>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5 text-primary" /> Analisis Kehadiran Guru & Siswa</CardTitle>
                <CardDescription>Statistik kehadiran keseluruhan, perbandingan antar kelas/guru (placeholder).</CardDescription>
              </CardHeader>
              <CardContent className="h-64 flex items-center justify-center bg-muted/50 rounded-md">
                <p className="text-muted-foreground">[Placeholder Grafik Kehadiran untuk Pimpinan]</p>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold">Visualisasi Data</h1>
      <p className="text-muted-foreground">
        Halo {user?.fullName || user?.name || user?.email}, berikut adalah gambaran umum data yang relevan.
      </p>
      
      {/* Generic Table Example */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Contoh Tabel Data Umum</CardTitle>
          <CardDescription>Ini adalah tabel placeholder yang menunjukkan kemampuan tampilan data generik.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Tugas</TableHead>
                <TableHead>Judul</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prioritas</TableHead>
                <TableHead className="text-right">Terakhir Diperbarui</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockDataGenericTable.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariantMap[item.status] || "default"}>{item.status}</Badge>
                  </TableCell>
                  <TableCell>
                     <Badge variant={item.priority === "Tinggi" ? "destructive" : item.priority === "Sedang" ? "secondary" : "outline"}>
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

      {/* Role-Specific Visualizations */}
      {renderRoleSpecificVisualizations()}
      
    </div>
  );
}

