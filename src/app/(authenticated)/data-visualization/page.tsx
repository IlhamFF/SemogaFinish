
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";

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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold">Visualisasi Data</h1>
      <p className="text-muted-foreground">
        Halo {user?.name || user?.email}, berikut adalah gambaran umum data yang relevan. 
        {user?.role === 'admin' && " Anda memiliki akses ke data sistem yang komprehensif."}
        {user?.role === 'guru' && " Anda dapat melihat data terkait kursus dan siswa Anda."}
        {user?.role === 'siswa' && " Anda dapat melihat kemajuan akademik dan informasi kursus Anda."}
        {user?.role === 'pimpinan' && " Anda memiliki akses ke analitik dan laporan institusional."}
      </p>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Contoh Tabel Data</CardTitle>
          <CardDescription>Ini adalah tabel placeholder yang menunjukkan kemampuan tampilan data.</CardDescription>
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

       {/* Placeholder for charts -  can be expanded based on roles */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Grafik Data (Placeholder)</CardTitle>
          <CardDescription>Representasi visual data akan ditampilkan di sini.</CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center bg-muted/50 rounded-md">
          <p className="text-muted-foreground">Grafik akan ditampilkan di sini</p>
        </CardContent>
      </Card>
    </div>
  );
}
