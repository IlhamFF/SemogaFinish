
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from "@/hooks/use-auth";
import { Award, FileSignature, TrendingUp, Download, Eye } from "lucide-react";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface NilaiMataPelajaran {
  id: string;
  mapel: string;
  guru: string;
  nilaiAkhir: number;
  predikat: string;
  kkm: number;
  kehadiran?: number; // persentase
  catatan?: string;
}

const mockNilai: NilaiMataPelajaran[] = [
  { id: "NIL001", mapel: "Matematika", guru: "Bu Ani", nilaiAkhir: 88, predikat: "A-", kkm: 75, kehadiran: 98 },
  { id: "NIL002", mapel: "Fisika", guru: "Pak Eko", nilaiAkhir: 75, predikat: "B", kkm: 75, kehadiran: 95 },
  { id: "NIL003", mapel: "Bahasa Indonesia", guru: "Pak Budi", nilaiAkhir: 92, predikat: "A", kkm: 70, kehadiran: 100 },
  { id: "NIL004", mapel: "Kimia", guru: "Bu Rina", nilaiAkhir: 80, predikat: "B+", kkm: 75, kehadiran: 90, catatan: "Perlu ditingkatkan pemahaman pada bab Redoks." },
  { id: "NIL005", mapel: "Bahasa Inggris", guru: "Ms. Jane", nilaiAkhir: 85, predikat: "A-", kkm: 70, kehadiran: 97 },
];

const chartData = mockNilai.map(n => ({ name: n.mapel, nilai: n.nilaiAkhir, kkm: n.kkm }));
const chartConfig = {
  nilai: { label: "Nilai Akhir", color: "hsl(var(--primary))" },
  kkm: { label: "KKM", color: "hsl(var(--destructive))" },
} satisfies ChartConfig;


export default function SiswaNilaiPage() {
  const { user } = useAuth();

  if (!user || (user.role !== 'siswa' && user.role !== 'superadmin')) {
    return <p>Akses Ditolak. Anda harus menjadi Siswa untuk melihat halaman ini.</p>;
  }
  if (!user.isVerified) {
    return <p>Silakan verifikasi email Anda untuk mengakses fitur ini.</p>;
  }

  const handlePlaceholderAction = (action: string, detail?: string) => {
    alert(`Fungsi "${action}" ${detail ? `untuk ${detail} ` : ''}belum diimplementasikan.`);
  };

  const ipk = mockNilai.length > 0 ? (mockNilai.reduce((acc, curr) => acc + curr.nilaiAkhir, 0) / mockNilai.length).toFixed(2) : "N/A";

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold flex items-center">
        <Award className="mr-3 h-8 w-8 text-primary" />
        Nilai & Rapor Saya
      </h1>
      <p className="text-muted-foreground">Lihat rekapitulasi nilai, kemajuan akademik, dan unduh rapor Anda.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardDescription>Indeks Prestasi Kumulatif (IPK)</CardDescription>
            <CardTitle className="text-4xl text-primary">{ipk}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">Semester Genap 2023/2024</div>
          </CardContent>
        </Card>
         <Card className="shadow-md md:col-span-2">
          <CardHeader className="pb-2">
            <CardDescription>Ringkasan Akademik</CardDescription>
            <CardTitle className="text-2xl">Semester Ini</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
                <p className="text-muted-foreground">Mata Pelajaran Lulus KKM:</p>
                <p className="font-semibold">{mockNilai.filter(n => n.nilaiAkhir >= n.kkm).length} dari {mockNilai.length}</p>
            </div>
             <div>
                <p className="text-muted-foreground">Rata-rata Kehadiran:</p>
                <p className="font-semibold">
                    {mockNilai.filter(n => n.kehadiran !== undefined).length > 0 
                     ? (mockNilai.reduce((acc, curr) => acc + (curr.kehadiran || 0), 0) / mockNilai.filter(n => n.kehadiran !== undefined).length).toFixed(1) + "%"
                     : "N/A"}
                </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Grafik Pencapaian Nilai</CardTitle>
          <CardDescription>Perbandingan nilai akhir Anda dengan Kriteria Ketuntasan Minimal (KKM) per mata pelajaran.</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px]">
          <ChartContainer config={chartConfig} className="w-full h-full">
            <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="hsl(var(--foreground))" fontSize={10} interval={0} angle={-30} textAnchor="end" height={60} />
              <YAxis tickLine={false} axisLine={false} stroke="hsl(var(--foreground))" fontSize={12} />
              <Tooltip content={<ChartTooltipContent />} cursor={{ fill: 'hsl(var(--muted))' }}/>
              <Legend />
              <Bar dataKey="nilai" fill="var(--color-nilai)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="kkm" fill="var(--color-kkm)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <div>
                    <CardTitle>Rincian Nilai Mata Pelajaran</CardTitle>
                    <CardDescription>Detail nilai akhir per mata pelajaran untuk semester saat ini.</CardDescription>
                </div>
                 <Button onClick={() => handlePlaceholderAction("Unduh Rapor PDF")} variant="outline">
                    <Download className="mr-2 h-4 w-4" /> Unduh Rapor (PDF)
                </Button>
            </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mata Pelajaran</TableHead>
                  <TableHead>Guru</TableHead>
                  <TableHead className="text-center">Nilai Akhir</TableHead>
                  <TableHead className="text-center">Predikat</TableHead>
                  <TableHead className="text-center">KKM</TableHead>
                  <TableHead className="text-center">Kehadiran</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Detail</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockNilai.map((nilai) => (
                  <TableRow key={nilai.id} className={nilai.nilaiAkhir < nilai.kkm ? "bg-destructive/10" : ""}>
                    <TableCell className="font-medium">{nilai.mapel}</TableCell>
                    <TableCell>{nilai.guru}</TableCell>
                    <TableCell className="text-center font-semibold">{nilai.nilaiAkhir}</TableCell>
                    <TableCell className="text-center">{nilai.predikat}</TableCell>
                    <TableCell className="text-center">{nilai.kkm}</TableCell>
                    <TableCell className="text-center">{nilai.kehadiran !== undefined ? `${nilai.kehadiran}%` : '-'}</TableCell>
                    <TableCell className="text-center">
                        <Badge variant={nilai.nilaiAkhir >= nilai.kkm ? "default" : "destructive"} className={nilai.nilaiAkhir >= nilai.kkm ? "bg-green-500 hover:bg-green-600" : ""}>
                            {nilai.nilaiAkhir >= nilai.kkm ? "Tuntas" : "Belum Tuntas"}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handlePlaceholderAction("Lihat Detail Nilai", nilai.mapel)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {mockNilai.find(n => n.catatan) && (
            <div className="mt-6 space-y-2">
                <h3 className="text-md font-semibold">Catatan dari Guru:</h3>
                {mockNilai.filter(n => n.catatan).map(n => (
                    <Card key={`note-${n.id}`} className="p-3 bg-muted/30">
                        <p className="text-sm font-medium">{n.mapel} ({n.guru}):</p>
                        <p className="text-xs text-muted-foreground">{n.catatan}</p>
                    </Card>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
