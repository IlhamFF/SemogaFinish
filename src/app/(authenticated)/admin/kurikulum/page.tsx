
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
            Area ini didedikasikan untuk merancang, menyusun, dan mengelola struktur kurikulum sekolah secara komprehensif, mengacu pada daftar mata pelajaran yang telah ditentukan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 text-muted-foreground bg-muted/20 rounded-md border">
            <h3 className="text-lg font-semibold text-foreground mb-3">Fitur Utama (Dalam Pengembangan):</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <ClipboardList className="h-5 w-5 mr-3 mt-1 text-primary flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-foreground">Referensi Mata Pelajaran</h4>
                  <p className="text-sm">Kurikulum akan disusun berdasarkan <Link href={ROUTES.ADMIN_MATA_PELAJARAN} className="text-primary hover:underline">daftar mata pelajaran</Link> yang telah dikelola secara terpusat.</p>
                </div>
              </li>
              <li className="flex items-start">
                <Target className="h-5 w-5 mr-3 mt-1 text-primary flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-foreground">Standar Kompetensi & Capaian Pembelajaran</h4>
                  <p className="text-sm">Menetapkan standar kompetensi lulusan (SKL) dan capaian pembelajaran (CP) untuk setiap jenjang dan program pendidikan, yang terintegrasi dengan mata pelajaran.</p>
                </div>
              </li>
              <li className="flex items-start">
                <BookCopy className="h-5 w-5 mr-3 mt-1 text-primary flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-foreground">Penyusunan Struktur Kurikulum, Silabus & RPP</h4>
                  <p className="text-sm">Memfasilitasi pembuatan dan pengelolaan struktur kurikulum per jenjang/tingkat, silabus, serta Rencana Pelaksanaan Pembelajaran (RPP) yang terstruktur untuk setiap mata pelajaran dalam kurikulum.</p>
                </div>
              </li>
               <li className="flex items-start">
                <BookOpenText className="h-5 w-5 mr-3 mt-1 text-primary flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-foreground">Manajemen Materi Pembelajaran</h4>
                  <p className="text-sm">Mengaitkan materi pembelajaran, sumber belajar, dan bahan ajar dengan setiap topik dalam silabus mata pelajaran.</p>
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

