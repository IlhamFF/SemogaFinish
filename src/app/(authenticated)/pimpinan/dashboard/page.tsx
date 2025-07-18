
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Users, BookOpenCheck, Loader2, Star, CheckCircle, BookCopy, Printer, User, Percent, BarChartHorizontal, PieChart, TrendingUp, UserMinus, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Line, LineChart as RechartsLineChart, PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Area, AreaChart, BarChart as RechartsBarChart, Bar } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartTooltip } from "@/components/ui/chart";
import React, { useMemo, useEffect, useState, useCallback } from "react";
import type { User as AppUser, Role } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { ROUTES } from "@/lib/constants";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Link from "next/link";


interface AkademikData {
  rataRataKelas: { name: string; rataRata: number }[];
  peringkatSiswa: { nama: string; kelas: string; rataRata: number }[];
  totalSiswa: number;
  totalGuru: number;
  totalKelas: number;
  totalMataPelajaran: number;
  rasioGuruSiswa: string;
  kehadiranSiswaBulanan: { name: string; Kehadiran: number }[];
  distribusiGuruMapel: { name: string; value: number }[];
  sebaranSiswaJurusan: { name: string; value: number }[];
  absensiBermasalah: { nama: string, kelas: string, alphaCount: string }[];
}

const initialAkademikData: AkademikData = {
  rataRataKelas: [],
  peringkatSiswa: [],
  totalSiswa: 0,
  totalGuru: 0,
  totalKelas: 0,
  totalMataPelajaran: 0,
  rasioGuruSiswa: "N/A",
  kehadiranSiswaBulanan: [],
  distribusiGuruMapel: [],
  sebaranSiswaJurusan: [],
  absensiBermasalah: [],
};

const TAHUN_AJARAN_OPTIONS = ["2023/2024", "2022/2023", "2021/2022", "Semua"];
const SEMESTER_OPTIONS = ["Genap", "Ganjil", "Semua"];
const ROLE_COLORS: Record<string, string> = {
    IPA: "hsl(var(--chart-1))",
    IPS: "hsl(var(--chart-2))",
    Lainnya: "hsl(var(--chart-3))",
};
const GURU_MAPEL_COLORS = [ "hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))" ];


export default function PimpinanDashboardPage() {
  const { user: currentUserAuth } = useAuth();
  const { toast } = useToast();
  const [akademikData, setAkademikData] = useState<AkademikData>(initialAkademikData);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  const [selectedTahun, setSelectedTahun] = useState<string>("2023/2024");
  const [selectedSemester, setSelectedSemester] = useState<string>("Genap");

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

  useEffect(() => {
    if (currentUserAuth && (currentUserAuth.role === 'pimpinan' || currentUserAuth.role === 'superadmin')) {
      fetchAllData();
    } else {
        setIsLoadingData(false);
    }
  }, [currentUserAuth, fetchAllData, selectedTahun, selectedSemester]);
  
  const handlePrintReport = () => { window.open(ROUTES.PIMPINAN_LAPORAN_CETAK, '_blank'); };

  const pimpinanStats = useMemo(() => {
    const lastAttendance = akademikData.kehadiranSiswaBulanan.slice(-1)[0]?.Kehadiran;
    return [
      { title: "Total Siswa Aktif", value: isLoadingData ? <Loader2 className="h-5 w-5 animate-spin" /> : akademikData.totalSiswa.toString(), icon: Users, color: "text-purple-400" },
      { title: "Rasio Guru:Siswa", value: isLoadingData ? <Loader2 className="h-5 w-5 animate-spin" /> : akademikData.rasioGuruSiswa.toString(), icon: User, color: "text-green-400" },
      { title: "Kehadiran (Bulan Ini)", value: isLoadingData ? <Loader2 className="h-5 w-5 animate-spin" /> : lastAttendance ? `${lastAttendance}%` : "N/A", icon: Percent, color: "text-pink-400" },
      { title: "Total Mapel", value: isLoadingData ? <Loader2 className="h-5 w-5 animate-spin" /> : `${akademikData.totalMataPelajaran}`, icon: BookCopy, color: "text-sky-400" },
    ];
  }, [isLoadingData, akademikData]);
  
  const chartConfigHorizontal = { rataRata: { label: "Rata-Rata Nilai", color: "hsl(var(--primary))" } } satisfies ChartConfig;
  const chartConfigVertical = { Kehadiran: { label: "Kehadiran (%)", color: "hsl(var(--primary))" } } satisfies ChartConfig;
  const sebaranSiswaConfig = useMemo(() => akademikData.sebaranSiswaJurusan.reduce((acc, cur) => ({...acc, [cur.name]: {label: cur.name, color: ROLE_COLORS[cur.name]}}), {}), [akademikData.sebaranSiswaJurusan]);

  if (!currentUserAuth || (currentUserAuth.role !== 'pimpinan' && currentUserAuth.role !== 'superadmin')) {
    return <p>Akses Ditolak. Anda harus menjadi Pimpinan untuk melihat halaman ini.</p>;
  }
  
  if (isLoadingData && akademikData.totalSiswa === 0) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /> <span className="ml-3">Memuat data dasbor...</span></div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 animate-fade-in-up">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">Dasbor Kinerja Akademik</h1>
          <p className="text-muted-foreground">Gambaran umum kinerja institusi untuk {selectedSemester} {selectedTahun}.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <Select value={selectedTahun} onValueChange={setSelectedTahun}><SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Pilih Tahun Ajaran" /></SelectTrigger><SelectContent>{TAHUN_AJARAN_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select>
            <Select value={selectedSemester} onValueChange={setSelectedSemester}><SelectTrigger className="w-full sm:w-[150px]"><SelectValue placeholder="Pilih Semester" /></SelectTrigger><SelectContent>{SEMESTER_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select>
            <Button onClick={handlePrintReport} variant="outline" className="w-full sm:w-auto"><Printer className="mr-2 h-4 w-4" /> Cetak Laporan</Button>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        {pimpinanStats.map((card, index) => (
             <div key={card.title} className="group relative overflow-hidden rounded-2xl bg-card p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-bl from-primary/10 to-accent/10 opacity-50 rounded-full blur-2xl group-hover:opacity-60 transition-all duration-300" />
                <div className="relative z-10"><div className="flex items-start justify-between"><div><h3 className="text-sm font-medium text-muted-foreground">{card.title}</h3><p className="text-4xl font-bold mt-1">{card.value}</p></div><div className={`w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform`}><card.icon className={`w-5 h-5 ${card.color}`} /></div></div></div>
            </div>
        ))}
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
         <Card className="shadow-lg lg:col-span-2 flex flex-col">
            <CardHeader><CardTitle className="flex items-center"><TrendingUp className="mr-2 h-5 w-5 text-primary" /> Tren Kehadiran Siswa</CardTitle><CardDescription>Persentase kehadiran siswa selama 6 bulan terakhir.</CardDescription></CardHeader>
            <CardContent className="h-[250px] -ml-4 flex-grow">
                <ChartContainer config={chartConfigVertical} className="w-full h-full">
                    <AreaChart accessibilityLayer data={akademikData.kehadiranSiswaBulanan} margin={{ left: 12, right: 12 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[80, 100]} tickFormatter={(value) => `${value}%`} />
                        <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                        <defs>
                            <linearGradient id="fillKehadiran" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-Kehadiran)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="var(--color-Kehadiran)" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="Kehadiran" stroke="var(--color-Kehadiran)" strokeWidth={2} fillOpacity={1} fill="url(#fillKehadiran)" />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="border-t pt-4">
                <Button asChild variant="outline" size="sm" className="ml-auto">
                    <Link href={ROUTES.PIMPINAN_LAPORAN_KEHADIRAN}>
                        Lihat Laporan Detail
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
        <Card className="shadow-lg">
            <CardHeader><CardTitle className="flex items-center"><PieChart className="mr-2 h-5 w-5 text-primary" /> Sebaran Siswa</CardTitle><CardDescription>Distribusi siswa berdasarkan jurusan.</CardDescription></CardHeader>
            <CardContent className="h-[250px] flex items-center justify-center"><ChartContainer config={sebaranSiswaConfig} className="mx-auto aspect-square h-full"><RechartsPieChart><Tooltip content={<ChartTooltipContent hideLabel />} /><Legend content={<ChartLegendContent nameKey="name" />} /><Pie data={akademikData.sebaranSiswaJurusan} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={50}>{akademikData.sebaranSiswaJurusan.map((entry, index) => (<Cell key={`cell-${index}`} fill={ROLE_COLORS[entry.name]} />))}</Pie></RechartsPieChart></ChartContainer></CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><BarChartHorizontal className="mr-2 h-5 w-5 text-primary" /> Rata-rata Nilai per Kelas</CardTitle>
            <CardDescription>Perbandingan rata-rata nilai akhir siswa per kelas.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] pl-0">
            <ChartContainer config={chartConfigHorizontal} className="w-full h-full">
              <RechartsBarChart
                data={akademikData.rataRataKelas.sort((a, b) => a.rataRata - b.rataRata)}
                layout="vertical"
                margin={{ left: 10, right: 30, top: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  width={80}
                  className="text-xs"
                />
                <XAxis dataKey="rataRata" type="number" hide domain={[0, 100]} />
                <ChartTooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="rataRata" fill="hsl(var(--primary))" radius={4} barSize={20} />
              </RechartsBarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader><CardTitle className="flex items-center"><Star className="mr-2 h-5 w-5 text-yellow-400" /> Peringkat Siswa Terbaik</CardTitle><CardDescription>10 siswa dengan rata-rata nilai tertinggi di sekolah.</CardDescription></CardHeader>
          <CardContent><ScrollArea className="h-[300px]"><Table><TableHeader><TableRow><TableHead className="w-[50px]">#</TableHead><TableHead>Nama Siswa</TableHead><TableHead>Kelas</TableHead><TableHead className="text-right">Rata-rata</TableHead></TableRow></TableHeader><TableBody>{akademikData.peringkatSiswa.map((siswa, index) => (<TableRow key={siswa.nama}><TableCell className="font-bold text-lg">{index + 1}</TableCell><TableCell>{siswa.nama}</TableCell><TableCell>{siswa.kelas}</TableCell><TableCell className="text-right font-medium text-primary">{(+siswa.rataRata).toFixed(2)}</TableCell></TableRow>))}</TableBody></Table></ScrollArea></CardContent>
        </Card>
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '800ms' }}>
        <Card className="shadow-lg lg:col-span-2">
            <CardHeader><CardTitle className="flex items-center"><BookCopy className="mr-2 h-5 w-5 text-primary" /> Distribusi Guru per Mata Pelajaran</CardTitle><CardDescription>Jumlah guru yang mengampu setiap mata pelajaran.</CardDescription></CardHeader>
            <CardContent><ScrollArea className="max-h-[250px]"><Table><TableHeader><TableRow><TableHead>Mata Pelajaran</TableHead><TableHead className="text-right">Jumlah Guru</TableHead></TableRow></TableHeader><TableBody>{akademikData.distribusiGuruMapel.sort((a,b) => b.value - a.value).map((item, index) => (<TableRow key={index}><TableCell className="font-medium">{item.name}</TableCell><TableCell className="text-right">{item.value}</TableCell></TableRow>))}</TableBody></Table></ScrollArea></CardContent>
        </Card>
        <Card className="shadow-lg">
            <CardHeader><CardTitle className="flex items-center"><UserMinus className="mr-2 h-5 w-5 text-primary" /> Absensi Bermasalah</CardTitle><CardDescription>Siswa dengan alpha terbanyak (30 hari terakhir).</CardDescription></CardHeader>
            <CardContent><ScrollArea className="max-h-[250px]"><Table><TableHeader><TableRow><TableHead>Nama Siswa</TableHead><TableHead className="text-right">Jumlah Alpha</TableHead></TableRow></TableHeader><TableBody>{akademikData.absensiBermasalah.map((item, index) => (<TableRow key={index}><TableCell className="font-medium">{item.nama}<span className="text-xs text-muted-foreground block">{item.kelas}</span></TableCell><TableCell className="text-right text-destructive font-bold">{item.alphaCount}</TableCell></TableRow>))}</TableBody></Table></ScrollArea></CardContent>
        </Card>
       </div>
    </div>
  );
}
