
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Presentation, BookOpen, Video, MessageSquare, CalendarCheck2, PlusCircle } from "lucide-react";

export default function GuruPengajaranPage() {
  const { user } = useAuth();

  if (!user || (user.role !== 'guru' && user.role !== 'superadmin')) {
    return <p>Akses Ditolak. Anda harus menjadi Guru untuk melihat halaman ini.</p>;
  }

  const handlePlaceholderAction = (action: string) => {
    alert(`Fungsi "${action}" belum diimplementasikan.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-semibold">Modul Pengajaran</h1>
        <Button onClick={() => handlePlaceholderAction("Mulai Sesi Pengajaran Baru")}>
          <PlusCircle className="mr-2 h-4 w-4" /> Mulai Sesi Baru
        </Button>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Presentation className="mr-2 h-6 w-6 text-primary" />
            Manajemen Aktivitas Pengajaran
          </CardTitle>
          <CardDescription>
            Kelola semua aspek terkait kegiatan belajar mengajar, mulai dari perencanaan hingga pelaksanaan sesi interaktif.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Daftar Kelas & Mata Pelajaran Saya</CardTitle>
              <CardDescription>Lihat kelas dan mata pelajaran yang Anda ampu.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Placeholder: List of classes/subjects */}
              <div className="p-4 bg-muted/50 rounded-md text-center">
                <p className="text-muted-foreground">Daftar kelas dan mata pelajaran akan ditampilkan di sini.</p>
                <Button variant="link" onClick={() => handlePlaceholderAction("Lihat Jadwal Mengajar")}>Lihat Jadwal Mengajar Lengkap</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <BookOpen className="mr-3 h-5 w-5 text-primary" />
                Rencana Pembelajaran (RPP)
              </CardTitle>
              <CardDescription>
                Akses dan kelola Rencana Pelaksanaan Pembelajaran (RPP) untuk setiap pertemuan.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Button variant="outline" onClick={() => handlePlaceholderAction("Lihat RPP Minggu Ini")} className="justify-start text-left h-auto py-3">
                <CalendarCheck2 className="mr-3 h-5 w-5" />
                <div>
                  <p className="font-semibold">RPP Minggu Ini</p>
                  <p className="text-xs text-muted-foreground">Lihat rencana untuk minggu berjalan.</p>
                </div>
              </Button>
              <Button variant="outline" onClick={() => handlePlaceholderAction("Upload/Buat RPP Baru")} className="justify-start text-left h-auto py-3">
                <PlusCircle className="mr-3 h-5 w-5" />
                 <div>
                  <p className="font-semibold">Buat/Unggah RPP</p>
                  <p className="text-xs text-muted-foreground">Tambahkan RPP baru.</p>
                </div>
              </Button>
               <Button variant="outline" onClick={() => handlePlaceholderAction("Arsip RPP")} className="justify-start text-left h-auto py-3">
                <BookOpen className="mr-3 h-5 w-5" />
                 <div>
                  <p className="font-semibold">Arsip RPP</p>
                  <p className="text-xs text-muted-foreground">Akses RPP sebelumnya.</p>
                </div>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Video className="mr-3 h-5 w-5 text-primary" />
                Sesi Pembelajaran Interaktif
              </CardTitle>
              <CardDescription>
                Fasilitas untuk menjalankan sesi pembelajaran daring atau luring, termasuk video conference dan papan tulis digital.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button variant="default" onClick={() => handlePlaceholderAction("Mulai Video Conference")} className="justify-start text-left h-auto py-3">
                <Video className="mr-3 h-5 w-5" />
                <div>
                  <p className="font-semibold">Mulai Video Conference</p>
                  <p className="text-xs text-muted-foreground">Untuk kelas terjadwal.</p>
                </div>
              </Button>
              <Button variant="outline" onClick={() => handlePlaceholderAction("Buka Papan Tulis Digital")} className="justify-start text-left h-auto py-3">
                 <MessageSquare className="mr-3 h-5 w-5" /> {/* Ganti ikon jika perlu */}
                 <div>
                  <p className="font-semibold">Papan Tulis Digital</p>
                  <p className="text-xs text-muted-foreground">Kolaborasi waktu nyata.</p>
                </div>
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
