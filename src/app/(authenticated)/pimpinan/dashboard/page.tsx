
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, BookOpenCheck, Loader2, Star, CheckCircle, BookCopy, Printer } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import React, { useMemo, useEffect, useState, useCallback } from "react";
import type { User as AppUser, Role } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { ROUTES } from "@/lib/constants";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";


interface AkademikData {
  rataRataKelas: { name: string; rataRata: number }[];
  peringkatSiswa: { nama: string; kelas: string; rataRata: number }[];
  totalSiswa: number;
  totalGuru: number;
  totalKelas: number;
  totalMataPelajaran: number;
}

interface DetailedStudentGrade {
    id: string;
    name: string;
    nis: string | null;
    average: number;
    grades: Record<string, number | null>;
}

interface DetailedClassData {
    students: DetailedStudentGrade[];
    subjects: string[];
}

const initialAkademikData: AkademikData = {
  rataRataKelas: [],
  peringkatSiswa: [],
  totalSiswa: 0,
  totalGuru: 0,
  totalKelas: 0,
  totalMataPelajaran: 0,
};

const TAHUN_AJARAN_OPTIONS = ["Semua", "2023/2024", "2022/2023", "2021/2022"];
const SEMESTER_OPTIONS = ["Semua", "Ganjil", "Genap"];

export default function PimpinanDashboardPage() {
  const { user: currentUserAuth } = useAuth();
  const { toast } = useToast();
  const [akademikData, setAkademikData] = useState<AkademikData>(initialAkademikData);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  const [selectedKelas, setSelectedKelas] = useState<string | undefined>();
  const [detailedClassData, setDetailedClassData] = useState<DetailedClassData>({ students: [], subjects: [] });
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  
  const [selectedTahun, setSelectedTahun] = useState<string>("Semua");
  const [selectedSemester, setSelectedSemester] = useState<string>("Semua");


  const fetchAllData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const akademikRes = await fetch('/api/laporan/akademik');
      if (!akademikRes.ok) {
        const errorData = await akademikRes.json();
        throw new Error(errorData.message || "Gagal mengambil data laporan akademik.");
      }
      setAkademikData(await akademikRes.json());
    } catch (error: any) {
      toast({ title: "Error Data Dasbor", description: error.message, variant: "destructive" });
      setAkademikData(initialAkademikData);
    } finally {
      setIsLoadingData(false);
    }
  }, [toast]);
  
  const fetchDetailedData = useCallback(async () => {
    if (!selectedKelas) {
      setDetailedClassData({ students: [], subjects: [] });
      return;
    }
    setIsLoadingDetails(true);
    try {
      const res = await fetch(`/api/laporan/kelas-detail?kelasId=${encodeURIComponent(selectedKelas)}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Gagal mengambil data detail kelas.");
      }
      setDetailedClassData(await res.json());
    } catch (e: any) {
      toast({ title: "Error Detail Kelas", description: e.message, variant: "destructive" });
      setDetailedClassData({ students: [], subjects: [] });
    } finally {
      setIsLoadingDetails(false);
    }
  }, [selectedKelas, toast]);

  useEffect(() => {
    if (currentUserAuth && (currentUserAuth.role === 'pimpinan' || currentUserAuth.role === 'superadmin')) {
      fetchAllData();
    } else {
        setIsLoadingData(false);
    }
  }, [currentUserAuth, fetchAllData]);
  
  useEffect(() => {
    if (!selectedKelas && akademikData.rataRataKelas.length > 0) {
      setSelectedKelas(akademikData.rataRataKelas[0].name);
    }
  }, [akademikData.rataRataKelas, selectedKelas]);
  
  useEffect(() => {
    if (selectedKelas) {
      fetchDetailedData();
    }
  }, [selectedKelas, fetchDetailedData]);


  const pimpinanStats = useMemo(() => {
    return [
      { title: "Total Siswa", value: isLoadingData ? <Loader2 className="h-5 w-5 animate-spin" /> : akademikData.totalSiswa.toString(), icon: Users, color: "text-purple-400", description: "SMA Az-Bail" },
      { title: "Total Guru", value: isLoadingData ? <Loader2 className="h-5 w-5 animate-spin" /> : akademikData.totalGuru.toString(), icon: Users, color: "text-green-400", description: "Tenaga Pengajar" },
      { title: "Jumlah Kelas", value: isLoadingData ? <Loader2 className="h-5 w-5 animate-spin" /> : akademikData.totalKelas.toString(), icon: BookOpenCheck, color: "text-pink-400", description: "IPA & IPS" },
      { title: "Kelulusan (Simulasi)", value: "95%", icon: CheckCircle, color: "text-amber-400", description: "Target: 90%" },
    ];
  }, [isLoadingData, akademikData]);
  
  
  const chartConfigClassDist = {
    rataRata: {
      label: "Rata-Rata Nilai",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig;

  const sortedClassAverages = useMemo(() => {
    if (isLoadingData) return [];
    return [...akademikData.rataRataKelas].sort((a,b) => b.rataRata - a.rataRata);
  }, [akademikData.rataRataKelas, isLoadingData])

  const handlePrintReport = () => {
    window.open(ROUTES.PIMPINAN_LAPORAN_CETAK, '_blank');
  };

  if (!currentUserAuth || (currentUserAuth.role !== 'pimpinan' && currentUserAuth.role !== 'superadmin')) {
    return <p>Akses Ditolak. Anda harus menjadi Pimpinan untuk melihat halaman ini.</p>;
  }
  
  if (isLoadingData && !selectedKelas) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /> <span className="ml-3">Memuat data dasbor...</span></div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 animate-fade-in-up">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">Dasbor Pimpinan</h1>
          <p className="text-muted-foreground">Selamat datang, {currentUserAuth.fullName || currentUserAuth.name || currentUserAuth.email}! Gambaran umum kinerja institusi.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <Select value={selectedTahun} onValueChange={setSelectedTahun}>
                <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Pilih Tahun Ajaran" /></SelectTrigger>
                <SelectContent>{TAHUN_AJARAN_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger className="w-full sm:w-[150px]"><SelectValue placeholder="Pilih Semester" /></SelectTrigger>
                <SelectContent>{SEMESTER_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
            <Button onClick={handlePrintReport} variant="outline" className="w-full sm:w-auto">
              <Printer className="mr-2 h-4 w-4" /> Cetak
            </Button>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        {pimpinanStats.map((card, index) => (
             <div key={card.title} className="group relative overflow-hidden rounded-2xl bg-card p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className={`absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-bl from-primary/10 to-accent/10 opacity-50 rounded-full blur-2xl group-hover:opacity-60 transition-all duration-300`} />
                <div className="relative z-10">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground">{card.title}</h3>
                            <p className="text-4xl font-bold mt-1">{card.value}</p>
                            <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
                        </div>
                        <div className={`w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <card.icon className={`w-5 h-5 ${card.color}`} />
                        </div>
                    </div>
                </div>
            </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              Rata-rata Nilai per Kelas
            </CardTitle>
            <CardDescription>Visualisasi perbandingan rata-rata nilai akhir siswa per kelas.</CardDescription>
          </CardHeader>
          <CardContent>
            {sortedClassAverages.length > 0 ? (
                <div className="h-[300px] -ml-4">
                  <ChartContainer config={chartConfigClassDist} className="w-full h-full">
                    <BarChart data={akademikData.rataRataKelas} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                       <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
                      <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={10} width={80} interval={0} tickLine={false} axisLine={false} />
                      <Tooltip content={<ChartTooltipContent />} cursor={{ fill: 'hsl(var(--accent))' }}/>
                      <Bar dataKey="rataRata" fill="var(--color-rataRata)" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ChartContainer>
                </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">Data nilai rata-rata kelas belum tersedia.</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="mr-2 h-5 w-5 text-yellow-400" />
              Peringkat Siswa Terbaik
            </CardTitle>
            <CardDescription>10 siswa dengan rata-rata nilai tertinggi di sekolah.</CardDescription>
          </CardHeader>
          <CardContent className="h-auto">
             {akademikData.peringkatSiswa.length > 0 ? (
              <ScrollArea className="max-h-[300px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">#</TableHead>
                      <TableHead>Nama Siswa</TableHead>
                      <TableHead>Kelas</TableHead>
                      <TableHead className="text-right">Rata-rata</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {akademikData.peringkatSiswa.map((siswa, index) => (
                      <TableRow key={siswa.nama}>
                        <TableCell className="font-bold text-lg">{index + 1}</TableCell>
                        <TableCell>{siswa.nama}</TableCell>
                        <TableCell>{siswa.kelas}</TableCell>
                        <TableCell className="text-right font-medium text-primary">{(+siswa.rataRata).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            ) : (
              <p className="text-muted-foreground text-center py-4">Data peringkat siswa belum tersedia.</p>
            )}
          </CardContent>
        </Card>
      </div>

       <div className="mt-6 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
        <Card className="shadow-lg col-span-1 lg:col-span-2">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <CardTitle className="flex items-center">
                  <BookCopy className="mr-2 h-5 w-5 text-primary" />
                  Detail Nilai per Kelas
                </CardTitle>
                <CardDescription>Pilih kelas untuk melihat rincian nilai semua siswa.</CardDescription>
              </div>
              <Select value={selectedKelas} onValueChange={setSelectedKelas} disabled={akademikData.rataRataKelas.length === 0}>
                <SelectTrigger className="w-full sm:w-[200px] print:hidden">
                  <SelectValue placeholder="Pilih Kelas" />
                </SelectTrigger>
                <SelectContent>
                  {akademikData.rataRataKelas.map(k => (
                    <SelectItem key={k.name} value={k.name}>{k.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingDetails ? (
              <div className="flex h-60 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : detailedClassData.students.length > 0 ? (
              <ScrollArea className="max-h-[500px] w-full">
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px] sticky left-0 bg-card z-10">#</TableHead>
                      <TableHead className="min-w-[180px] sticky left-10 bg-card z-10">Nama Siswa</TableHead>
                      {detailedClassData.subjects.map(subject => (
                        <TableHead key={subject} className="text-center">{subject}</TableHead>
                      ))}
                      <TableHead className="text-right font-semibold">Rata-rata</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detailedClassData.students.map((student, index) => (
                      <TableRow key={student.id}>
                        <TableCell className="sticky left-0 bg-card z-10">{index + 1}</TableCell>
                        <TableCell className="sticky left-10 bg-card z-10 font-medium">{student.name}</TableCell>
                        {detailedClassData.subjects.map(subject => (
                          <TableCell key={subject} className="text-center">
                            {student.grades[subject] != null ? Number(student.grades[subject]).toFixed(2) : '-'}
                          </TableCell>
                        ))}
                        <TableCell className="text-right font-semibold text-primary">{student.average.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            ) : (
              <p className="text-muted-foreground text-center py-4">Pilih kelas untuk menampilkan data atau tidak ada data nilai untuk kelas ini.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
