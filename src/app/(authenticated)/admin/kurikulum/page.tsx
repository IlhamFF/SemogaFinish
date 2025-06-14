
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { BookOpenCheck, Target, BookCopy, BookOpenText, ClipboardList } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

export default function AdminKurikulumPage() {
  const { user } = useAuth();

  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return <p>Akses Ditolak. Anda harus menjadi admin untuk melihat halaman ini.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-semibold">Manajemen Kurikulum</h1>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpenCheck className="mr-2 h-6 w-6 text-primary" />
            Pengembangan dan Pengelolaan Kurikulum
          </CardTitle>
          <CardDescription>
            Fasilitas komprehensif untuk merancang, mengembangkan, dan mengelola seluruh aspek kurikulum pendidikan. Modul ini memungkinkan administrator untuk menyusun standar pembelajaran, struktur kurikulum, hingga materi ajar yang relevan dengan daftar mata pelajaran yang tersedia.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 text-muted-foreground bg-muted/20 rounded-md border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Komponen Utama Manajemen Kurikulum (Dalam Pengembangan):</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <ClipboardList className="h-5 w-5 mr-3 mt-1 text-primary flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-foreground">Referensi Mata Pelajaran</h4>
                  <p className="text-sm">
                    Fondasi utama penyusunan kurikulum adalah <Link href={ROUTES.ADMIN_MATA_PELAJARAN} className="text-primary hover:underline">daftar mata pelajaran</Link> yang telah ditetapkan dan dikelola secara terpusat. Semua elemen kurikulum akan merujuk pada mata pelajaran ini untuk memastikan konsistensi.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <Target className="h-5 w-5 mr-3 mt-1 text-primary flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-foreground">Standar Kompetensi & Capaian Pembelajaran</h4>
                  <p className="text-sm">
                    Definisikan Standar Kompetensi Lulusan (SKL) dan Capaian Pembelajaran (CP) untuk setiap jenjang pendidikan dan program studi. SKL dan CP ini menjadi acuan utama dalam pengembangan silabus dan RPP, memastikan bahwa pembelajaran terarah dan terukur.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <BookCopy className="h-5 w-5 mr-3 mt-1 text-primary flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-foreground">Penyusunan Struktur Kurikulum, Silabus & RPP</h4>
                  <p className="text-sm">
                    Buat dan kelola struktur kurikulum yang detail untuk setiap tingkatan kelas atau program. Kembangkan Silabus yang mencakup alokasi waktu, metode, dan penilaian. Susun Rencana Pelaksanaan Pembelajaran (RPP) yang operasional bagi guru, lengkap dengan kegiatan pembelajaran dan asesmen.
                  </p>
                </div>
              </li>
               <li className="flex items-start">
                <BookOpenText className="h-5 w-5 mr-3 mt-1 text-primary flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-foreground">Manajemen Materi Pembelajaran</h4>
                  <p className="text-sm">
                    Integrasikan materi pembelajaran digital maupun fisik. Unggah, kelola, dan kaitkan berbagai sumber belajar, bahan ajar, modul, dan referensi lainnya dengan setiap topik atau sub-topik dalam silabus mata pelajaran, sehingga mudah diakses oleh guru dan siswa.
                  </p>
                </div>
              </li>
            </ul>
            <p className="mt-8 text-sm text-center text-muted-foreground">
              Fungsionalitas penuh untuk manajemen kurikulum, termasuk pembuatan dan pengelolaan detail setiap komponen, akan segera hadir.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
