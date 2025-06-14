
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Book, CheckSquare, CalendarClock, Award, CalendarDays, ClipboardCheck, BookOpen as BookOpenIcon, FileText as FileTextIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

const siswaStats = [
  { title: "Kursus & Jadwal", value: "Lihat Detail", icon: CalendarDays, color: "text-primary", href: ROUTES.SISWA_JADWAL },
  { title: "Tugas Saya", value: "2 Harus Dikumpulkan", icon: ClipboardCheck, color: "text-red-500", href: ROUTES.SISWA_TUGAS },
  { title: "Materi Pelajaran", value: "Akses Materi", icon: BookOpenIcon, color: "text-green-500", href: ROUTES.SISWA_MATERI },
  { title: "Test, Nilai & Rapor", value: "Cek Kemajuan", icon: Award, color: "text-yellow-500", href: ROUTES.SISWA_NILAI, isProgress: false, progressValue: 75 }, // Changed from progress to direct link
];

export default function SiswaDashboardPage() {
  const { user } = useAuth();

  if (!user || (user.role !== 'siswa' && user.role !== 'superadmin')) {
    return <p>Akses Ditolak. Anda harus menjadi Siswa untuk melihat halaman ini.</p>;
  }
  
  if (!user.isVerified) {
     return (
        <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl text-primary">Verifikasi Email Diperlukan</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-4">
                        Akun Anda belum diverifikasi. Silakan periksa email Anda untuk tautan verifikasi atau hubungi administrator.
                    </p>
                    <Link href={ROUTES.VERIFY_EMAIL}>
                        <Button>Ke Halaman Verifikasi</Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
     );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold">Dasbor Siswa</h1>
      <p className="text-muted-foreground">Selamat datang, {user.fullName || user.name || user.email}! Lacak kursus, tugas, dan kemajuan Anda.</p>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {siswaStats.map((card) => (
          <Link href={card.href || "#"} key={card.title} passHref>
            <Card className="shadow-lg hover:shadow-xl transition-shadow h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="text-2xl font-bold">{card.value}</div>
                {card.isProgress && card.progressValue !== undefined ? (
                  <Progress value={card.progressValue} className="h-2 mt-2" />
                ) : (
                  <p className="text-xs text-muted-foreground">Lihat detail &rarr;</p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Tenggat Waktu Mendatang</CardTitle>
            <CardDescription>Tugas dan ujian yang harus segera dikerjakan.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-center justify-between p-3 rounded-md bg-primary/5 border border-primary/20">
                <div>
                  <h4 className="font-semibold text-primary">Matematika - Kuis Bab 5</h4>
                  <p className="text-xs text-muted-foreground">Batas Waktu: Besok, 23:59</p>
                </div>
                <Link href={ROUTES.SISWA_TEST} className="text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200">
                  Kerjakan
                </Link>
              </li>
              <li className="flex items-center justify-between p-3 rounded-md bg-secondary/20 border border-secondary/40">
                 <div>
                  <h4 className="font-semibold">Fisika - Pengumpulan Laporan Lab</h4>
                  <p className="text-xs text-muted-foreground">Batas Waktu: Dalam 3 hari</p>
                </div>
                 <Link href={ROUTES.SISWA_TUGAS} className="text-xs font-medium px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 hover:bg-yellow-200">
                  Upload
                </Link>
              </li>
            </ul>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Pengumuman Terbaru</CardTitle>
            <CardDescription>Informasi penting dari sekolah atau guru.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
                <div className="p-3 rounded-md bg-accent/10 border border-accent/30">
                    <h4 className="font-semibold text-accent-foreground">Jadwal Ujian Akhir Semester</h4>
                    <p className="text-xs text-muted-foreground mt-1">Jadwal UAS telah dirilis. Silakan cek di bagian Test & Ujian.</p>
                </div>
                 <div className="p-3 rounded-md bg-muted/50 border">
                    <h4 className="font-semibold">Libur Nasional</h4>
                    <p className="text-xs text-muted-foreground mt-1">Kegiatan belajar mengajar diliburkan pada tanggal 17 Agustus.</p>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

