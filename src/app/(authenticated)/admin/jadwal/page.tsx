
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { CalendarDays, Clock, UserCheck, AlertTriangle } from "lucide-react";

export default function AdminJadwalPage() {
  const { user } = useAuth();

  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return <p>Akses Ditolak. Anda harus menjadi admin untuk melihat halaman ini.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-semibold">Manajemen Jadwal Pelajaran</h1>
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
        <CardContent>
          <div className="p-6 text-muted-foreground bg-muted/20 rounded-md border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Fitur Utama Manajemen Jadwal (Dalam Pengembangan):</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <Clock className="h-5 w-5 mr-3 mt-1 text-primary flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-foreground">Pembuatan Jadwal Fleksibel</h4>
                  <p className="text-sm">
                    Membuat jadwal pelajaran per kelas, per tingkatan, atau per program studi. Dukungan untuk berbagai jenis slot waktu, hari efektif, dan durasi pelajaran.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <UserCheck className="h-5 w-5 mr-3 mt-1 text-primary flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-foreground">Penetapan Guru dan Ruangan</h4>
                  <p className="text-sm">
                    Menetapkan guru pengampu untuk setiap mata pelajaran dalam jadwal. Mengelola ketersediaan guru dan alokasi ruangan kelas atau laboratorium.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <AlertTriangle className="h-5 w-5 mr-3 mt-1 text-primary flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-foreground">Deteksi Konflik Otomatis</h4>
                  <p className="text-sm">
                    Sistem akan membantu mendeteksi potensi konflik jadwal, seperti guru mengajar di dua kelas berbeda pada waktu yang sama, atau penggunaan ruangan yang bentrok.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <CalendarDays className="h-5 w-5 mr-3 mt-1 text-primary flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-foreground">Visualisasi dan Publikasi Jadwal</h4>
                  <p className="text-sm">
                    Menampilkan jadwal dalam format yang mudah dibaca (tabel, kalender). Kemampuan untuk mempublikasikan jadwal kepada guru, siswa, dan orang tua.
                  </p>
                </div>
              </li>
               <li className="flex items-start">
                <Clock className="h-5 w-5 mr-3 mt-1 text-primary flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-foreground">Manajemen Perubahan Jadwal</h4>
                  <p className="text-sm">
                    Fasilitas untuk mengakomodasi perubahan jadwal insidental (misalnya, guru berhalangan hadir) dan penjadwalan ulang.
                  </p>
                </div>
              </li>
            </ul>
            <p className="mt-8 text-sm text-center text-muted-foreground">
              Fungsionalitas penuh untuk manajemen jadwal akan diimplementasikan secara bertahap.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
