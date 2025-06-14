
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { BarChart, Users, BookOpen, Activity, TrendingUp, CheckCircle } from "lucide-react";

const mockData = [
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
                <CardDescription>Grafik login harian, pendaftaran pengguna baru, dan peran paling aktif.</CardDescription>
              </CardHeader>
              <CardContent className="h-64 flex items-center justify-center bg-muted/50 rounded-md">
                <p className="text-muted-foreground">[Placeholder Grafik Aktivitas Pengguna]</p>
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
                <p className="text-muted-foreground">[Placeholder Grafik Performa Siswa]</p>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center"><CheckCircle className="mr-2 h-5 w-5 text-primary" /> Tingkat Penyelesaian Tugas</CardTitle>
                <CardDescription>Persentase siswa yang mengumpulkan tugas tepat waktu, terlambat, atau belum mengumpulkan.</CardDescription>
              </CardHeader>
              <CardContent className="h-64 flex items-center justify-center bg-muted/50 rounded-md">
                <p className="text-muted-foreground">[Placeholder Grafik Penyelesaian Tugas]</p>
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
                <p className="text-muted-foreground">[Placeholder Grafik Tren Nilai Saya]</p>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center"><BookOpen className="mr-2 h-5 w-5 text-primary" /> Aktivitas Belajar Saya</CardTitle>
                <CardDescription>Waktu yang dihabiskan untuk materi, frekuensi mengerjakan kuis (jika ada data).</CardDescription>
              </CardHeader>
              <CardContent className="h-64 flex items-center justify-center bg-muted/50 rounded-md">
                <p className="text-muted-foreground">[Placeholder Grafik Aktivitas Belajar]</p>
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
                <p className="text-muted-foreground">[Placeholder Grafik Performa Sekolah]</p>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5 text-primary" /> Analisis Kehadiran Guru & Siswa</CardTitle>
                <CardDescription>Statistik kehadiran keseluruhan, perbandingan antar kelas/guru.</CardDescription>
              </CardHeader>
              <CardContent className="h-64 flex items-center justify-center bg-muted/50 rounded-md">
                <p className="text-muted-foreground">[Placeholder Grafik Kehadiran]</p>
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
              {mockData.map((item) => (
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
