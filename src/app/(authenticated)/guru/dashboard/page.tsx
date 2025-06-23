
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, Users, TrendingUp, CheckCircle, Loader2, CalendarDays, ClipboardCheck, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { JadwalPelajaran, Tugas, Test } from "@/types";
import { parseISO, isFuture, differenceInDays, format } from "date-fns";
import { id as localeID } from 'date-fns/locale';
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

export default function GuruDashboardPage() {
  const { user } = useAuth();
  const [jadwalList, setJadwalList] = useState<JadwalPelajaran[]>([]);
  const [tugasList, setTugasList] = useState<Tugas[]>([]);
  const [testList, setTestList] = useState<Test[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user || !user.id) return;
    setIsLoading(true);
    try {
      const [jadwalRes, tugasRes, testRes] = await Promise.all([
        fetch(`/api/jadwal/pelajaran?guruId=${user.id}`),
        fetch(`/api/tugas`), // API already filters by uploader if guru
        fetch(`/api/test`),  // API already filters by uploader if guru
      ]);

      if (jadwalRes.ok) setJadwalList(await jadwalRes.json());
      else console.error("Failed to fetch jadwal");

      if (tugasRes.ok) setTugasList(await tugasRes.json());
      else console.error("Failed to fetch tugas");
      
      if (testRes.ok) setTestList(await testRes.json());
      else console.error("Failed to fetch test");

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const guruStats = useMemo(() => {
    if (!user) return [];
    const uniqueMapel = new Set(jadwalList.map(j => j.mapel?.nama).filter(Boolean));
    const uniqueKelas = new Set(jadwalList.map(j => j.kelas).filter(Boolean));
    const totalTugasDanTest = tugasList.length + testList.length;
    const upcomingItems = [
      ...tugasList.filter(t => isFuture(parseISO(t.tenggat)) && differenceInDays(parseISO(t.tenggat), new Date()) <= 7),
      ...testList.filter(t => t.status === "Terjadwal" && isFuture(parseISO(t.tanggal)) && differenceInDays(parseISO(t.tanggal), new Date()) <= 7)
    ].length;
    return [
      { title: "Mata Pelajaran", value: isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : uniqueMapel.size.toString(), icon: BookOpen, color: "text-primary", href: ROUTES.GURU_PENGAJARAN, description:"Jumlah mapel yang diampu"},
      { title: "Kelas", value: isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : uniqueKelas.size.toString(), icon: Users, color: "text-green-500", href: ROUTES.GURU_PENGAJARAN, description:"Jumlah kelas yang diajar" },
      { title: "Tugas & Test", value: isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : totalTugasDanTest.toString(), icon: ClipboardCheck, color: "text-yellow-500", href: ROUTES.GURU_TUGAS, description:"Total item yang dibuat" },
      { title: "Tenggat Mendatang", value: isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : upcomingItems.toString(), icon: AlertTriangle, color: "text-red-500", href: ROUTES.GURU_TUGAS, description:"Tugas & Test dalam 7 hari"},
    ];
  }, [user, jadwalList, tugasList, testList, isLoading]);

  const jadwalHariIni = useMemo(() => {
    if (isLoading) return [];
    const dayName = format(new Date(), "eeee", { locale: localeID });
    return jadwalList
      .filter(j => j.hari === dayName)
      .sort((a,b) => (a.slotWaktu?.waktuMulai || "").localeCompare(b.slotWaktu?.waktuMulai || ""));
  }, [jadwalList, isLoading]);
  
  const tugasMendatang = useMemo(() => {
    if(isLoading) return [];
    return tugasList
        .filter(t => isFuture(parseISO(t.tenggat)))
        .sort((a, b) => new Date(a.tenggat).getTime() - new Date(b.tenggat).getTime())
        .slice(0, 5);
  }, [tugasList, isLoading]);


  if (!user || (user.role !== 'guru' && user.role !== 'superadmin')) {
    return <p>Akses Ditolak. Anda harus menjadi Guru untuk melihat halaman ini.</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold">Dasbor Guru</h1>
      <p className="text-muted-foreground">Selamat datang, {user.fullName || user.name || user.email}! Kelola kursus, siswa, dan tugas Anda.</p>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {guruStats.map((card) => (
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
                <CardTitle className="flex items-center"><CalendarDays className="mr-2 h-5 w-5 text-primary" /> Jadwal Mengajar Hari Ini</CardTitle>
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
                                    <span>Kelas: {j.kelas}</span>
                                    <span>Ruang: {j.ruangan?.nama}</span>
                                    <span>{j.slotWaktu?.waktuMulai} - {j.slotWaktu?.waktuSelesai}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">Tidak ada jadwal mengajar hari ini.</div>
                )}
            </CardContent>
        </Card>
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center"><ClipboardCheck className="mr-2 h-5 w-5 text-primary" /> Tugas Mendatang</CardTitle>
                <CardDescription>5 tugas dengan tenggat paling dekat.</CardDescription>
            </CardHeader>
            <CardContent className="h-64 overflow-y-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full"><Loader2 className="h-6 w-6 animate-spin" /></div>
                ) : tugasMendatang.length > 0 ? (
                     <ul className="space-y-3">
                        {tugasMendatang.map(t => (
                            <li key={t.id} className="text-sm p-3 bg-muted/50 rounded-md">
                                <p className="font-semibold">{t.judul}</p>
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>{t.mapel} - {t.kelas}</span>
                                    <Badge variant="destructive">
                                        Tenggat: {format(parseISO(t.tenggat), 'dd MMM yyyy')}
                                    </Badge>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">Tidak ada tugas yang akan datang.</div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
