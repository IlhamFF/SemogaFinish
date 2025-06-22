
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Book, CalendarDays, ClipboardCheck, BookOpen as BookOpenIcon, Loader2, BarChart, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import type { JadwalPelajaran, Tugas as TugasType, Test as TestType } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { isPast, parseISO, format, isFuture } from "date-fns";
import { id as localeID } from 'date-fns/locale';
import { Badge } from "@/components/ui/badge";

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
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const siswaStats = useMemo(() => {
    const uniqueSubjects = new Set(jadwalList.map(j => j.mapel?.nama).filter(Boolean));
    const tugasHarusDikumpulkan = tugasList.filter(t => !isPast(parseISO(t.tenggat))).length;
    const testMendatang = testList.filter(t => t.status === "Terjadwal" || t.status === "Berlangsung").length;

    return [
      { title: "Mata Pelajaran", value: isLoading ? <Loader2 className="h-5 w-5 animate-spin"/> : uniqueSubjects.size.toString(), icon: Book, color: "text-primary", href: ROUTES.SISWA_JADWAL, description: "Total mata pelajaran" },
      { title: "Tugas Aktif", value: isLoading ? <Loader2 className="h-5 w-5 animate-spin"/> : tugasHarusDikumpulkan.toString(), icon: ClipboardCheck, color: "text-red-500", href: ROUTES.SISWA_TUGAS, description: "Tugas yang belum tenggat" },
      { title: "Test Mendatang", value: isLoading ? <Loader2 className="h-5 w-5 animate-spin"/> : testMendatang.toString(), icon: AlertTriangle, color: "text-yellow-500", href: ROUTES.SISWA_TEST, description: "Test/Ujian yang akan datang"},
      { title: "Materi & Nilai", value: isLoading ? <Loader2 className="h-5 w-5 animate-spin"/> : "Akses", icon: BookOpenIcon, color: "text-green-500", href: ROUTES.SISWA_MATERI, description: "Lihat materi & nilai"},
    ];
  }, [jadwalList, tugasList, testList, isLoading]);
  
  const jadwalHariIni = useMemo(() => {
    if (isLoading) return [];
    const dayName = format(new Date(), "eeee", { locale: localeID });
    return jadwalList
      .filter(j => j.hari === dayName)
      .sort((a,b) => (a.slotWaktu?.waktuMulai || "").localeCompare(b.slotWaktu?.waktuMulai || ""));
  }, [jadwalList, isLoading]);

  const tugasDanTestMendatang = useMemo(() => {
    if (isLoading) return [];
    const combined = [
        ...tugasList.filter(t => isFuture(parseISO(t.tenggat))).map(t => ({ type: 'Tugas', data: t, date: t.tenggat })),
        ...testList.filter(t => t.status === 'Terjadwal' && isFuture(parseISO(t.tanggal))).map(t => ({ type: 'Test', data: t, date: t.tanggal }))
    ];
    return combined.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 5);
  }, [tugasList, testList, isLoading]);


  if (!user || (user.role !== 'siswa' && user.role !== 'superadmin')) {
    return <p>Akses Ditolak. Anda harus menjadi Siswa untuk melihat halaman ini.</p>;
  }
  
  if (user && !user.isVerified && !isLoading) {
     return (
        <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader><CardTitle className="text-2xl text-primary">Verifikasi Email Diperlukan</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-4">Akun Anda belum diverifikasi. Silakan periksa email Anda.</p>
                    <Link href={ROUTES.VERIFY_EMAIL}><Button>Ke Halaman Verifikasi</Button></Link>
                </CardContent>
            </Card>
        </div>
     );
  }
  
  if (isLoading) {
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
                <CardTitle className="flex items-center"><CalendarDays className="mr-2 h-5 w-5 text-primary" /> Jadwal Hari Ini</CardTitle>
                <CardDescription>Sesi pelajaran Anda untuk hari {format(new Date(), "eeee, dd MMM yyyy", { locale: localeID })}.</CardDescription>
            </CardHeader>
            <CardContent className="h-64 overflow-y-auto">
                 {isLoading ? (
                    <div className="flex items-center justify-center h-full"><Loader2 className="h-6 w-6 animate-spin" /></div>
                ) : jadwalHariIni.length > 0 ? (
                    <ul className="space-y-3">
                        {jadwalHariIni.map(j => (
                            <li key={j.id} className="text-sm p-3 bg-muted/50 rounded-md">
                                <p className="font-semibold text-primary">{j.mapel?.nama}</p>
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Guru: {j.guru?.fullName || j.guru?.name}</span>
                                    <span>Ruang: {j.ruangan?.nama}</span>
                                    <span>{j.slotWaktu?.waktuMulai} - {j.slotWaktu?.waktuSelesai}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">Tidak ada jadwal pelajaran hari ini.</div>
                )}
            </CardContent>
        </Card>
        <Card className="shadow-lg">
            <CardHeader>
            <CardTitle className="flex items-center"><BookOpenIcon className="mr-2 h-5 w-5 text-primary" /> Tugas & Test Mendatang</CardTitle>
            <CardDescription>Aktivitas terdekat yang perlu Anda perhatikan.</CardDescription>
            </CardHeader>
            <CardContent className="h-64 overflow-y-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full"><Loader2 className="h-6 w-6 animate-spin" /></div>
                ) : tugasDanTestMendatang.length > 0 ? (
                     <ul className="space-y-3">
                        {tugasDanTestMendatang.map(item => (
                            <li key={`${item.type}-${item.data.id}`} className="text-sm p-3 bg-muted/50 rounded-md">
                                 <p className="font-semibold">{item.data.judul}</p>
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>{item.data.mapel}</span>
                                    <Badge variant={item.type === 'Tugas' ? 'destructive' : 'secondary'}>
                                        {item.type === 'Tugas' ? 'Tenggat' : 'Jadwal'}: {format(parseISO(item.date), 'dd MMM')}
                                    </Badge>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">Tidak ada tugas atau test yang akan datang.</div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

    