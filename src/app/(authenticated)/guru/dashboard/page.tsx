
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, Users, MessageSquare, CalendarDays } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const guruStats = [
  { title: "Kursus Saya", value: "5", icon: BookOpen, color: "text-primary" },
  { title: "Total Siswa", value: "120", icon: Users, color: "text-green-500" },
  { title: "Pesan Belum Dibaca", value: "3", icon: MessageSquare, color: "text-yellow-500" },
  { title: "Tenggat Waktu Mendatang", value: "2", icon: CalendarDays, color: "text-red-500" },
];

export default function GuruDashboardPage() {
  const { user } = useAuth();

  if (!user || (user.role !== 'guru' && user.role !== 'superadmin')) {
    return <p>Akses Ditolak. Anda harus menjadi Guru untuk melihat halaman ini.</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold">Dasbor Guru</h1>
      <p className="text-muted-foreground">Selamat datang, {user.name || user.email}! Kelola kursus, siswa, dan tugas Anda.</p>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {guruStats.map((card) => (
          <Card key={card.title} className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">Lihat detail &rarr;</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Pengumpulan Terkini</CardTitle>
            <CardDescription>Gambaran umum pengumpulan siswa terkini.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-center justify-between">
                <span className="text-sm">Matematika - Tugas 1 oleh Siswa Rajin</span>
                <span className="text-xs text-muted-foreground">Telah Dinilai</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-sm">Fisika - Laporan Lab oleh Siswa Cerdas</span>
                <span className="text-xs text-red-500">Perlu Dinilai</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-sm">Kimia - Kuis 2 oleh Siswa Tekun</span>
                 <span className="text-xs text-muted-foreground">Telah Dinilai</span>
              </li>
            </ul>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Pengumuman</CardTitle>
            <CardDescription>Pengumuman sekolah atau kursus terbaru.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="bg-accent/50 p-4 rounded-md border border-accent">
                <h3 className="font-semibold text-accent-foreground">Jadwal Ujian Tengah Semester Dirilis</h3>
                <p className="text-sm text-muted-foreground mt-1">Silakan periksa papan pengumuman untuk jadwal ujian tengah semester yang terperinci.</p>
                <p className="text-xs text-muted-foreground mt-2">Diposting oleh Admin - 2 hari yang lalu</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
