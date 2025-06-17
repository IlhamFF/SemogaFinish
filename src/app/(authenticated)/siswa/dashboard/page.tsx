
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Book, CheckSquare, CalendarClock, Award, CalendarDays, ClipboardCheck, BookOpen as BookOpenIcon, FileText as FileTextIcon, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import type { JadwalPelajaran, Tugas as TugasType, Test as TestType } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { isPast, parseISO } from "date-fns";

// Frontend status derivation for Tugas
type TugasSiswaStatus = "Belum Dikerjakan" | "Terlambat" | "Sudah Dikumpulkan" | "Dinilai";
const getTugasSiswaStatus = (tugas: TugasType): TugasSiswaStatus => {
    if (tugas.nilai) return "Dinilai";
    if (isPast(parseISO(tugas.tenggat))) return "Terlambat";
    return "Belum Dikerjakan";
};

export default function SiswaDashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [jadwalList, setJadwalList] = useState<JadwalPelajaran[]>([]);
  const [tugasList, setTugasList] = useState<TugasType[]>([]);
  const [testList, setTestList] = useState<TestType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user || !user.isVerified || !user.kelas) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [jadwalRes, tugasRes, testRes] = await Promise.all([
        fetch(`/api/jadwal/pelajaran?kelas=${encodeURIComponent(user.kelas)}`),
        fetch(`/api/tugas`), // API already filters by class for siswa
        fetch(`/api/test`),  // API already filters by class for siswa
      ]);

      if (jadwalRes.ok) setJadwalList(await jadwalRes.json());
      else { console.error("Gagal mengambil jadwal siswa"); setJadwalList([]); }

      if (tugasRes.ok) setTugasList(await tugasRes.json());
      else { console.error("Gagal mengambil tugas siswa"); setTugasList([]); }
      
      if (testRes.ok) setTestList(await testRes.json());
      else { console.error("Gagal mengambil test siswa"); setTestList([]); }

    } catch (error) {
      console.error("Error fetching dashboard data siswa:", error);
      toast({ title: "Gagal Memuat Data", description: "Tidak dapat mengambil data dasbor.", variant: "destructive" });
      setJadwalList([]);
      setTugasList([]);
      setTestList([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const siswaStats = useMemo(() => {
    const uniqueSubjects = new Set(jadwalList.map(j => j.mapel?.nama).filter(Boolean));
    const tugasHarusDikumpulkan = tugasList.filter(t => {
        const status = getTugasSiswaStatus(t);
        return status === "Belum Dikerjakan" || status === "Terlambat";
    }).length;
    const testMendatang = testList.filter(t => t.status === "Terjadwal" || t.status === "Berlangsung").length;

    return [
      { title: "Kursus & Jadwal", value: isLoading ? <Loader2 className="h-5 w-5 animate-spin"/> : uniqueSubjects.size.toString(), icon: CalendarDays, color: "text-primary", href: ROUTES.SISWA_JADWAL, description: isLoading ? "Memuat..." : `${uniqueSubjects.size} mata pelajaran terjadwal` },
      { title: "Tugas Saya", value: isLoading ? <Loader2 className="h-5 w-5 animate-spin"/> : tugasHarusDikumpulkan.toString(), icon: ClipboardCheck, color: "text-red-500", href: ROUTES.SISWA_TUGAS, description: isLoading ? "Memuat..." : `${tugasHarusDikumpulkan} tugas perlu dikerjakan` },
      { title: "Materi Pelajaran", value: isLoading ? <Loader2 className="h-5 w-5 animate-spin"/> : "Akses", icon: BookOpenIcon, color: "text-green-500", href: ROUTES.SISWA_MATERI, description: isLoading ? "Memuat..." : "Lihat semua materi" },
      { title: "Test & Ujian", value: isLoading ? <Loader2 className="h-5 w-5 animate-spin"/> : testMendatang.toString(), icon: Award, color: "text-yellow-500", href: ROUTES.SISWA_NILAI, description: isLoading ? "Memuat..." : `${testMendatang} test akan datang/berlangsung`},
    ];
  }, [jadwalList, tugasList, testList, isLoading]);


  if (!user || (user.role !== 'siswa' && user.role !== 'superadmin')) {
    return <p>Akses Ditolak. Anda harus menjadi Siswa untuk melihat halaman ini.</p>;
  }
  
  if (user && !user.isVerified && !isLoading) { // Check user explicitly, not isLoading for this part
     return (
        <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl text-primary">Verifikasi Email Diperlukan</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-4">
                        Akun Anda belum diverifikasi. Silakan periksa email Anda untuk tautan verifikasi atau hubungi administrator.
                    </p>
                    <Link href={ROUTES.VERIFY_EMAIL}>
                        <Button>Ke Halaman Verifikasi</Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
     );
  }
  
  if (isLoading && !user) { // Initial loading before user is determined
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold">Dasbor Siswa</h1>
      <p className="text-muted-foreground">Selamat datang, {user.fullName || user.name || user.email}! Lacak kursus, tugas, dan kemajuan Anda.</p>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {siswaStats.map((card) => (
          <Link href={card.href || "#"} key={card.title} passHref>
            <Card className="shadow-lg hover:shadow-xl transition-shadow h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">{card.description || "Lihat detail \u2192"}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Tenggat Waktu Mendatang</CardTitle>
            <CardDescription>Tugas dan ujian yang harus segera dikerjakan.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-center justify-between p-3 rounded-md bg-primary/5 border border-primary/20">
                <div>
                  <h4 className="font-semibold text-primary">Matematika - Kuis Bab 5</h4>
                  <p className="text-xs text-muted-foreground">Batas Waktu: Besok, 23:59</p>
                </div>
                <Link href={ROUTES.SISWA_TEST} className="text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200">
                  Kerjakan
                </Link>
              </li>
              <li className="flex items-center justify-between p-3 rounded-md bg-secondary/20 border border-secondary/40">
                 <div>
                  <h4 className="font-semibold">Fisika - Pengumpulan Laporan Lab</h4>
                  <p className="text-xs text-muted-foreground">Batas Waktu: Dalam 3 hari</p>
                </div>
                 <Link href={ROUTES.SISWA_TUGAS} className="text-xs font-medium px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 hover:bg-yellow-200">
                  Upload
                </Link>
              </li>
            </ul>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Pengumuman Terbaru</CardTitle>
            <CardDescription>Informasi penting dari sekolah atau guru.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
                <div className="p-3 rounded-md bg-accent/10 border border-accent/30">
                    <h4 className="font-semibold text-accent-foreground">Jadwal Ujian Akhir Semester</h4>
                    <p className="text-xs text-muted-foreground mt-1">Jadwal UAS telah dirilis. Silakan cek di bagian Test & Ujian.</p>
                </div>
                 <div className="p-3 rounded-md bg-muted/50 border">
                    <h4 className="font-semibold">Libur Nasional</h4>
                    <p className="text-xs text-muted-foreground mt-1">Kegiatan belajar mengajar diliburkan pada tanggal 17 Agustus.</p>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    