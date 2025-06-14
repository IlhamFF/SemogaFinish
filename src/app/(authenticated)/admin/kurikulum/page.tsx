
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { BookOpenCheck, ClipboardList, Target, BookCopy, BookOpenText } from "lucide-react";

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
            Area ini didedikasikan untuk membuat, melihat, memperbarui, dan mengelola struktur kurikulum sekolah secara komprehensif.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 text-muted-foreground bg-muted/20 rounded-md border">
            <h3 className="text-lg font-semibold text-foreground mb-3">Fitur Utama (Dalam Pengembangan):</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <ClipboardList className="h-5 w-5 mr-3 mt-1 text-primary flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-foreground">Definisi Mata Pelajaran</h4>
                  <p className="text-sm">Membuat dan mengelola daftar mata pelajaran yang ditawarkan, termasuk kode, nama, dan deskripsi singkat.</p>
                </div>
              </li>
              <li className="flex items-start">
                <Target className="h-5 w-5 mr-3 mt-1 text-primary flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-foreground">Standar Kompetensi & Capaian Pembelajaran</h4>
                  <p className="text-sm">Menetapkan standar kompetensi lulusan (SKL) dan capaian pembelajaran (CP) untuk setiap jenjang dan mata pelajaran.</p>
                </div>
              </li>
              <li className="flex items-start">
                <BookCopy className="h-5 w-5 mr-3 mt-1 text-primary flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-foreground">Penyusunan Silabus & RPP</h4>
                  <p className="text-sm">Memfasilitasi pembuatan dan pengelolaan silabus serta Rencana Pelaksanaan Pembelajaran (RPP) yang terstruktur.</p>
                </div>
              </li>
               <li className="flex items-start">
                <BookOpenText className="h-5 w-5 mr-3 mt-1 text-primary flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-foreground">Manajemen Materi Pembelajaran</h4>
                  <p className="text-sm">Mengaitkan materi pembelajaran, sumber belajar, dan bahan ajar dengan setiap topik dalam kurikulum.</p>
                </div>
              </li>
            </ul>
            <p className="mt-6 text-sm text-center">
              Fungsionalitas penuh untuk manajemen kurikulum akan segera hadir.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
