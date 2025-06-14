
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { FileText, PlayCircle, ListChecks, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { id as localeID } from 'date-fns/locale';

type TestStatus = "Terjadwal" | "Berlangsung" | "Selesai" | "Menunggu Hasil" | "Dinilai";
interface Test {
  id: string;
  judul: string;
  mapel: string;
  guru: string;
  tanggal: Date;
  durasi: string; // e.g., "90 Menit"
  status: TestStatus;
  tipe: "Kuis" | "UTS" | "UAS" | "Ulangan Harian";
  nilai?: number;
  jumlahSoal?: number;
}

const mockTests: Test[] = [
  { id: "TEST001", judul: "Ujian Tengah Semester Gasal", mapel: "Matematika", guru: "Bu Ani", tanggal: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), durasi: "90 Menit", status: "Terjadwal", tipe: "UTS", jumlahSoal: 25 },
  { id: "TEST002", judul: "Kuis Bab Termodinamika", mapel: "Fisika", guru: "Pak Eko", tanggal: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), durasi: "45 Menit", status: "Berlangsung", tipe: "Kuis", jumlahSoal: 10 },
  { id: "TEST003", judul: "Ulangan Harian Struktur Atom", mapel: "Kimia", guru: "Bu Rina", tanggal: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), durasi: "60 Menit", status: "Menunggu Hasil", tipe: "Ulangan Harian", jumlahSoal: 15 },
  { id: "TEST004", judul: "Ujian Akhir Semester Genap", mapel: "Bahasa Indonesia", guru: "Pak Budi", tanggal: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), durasi: "120 Menit", status: "Dinilai", tipe: "UAS", nilai: 88, jumlahSoal: 40 },
];


export default function SiswaTestPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"mendatang" | "riwayat">("mendatang");

  if (!user || (user.role !== 'siswa' && user.role !== 'superadmin')) {
    return <p>Akses Ditolak. Anda harus menjadi Siswa untuk melihat halaman ini.</p>;
  }
  if (!user.isVerified) {
    return <p>Silakan verifikasi email Anda untuk mengakses fitur ini.</p>;
  }

  const handlePlaceholderAction = (action: string, testId?: string) => {
    alert(`Fungsi "${action}" ${testId ? `untuk test ${testId} ` : ''}belum diimplementasikan.`);
  };

  const testMendatang = mockTests.filter(t => t.status === "Terjadwal" || t.status === "Berlangsung");
  const testRiwayat = mockTests.filter(t => t.status === "Selesai" || t.status === "Menunggu Hasil" || t.status === "Dinilai");

  const getStatusBadgeVariant = (status: TestStatus): "default" | "secondary" | "destructive" | "outline" => {
    if (status === "Dinilai" || status === "Berlangsung") return "default"; // Green/Blue for active/done
    if (status === "Terjadwal") return "secondary";
    if (status === "Menunggu Hasil") return "outline";
    return "outline"; // Selesai (generic)
  };

  const getStatusIcon = (status: TestStatus) => {
    if (status === "Dinilai") return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (status === "Berlangsung") return <PlayCircle className="h-4 w-4 text-blue-500 animate-pulse" />;
    if (status === "Terjadwal") return <Clock className="h-4 w-4 text-gray-500" />;
    if (status === "Menunggu Hasil") return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    return <ListChecks className="h-4 w-4" />;
  };

  const renderTestList = (listTests: Test[]) => (
    listTests.length > 0 ? (
      <ul className="space-y-4">
        {listTests.map(test => (
          <li key={test.id}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                        <CardTitle className="text-lg text-primary">{test.judul} <span className="text-sm font-normal text-muted-foreground">({test.tipe})</span></CardTitle>
                        <CardDescription>{test.mapel} - oleh {test.guru}</CardDescription>
                    </div>
                     <Badge variant={getStatusBadgeVariant(test.status)} className="mt-2 sm:mt-0 flex items-center gap-1">
                        {getStatusIcon(test.status)} {test.status}
                    </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-3">
                    <div>
                        <p className="font-semibold">Tanggal:</p>
                        <p className="text-muted-foreground">{format(test.tanggal, "dd MMM yyyy, HH:mm", { locale: localeID })}</p>
                    </div>
                    <div>
                        <p className="font-semibold">Durasi:</p>
                        <p className="text-muted-foreground">{test.durasi}</p>
                    </div>
                    <div>
                        <p className="font-semibold">Jumlah Soal:</p>
                        <p className="text-muted-foreground">{test.jumlahSoal || '-'}</p>
                    </div>
                    {test.status === "Dinilai" && test.nilai !== undefined && (
                         <div>
                            <p className="font-semibold">Nilai:</p>
                            <p className="text-foreground font-bold text-lg">{test.nilai}</p>
                        </div>
                    )}
                </div>
                
                {test.status === "Berlangsung" && (
                  <Button 
                    className="w-full sm:w-auto" 
                    onClick={() => handlePlaceholderAction("Mulai Test", test.id)}
                  >
                    <PlayCircle className="mr-2 h-4 w-4" /> Mulai Test
                  </Button>
                )}
                {test.status === "Terjadwal" && new Date() > test.tanggal && ( // If current time is past test time but still scheduled (e.g., admin hasn't started it)
                     <p className="text-sm text-yellow-600">Menunggu test dimulai oleh pengawas/sistem.</p>
                )}
                 {test.status === "Terjadwal" && new Date() < test.tanggal && (
                     <p className="text-sm text-muted-foreground">Test akan tersedia pada waktunya.</p>
                )}
                {test.status === "Dinilai" && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full sm:w-auto" 
                    onClick={() => handlePlaceholderAction("Lihat Detail Hasil", test.id)}
                  >
                    Lihat Detail Hasil
                  </Button>
                )}
                 {test.status === "Menunggu Hasil" && (
                     <p className="text-sm text-yellow-600">Hasil sedang diproses. Mohon tunggu.</p>
                )}
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    ) : (
      <div className="text-center py-10 text-muted-foreground">
        <FileText className="mx-auto h-12 w-12" />
        <p className="mt-2">Tidak ada test/ujian dalam kategori ini.</p>
      </div>
    )
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold flex items-center">
        <FileText className="mr-3 h-8 w-8 text-primary" />
        Test & Ujian Saya
      </h1>
      <p className="text-muted-foreground">Lihat jadwal test/ujian, kerjakan, dan lihat hasilnya.</p>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "mendatang" | "riwayat")}>
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="mendatang">Test Mendatang ({testMendatang.length})</TabsTrigger>
          <TabsTrigger value="riwayat">Riwayat Test ({testRiwayat.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="mendatang">
          <Card className="shadow-lg mt-4">
            <CardHeader>
              <CardTitle>Jadwal Test & Ujian</CardTitle>
              <CardDescription>Daftar test/ujian yang akan datang atau sedang berlangsung.</CardDescription>
            </CardHeader>
            <CardContent>
              {renderTestList(testMendatang)}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="riwayat">
          <Card className="shadow-lg mt-4">
            <CardHeader>
              <CardTitle>Riwayat Test & Ujian</CardTitle>
              <CardDescription>Daftar test/ujian yang telah selesai atau dinilai.</CardDescription>
            </CardHeader>
            <CardContent>
              {renderTestList(testRiwayat)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

