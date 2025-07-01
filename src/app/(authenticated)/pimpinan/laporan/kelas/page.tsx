
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, Search, Loader2, Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import { SCHOOL_GRADE_LEVELS } from "@/lib/constants";

interface ReportStudent {
  id: string;
  name: string;
  nis: string | null;
  kelas: string | null;
  grades: Record<string, number | null>; // Key: mapel name, Value: grade
  average: number;
}

interface ReportData {
  students: ReportStudent[];
  subjects: string[];
}

export default function LaporanAkademikPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedTingkat, setSelectedTingkat] = useState<string | undefined>();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  const handleFetchReport = async () => {
    if (!selectedTingkat) {
      toast({ title: "Info", description: "Silakan pilih tingkat terlebih dahulu." });
      return;
    }
    setIsLoadingReport(true);
    setReportData(null);
    try {
      const response = await fetch(`/api/laporan/kelas-detail?tingkat=${encodeURIComponent(selectedTingkat)}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal mengambil data laporan.");
      }
      const data: ReportData = await response.json();
      setReportData(data);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoadingReport(false);
    }
  };

  const getGradeColor = (grade: number | null) => {
    if (grade === null) return "text-muted-foreground";
    if (grade >= 90) return "text-green-500 font-bold";
    if (grade >= 75) return "text-sky-500 font-medium";
    if (grade >= 60) return "text-yellow-500";
    return "text-destructive font-medium";
  };
  
  if (!user || (user.role !== 'pimpinan' && user.role !== 'superadmin')) {
      return <p>Akses Ditolak.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent flex items-center">
            <BarChart3 className="mr-3 h-7 w-7" /> Analisis Nilai Siswa
          </h1>
          <p className="text-muted-foreground">Analisis pencapaian akademik siswa secara mendetail untuk setiap angkatan.</p>
        </div>
        <Button variant="outline" onClick={() => window.print()} className="print:hidden">
          <Printer className="mr-2 h-4 w-4" /> Cetak Laporan
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Filter Laporan</CardTitle>
          <CardDescription>Pilih angkatan (tingkat) untuk melihat laporan rincian nilai.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-end gap-4">
          <div className="w-full sm:w-auto sm:min-w-[250px]">
            <label htmlFor="tingkat-select" className="text-sm font-medium text-muted-foreground">Pilih Angkatan</label>
            <Select onValueChange={setSelectedTingkat} value={selectedTingkat}>
              <SelectTrigger id="tingkat-select">
                <SelectValue placeholder="Pilih tingkat" />
              </SelectTrigger>
              <SelectContent>
                {SCHOOL_GRADE_LEVELS.map(tingkat => <SelectItem key={tingkat} value={tingkat}>Tingkat {tingkat}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleFetchReport} disabled={isLoadingReport || !selectedTingkat}>
            {isLoadingReport ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
            Tampilkan Laporan
          </Button>
        </CardContent>
      </Card>
      
      {isLoadingReport && (
        <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-3 text-muted-foreground">Mengambil data laporan untuk Tingkat {selectedTingkat}...</p>
        </div>
      )}

      {reportData && (
        <Card className="shadow-xl printable-area">
          <CardHeader>
            <div className="print:text-center">
              <CardTitle>Laporan Rincian Nilai: Angkatan Tingkat {selectedTingkat}</CardTitle>
              <CardDescription>Menampilkan rekap nilai akhir untuk setiap siswa di mata pelajaran yang relevan. Diurutkan berdasarkan rata-rata tertinggi.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {reportData.students.length > 0 && reportData.subjects.length > 0 ? (
              <ScrollArea className="max-h-[70vh] w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky left-0 bg-card z-10 min-w-[200px]">Nama Siswa (Kelas)</TableHead>
                      {reportData.subjects.map(subject => <TableHead key={subject} className="text-center min-w-[120px]">{subject}</TableHead>)}
                      <TableHead className="text-center sticky right-0 bg-card z-10 font-bold min-w-[100px]">Rata-Rata</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.students.map(student => (
                      <TableRow key={student.id}>
                        <TableCell className="sticky left-0 bg-card z-10 font-medium">{student.name}<span className="text-xs text-muted-foreground block">{student.kelas || 'N/A'}</span></TableCell>
                        {reportData.subjects.map(subject => (
                          <TableCell key={subject} className={cn("text-center", getGradeColor(student.grades[subject]))}>
                            {student.grades[subject]?.toFixed(2) ?? '-'}
                          </TableCell>
                        ))}
                        <TableCell className={cn("text-center sticky right-0 bg-card z-10 font-bold", getGradeColor(student.average))}>
                          {student.average.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            ) : (
                <p className="text-center text-muted-foreground py-8">Tidak ada data nilai yang ditemukan untuk tingkat ini.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
