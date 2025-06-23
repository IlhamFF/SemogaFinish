"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, TrendingUp, BookOpenCheck, BarChartHorizontalBig, Loader2, Trophy } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import React, { useMemo, useEffect, useState, useCallback } from "react";
import type { User as AppUser, Role } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { ROLES } from "@/lib/constants";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface AkademikData {
  rataRataKelas: { name: string; rataRata: number }[];
  peringkatSiswa: { nama: string; kelas: string; rataRata: number }[];
  totalSiswa: number;
  totalGuru: number;
  totalKelas: number;
  totalMataPelajaran: number;
}

const initialAkademikData: AkademikData = {
  rataRataKelas: [],
  peringkatSiswa: [],
  totalSiswa: 0,
  totalGuru: 0,
  totalKelas: 0,
  totalMataPelajaran: 0,
};

export default function PimpinanDashboardPage() {
  const { user: currentUserAuth } = useAuth();
  const { toast } = useToast();
  const [akademikData, setAkademikData] = useState<AkademikData>(initialAkademikData);
  const [isLoadingData, setIsLoadingData] = useState(true);

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
  }, [currentUserAuth, fetchAllData]);

  const pimpinanStats = useMemo(() => {
    const rataRataSekolah = akademikData.rataRataKelas.length > 0
      ? (akademikData.rataRataKelas.reduce((acc, curr) => acc + curr.rataRata, 0) / akademikData.rataRataKelas.length).toFixed(2)
      : 0;
    
    return [
      { title: "Total Siswa Aktif", value: isLoadingData ? <Loader2 className="h-5 w-5 animate-spin" /> : akademikData.totalSiswa.toString(), icon: Users, color: "text-primary" },
      { title: "Total Guru", value: isLoadingData ? <Loader2 className="h-5 w-5 animate-spin" /> : akademikData.totalGuru.toString(), icon: Users, color: "text-green-500" },
      { title: "Jumlah Kelas", value: isLoadingData ? <Loader2 className="h-5 w-5 animate-spin" /> : akademikData.totalKelas.toString(), icon: BookOpenCheck, color: "text-yellow-500" },
      { title: "Nilai Rata-rata Sekolah", value: isLoadingData ? <Loader2 className="h-5 w-5 animate-spin" /> : rataRataSekolah.toString(), icon: TrendingUp, color: "text-indigo-500" },
    ];
  }, [isLoadingData, akademikData]);
  
  
  const chartConfigClassDist = {
    rataRata: {
      label: "Rata-Rata Nilai",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig;


  if (!currentUserAuth || (currentUserAuth.role !== 'pimpinan' && currentUserAuth.role !== 'superadmin')) {
    return <p>Akses Ditolak. Anda harus menjadi Pimpinan untuk melihat halaman ini.</p>;
  }
  
  if (isLoadingData) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /> <span className="ml-3">Memuat data dasbor...</span></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold">Dasbor Pimpinan SMA Az-Bail</h1>
      <p className="text-muted-foreground">Selamat datang, {currentUserAuth.fullName || currentUserAuth.name || currentUserAuth.email}! Gambaran umum kinerja institusi dan metrik utama.</p>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {pimpinanStats.map((card) => (
          <Card key={card.title} className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChartHorizontalBig className="mr-2 h-5 w-5 text-primary" />
              Performa Rata-rata per Kelas
            </CardTitle>
            <CardDescription>Perbandingan nilai rata-rata akhir dari semua mata pelajaran di setiap kelas.</CardDescription>
          </CardHeader>
          <CardContent>
            {akademikData.rataRataKelas.length > 0 ? (
              <div className="h-[400px]">
                  <ChartContainer config={chartConfigClassDist} className="w-full h-full">
                    <BarChart data={akademikData.rataRataKelas} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                       <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" stroke="hsl(var(--foreground))" fontSize={12} domain={[0, 100]} />
                      <YAxis dataKey="name" type="category" stroke="hsl(var(--foreground))" fontSize={10} width={80} interval={0} />
                      <Tooltip content={<ChartTooltipContent />} cursor={{ fill: 'hsl(var(--muted))' }}/>
                      <Bar dataKey="rataRata" fill="var(--color-rataRata)" radius={[0, 4, 4, 0]} barSize={15} />
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
              <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
              Peringkat Teratas Siswa
            </CardTitle>
            <CardDescription>5 siswa dengan nilai rata-rata keseluruhan tertinggi.</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
             {akademikData.peringkatSiswa.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Peringkat</TableHead>
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
            ) : (
              <p className="text-muted-foreground text-center py-4">Data peringkat siswa belum tersedia.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
