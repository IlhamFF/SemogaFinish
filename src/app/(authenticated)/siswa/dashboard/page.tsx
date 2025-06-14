
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Book, CheckSquare, CalendarClock, Award } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Progress } from "@/components/ui/progress";

const siswaStats = [
  { title: "Kursus Terdaftar", value: "4", icon: Book, color: "text-primary" },
  { title: "Tugas Harus Dikumpulkan", value: "2", icon: CalendarClock, color: "text-red-500" },
  { title: "Tugas Selesai", value: "15", icon: CheckSquare, color: "text-green-500" },
  { title: "Kemajuan Keseluruhan", value: "75%", icon: Award, color: "text-yellow-500", isProgress: true, progressValue: 75 },
];

export default function SiswaDashboardPage() {
  const { user } = useAuth();

  if (!user || (user.role !== 'siswa' && user.role !== 'superadmin')) {
    return <p>Akses Ditolak. Anda harus menjadi Siswa untuk melihat halaman ini.</p>;
  }
  
  if (!user.isVerified) {
     return <p>Silakan verifikasi email Anda untuk mengakses dasbor.</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold">Dasbor Siswa</h1>
      <p className="text-muted-foreground">Selamat datang, {user.name || user.email}! Lacak kursus, tugas, dan kemajuan Anda.</p>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {siswaStats.map((card) => (
          <Card key={card.title} className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              {card.isProgress && card.progressValue !== undefined ? (
                <Progress value={card.progressValue} className="h-2 mt-2" indicatorClassName={card.color.replace('text-','bg-')} />
              ) : (
                <p className="text-xs text-muted-foreground">Lihat detail &rarr;</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Tenggat Waktu Mendatang</CardTitle>
            <CardDescription>Tugas dan pekerjaan yang harus segera dikumpulkan.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-center justify-between p-3 rounded-md bg-primary/5 border border-primary/20">
                <div>
                  <h4 className="font-semibold text-primary">Matematika - Kuis Bab 5</h4>
                  <p className="text-xs text-muted-foreground">Batas Waktu: Besok, 23:59</p>
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-600">Prioritas Tinggi</span>
              </li>
              <li className="flex items-center justify-between p-3 rounded-md bg-secondary/20 border border-secondary/40">
                 <div>
                  <h4 className="font-semibold">Fisika - Pengumpulan Laporan Lab</h4>
                  <p className="text-xs text-muted-foreground">Batas Waktu: Dalam 3 hari</p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Nilai Saya</CardTitle>
            <CardDescription>Nilai dan umpan balik terkini.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <span>Matematika - Tugas 4</span>
                    <span className="font-semibold text-green-600">A (92%)</span>
                </div>
                <div className="flex justify-between items-center">
                    <span>Sastra Inggris - Esai</span>
                    <span className="font-semibold text-yellow-600">B+ (88%)</span>
                </div>
                <div className="flex justify-between items-center">
                    <span>Sejarah - Ujian Tengah Semester</span>
                    <span className="font-semibold text-primary">A- (90%)</span>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
