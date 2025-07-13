"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Printer, Users, BookOpen, GraduationCap, TrendingUp, AlertTriangle, Award } from "lucide-react";
import { APP_NAME } from '@/lib/constants';
import { format } from 'date-fns';
import { id as localeID } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Image from 'next/image';
import { Progress } from "@/components/ui/progress";

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

// Simple Bar Chart Component for Print
const SimpleBarChart = ({ data, label }: { data: { name: string; value: number }[], label: string }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="space-y-2">
      {data.map((item, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className="w-20 text-sm text-gray-600 text-right">{item.name}</div>
          <div className="flex-1 relative bg-gray-100 h-6 rounded">
            <div 
              className="absolute left-0 top-0 h-full bg-blue-500 rounded"
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            />
            <span className="absolute right-2 top-1 text-xs font-medium">{item.value}{label}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

// Simple Pie Chart Component for Print
const SimplePieChart = ({ data }: { data: { name: string; value: number }[] }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  
  return (
    <div className="flex items-center justify-between gap-8">
      <div className="relative w-48 h-48">
        <svg viewBox="0 0 100 100" className="transform -rotate-90">
          {data.reduce((acc, item, index) => {
            const percentage = (item.value / total) * 100;
            const startAngle = acc;
            const endAngle = acc + percentage;
            const largeArcFlag = percentage > 50 ? 1 : 0;
            const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 50);
            const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 50);
            const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 50);
            const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 50);
            
            return (
              <React.Fragment key={index}>
                <path
                  d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                  fill={colors[index % colors.length]}
                  stroke="white"
                  strokeWidth="1"
                />
                {acc + percentage}
              </React.Fragment>
            );
          }, 0)}
        </svg>
      </div>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded"
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            <span className="text-sm">{item.name}: {item.value} ({((item.value / total) * 100).toFixed(1)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function CetakLaporanPimpinanPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const [akademikData, setAkademikData] = useState<AkademikData>(initialAkademikData);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [selectedPeriod] = useState({ tahun: "2023/2024", semester: "Genap" });

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
      { title: "Total Siswa", value: akademikData.totalSiswa.toString(), icon: Users, color: "text-blue-600" },
      { title: "Total Guru", value: akademikData.totalGuru.toString(), icon: GraduationCap, color: "text-green-600" },
      { title: "Jumlah Kelas", value: akademikData.totalKelas.toString(), icon: BookOpen, color: "text-purple-600" },
      { title: "Rasio Guru:Siswa", value: akademikData.rasioGuruSiswa, icon: TrendingUp, color: "text-orange-600" },
    ];
  }, [akademikData]);

  const averageAttendance = useMemo(() => {
    if (akademikData.kehadiranSiswaBulanan.length === 0) return 0;
    const sum = akademikData.kehadiranSiswaBulanan.reduce((acc, item) => acc + item.Kehadiran, 0);
    return (sum / akademikData.kehadiranSiswaBulanan.length).toFixed(1);
  }, [akademikData.kehadiranSiswaBulanan]);

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
      <div className="max-w-5xl mx-auto bg-white print:shadow-none shadow-lg">
        {/* Cover Page */}
        <div className="p-8 print:p-12 min-h-screen flex flex-col justify-between page-break-after">
          <div>
            <header className="text-center mb-12">
              <Image 
                src="/logo.png" 
                alt="Logo Sekolah"
                width={120}
                height={120}
                className="object-contain mx-auto mb-6"
              />
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{APP_NAME}</h1>
              <div className="w-32 h-1 bg-blue-600 mx-auto mb-6"></div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">LAPORAN KINERJA AKADEMIK</h2>
              <p className="text-lg text-gray-600">Tahun Ajaran {selectedPeriod.tahun} - Semester {selectedPeriod.semester}</p>
            </header>
            
            <div className="mt-16 bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-center">EXECUTIVE SUMMARY</h3>
              <div className="grid grid-cols-2 gap-6">
                {pimpinanStats.map((stat) => (
                  <div key={stat.title} className="text-center">
                    <stat.icon className={`w-12 h-12 mx-auto mb-2 ${stat.color}`} />
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <footer className="text-center text-sm text-gray-500 mt-12">
            <p>Dicetak oleh: {user.fullName || user.name}</p>
            <p>Tanggal: {format(new Date(), "dd MMMM yyyy", { locale: localeID })}</p>
          </footer>
        </div>

        {/* Content Pages */}
        <div className="p-8 print:p-12">
          {/* Section 1: Analisis Akademik */}
          <section className="mb-12 page-break-inside-avoid">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
              <Award className="mr-3 text-blue-600" /> I. ANALISIS PRESTASI AKADEMIK
            </h2>
            
            <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">A. Peringkat 10 Siswa Terbaik</h3>
              <Table className="border">
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead className="border text-center w-16">Peringkat</TableHead>
                    <TableHead className="border">Nama Siswa</TableHead>
                    <TableHead className="border">Kelas</TableHead>
                    <TableHead className="border text-center">Rata-rata</TableHead>
                    <TableHead className="border text-center">Predikat</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {akademikData.peringkatSiswa.map((siswa, index) => {
                    const nilai = +siswa.rataRata;
                    const predikat = nilai >= 90 ? "A" : nilai >= 80 ? "B" : nilai >= 70 ? "C" : "D";
                    return (
                      <TableRow key={`${siswa.nama}-${index}`}>
                        <TableCell className="border text-center font-bold">{index + 1}</TableCell>
                        <TableCell className="border">{siswa.nama}</TableCell>
                        <TableCell className="border">{siswa.kelas}</TableCell>
                        <TableCell className="border text-center font-semibold">{nilai.toFixed(2)}</TableCell>
                        <TableCell className="border text-center font-bold text-blue-600">{predikat}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">B. Analisis Nilai per Kelas</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Table className="border">
                    <TableHeader>
                      <TableRow className="bg-gray-100">
                        <TableHead className="border">Kelas</TableHead>
                        <TableHead className="border text-center">Rata-rata</TableHead>
                        <TableHead className="border text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {akademikData.rataRataKelas.sort((a,b) => b.rataRata - a.rataRata).map((item) => {
                        const status = item.rataRata >= 75 ? "Baik" : "Perlu Perhatian";
                        const statusColor = item.rataRata >= 75 ? "text-green-600" : "text-red-600";
                        return (
                          <TableRow key={item.name}>
                            <TableCell className="border">{item.name}</TableCell>
                            <TableCell className="border text-center font-semibold">{item.rataRata.toFixed(2)}</TableCell>
                            <TableCell className={`border text-center font-semibold ${statusColor}`}>{status}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-2">Visualisasi Rata-rata Nilai</h4>
                  <SimpleBarChart 
                    data={akademikData.rataRataKelas.map(k => ({ name: k.name, value: k.rataRata }))} 
                    label=""
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Kehadiran */}
          <section className="mb-12 page-break-before page-break-inside-avoid">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
              <TrendingUp className="mr-3 text-green-600" /> II. ANALISIS KEHADIRAN
            </h2>
            
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">A. Trend Kehadiran Bulanan</h3>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Rata-rata Kehadiran 6 Bulan: <span className="text-2xl font-bold text-green-600">{averageAttendance}%</span></p>
                </div>
                <SimpleBarChart 
                  data={akademikData.kehadiranSiswaBulanan.map(k => ({ name: k.name, value: k.Kehadiran }))} 
                  label="%"
                />
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <AlertTriangle className="mr-2 text-red-500 w-5 h-5" /> B. Siswa dengan Absensi Bermasalah
              </h3>
              <Table className="border">
                <TableHeader>
                  <TableRow className="bg-red-50">
                    <TableHead className="border">Nama Siswa</TableHead>
                    <TableHead className="border">Kelas</TableHead>
                    <TableHead className="border text-center">Jumlah Alpha (30 hari)</TableHead>
                    <TableHead className="border text-center">Tindak Lanjut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {akademikData.absensiBermasalah.slice(0, 10).map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="border">{item.nama}</TableCell>
                      <TableCell className="border">{item.kelas}</TableCell>
                      <TableCell className="border text-center font-bold text-red-600">{item.alphaCount}</TableCell>
                      <TableCell className="border text-center text-sm">
                        {+item.alphaCount >= 10 ? "Panggilan Orang Tua" : "Pembinaan"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>

          {/* Section 3: SDM */}
          <section className="mb-12 page-break-before page-break-inside-avoid">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
              <Users className="mr-3 text-purple-600" /> III. ANALISIS SUMBER DAYA
            </h2>
            
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">A. Distribusi Guru per Mata Pelajaran</h3>
                <Table className="border">
                  <TableHeader>
                    <TableRow className="bg-gray-100">
                      <TableHead className="border">Mata Pelajaran</TableHead>
                      <TableHead className="border text-center">Jumlah Guru</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {akademikData.distribusiGuruMapel.sort((a,b) => b.value - a.value).slice(0, 10).map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="border">{item.name}</TableCell>
                        <TableCell className="border text-center font-semibold">{item.value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">B. Sebaran Siswa per Jurusan</h3>
                <SimplePieChart data={akademikData.sebaranSiswaJurusan} />
              </div>
            </div>
          </section>

          {/* Section 4: Rekomendasi */}
          <section className="mb-12 page-break-before">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">IV. REKOMENDASI & TINDAK LANJUT</h2>
            
            <div className="space-y-4">
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h3 className="font-semibold text-yellow-800 mb-2">Aspek Akademik:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  <li>Perlu program remedial untuk kelas dengan rata-rata di bawah 75</li>
                  <li>Pengembangan program pengayaan untuk siswa berprestasi</li>
                  <li>Evaluasi metode pembelajaran untuk mata pelajaran dengan nilai rendah</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">Aspek Kehadiran:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  <li>Implementasi sistem monitoring kehadiran real-time</li>
                  <li>Program konseling untuk siswa dengan tingkat absensi tinggi</li>
                  <li>Kerjasama dengan orang tua untuk meningkatkan kedisiplinan</li>
                </ul>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800 mb-2">Aspek SDM:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  <li>Evaluasi rasio guru-siswa per mata pelajaran</li>
                  <li>Program pelatihan untuk meningkatkan kompetensi guru</li>
                  <li>Rekrutmen guru untuk mata pelajaran yang kekurangan</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Footer */}
          <div className="mt-16 page-break-inside-avoid">
            <div className="border-t-2 pt-8">
              <div className="grid grid-cols-3 gap-8 text-center">
                <div>
                  <p className="text-sm text-gray-600 mb-16">Mengetahui,</p>
                  <div className="border-t border-gray-400 pt-2">
                    <p className="font-semibold">Kepala Sekolah</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-16">Menyetujui,</p>
                  <div className="border-t border-gray-400 pt-2">
                    <p className="font-semibold">Wakil Kepala Sekolah</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-16">Dibuat oleh,</p>
                  <div className="border-t border-gray-400 pt-2">
                    <p className="font-semibold">{user.fullName || user.name}</p>
                    <p className="text-sm text-gray-600">{user.role === 'superadmin' ? 'Administrator' : 'Pimpinan'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <footer className="mt-12 text-xs text-center text-gray-500">
              <p>*** Dokumen ini dicetak secara otomatis oleh sistem {APP_NAME} ***</p>
              <p>Tanggal Cetak: {format(new Date(), "dd MMMM yyyy 'pukul' HH:mm:ss", { locale: localeID })}</p>
            </footer>
          </div>
        </div>
        
        <div className="flex justify-center p-8 print:hidden">
          <Button onClick={() => window.print()} size="lg" className="shadow-lg">
            <Printer className="mr-2 h-5 w-5" /> Cetak Laporan
          </Button>
        </div>
      </div>
      
      <style jsx global>{`
        @media print {
          .page-break-after { page-break-after: always; }
          .page-break-before { page-break-before: always; }
          .page-break-inside-avoid { page-break-inside: avoid; }
          
          @page {
            size: A4;
            margin: 0;
          }
          
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}