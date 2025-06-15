
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { BarChart, Users, BookOpen, Activity, TrendingUp, CheckCircle, PieChart } from "lucide-react";
import { Bar as RechartsBar, BarChart as RechartsBarChart, PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { ROLES } from "@/lib/constants";
import React from "react";

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

// Mock data for Admin Charts
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

const mockAdminRoleDistribution = [
  { name: ROLES.admin, value: 2, fill: "hsl(var(--chart-1))" },
  { name: ROLES.guru, value: 15, fill: "hsl(var(--chart-2))" },
  { name: ROLES.siswa, value: 150, fill: "hsl(var(--chart-3))" },
  { name: ROLES.pimpinan, value: 1, fill: "hsl(var(--chart-4))" },
];


export default function DataVisualizationPage() {
  const { user } = useAuth();

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
                <CardTitle className="flex items-center"><PieChart className="mr-2 h-5 w-5 text-primary" /> Distribusi Peran Pengguna</CardTitle>
                <CardDescription>Visualisasi jumlah pengguna berdasarkan peran (data mock).</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                 <ChartContainer config={{}} className="w-full h-full max-w-[250px] aspect-square">
                    <RechartsPieChart>
                        <Tooltip content={<ChartTooltipContent hideLabel hideIndicator nameKey="name" />} />
                        <Pie data={mockAdminRoleDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                            {mockAdminRoleDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                        <Legend />
                    </RechartsPieChart>
                </ChartContainer>
              </CardContent>
            </Card>
             <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center"><Activity className="mr-2 h-5 w-5 text-primary" /> Penggunaan Sumber Daya Sistem</CardTitle>
                <CardDescription>Visualisasi penggunaan database, penyimpanan, dan lalu lintas jaringan.</CardDescription>
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
                <CardDescription>Distribusi nilai siswa, rata-rata kelas, dan tren peningkatan/penurunan.</CardDescription>
              </CardHeader>
              <CardContent className="h-64 flex items-center justify-center bg-muted/50 rounded-md">
                <p className="text-muted-foreground">[Placeholder Grafik Performa Siswa untuk Guru]</p>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center"><CheckCircle className="mr-2 h-5 w-5 text-primary" /> Tingkat Penyelesaian Tugas</CardTitle>
                <CardDescription>Persentase siswa yang mengumpulkan tugas tepat waktu, terlambat, atau belum mengumpulkan.</CardDescription>
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
                <CardDescription>Tren nilai saya per mata pelajaran dari waktu ke waktu.</CardDescription>
              </CardHeader>
              <CardContent className="h-64 flex items-center justify-center bg-muted/50 rounded-md">
                <p className="text-muted-foreground">[Placeholder Grafik Tren Nilai Saya untuk Siswa]</p>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center"><BookOpen className="mr-2 h-5 w-5 text-primary" /> Aktivitas Belajar Saya</CardTitle>
                <CardDescription>Waktu yang dihabiskan untuk materi, frekuensi mengerjakan kuis (jika ada data).</CardDescription>
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
                <CardDescription>Rata-rata nilai per angkatan, perbandingan antar jurusan, tren kelulusan.</CardDescription>
              </CardHeader>
              <CardContent className="h-64 flex items-center justify-center bg-muted/50 rounded-md">
                <p className="text-muted-foreground">[Placeholder Grafik Performa Sekolah untuk Pimpinan]</p>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5 text-primary" /> Analisis Kehadiran Guru & Siswa</CardTitle>
                <CardDescription>Statistik kehadiran keseluruhan, perbandingan antar kelas/guru.</CardDescription>
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
