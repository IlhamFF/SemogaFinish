
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Printer } from "lucide-react";
import { APP_NAME } from '@/lib/constants';
import { format } from 'date-fns';
import { id as localeID } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Image from 'next/image';

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

export default function CetakLaporanPimpinanPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
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
      toast({ title: "Error Data Laporan", description: error.message, variant: "destructive" });
      setAkademikData(initialAkademikData);
    } finally {
      setIsLoadingData(false);
    }
  }, [toast]);
  
  useEffect(() => {
    if (!isAuthLoading && user) {
      fetchAllData();
    }
  }, [isAuthLoading, user, fetchAllData]);

  useEffect(() => {
    if (!isLoadingData && akademikData.totalSiswa > 0) {
      setTimeout(() => window.print(), 1500);
    }
  }, [isLoadingData, akademikData]);

  const pimpinanStats = useMemo(() => {
    return [
      { title: "Total Siswa", value: akademikData.totalSiswa.toString() },
      { title: "Total Guru", value: akademikData.totalGuru.toString() },
      { title: "Jumlah Kelas", value: akademikData.totalKelas.toString() },
      { title: "Total Mata Pelajaran", value: akademikData.totalMataPelajaran.toString() },
    ];
  }, [akademikData]);

  if (isAuthLoading || isLoadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg">Mempersiapkan Laporan Kinerja Akademik...</p>
        </div>
      </div>
    );
  }
  
  if (!user || (user.role !== 'pimpinan' && user.role !== 'superadmin')) {
      return <p className="p-8 text-center text-red-500">Akses Ditolak.</p>;
  }

  if (akademikData.totalSiswa === 0) {
     return (
      <div className="flex min-h-screen items-center justify-center bg-white">
          <div className="text-center p-8">
            <h1 className="text-xl font-bold">Data Laporan Kosong</h1>
            <p className="text-gray-600 mt-2">Belum ada data akademik yang memadai untuk membuat laporan.</p>
            <Button onClick={() => window.close()} className="mt-4 print:hidden">Tutup Halaman</Button>
          </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 text-black p-4 sm:p-8 print:p-0 print:bg-white font-sans">
      <div className="max-w-4xl mx-auto A4-container bg-white p-8 print:shadow-none shadow-lg">
        <header className="flex justify-between items-start border-b-4 border-gray-900 pb-4">
          <div className="flex items-center gap-4">
             <Image 
                src="/logo.png" 
                alt="Logo Sekolah"
                width={60}
                height={60}
                className="object-contain"
                data-ai-hint="logo"
             />
             <div>
                <h1 className="text-3xl font-bold font-headline text-gray-900">{APP_NAME}</h1>
                <p className="text-md text-gray-700">Laporan Kinerja Akademik</p>
             </div>
          </div>
          <div className="text-right text-sm text-gray-600">
            <p><strong>Dicetak oleh:</strong> {user.fullName || user.name}</p>
            <p><strong>Tanggal Cetak:</strong> {format(new Date(), "dd MMMM yyyy", { locale: localeID })}</p>
          </div>
        </header>

        <section className="my-8">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2 text-gray-800">Ringkasan Statistik Utama</h2>
          <div className="grid grid-cols-2 gap-4">
            {pimpinanStats.map(stat => (
              <div key={stat.title} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="my-8">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2 text-gray-800">Peringkat 10 Siswa Terbaik (Keseluruhan)</h2>
            <Table>
                <TableHeader>
                    <TableRow className="bg-gray-100">
                    <TableHead className="w-[50px]">Peringkat</TableHead>
                    <TableHead>Nama Siswa</TableHead>
                    <TableHead>Kelas</TableHead>
                    <TableHead className="text-right">Rata-rata Nilai</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {akademikData.peringkatSiswa.map((siswa, index) => (
                    <TableRow key={`${siswa.nama}-${index}`}>
                        <TableCell className="font-bold text-center">{index + 1}</TableCell>
                        <TableCell>{siswa.nama}</TableCell>
                        <TableCell>{siswa.kelas}</TableCell>
                        <TableCell className="text-right font-medium text-blue-600">{(+siswa.rataRata).toFixed(2)}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
        </section>

        <section className="my-8 break-inside-avoid">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2 text-gray-800">Rata-rata Nilai per Kelas</h2>
            <Table>
                <TableHeader>
                <TableRow className="bg-gray-100">
                    <TableHead>Kelas</TableHead>
                    <TableHead className="text-right">Rata-rata Nilai Akhir</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {akademikData.rataRataKelas.sort((a,b) => b.rataRata - a.rataRata).map((item) => (
                    <TableRow key={item.name}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-right font-semibold text-blue-600">{item.rataRata.toFixed(2)}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </section>
        
        <footer className="mt-12 pt-8 text-xs text-center text-gray-500 border-t">
            <p>*** Laporan Internal - {APP_NAME} ***</p>
        </footer>
         <div className="flex justify-end mt-8 print:hidden">
            <Button onClick={() => window.print()} variant="default">
                <Printer className="mr-2 h-4 w-4" /> Cetak Laporan
            </Button>
        </div>
      </div>
    </div>
  );
}
