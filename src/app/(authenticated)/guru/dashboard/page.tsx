
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, Users, ClipboardCheck, AlertTriangle, Loader2, CalendarDays, Wind } from "lucide-react";
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
      { title: "Mata Pelajaran", value: isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : uniqueMapel.size.toString(), icon: BookOpen, color: "text-purple-400", href: ROUTES.GURU_PENGAJARAN, description:"Jumlah mapel yang diampu"},
      { title: "Kelas", value: isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : uniqueKelas.size.toString(), icon: Users, color: "text-green-400", href: ROUTES.GURU_PENGAJARAN, description:"Jumlah kelas yang diajar" },
      { title: "Tugas & Test", value: isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : totalTugasDanTest.toString(), icon: ClipboardCheck, color: "text-pink-400", href: ROUTES.GURU_TUGAS, description:"Total item yang dibuat" },
      { title: "Tenggat Mendatang", value: isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : upcomingItems.toString(), icon: AlertTriangle, color: "text-amber-400", href: ROUTES.GURU_TUGAS, description:"Tugas & Test dalam 7 hari"},
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
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          Dasbor Guru
        </h1>
        <p className="text-muted-foreground">Selamat datang, {user.fullName || user.name || user.email}! Kelola kursus, siswa, dan tugas Anda.</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        {guruStats.map((card, index) => (
          <Link href={card.href || "#"} key={card.title} passHref>
             <div className="group relative overflow-hidden rounded-2xl bg-card p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
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
          </Link>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
         <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="text-lg flex items-center"><CalendarDays className="mr-3 h-5 w-5 text-purple-400" /> Jadwal Mengajar Hari Ini</CardTitle>
                <CardDescription className="text-muted-foreground">{format(new Date(), "eeee, dd MMMM yyyy", { locale: localeID })}</CardDescription>
            </CardHeader>
            <CardContent className="h-80 overflow-y-auto pr-3">
                 {isLoading ? (
                    <div className="flex items-center justify-center h-full"><Loader2 className="h-6 w-6 animate-spin" /></div>
                ) : jadwalHariIni.length > 0 ? (
                    <div className="relative pl-5">
                       <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-purple-600/50 to-transparent -z-10" />
                       <ul className="space-y-4">
                           {jadwalHariIni.map((j) => (
                               <li key={j.id} className="relative group transition-all duration-300">
                                   <div className="absolute -left-3.5 top-1.5 w-4 h-4 rounded-full bg-background border-2 border-purple-500 group-hover:scale-125 transition-transform" />
                                   <div className="pl-4">
                                       <p className="font-semibold text-primary">{j.mapel?.nama}</p>
                                       <div className="flex flex-col sm:flex-row justify-between text-xs text-muted-foreground">
                                           <span>Kelas: {j.kelas}</span>
                                           <span className="font-medium">Ruang: {j.ruangan?.nama}</span>
                                       </div>
                                       <p className="text-xs text-muted-foreground">{j.slotWaktu?.waktuMulai} - {j.slotWaktu?.waktuSelesai}</p>
                                   </div>
                               </li>
                           ))}
                       </ul>
                    </div>
                ) : (
                     <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <Wind className="w-16 h-16 mb-4 text-purple-600/20" />
                        <p className="font-medium">Tidak ada jadwal hari ini.</p>
                        <p className="text-sm">Waktu untuk mempersiapkan pelajaran besok!</p>
                    </div>
                )}
            </CardContent>
        </Card>
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="text-lg flex items-center"><ClipboardCheck className="mr-3 h-5 w-5 text-pink-400" /> Tugas Mendatang</CardTitle>
                <CardDescription>5 tugas dengan tenggat paling dekat.</CardDescription>
            </CardHeader>
            <CardContent className="h-80 overflow-y-auto pr-3">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full"><Loader2 className="h-6 w-6 animate-spin" /></div>
                ) : tugasMendatang.length > 0 ? (
                     <ul className="space-y-3">
                        {tugasMendatang.map(t => (
                            <li key={t.id} className="p-3 bg-muted/50 rounded-xl border border-border hover:border-primary/50 transition-colors">
                                <p className="font-semibold">{t.judul}</p>
                                <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
                                    <span>{t.mapel} - {t.kelas}</span>
                                    <Badge variant={differenceInDays(parseISO(t.tenggat), new Date()) < 3 ? 'destructive' : 'secondary'}>
                                        Tenggat: {format(parseISO(t.tenggat), 'dd MMM')}
                                    </Badge>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <Wind className="w-16 h-16 mb-4 text-pink-600/20" />
                        <p className="font-medium">Tidak ada tugas aktif.</p>
                        <p className="text-sm">Semua tugas sudah lewat tenggat atau belum dibuat.</p>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
