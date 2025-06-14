
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { CalendarDays, Clock, UserCheck, AlertTriangle, PlusCircle, Edit, Search, Printer, Settings2, Building } from "lucide-react";

export default function AdminJadwalPage() {
  const { user } = useAuth();

  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return <p>Akses Ditolak. Anda harus menjadi admin untuk melihat halaman ini.</p>;
  }

  const handlePlaceholderAction = (action: string) => {
    alert(`Fungsi "${action}" belum diimplementasikan.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-semibold">Manajemen Jadwal Pelajaran</h1>
         <Button onClick={() => handlePlaceholderAction("Buat Jadwal Baru Keseluruhan")}>
          <PlusCircle className="mr-2 h-4 w-4" /> Buat Jadwal Baru
        </Button>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarDays className="mr-2 h-6 w-6 text-primary" />
            Pengelolaan Jadwal Terpusat
          </CardTitle>
          <CardDescription>
            Modul ini dirancang untuk memfasilitasi pembuatan, pengelolaan, dan publikasi jadwal pelajaran secara efisien dan terintegrasi untuk seluruh tingkatan kelas dan program studi.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Clock className="mr-3 h-5 w-5 text-primary" />
                Pembuatan & Konfigurasi Jadwal
              </CardTitle>
              <CardDescription>
                Atur slot waktu, hari efektif, durasi pelajaran, dan buat jadwal per kelas atau tingkatan.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Button variant="outline" onClick={() => handlePlaceholderAction("Konfigurasi Jam Pelajaran")} className="justify-start text-left h-auto py-3">
                <Settings2 className="mr-3 h-5 w-5" />
                <div>
                  <p className="font-semibold">Konfigurasi Jam & Hari</p>
                  <p className="text-xs text-muted-foreground">Atur slot waktu dan hari efektif.</p>
                </div>
              </Button>
              <Button variant="outline" onClick={() => handlePlaceholderAction("Buat Jadwal Kelas")} className="justify-start text-left h-auto py-3">
                <PlusCircle className="mr-3 h-5 w-5" />
                 <div>
                  <p className="font-semibold">Buat Jadwal per Kelas</p>
                  <p className="text-xs text-muted-foreground">Susun jadwal untuk satu kelas.</p>
                </div>
              </Button>
               <Button variant="outline" onClick={() => handlePlaceholderAction("Impor Jadwal")} className="justify-start text-left h-auto py-3">
                <Search className="mr-3 h-5 w-5" /> {/* Ganti ikon jika ada yang lebih sesuai */}
                 <div>
                  <p className="font-semibold">Impor Jadwal</p>
                  <p className="text-xs text-muted-foreground">Unggah jadwal dari template.</p>
                </div>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <UserCheck className="mr-3 h-5 w-5 text-primary" />
                Alokasi Guru & Ruangan
              </CardTitle>
              <CardDescription>
                Tetapkan guru pengampu untuk setiap mata pelajaran dan alokasikan ruangan kelas atau laboratorium.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Button variant="outline" onClick={() => handlePlaceholderAction("Kelola Ketersediaan Guru")} className="justify-start text-left h-auto py-3">
                <UserCheck className="mr-3 h-5 w-5" />
                <div>
                  <p className="font-semibold">Ketersediaan Guru</p>
                  <p className="text-xs text-muted-foreground">Lihat dan atur jadwal guru.</p>
                </div>
              </Button>
              <Button variant="outline" onClick={() => handlePlaceholderAction("Manajemen Ruangan")} className="justify-start text-left h-auto py-3">
                <Building className="mr-3 h-5 w-5" />
                <div>
                  <p className="font-semibold">Manajemen Ruangan</p>
                  <p className="text-xs text-muted-foreground">Kelola daftar dan kapasitas.</p>
                </div>
              </Button>
              <Button variant="outline" onClick={() => handlePlaceholderAction("Deteksi Konflik Jadwal")} className="justify-start text-left h-auto py-3">
                 <AlertTriangle className="mr-3 h-5 w-5" />
                 <div>
                  <p className="font-semibold">Deteksi Konflik</p>
                  <p className="text-xs text-muted-foreground">Periksa bentrok jadwal.</p>
                </div>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <CalendarDays className="mr-3 h-5 w-5 text-primary" />
                Visualisasi & Publikasi
              </CardTitle>
              <CardDescription>
                Tampilkan jadwal dalam format yang mudah dibaca dan publikasikan kepada stakeholder.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Button variant="outline" onClick={() => handlePlaceholderAction("Lihat Jadwal per Kelas")} className="justify-start text-left h-auto py-3">
                <Search className="mr-3 h-5 w-5" />
                <div>
                  <p className="font-semibold">Tampilan Jadwal Kelas</p>
                  <p className="text-xs text-muted-foreground">Lihat jadwal detail per kelas.</p>
                </div>
              </Button>
              <Button variant="outline" onClick={() => handlePlaceholderAction("Cetak Jadwal")} className="justify-start text-left h-auto py-3">
                 <Printer className="mr-3 h-5 w-5" />
                 <div>
                  <p className="font-semibold">Cetak Jadwal</p>
                  <p className="text-xs text-muted-foreground">Cetak jadwal per kelas/guru.</p>
                </div>
              </Button>
              <Button variant="outline" onClick={() => handlePlaceholderAction("Publikasi Jadwal")} className="justify-start text-left h-auto py-3">
                <Edit className="mr-3 h-5 w-5" /> {/* Ganti ikon jika ada yg lebih sesuai */}
                <div>
                  <p className="font-semibold">Publikasikan Jadwal</p>
                  <p className="text-xs text-muted-foreground">Umumkan jadwal terbaru.</p>
                </div>
              </Button>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Clock className="mr-3 h-5 w-5 text-primary" />
                 Manajemen Perubahan Jadwal
              </CardTitle>
              <CardDescription>
                Fasilitas untuk mengakomodasi perubahan jadwal insidental dan penjadwalan ulang.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
               <Button variant="outline" onClick={() => handlePlaceholderAction("Jadwal Pengganti")} className="justify-start text-left h-auto py-3">
                <UserCheck className="mr-3 h-5 w-5" />
                <div>
                  <p className="font-semibold">Atur Jadwal Pengganti</p>
                  <p className="text-xs text-muted-foreground">Jika ada guru berhalangan.</p>
                </div>
              </Button>
              <Button variant="outline" onClick={() => handlePlaceholderAction("Notifikasi Perubahan")} className="justify-start text-left h-auto py-3">
                 <AlertTriangle className="mr-3 h-5 w-5" />
                 <div>
                  <p className="font-semibold">Notifikasi Perubahan</p>
                  <p className="text-xs text-muted-foreground">Info ke guru/siswa terkait.</p>
                </div>
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
