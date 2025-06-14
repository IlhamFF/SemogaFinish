
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { ClipboardCheck, FilePenLine, UploadCloud, Eye, Clock, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { id as localeID } from 'date-fns/locale';

type TugasStatus = "Belum Dikerjakan" | "Terlambat" | "Sudah Dikumpulkan" | "Dinilai";
interface Tugas {
  id: string;
  judul: string;
  mapel: string;
  guru: string;
  tenggat: Date;
  status: TugasStatus;
  deskripsi?: string;
  fileLampiran?: string;
  nilai?: number;
  feedbackGuru?: string;
}

const mockTugas: Tugas[] = [
  { id: "TGS001", judul: "Latihan Soal Bab 1: Aljabar", mapel: "Matematika", guru: "Bu Ani", tenggat: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), status: "Belum Dikerjakan", deskripsi: "Kerjakan soal 1-10 di buku paket halaman 25." },
  { id: "TGS002", judul: "Praktikum Hukum Newton", mapel: "Fisika", guru: "Pak Eko", tenggat: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), status: "Terlambat", deskripsi: "Buat laporan praktikum sesuai format yang diberikan.", fileLampiran: "template_laporan.docx" },
  { id: "TGS003", judul: "Membuat Puisi", mapel: "Bahasa Indonesia", guru: "Pak Budi", tenggat: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), status: "Belum Dikerjakan", deskripsi: "Buatlah puisi dengan tema 'Pahlawan'."},
  { id: "TGS004", judul: "Presentasi Kelompok Sel", mapel: "Biologi", guru: "Bu Ida", tenggat: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), status: "Sudah Dikumpulkan", deskripsi: "Presentasi tentang organel sel." },
  { id: "TGS005", judul: "Analisis Novel Laskar Pelangi", mapel: "Bahasa Indonesia", guru: "Pak Budi", tenggat: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), status: "Dinilai", nilai: 85, feedbackGuru: "Analisis sudah baik, perhatikan lagi tata bahasa." },
];


export default function SiswaTugasPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"mendatang" | "selesai">("mendatang");

  if (!user || (user.role !== 'siswa' && user.role !== 'superadmin')) {
    return <p>Akses Ditolak. Anda harus menjadi Siswa untuk melihat halaman ini.</p>;
  }
  if (!user.isVerified) {
    return <p>Silakan verifikasi email Anda untuk mengakses fitur ini.</p>;
  }

  const handlePlaceholderAction = (action: string, tugasId?: string) => {
    alert(`Fungsi "${action}" ${tugasId ? `untuk tugas ${tugasId} ` : ''}belum diimplementasikan.`);
  };

  const tugasMendatang = mockTugas.filter(t => t.status === "Belum Dikerjakan" || t.status === "Terlambat");
  const tugasSelesai = mockTugas.filter(t => t.status === "Sudah Dikumpulkan" || t.status === "Dinilai");

  const getStatusBadgeVariant = (status: TugasStatus): "default" | "secondary" | "destructive" | "outline" => {
    if (status === "Dinilai") return "default"; // Green in many themes if customized
    if (status === "Sudah Dikumpulkan") return "secondary";
    if (status === "Terlambat") return "destructive";
    return "outline"; // Belum Dikerjakan
  };
  
  const getStatusIcon = (status: TugasStatus) => {
    if (status === "Dinilai" || status === "Sudah Dikumpulkan") return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (status === "Terlambat") return <Clock className="h-4 w-4 text-red-500" />;
    return <FilePenLine className="h-4 w-4 text-yellow-500" />;
  }

  const renderTugasList = (listTugas: Tugas[]) => (
    listTugas.length > 0 ? (
      <ul className="space-y-4">
        {listTugas.map(tugas => (
          <li key={tugas.id}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                        <CardTitle className="text-lg text-primary">{tugas.judul}</CardTitle>
                        <CardDescription>{tugas.mapel} - oleh {tugas.guru}</CardDescription>
                    </div>
                    <Badge variant={getStatusBadgeVariant(tugas.status)} className="mt-2 sm:mt-0 flex items-center gap-1">
                        {getStatusIcon(tugas.status)} {tugas.status}
                    </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {tugas.deskripsi && <p className="text-sm text-muted-foreground mb-3">{tugas.deskripsi}</p>}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-muted-foreground">
                  <p>
                    Tenggat: {format(tugas.tenggat, "dd MMMM yyyy, HH:mm", { locale: localeID })}
                    ({formatDistanceToNow(tugas.tenggat, { addSuffix: true, locale: localeID })})
                  </p>
                  {tugas.fileLampiran && <p>Lampiran: {tugas.fileLampiran}</p>}
                </div>
                {(tugas.status === "Belum Dikerjakan" || tugas.status === "Terlambat") && (
                  <Button 
                    size="sm" 
                    className="mt-3 w-full sm:w-auto" 
                    onClick={() => handlePlaceholderAction("Upload Jawaban", tugas.id)}
                  >
                    <UploadCloud className="mr-2 h-4 w-4" /> Upload Jawaban
                  </Button>
                )}
                {tugas.status === "Sudah Dikumpulkan" && (
                  <p className="mt-3 text-sm text-green-600 font-medium">Jawaban telah dikumpulkan. Menunggu penilaian.</p>
                )}
                {tugas.status === "Dinilai" && (
                  <div className="mt-3 p-3 bg-muted/50 rounded-md">
                    <p className="text-sm font-semibold">Nilai: {tugas.nilai}/100</p>
                    {tugas.feedbackGuru && <p className="text-xs text-muted-foreground mt-1">Feedback: {tugas.feedbackGuru}</p>}
                     <Button 
                        variant="link" 
                        size="sm" 
                        className="p-0 h-auto mt-1 text-xs"
                        onClick={() => handlePlaceholderAction("Lihat Detail Penilaian", tugas.id)}
                    >
                        Lihat Detail Penilaian
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    ) : (
      <div className="text-center py-10 text-muted-foreground">
        <ClipboardCheck className="mx-auto h-12 w-12" />
        <p className="mt-2">Tidak ada tugas dalam kategori ini.</p>
      </div>
    )
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold flex items-center">
        <ClipboardCheck className="mr-3 h-8 w-8 text-primary" />
        Tugas Saya
      </h1>
      <p className="text-muted-foreground">Lihat, kelola, dan kumpulkan tugas sekolah Anda.</p>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "mendatang" | "selesai")}>
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="mendatang">Tugas Mendatang ({tugasMendatang.length})</TabsTrigger>
          <TabsTrigger value="selesai">Tugas Selesai ({tugasSelesai.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="mendatang">
          <Card className="shadow-lg mt-4">
            <CardHeader>
              <CardTitle>Tugas Harus Dikerjakan</CardTitle>
              <CardDescription>Daftar tugas yang belum dikumpulkan atau terlambat.</CardDescription>
            </CardHeader>
            <CardContent>
              {renderTugasList(tugasMendatang)}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="selesai">
          <Card className="shadow-lg mt-4">
            <CardHeader>
              <CardTitle>Riwayat Tugas</CardTitle>
              <CardDescription>Daftar tugas yang sudah dikumpulkan atau dinilai.</CardDescription>
            </CardHeader>
            <CardContent>
              {renderTugasList(tugasSelesai)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
