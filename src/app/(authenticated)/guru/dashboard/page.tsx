
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, Users, MessageSquare, CalendarDays, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { JadwalPelajaran, Tugas, Test } from "@/types";
import { parseISO, isFuture, differenceInDays } from "date-fns";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

export default function GuruDashboardPage() {
  const { user } = useAuth();
  const [jadwalList, setJadwalList] = useState<JadwalPelajaran[]>([]);
  const [tugasList, setTugasList] = useState<Tugas[]>([]);
  const [testList, setTestList] = useState<Test[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !user.id) return;

    const fetchData = async () => {
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
    };

    fetchData();
  }, [user]);

  const guruStats = useMemo(() => {
    if (!user) return [];

    const uniqueMapel = new Set(jadwalList.map(j => j.mapel?.nama).filter(Boolean));
    const uniqueKelas = new Set(jadwalList.map(j => j.kelas).filter(Boolean));

    const upcomingTugas = tugasList.filter(t => {
        try {
            const tenggatDate = parseISO(t.tenggat);
            return isFuture(tenggatDate) && differenceInDays(tenggatDate, new Date()) <= 7;
        } catch (e) { return false; }
    }).length;

    const upcomingTests = testList.filter(t => {
        try {
            const tanggalTest = parseISO(t.tanggal);
            return isFuture(tanggalTest) && differenceInDays(tanggalTest, new Date()) <= 7 && t.status === "Terjadwal";
        } catch (e) { return false; }
    }).length;

    return [
      { title: "Mata Pelajaran Saya", value: isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : uniqueMapel.size.toString(), icon: BookOpen, color: "text-primary", href: ROUTES.GURU_PENGAJARAN, description:"Jumlah mapel yang diampu"},
      { title: "Kelas Saya", value: isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : uniqueKelas.size.toString(), icon: Users, color: "text-green-500", href: ROUTES.GURU_PENGAJARAN, description:"Jumlah kelas yang diajar" },
      { title: "Pesan Belum Dibaca", value: "3", icon: MessageSquare, color: "text-yellow-500", href: "#", description:"(Data Mock)" }, // Placeholder
      { title: "Tenggat Mendatang", value: isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (upcomingTugas + upcomingTests).toString(), icon: CalendarDays, color: "text-red-500", href: ROUTES.GURU_TUGAS, description:"Tugas & Test dalam 7 hari"},
    ];
  }, [user, jadwalList, tugasList, testList, isLoading]);


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
            <CardTitle>Pengumpulan Terkini (Placeholder)</CardTitle>
            <CardDescription>Gambaran umum pengumpulan siswa terkini.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-center justify-between">
                <span className="text-sm">Matematika - Tugas 1 oleh Siswa Rajin</span>
                <span className="text-xs text-muted-foreground">Telah Dinilai</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-sm">Fisika - Laporan Lab oleh Siswa Cerdas</span>
                <span className="text-xs text-red-500">Perlu Dinilai</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-sm">Kimia - Kuis 2 oleh Siswa Tekun</span>
                 <span className="text-xs text-muted-foreground">Telah Dinilai</span>
              </li>
            </ul>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Pengumuman (Placeholder)</CardTitle>
            <CardDescription>Pengumuman sekolah atau kursus terbaru.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="bg-accent/50 p-4 rounded-md border border-accent">
                <h3 className="font-semibold text-accent-foreground">Jadwal Ujian Tengah Semester Dirilis</h3>
                <p className="text-sm text-muted-foreground mt-1">Silakan periksa papan pengumuman untuk jadwal ujian tengah semester yang terperinci.</p>
                <p className="text-xs text-muted-foreground mt-2">Diposting oleh Admin - 2 hari yang lalu</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    