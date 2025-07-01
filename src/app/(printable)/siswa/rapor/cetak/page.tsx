
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import type { NilaiSemesterSiswa } from '@/types';
import { Loader2, Printer, BookOpenText } from "lucide-react";
import { APP_NAME } from '@/lib/constants';
import { format } from 'date-fns';
import { id as localeID } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

type GroupedGrades = Record<string, NilaiSemesterSiswa[]>;

export default function CetakRaporPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const [grades, setGrades] = useState<NilaiSemesterSiswa[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const fetchGrades = useCallback(async () => {
    if (!user) return;
    setIsLoadingData(true);
    try {
      const response = await fetch('/api/penilaian/semester/me');
      if (!response.ok) throw new Error("Gagal mengambil data rapor.");
      const data: NilaiSemesterSiswa[] = await response.json();
      setGrades(data);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoadingData(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (!isAuthLoading && user) {
      fetchGrades();
    }
  }, [isAuthLoading, user, fetchGrades]);

  useEffect(() => {
    if (!isLoadingData && grades.length > 0) {
      setTimeout(() => window.print(), 1000);
    }
  }, [isLoadingData, grades]);

  const groupedGrades = useMemo(() => {
    return grades.reduce((acc, grade) => {
      const key = `Semester ${grade.semester} - T.A. ${grade.tahunAjaran}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(grade);
      return acc;
    }, {} as GroupedGrades);
  }, [grades]);
  
  const sortedGroupKeys = useMemo(() => {
    return Object.keys(groupedGrades).sort((a, b) => {
        const yearA = a.split('T.A. ')[1];
        const semA = a.split(' ')[1];
        const yearB = b.split('T.A. ')[1];
        const semB = b.split(' ')[1];

        if (yearA !== yearB) return yearB.localeCompare(yearA);
        if (semA === 'Genap' && semB === 'Ganjil') return -1;
        if (semA === 'Ganjil' && semB === 'Genap') return 1;
        return 0;
    });
  }, [groupedGrades]);


  if (isAuthLoading || isLoadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg">Mempersiapkan Rapor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <p className="p-8 text-center text-red-500">Anda tidak terautentikasi. Silakan login kembali.</p>;
  }

  if (grades.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
          <div className="text-center p-8">
            <h1 className="text-xl font-bold">Data Rapor Kosong</h1>
            <p className="text-gray-600 mt-2">Belum ada data nilai semester yang tercatat untuk Anda.</p>
            <Button onClick={() => window.close()} className="mt-4 print:hidden">Tutup Halaman</Button>
          </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 text-black p-4 md:p-8 print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto A4-container bg-white p-6 print:p-8 print:shadow-none shadow-lg">
        <header className="flex justify-between items-center border-b-4 border-gray-900 pb-4">
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
              <h1 className="text-2xl font-bold font-headline text-gray-900">{APP_NAME}</h1>
              <p className="text-sm text-gray-600">Laporan Hasil Belajar Siswa (Rapor)</p>
            </div>
          </div>
          <Button onClick={() => window.print()} className="print:hidden" variant="outline">
            <Printer className="mr-2 h-4 w-4" /> Cetak Ulang
          </Button>
        </header>
        
        <section className="my-6">
          <h2 className="text-lg font-semibold mb-2 text-gray-800">Identitas Siswa</h2>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-gray-200"><td className="py-1 pr-4 font-medium text-gray-600 w-1/3">Nama Lengkap</td><td className="font-semibold text-gray-800">: {user.fullName || "-"}</td></tr>
              <tr className="border-b border-gray-200"><td className="py-1 pr-4 font-medium text-gray-600 w-1/3">Nomor Induk Siswa (NIS)</td><td className="font-semibold text-gray-800">: {user.nis || "-"}</td></tr>
              <tr><td className="py-1 pr-4 font-medium text-gray-600 w-1/3">Kelas</td><td className="font-semibold text-gray-800">: {user.kelasId || "-"}</td></tr>
            </tbody>
          </table>
        </section>

        {sortedGroupKeys.map(groupKey => (
            <section key={groupKey} className="mb-8 break-inside-avoid">
                <h2 className="text-lg font-bold mb-3 bg-gray-100 p-2 rounded-md text-gray-800">{groupKey}</h2>
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="border-b-2 border-black bg-gray-100">
                            <th className="p-2 text-left w-10">No</th>
                            <th className="p-2 text-left">Mata Pelajaran</th>
                            <th className="p-2 text-center w-24">Nilai Akhir</th>
                            <th className="p-2 text-center w-24">Predikat</th>
                            <th className="p-2 text-left">Catatan Guru</th>
                        </tr>
                    </thead>
                    <tbody>
                        {groupedGrades[groupKey].map((grade, index) => (
                            <tr key={grade.id} className="border-b border-gray-200">
                                <td className="p-2 text-center">{index + 1}</td>
                                <td className="p-2">{grade.mapel?.nama || "N/A"}</td>
                                <td className="p-2 text-center font-semibold text-gray-800">{grade.nilaiAkhir ?? "-"}</td>
                                <td className="p-2 text-center font-semibold text-primary">{grade.predikat || "-"}</td>
                                <td className="p-2 text-gray-600 italic text-xs">{grade.catatanGuru || "-"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        ))}

        <footer className="mt-12 pt-8 text-xs text-center text-gray-500 border-t">
          <p>Dokumen ini dihasilkan secara otomatis oleh sistem {APP_NAME} pada {format(new Date(), "dd MMMM yyyy, HH:mm", { locale: localeID })}.</p>
        </footer>
      </div>
    </div>
  );
}
