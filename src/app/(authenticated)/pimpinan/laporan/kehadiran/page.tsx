
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { UserCheck, Search, Loader2, Download, TrendingUp } from "lucide-react";
import { SCHOOL_GRADE_LEVELS, SCHOOL_MAJORS, SCHOOL_CLASSES_PER_MAJOR_GRADE } from "@/lib/constants";
import { Label } from '@/components/ui/label';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import Papa from "papaparse";

interface StudentStat {
  id: string;
  name: string;
  nis: string | null;
  kelas: string;
  hadir: number;
  izin: number;
  sakit: number;
  alpha: number;
  total: number;
  persentaseKehadiran: number;
}

interface TrendData {
  name: string; // "Jan", "Feb", etc.
  Kehadiran: number; // Percentage
}

interface ReportData {
  studentStats: StudentStat[];
  trendData: TrendData[];
}

const TAHUN_AJARAN_OPTIONS = ["2023/2024", "2022/2023", "2021/2022"];
const SEMESTER_OPTIONS = ["Genap", "Ganjil"];

const chartConfig = {
  Kehadiran: { label: "Kehadiran (%)", color: "hsl(var(--primary))" },
} satisfies ChartConfig;


export default function LaporanKehadiranPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedTahun, setSelectedTahun] = useState<string>(TAHUN_AJARAN_OPTIONS[0]);
  const [selectedSemester, setSelectedSemester] = useState<string>(SEMESTER_OPTIONS[0]);
  const [selectedTingkat, setSelectedTingkat] = useState<string | undefined>();
  const [selectedKelas, setSelectedKelas] = useState<string>("semua");
  
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  const availableKelas = useMemo(() => {
    if (!selectedTingkat) return [];
    const kls: string[] = [];
    SCHOOL_MAJORS.forEach(major => {
        for (let i = 1; i <= SCHOOL_CLASSES_PER_MAJOR_GRADE; i++) {
          kls.push(`${selectedTingkat} ${major} ${i}`);
        }
    });
    return kls.sort();
  }, [selectedTingkat]);

  useEffect(() => {
    setSelectedKelas("semua");
    setReportData(null);
  }, [selectedTingkat]);

  const handleFetchReport = async () => {
    if (!selectedTingkat || !selectedTahun || !selectedSemester) {
      toast({ title: "Info", description: "Silakan lengkapi semua filter." });
      return;
    }
    setIsLoadingReport(true);
    setReportData(null);
    try {
      let apiUrl = `/api/laporan/kehadiran?tingkat=${encodeURIComponent(selectedTingkat)}&tahunAjaran=${encodeURIComponent(selectedTahun)}&semester=${selectedSemester}`;
      if (selectedKelas && selectedKelas !== "semua") {
        apiUrl += `&kelas=${encodeURIComponent(selectedKelas)}`;
      }

      const response = await fetch(apiUrl);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal mengambil data laporan kehadiran.");
      }
      const data: ReportData = await response.json();
      setReportData(data);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoadingReport(false);
    }
  };

  const handleExportCsv = () => {
    if (!reportData || reportData.studentStats.length === 0) {
      toast({ title: "Tidak Ada Data", description: "Tidak ada data untuk diekspor." });
      return;
    }
    const dataToExport = reportData.studentStats.map(s => ({
        "NIS": s.nis || "N/A",
        "Nama Siswa": s.name,
        "Kelas": s.kelas,
        "Hadir": s.hadir,
        "Izin": s.izin,
        "Sakit": s.sakit,
        "Alpha": s.alpha,
        "Total Pertemuan": s.total,
        "Persentase Kehadiran (%)": s.persentaseKehadiran.toFixed(2),
    }));
    const csv = Papa.unparse(dataToExport, { header: true });
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const fileName = `laporan_kehadiran_${selectedTingkat}_${selectedKelas}.csv`;
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  if (!user || (user.role !== 'pimpinan' && user.role !== 'superadmin')) {
      return <p>Akses Ditolak.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent flex items-center">
            <UserCheck className="mr-3 h-7 w-7" /> Analisis Kehadiran Siswa
          </h1>
          <p className="text-muted-foreground">Analisis detail kehadiran siswa per angkatan atau per kelas.</p>
        </div>
        <Button variant="outline" onClick={handleExportCsv} disabled={!reportData || isLoadingReport}>
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Filter Laporan Kehadiran</CardTitle>
          <CardDescription>Pilih filter untuk melihat laporan kehadiran.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-end gap-4">
          <div className="w-full sm:w-auto sm:min-w-[150px]">
            <Label htmlFor="tahun-select">Tahun Ajaran</Label>
            <Select onValueChange={setSelectedTahun} value={selectedTahun}><SelectTrigger id="tahun-select"><SelectValue placeholder="Pilih Tahun" /></SelectTrigger><SelectContent>{TAHUN_AJARAN_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select>
          </div>
           <div className="w-full sm:w-auto sm:min-w-[150px]">
            <Label htmlFor="semester-select">Semester</Label>
            <Select onValueChange={setSelectedSemester} value={selectedSemester}><SelectTrigger id="semester-select"><SelectValue placeholder="Pilih Semester" /></SelectTrigger><SelectContent>{SEMESTER_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="w-full sm:w-auto sm:min-w-[150px]">
            <Label htmlFor="tingkat-select">Angkatan</Label>
            <Select onValueChange={setSelectedTingkat} value={selectedTingkat}><SelectTrigger id="tingkat-select"><SelectValue placeholder="Pilih tingkat" /></SelectTrigger><SelectContent>{SCHOOL_GRADE_LEVELS.map(t => <SelectItem key={t} value={t}>Tingkat {t}</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="w-full sm:w-auto sm:min-w-[150px]">
            <Label htmlFor="kelas-select">Kelas</Label>
             <Select onValueChange={setSelectedKelas} value={selectedKelas} disabled={!selectedTingkat}><SelectTrigger id="kelas-select"><SelectValue placeholder="Pilih kelas" /></SelectTrigger><SelectContent><SelectItem value="semua">Semua Kelas Angkatan Ini</SelectItem>{availableKelas.map(kls => <SelectItem key={kls} value={kls}>{kls}</SelectItem>)}</SelectContent></Select>
          </div>
          <Button onClick={handleFetchReport} disabled={isLoadingReport || !selectedTingkat}>
            {isLoadingReport ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
            Tampilkan
          </Button>
        </CardContent>
      </Card>
      
      {isLoadingReport && (
        <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-3 text-muted-foreground">Mengambil data...</p></div>
      )}

      {reportData && (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center"><TrendingUp className="mr-2 h-5 w-5 text-primary" />Tren Kehadiran Bulanan</CardTitle>
                    <CardDescription>Persentase kehadiran (Hadir dari Total Sesi) per bulan untuk filter yang dipilih.</CardDescription>
                </CardHeader>
                <CardContent className="h-[250px]">
                    <ChartContainer config={chartConfig} className="w-full h-full">
                    <AreaChart accessibilityLayer data={reportData.trendData} margin={{ left: 0, right: 20 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                        <Tooltip content={<ChartTooltipContent indicator="dot" />} />
                        <defs><linearGradient id="fillKehadiran" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--color-Kehadiran)" stopOpacity={0.8} /><stop offset="95%" stopColor="var(--color-Kehadiran)" stopOpacity={0.1} /></linearGradient></defs>
                        <Area type="monotone" dataKey="Kehadiran" stroke="var(--color-Kehadiran)" strokeWidth={2} fillOpacity={1} fill="url(#fillKehadiran)" />
                    </AreaChart>
                    </ChartContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Rincian Kehadiran Siswa</CardTitle>
                    <CardDescription>Menampilkan {reportData.studentStats.length} siswa sesuai filter.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="max-h-[60vh]">
                    <Table>
                        <TableHeader className="sticky top-0 bg-card"><TableRow><TableHead>Nama Siswa (NIS)</TableHead><TableHead>Kelas</TableHead><TableHead className="text-center">Hadir</TableHead><TableHead className="text-center">Izin</TableHead><TableHead className="text-center">Sakit</TableHead><TableHead className="text-center">Alpha</TableHead><TableHead className="text-center">Kehadiran (%)</TableHead></TableRow></TableHeader>
                        <TableBody>
                        {reportData.studentStats.map((s) => (
                            <TableRow key={s.id}>
                                <TableCell className="font-medium">{s.name}<span className="text-xs text-muted-foreground block">{s.nis || "N/A"}</span></TableCell>
                                <TableCell>{s.kelas}</TableCell>
                                <TableCell className="text-center">{s.hadir}</TableCell>
                                <TableCell className="text-center">{s.izin}</TableCell>
                                <TableCell className="text-center">{s.sakit}</TableCell>
                                <TableCell className="text-center text-destructive font-semibold">{s.alpha}</TableCell>
                                <TableCell className="text-center font-bold text-primary">{s.persentaseKehadiran.toFixed(1)}%</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}
