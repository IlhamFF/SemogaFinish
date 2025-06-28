
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import type { NilaiSemesterSiswa } from '@/types';
import { Loader2, Printer, BookOpenText } from "lucide-react";
import { APP_NAME } from '@/lib/constants';
import { format, parseISO } from 'date-fns';
import { id as localeID } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

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
      // Automatically trigger print dialog
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
        const [,,,,,yearA, semA] = a.replace(/[^\w\s]/g, '').split(' ');
        const [,,,,,yearB, semB] = b.replace(/[^\w\s]/g, '').split(' ');
        if (yearA !== yearB) return yearB.localeCompare(yearA);
        return semB.localeCompare(semA);
    });
  }, [groupedGrades]);


  if (isAuthLoading || isLoadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-900">
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
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-900">
          <div className="text-center p-8">
            <h1 className="text-xl font-bold">Data Rapor Kosong</h1>
            <p className="text-muted-foreground mt-2">Belum ada data nilai semester yang tercatat untuk Anda.</p>
            <Button onClick={() => window.close()} className="mt-4 print:hidden">Tutup Halaman</Button>
          </div>
      </div>
    );
  }

  return (
    <div className="bg-white text-black p-4 md:p-8 print:p-0">
      <div className="max-w-4xl mx-auto A4-container bg-white p-6 print:p-2 print:shadow-none shadow-lg">
        <header className="flex justify-between items-center border-b-4 border-black pb-4">
          <div className="flex items-center gap-4">
            <BookOpenText className="h-16 w-16 text-primary" />
            <div>
              <h1 className="text-2xl font-bold font-headline">{APP_NAME}</h1>
              <p className="text-sm">Laporan Hasil Belajar Siswa (Rapor)</p>
            </div>
          </div>
          <Button onClick={() => window.print()} className="print:hidden" variant="outline">
            <Printer className="mr-2 h-4 w-4" /> Cetak Ulang
          </Button>
        </header>
        
        <section className="my-6">
          <h2 className="text-lg font-semibold mb-2">Identitas Siswa</h2>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b"><td className="py-1 pr-4 font-medium">Nama Lengkap</td><td>: {user.fullName || "-"}</td></tr>
              <tr className="border-b"><td className="py-1 pr-4 font-medium">Nomor Induk Siswa (NIS)</td><td>: {user.nis || "-"}</td></tr>
              <tr><td className="py-1 pr-4 font-medium">Kelas</td><td>: {user.kelasId || "-"}</td></tr>
            </tbody>
          </table>
        </section>

        {sortedGroupKeys.map(groupKey => (
            <section key={groupKey} className="mb-8">
                 <Separator className="my-4"/>
                <h2 className="text-lg font-bold mb-3 bg-gray-100 p-2 rounded-md">{groupKey}</h2>
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="border-b-2 border-black bg-gray-50">
                            <th className="p-2 text-left w-10">No</th>
                            <th className="p-2 text-left">Mata Pelajaran</th>
                            <th className="p-2 text-center w-24">Nilai Akhir</th>
                            <th className="p-2 text-center w-24">Predikat</th>
                            <th className="p-2 text-left">Catatan Guru</th>
                        </tr>
                    </thead>
                    <tbody>
                        {groupedGrades[groupKey].map((grade, index) => (
                            <tr key={grade.id} className="border-b">
                                <td className="p-2 text-center">{index + 1}</td>
                                <td className="p-2">{grade.mapel?.nama || "N/A"}</td>
                                <td className="p-2 text-center font-semibold">{grade.nilaiAkhir ?? "-"}</td>
                                <td className="p-2 text-center">{grade.predikat || "-"}</td>
                                <td className="p-2 text-muted-foreground italic text-xs">{grade.catatanGuru || "-"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        ))}

        <footer className="mt-12 pt-8 text-xs text-center border-t text-gray-500">
          <p>Dokumen ini dihasilkan secara otomatis oleh sistem {APP_NAME} pada {format(new Date(), "dd MMMM yyyy, HH:mm", { locale: localeID })}.</p>
        </footer>
      </div>
    </div>
  );
}
