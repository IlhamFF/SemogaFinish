
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
    Book, 
    CalendarDays, 
    ClipboardCheck, 
    BookOpen as BookOpenIcon, 
    Loader2, 
    AlertTriangle,
    PartyPopper,
    Wind
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import type { JadwalPelajaran, Tugas as TugasType, Test as TestType, TugasSubmission } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { isPast, parseISO, format, isFuture } from "date-fns";
import { id as localeID } from 'date-fns/locale';
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// --- Skeleton Component for Loading State ---
const SiswaDashboardSkeleton = () => (
    <div className="max-w-7xl mx-auto space-y-8 animate-pulse p-1">
        <div>
            <Skeleton className="h-9 w-3/4 md:w-1/2 mb-2 rounded-md" />
            <Skeleton className="h-5 w-1/2 md:w-1/3 rounded-md" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-2xl" />
            ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-80 rounded-2xl" />
            <Skeleton className="h-80 rounded-2xl" />
        </div>
    </div>
);

// --- Main Dashboard Component ---
export default function SiswaDashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [jadwalList, setJadwalList] = useState<JadwalPelajaran[]>([]);
  const [tugasList, setTugasList] = useState<TugasType[]>([]);
  const [testList, setTestList] = useState<TestType[]>([]);
  const [submissions, setSubmissions] = useState<TugasSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user || !user.isVerified || !user.kelasId) {
      setIsLoading(false);
      return;
    }
    try {
      const [jadwalRes, tugasRes, testRes, subsRes] = await Promise.all([
        fetch(`/api/jadwal/pelajaran?kelas=${encodeURIComponent(user.kelasId)}`),
        fetch(`/api/tugas`),
        fetch(`/api/test`),
        fetch(`/api/tugas/submissions/me`)
      ]);

      if (jadwalRes.ok) setJadwalList(await jadwalRes.json());
      else { console.error("Gagal mengambil jadwal siswa"); setJadwalList([]); }

      if (tugasRes.ok) setTugasList(await tugasRes.json());
      else { console.error("Gagal mengambil tugas siswa"); setTugasList([]); }
      
      if (testRes.ok) setTestList(await testRes.json());
      else { console.error("Gagal mengambil test siswa"); setTestList([]); }

      if (subsRes.ok) setSubmissions(await subsRes.json());
      else { console.error("Gagal mengambil submissions siswa"); setSubmissions([]); }

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
    const submittedTugasIds = new Set(submissions.map(s => s.tugasId));
    const tugasHarusDikumpulkan = tugasList.filter(t => !isPast(parseISO(t.tenggat)) && !submittedTugasIds.has(t.id)).length;
    const testMendatang = testList.filter(t => t.status === "Terjadwal" || t.status === "Berlangsung").length;

    return [
      { title: "Mata Pelajaran", value: uniqueSubjects.size.toString(), icon: Book, href: ROUTES.SISWA_JADWAL, description: "Total mapel semester ini", gradient: "from-purple-600 to-pink-600", iconColor: "text-pink-400" },
      { title: "Tugas Aktif", value: tugasHarusDikumpulkan.toString(), icon: ClipboardCheck, href: ROUTES.SISWA_TUGAS, description: "Tugas belum dikumpulkan", gradient: "from-red-600 to-orange-500", iconColor: "text-orange-400" },
      { title: "Test Mendatang", value: testMendatang.toString(), icon: AlertTriangle, href: ROUTES.SISWA_TEST, description: "Test/Ujian akan datang", gradient: "from-yellow-500 to-amber-400", iconColor: "text-amber-300"},
      { title: "Materi & Nilai", value: "Akses", icon: BookOpenIcon, href: ROUTES.SISWA_MATERI, description: "Lihat materi & nilai Anda", gradient: "from-green-600 to-emerald-500", iconColor: "text-emerald-400"},
    ];
  }, [jadwalList, tugasList, testList, submissions]);
  
  const jadwalHariIni = useMemo(() => {
    const dayName = format(new Date(), "eeee", { locale: localeID });
    return jadwalList
      .filter(j => j.hari === dayName)
      .sort((a,b) => (a.slotWaktu?.waktuMulai || "").localeCompare(b.slotWaktu?.waktuMulai || ""));
  }, [jadwalList]);

  const tugasDanTestMendatang = useMemo(() => {
    const submittedTugasIds = new Set(submissions.map(s => s.tugasId));
    const combined = [
        ...tugasList.filter(t => isFuture(parseISO(t.tenggat)) && !submittedTugasIds.has(t.id)).map(t => ({ type: 'Tugas', data: t, date: t.tenggat })),
        ...testList.filter(t => t.status === 'Terjadwal' && isFuture(parseISO(t.tanggal))).map(t => ({ type: 'Test', data: t, date: t.tanggal }))
    ];
    return combined.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 5);
  }, [tugasList, testList, submissions]);


  if (isLoading) {
    return <SiswaDashboardSkeleton />;
  }

  if (user && !user.isVerified) {
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

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-1">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Dasbor Siswa
        </h1>
        <p className="text-gray-400">Selamat datang kembali, {user?.fullName || user?.name || user?.email}! Mari kita lihat agenda belajarmu hari ini.</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        {siswaStats.map((card, index) => (
          <Link href={card.href || "#"} key={card.title} passHref>
            <div className="group relative overflow-hidden rounded-2xl bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 p-6 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className={`absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-bl ${card.gradient} opacity-20 rounded-full blur-2xl group-hover:opacity-30 transition-all duration-300`} />
                <div className="relative z-10">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-400">{card.title}</h3>
                            <p className="text-4xl font-bold text-white mt-1">{card.value}</p>
                            <p className="text-xs text-gray-500 mt-1">{card.description}</p>
                        </div>
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${card.gradient} opacity-30 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                        </div>
                    </div>
                </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
         <Card className="relative overflow-hidden rounded-2xl bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 p-6 shadow-xl">
            <div className="absolute top-0 left-0 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <CardHeader className="p-0 mb-4 relative z-10">
                <CardTitle className="text-lg flex items-center"><CalendarDays className="mr-3 h-5 w-5 text-purple-400" /> Jadwal Hari Ini</CardTitle>
                <CardDescription className="text-gray-400">{format(new Date(), "eeee, dd MMMM yyyy", { locale: localeID })}</CardDescription>
            </CardHeader>
            <CardContent className="p-0 h-64 overflow-y-auto relative z-10">
                {jadwalHariIni.length > 0 ? (
                    <div className="relative pl-5">
                       <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gradient-to-b from-purple-600/50 to-transparent -z-10" />
                       <ul className="space-y-4">
                           {jadwalHariIni.map((j) => (
                               <li key={j.id} className="relative group transition-all duration-300">
                                   <div className="absolute -left-3.5 top-1.5 w-4 h-4 rounded-full bg-gray-800 border-2 border-purple-500 group-hover:scale-125 transition-transform" />
                                   <div className="pl-4">
                                       <p className="font-semibold text-purple-300">{j.mapel?.nama}</p>
                                       <div className="flex flex-col sm:flex-row justify-between text-xs text-gray-400">
                                           <span>{j.slotWaktu?.waktuMulai} - {j.slotWaktu?.waktuSelesai}</span>
                                           <span className="font-medium">Ruang: {j.ruangan?.nama}</span>
                                       </div>
                                       <p className="text-xs text-gray-500">Guru: {j.guru?.fullName || j.guru?.name}</p>
                                   </div>
                               </li>
                           ))}
                       </ul>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <Wind className="w-16 h-16 mb-4 text-purple-600/30" />
                        <p className="font-medium">Tidak ada jadwal hari ini.</p>
                        <p className="text-sm">Waktu bebas! Manfaatkan untuk belajar atau istirahat. 🎉</p>
                    </div>
                )}
            </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden rounded-2xl bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 p-6 shadow-xl">
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-green-600/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
            <CardHeader className="p-0 mb-4 relative z-10">
                <CardTitle className="text-lg flex items-center"><BookOpenIcon className="mr-3 h-5 w-5 text-green-400" /> Tenggat Terdekat</CardTitle>
                <CardDescription className="text-gray-400">Tugas & Test yang perlu perhatianmu.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 h-64 overflow-y-auto relative z-10">
                {tugasDanTestMendatang.length > 0 ? (
                     <ul className="space-y-3">
                        {tugasDanTestMendatang.map(item => (
                            <li key={`${item.type}-${item.data.id}`} className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-green-500/50 transition-colors">
                                <div className="flex justify-between items-start">
                                    <p className="font-semibold text-gray-200 flex-1 pr-2">{item.data.judul}</p>
                                    <Badge variant={item.type === 'Tugas' ? 'destructive' : 'secondary'} className="text-xs">
                                        {item.type}
                                    </Badge>
                                </div>
                                <div className="flex justify-between text-xs text-gray-400 mt-1">
                                    <span>{item.data.mapel}</span>
                                    <span>Tenggat: {format(parseISO(item.date), 'dd MMM')}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <PartyPopper className="w-16 h-16 mb-4 text-green-600/30" />
                        <p className="font-medium">Semua tugas & test selesai.</p>
                        <p className="text-sm">Kerja bagus! Terus pertahankan. ✨</p>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
