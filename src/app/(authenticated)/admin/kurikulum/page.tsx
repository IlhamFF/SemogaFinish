
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { BookOpenCheck, Target, BookCopy, BookUp, Layers, FileText, FolderKanban, PlusCircle, Edit, Search } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

export default function AdminKurikulumPage() {
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
        <h1 className="text-3xl font-headline font-semibold">Manajemen Kurikulum</h1>
        <Button onClick={() => handlePlaceholderAction("Buat Kurikulum Baru")}>
          <PlusCircle className="mr-2 h-4 w-4" /> Buat Kurikulum Baru
        </Button>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpenCheck className="mr-2 h-6 w-6 text-primary" />
            Pengembangan dan Pengelolaan Kurikulum
          </CardTitle>
          <CardDescription>
            Fasilitas komprehensif untuk merancang, mengembangkan, dan mengelola seluruh aspek kurikulum pendidikan. Modul ini memungkinkan administrator untuk menyusun standar pembelajaran, struktur kurikulum, hingga materi ajar yang relevan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Target className="mr-3 h-5 w-5 text-primary" />
                Standar Kompetensi & Capaian Pembelajaran
              </CardTitle>
              <CardDescription>
                Kelola Standar Kompetensi Lulusan (SKL) dan Capaian Pembelajaran (CP) sebagai acuan utama.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Button variant="outline" onClick={() => handlePlaceholderAction("Kelola SKL")} className="justify-start text-left h-auto py-3">
                <Layers className="mr-3 h-5 w-5" />
                <div>
                  <p className="font-semibold">Standar Kompetensi Lulusan (SKL)</p>
                  <p className="text-xs text-muted-foreground">Definisikan profil lulusan.</p>
                </div>
              </Button>
              <Button variant="outline" onClick={() => handlePlaceholderAction("Kelola CP")} className="justify-start text-left h-auto py-3">
                <FileText className="mr-3 h-5 w-5" />
                 <div>
                  <p className="font-semibold">Capaian Pembelajaran (CP)</p>
                  <p className="text-xs text-muted-foreground">Tetapkan target per fase/tingkat.</p>
                </div>
              </Button>
               <Button variant="outline" onClick={() => handlePlaceholderAction("Pemetaan SKL-CP")} className="justify-start text-left h-auto py-3">
                <Search className="mr-3 h-5 w-5" />
                 <div>
                  <p className="font-semibold">Pemetaan & Analisis</p>
                  <p className="text-xs text-muted-foreground">Hubungkan SKL dengan CP.</p>
                </div>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <BookCopy className="mr-3 h-5 w-5 text-primary" />
                Struktur Kurikulum, Silabus & RPP
              </CardTitle>
              <CardDescription>
                Susun kerangka kurikulum, alokasi waktu, materi pokok, hingga rencana pelaksanaan pembelajaran. Pastikan merujuk pada <Link href={ROUTES.ADMIN_MATA_PELAJARAN} className="text-primary hover:underline">daftar mata pelajaran</Link> yang sudah ada.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Button variant="outline" onClick={() => handlePlaceholderAction("Kelola Struktur Kurikulum")} className="justify-start text-left h-auto py-3">
                <Layers className="mr-3 h-5 w-5" />
                <div>
                  <p className="font-semibold">Struktur Kurikulum</p>
                  <p className="text-xs text-muted-foreground">Atur mata pelajaran per tingkat.</p>
                </div>
              </Button>
              <Button variant="outline" onClick={() => handlePlaceholderAction("Manajemen Silabus")} className="justify-start text-left h-auto py-3">
                <FileText className="mr-3 h-5 w-5" />
                <div>
                  <p className="font-semibold">Pengembangan Silabus</p>
                  <p className="text-xs text-muted-foreground">Rancang silabus per mapel.</p>
                </div>
              </Button>
              <Button variant="outline" onClick={() => handlePlaceholderAction("Manajemen RPP")} className="justify-start text-left h-auto py-3">
                 <BookUp className="mr-3 h-5 w-5" />
                 <div>
                  <p className="font-semibold">Penyusunan RPP</p>
                  <p className="text-xs text-muted-foreground">Buat rencana pembelajaran detail.</p>
                </div>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <FolderKanban className="mr-3 h-5 w-5 text-primary" />
                Bank Materi & Sumber Pembelajaran
              </CardTitle>
              <CardDescription>
                Kelola dan organisasikan materi ajar, modul, video, dan referensi pendukung lainnya.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Button variant="outline" onClick={() => handlePlaceholderAction("Upload Materi Ajar")} className="justify-start text-left h-auto py-3">
                <PlusCircle className="mr-3 h-5 w-5" />
                <div>
                  <p className="font-semibold">Tambah Materi Baru</p>
                  <p className="text-xs text-muted-foreground">Unggah file atau tautan.</p>
                </div>
              </Button>
              <Button variant="outline" onClick={() => handlePlaceholderAction("Kelola Kategori Materi")} className="justify-start text-left h-auto py-3">
                 <Edit className="mr-3 h-5 w-5" />
                 <div>
                  <p className="font-semibold">Kategorisasi Materi</p>
                  <p className="text-xs text-muted-foreground">Susun materi per mapel/topik.</p>
                </div>
              </Button>
              <Button variant="outline" onClick={() => handlePlaceholderAction("Cari Materi")} className="justify-start text-left h-auto py-3">
                <Search className="mr-3 h-5 w-5" />
                <div>
                  <p className="font-semibold">Pencarian Materi</p>
                  <p className="text-xs text-muted-foreground">Temukan sumber belajar.</p>
                </div>
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
