
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, Search, Loader2, Printer, ChevronRight, Users, Star, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { SCHOOL_GRADE_LEVELS, SCHOOL_MAJORS, SCHOOL_CLASSES_PER_MAJOR_GRADE } from "@/lib/constants";
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { ClassReport, ReportData } from '@/app/api/laporan/kelas-detail/route';
import Papa from "papaparse";

export default function LaporanAkademikPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
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
    if (!selectedTingkat) {
      toast({ title: "Info", description: "Silakan pilih angkatan terlebih dahulu." });
      return;
    }
    setIsLoadingReport(true);
    setReportData(null);
    try {
      let apiUrl = `/api/laporan/kelas-detail?tingkat=${encodeURIComponent(selectedTingkat)}`;
      if (selectedKelas && selectedKelas !== "semua") {
        apiUrl += `&kelas=${encodeURIComponent(selectedKelas)}`;
      }

      const response = await fetch(apiUrl);
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
    if (grade === null || typeof grade !== 'number' || isNaN(grade)) return "text-muted-foreground";
    if (grade >= 90) return "text-green-500 font-bold";
    if (grade >= 75) return "text-sky-500 font-medium";
    if (grade >= 60) return "text-yellow-500";
    return "text-destructive font-medium";
  };
  
  if (!user || (user.role !== 'pimpinan' && user.role !== 'superadmin')) {
      return <p>Akses Ditolak.</p>;
  }
  
  const reportTitle = useMemo(() => {
    if (!selectedTingkat) return "Analisis Nilai Siswa";
    let title = `Laporan Rincian Nilai: Angkatan Tingkat ${selectedTingkat}`;
    if (selectedKelas !== "semua") {
        title = `Laporan Rincian Nilai: Kelas ${selectedKelas}`;
    }
    return title;
  }, [selectedTingkat, selectedKelas]);

  const handleExportCsv = () => {
    if (!reportData || reportData.classReports.length === 0) {
      toast({
        title: "Tidak Ada Data",
        description: "Tidak ada data untuk diekspor. Silakan tampilkan laporan terlebih dahulu.",
        variant: "default",
      });
      return;
    }

    const dataToExport: any[] = [];
    const subjects = reportData.subjects;

    reportData.classReports.forEach(classReport => {
      classReport.students.forEach(student => {
        const row: Record<string, any> = {
          "Kelompok": classReport.className,
          "NIS": student.nis || "N/A",
          "Nama Siswa": student.name,
        };
        subjects.forEach(subject => {
          row[subject] = student.grades[subject] !== null ? student.grades[subject]?.toFixed(2) : "";
        });
        row["Rata-Rata"] = student.average.toFixed(2);
        dataToExport.push(row);
      });
    });

    const csv = Papa.unparse(dataToExport, {
      columns: ["Kelompok", "NIS", "Nama Siswa", ...subjects, "Rata-Rata"],
      header: true
    });

    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    let fileName = `laporan_nilai_angkatan_${selectedTingkat}`;
    if(selectedKelas && selectedKelas !== 'semua') {
        fileName = `laporan_nilai_kelas_${selectedKelas.replace(/ /g, '_')}`;
    }
    fileName += '.csv';

    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent flex items-center">
            <BarChart3 className="mr-3 h-7 w-7" /> Analisis Nilai Siswa
          </h1>
          <p className="text-muted-foreground">Analisis pencapaian akademik siswa per angkatan atau per kelas.</p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <Button variant="outline" onClick={handleExportCsv} disabled={!reportData || isLoadingReport}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" /> Cetak Laporan
          </Button>
        </div>
      </div>

      <Card className="shadow-lg print:hidden">
        <CardHeader>
          <CardTitle>Filter Laporan</CardTitle>
          <CardDescription>Pilih angkatan dan kelas untuk melihat laporan rincian nilai.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-end gap-4">
          <div className="w-full sm:w-auto sm:min-w-[200px]">
            <Label htmlFor="tingkat-select">Pilih Angkatan</Label>
            <Select onValueChange={setSelectedTingkat} value={selectedTingkat}>
              <SelectTrigger id="tingkat-select">
                <SelectValue placeholder="Pilih tingkat" />
              </SelectTrigger>
              <SelectContent>
                {SCHOOL_GRADE_LEVELS.map(tingkat => <SelectItem key={tingkat} value={tingkat}>Tingkat {tingkat}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-auto sm:min-w-[200px]">
            <Label htmlFor="kelas-select">Pilih Kelas</Label>
             <Select onValueChange={setSelectedKelas} value={selectedKelas} disabled={!selectedTingkat}>
              <SelectTrigger id="kelas-select">
                <SelectValue placeholder="Pilih kelas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Kelas Angkatan Ini</SelectItem>
                {availableKelas.map(kls => <SelectItem key={kls} value={kls}>{kls}</SelectItem>)}
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
            <p className="ml-3 text-muted-foreground">Mengambil data laporan...</p>
        </div>
      )}

      {reportData && (
        <Card className="shadow-xl printable-area">
          <CardHeader>
            <div className="print:text-center">
              <CardTitle>{reportTitle}</CardTitle>
              <CardDescription>
                Menampilkan rekapitulasi nilai per kelompok, diurutkan berdasarkan rata-rata kelompok tertinggi.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {reportData.classReports.length > 0 && reportData.subjects.length > 0 ? (
               <Accordion type="single" collapsible className="w-full" defaultValue={reportData.classReports[0]?.className}>
                {reportData.classReports.map((classReport) => (
                  <AccordionItem value={classReport.className} key={classReport.className}>
                    <AccordionTrigger className="text-lg font-medium hover:no-underline rounded-lg px-4 hover:bg-muted/50">
                        <div className="flex items-center gap-4">
                            <span className="text-primary">{classReport.className}</span>
                            <div className="flex items-center text-sm font-normal text-muted-foreground">
                                <Users className="mr-1.5 h-4 w-4" />
                                {classReport.students.length} Siswa
                            </div>
                             <div className="flex items-center text-sm font-normal text-muted-foreground">
                                <Star className="mr-1.5 h-4 w-4" />
                                Rata-rata: <span className="font-semibold ml-1">{classReport.classAverage.toFixed(2)}</span>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ScrollArea className="max-h-[70vh] w-full">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead className="w-[40px] text-center">#</TableHead>
                                <TableHead className="sticky left-0 bg-background z-10 min-w-[200px]">Nama Siswa (NIS)</TableHead>
                                {reportData.subjects.map(subject => <TableHead key={subject} className="text-center min-w-[120px]">{subject}</TableHead>)}
                                <TableHead className="text-center sticky right-0 bg-background z-10 font-bold min-w-[100px]">Rata-Rata</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {classReport.students.map((student, index) => (
                                <TableRow key={student.id}>
                                    <TableCell className="text-center font-medium">{index + 1}</TableCell>
                                    <TableCell className="sticky left-0 bg-background z-10 font-medium">{student.name}<span className="text-xs text-muted-foreground block">{student.nis || 'N/A'}</span></TableCell>
                                    {reportData.subjects.map(subject => (
                                    <TableCell key={subject} className={cn("text-center", getGradeColor(student.grades[subject]))}>
                                        {student.grades[subject] !== null ? student.grades[subject]?.toFixed(2) : '-'}
                                    </TableCell>
                                    ))}
                                    <TableCell className={cn("text-center sticky right-0 bg-background z-10 font-bold", getGradeColor(student.average))}>
                                    {student.average.toFixed(2)}
                                    </TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                      </ScrollArea>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
                <p className="text-center text-muted-foreground py-8">Tidak ada data nilai yang ditemukan untuk filter yang dipilih.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
