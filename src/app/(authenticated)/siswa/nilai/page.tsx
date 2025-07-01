
"use client";

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Bar, BarChart as RechartsBarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Award, FileSignature, TrendingUp, Download, Eye, UserCircle, CalendarDays, CheckCircle, Info, BookUser, Loader2 } from "lucide-react";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { ScrollArea } from '@/components/ui/scroll-area';
import type { NilaiSemesterSiswa } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { ROUTES } from '@/lib/constants';

const chartConfig = {
  nilaiAkhir: { label: "Nilai Akhir", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;

export default function SiswaNilaiPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [semesterGrades, setSemesterGrades] = useState<NilaiSemesterSiswa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<NilaiSemesterSiswa | null>(null);

  const fetchGrades = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/penilaian/semester/me');
      if (!response.ok) {
        throw new Error("Gagal mengambil data nilai semester.");
      }
      const data: NilaiSemesterSiswa[] = await response.json();
      setSemesterGrades(data);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);


  if (!user || (user.role !== 'siswa' && user.role !== 'superadmin')) {
    return <p>Akses Ditolak. Anda harus menjadi Siswa untuk melihat halaman ini.</p>;
  }
  if (!user.isVerified) {
    return <p>Silakan verifikasi email Anda untuk mengakses fitur ini.</p>;
  }

  const handleShowDetails = (grade: NilaiSemesterSiswa) => {
    setSelectedGrade(grade);
    setIsDetailOpen(true);
  };
  
  const handleDownloadRapor = () => {
    window.open(ROUTES.SISWA_RAPOR_CETAK, '_blank');
  }

  const { averageGrade, totalGradedItems, chartData } = useMemo(() => {
    const validGrades = semesterGrades.filter(item => typeof item.nilaiAkhir === 'number' || typeof item.nilaiAkhir === 'string');
    const total = validGrades.reduce((acc, curr) => acc + Number(curr.nilaiAkhir ?? 0), 0);
    const avg = validGrades.length > 0 ? (total / validGrades.length).toFixed(2) : "N/A";
    const chart = validGrades.map(item => ({ name: `${item.mapel?.nama} (${item.semester.substring(0,1)}${item.tahunAjaran.substring(2,4)})`, nilaiAkhir: Number(item.nilaiAkhir) }));
    return { averageGrade: avg, totalGradedItems: validGrades.length, chartData: chart };
  }, [semesterGrades]);
  
  const getPredikatBadgeVariant = (predikat: string | null | undefined): "default" | "secondary" | "destructive" | "outline" => {
    switch (predikat) {
      case "A": return "default";
      case "B": return "secondary";
      case "C": return "outline";
      case "D":
      case "E": return "destructive";
      default: return "outline";
    }
  };


  return (
    <>
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent flex items-center">
            <Award className="mr-3 h-7 w-7" />
            Nilai & Rapor Saya
          </h1>
          <p className="text-muted-foreground">Lihat rekapitulasi nilai, kemajuan akademik, dan unduh rapor Anda.</p>
        </div>
        <Button onClick={handleDownloadRapor} variant="outline" className="w-full md:w-auto">
            <Download className="mr-2 h-4 w-4" /> Unduh Rapor (PDF)
        </Button>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Informasi Siswa</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center">
                <UserCircle className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="font-medium mr-1">Nama:</span>
                <span className="text-foreground truncate">{user.fullName || user.name || "Siswa"}</span>
            </div>
            <div className="flex items-center">
                <Info className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="font-medium mr-1">NIS:</span>
                <span className="text-foreground truncate">{user.nis || "-"}</span>
            </div>
            <div className="flex items-center">
                <BookUser className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="font-medium mr-1">Kelas:</span>
                <span className="text-foreground truncate">{user.kelasId || "-"}</span>
            </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardDescription>Rata-rata Nilai Keseluruhan</CardDescription>
            <CardTitle className="text-4xl text-primary">{isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : averageGrade}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">Dari {totalGradedItems} mata pelajaran yang dinilai</div>
          </CardContent>
        </Card>
         <Card className="shadow-md md:col-span-2">
          <CardHeader className="pb-2">
            <CardDescription>Ringkasan Akademik & Kehadiran</CardDescription>
            <CardTitle className="text-2xl">Data Saat Ini</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm pt-2">
            <div>
                <p className="text-muted-foreground">Total Mapel Dinilai:</p>
                <p className="font-semibold text-lg">{isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : `${totalGradedItems} Mapel`}</p>
            </div>
             <div className="space-y-1">
                <p className="text-muted-foreground">Rekap Kehadiran:</p>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                    <p className="text-sm text-muted-foreground">Fitur rekap kehadiran akan segera tersedia.</p>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Grafik Nilai Akhir per Mata Pelajaran</CardTitle>
          <CardDescription>Perbandingan nilai akhir Anda dari setiap mata pelajaran yang telah dinilai.</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px]">
          {isLoading ? (
             <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : chartData.length > 0 ? (
              <ChartContainer config={chartConfig} className="w-full h-full">
                <RechartsBarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={10} interval={0} angle={-30} textAnchor="end" height={70} />
                    <YAxis tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
                    <Tooltip content={<ChartTooltipContent />} cursor={{ fill: 'hsl(var(--muted))' }}/>
                    <Bar dataKey="nilaiAkhir" fill="var(--color-nilaiAkhir)" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
              </ChartContainer>
          ) : (
             <p className="text-center text-muted-foreground pt-10">Belum ada data nilai semester untuk ditampilkan di grafik.</p>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle>Rincian Nilai Semester</CardTitle>
            <CardDescription>Detail nilai dari setiap mata pelajaran yang telah dinilai oleh guru.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-[500px] overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center items-center h-20"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : semesterGrades.length > 0 ? (
                <Table>
                  <TableHeader className="sticky top-0 bg-card z-10">
                    <TableRow>
                      <TableHead>Mata Pelajaran</TableHead>
                      <TableHead>Semester</TableHead>
                      <TableHead>Tahun Ajaran</TableHead>
                      <TableHead className="text-center">Nilai Akhir</TableHead>
                      <TableHead className="text-center">Predikat</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {semesterGrades.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.mapel?.nama || "N/A"}</TableCell>
                        <TableCell>{item.semester}</TableCell>
                        <TableCell>{item.tahunAjaran}</TableCell>
                        <TableCell className="text-center font-semibold text-lg">{item.nilaiAkhir ?? "-"}</TableCell>
                        <TableCell className="text-center">
                            {item.predikat ? <Badge variant={getPredikatBadgeVariant(item.predikat)}>{item.predikat}</Badge> : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleShowDetails(item)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
            ) : (
                <p className="text-center text-muted-foreground py-10">Anda belum memiliki nilai semester yang tercatat.</p>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>

    <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Detail Nilai: {selectedGrade?.mapel?.nama}</DialogTitle>
                <DialogDescription>
                    Rincian komponen nilai untuk semester {selectedGrade?.semester} {selectedGrade?.tahunAjaran}.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4">
                        <CardDescription>Nilai Tugas</CardDescription>
                        <CardTitle>{selectedGrade?.nilaiTugas ?? "-"}</CardTitle>
                    </Card>
                    <Card className="p-4">
                        <CardDescription>Nilai UTS</CardDescription>
                        <CardTitle>{selectedGrade?.nilaiUTS ?? "-"}</CardTitle>
                    </Card>
                    <Card className="p-4">
                        <CardDescription>Nilai UAS</CardDescription>
                        <CardTitle>{selectedGrade?.nilaiUAS ?? "-"}</CardTitle>
                    </Card>
                    <Card className="p-4">
                        <CardDescription>Nilai Harian</CardDescription>
                        <CardTitle>{selectedGrade?.nilaiHarian ?? "-"}</CardTitle>
                    </Card>
                </div>
                <div>
                    <h4 className="text-sm font-medium mb-1">Catatan dari Guru:</h4>
                    <p className="text-sm text-muted-foreground p-3 bg-muted rounded-md min-h-[60px]">
                        {selectedGrade?.catatanGuru || "Tidak ada catatan."}
                    </p>
                </div>
                <div>
                     <h4 className="text-sm font-medium mb-1">Dinilai oleh:</h4>
                     <p className="text-sm text-muted-foreground">
                        {selectedGrade?.dicatatOlehGuru?.fullName || selectedGrade?.dicatatOlehGuru?.name || "Guru"}
                     </p>
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="outline">Tutup</Button></DialogClose>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}
