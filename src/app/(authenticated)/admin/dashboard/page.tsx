
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, Bell, BookOpenText, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import React, { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import type { User, MataPelajaran } from "@/types"; 
import { Loader2 } from "lucide-react";

export default function AdminDashboardPage() {
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [allMataPelajaran, setAllMataPelajaran] = useState<MataPelajaran[]>([]);
  const [isLoadingMapel, setIsLoadingMapel] = useState(true);

  const fetchUsersForStats = useCallback(async () => {
    if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'superadmin')) {
      setIsLoadingStats(true);
      try {
        const response = await fetch('/api/users');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Gagal mengambil data pengguna untuk statistik.");
        }
        const data = await response.json();
        setAllUsers(data);
      } catch (error: any) {
        toast({ title: "Error Statistik Pengguna", description: error.message, variant: "destructive" });
      } finally {
        setIsLoadingStats(false);
      }
    } else {
      setIsLoadingStats(false); 
    }
  }, [currentUser, toast]);

  const fetchMataPelajaran = useCallback(async () => {
    if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'superadmin')) {
      setIsLoadingMapel(true);
      try {
        const response = await fetch('/api/mapel');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Gagal mengambil data mata pelajaran.");
        }
        const data = await response.json();
        setAllMataPelajaran(data);
      } catch (error: any) {
        toast({ title: "Error Data Mapel", description: error.message, variant: "destructive" });
      } finally {
        setIsLoadingMapel(false);
      }
    } else {
      setIsLoadingMapel(false);
    }
  }, [currentUser, toast]);

  useEffect(() => {
    fetchUsersForStats();
    fetchMataPelajaran();
  }, [fetchUsersForStats, fetchMataPelajaran]);
  
  if (authLoading || !currentUser) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (currentUser.role !== 'admin' && currentUser.role !== 'superadmin') {
    return <p>Akses Ditolak. Anda harus menjadi admin untuk melihat halaman ini.</p>;
  }
  
  const totalPengguna = allUsers.length;
  const verifikasiTertunda = allUsers.filter(u => u.role === 'siswa' && !u.isVerified).length;
  const totalMataPelajaran = allMataPelajaran.length;

  const statCards = [
    { title: "Total Pengguna", value: isLoadingStats ? <Loader2 className="h-5 w-5 animate-spin" /> : totalPengguna.toString(), icon: Users, color: "text-primary", link: ROUTES.ADMIN_USERS },
    { title: "Total Mapel", value: isLoadingMapel ? <Loader2 className="h-5 w-5 animate-spin" /> : totalMataPelajaran.toString(), icon: BookOpenText, color: "text-green-500", link: ROUTES.ADMIN_MATA_PELAJARAN, description: "Jumlah mata pelajaran terdaftar" },
    { title: "Verifikasi Tertunda", value: isLoadingStats ? <Loader2 className="h-5 w-5 animate-spin" /> : verifikasiTertunda.toString(), icon: AlertTriangle, color: "text-yellow-500", link: ROUTES.ADMIN_USERS, description: "Siswa menunggu verifikasi" },
    { title: "Peringatan Sistem", value: "2", icon: Bell, color: "text-red-500", description: "Peringatan & notifikasi (mock)" },
  ];


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold">Dasbor Admin</h1>
      <p className="text-muted-foreground">Selamat datang, {currentUser.fullName || currentUser.name || currentUser.email}! Kelola pengguna, pengaturan, dan lihat gambaran umum sistem.</p>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.title} className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              {card.link ? (
                <Link href={card.link} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                  {card.description || "Lihat detail \u2192"}
                </Link>
              ) : (
                 <p className="text-xs text-muted-foreground">{card.description || "Baru diperbarui"}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Aktivitas Terkini</CardTitle>
            <CardDescription>Gambaran umum kejadian sistem terkini (data mock).</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-center justify-between">
                <span className="text-sm">Pengguna baru terdaftar: siswa_baru@example.com</span>
                <span className="text-xs text-muted-foreground">2 menit lalu</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-sm">Guru memperbarui profil: guru_hebat@example.com</span>
                <span className="text-xs text-muted-foreground">1 jam lalu</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-sm">Pemeliharaan sistem dijadwalkan.</span>
                <span className="text-xs text-muted-foreground">Besok</span>
              </li>
            </ul>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Tindakan Cepat</CardTitle>
            <CardDescription>Lakukan tugas umum dengan cepat.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
             <Button asChild variant="outline" className="w-full justify-start text-left h-auto py-3">
                <Link href={ROUTES.ADMIN_USERS}>
                  <Users className="mr-3 h-5 w-5" />
                  <div>
                    <p className="font-semibold">Kelola Pengguna</p>
                    <p className="text-xs text-muted-foreground">Lihat, tambah, atau edit pengguna.</p>
                  </div>
                </Link>
             </Button>
             <Button variant="outline" className="w-full justify-start text-left h-auto py-3" onClick={() => toast({title: "Fitur Dalam Pengembangan", description: "Laporan dan analitik belum tersedia."})}>
                <BarChart3 className="mr-3 h-5 w-5" />
                 <div>
                    <p className="font-semibold">Lihat Laporan</p>
                    <p className="text-xs text-muted-foreground">Akses analitik sistem.</p>
                  </div>
            </Button>
             <Button variant="outline" className="w-full justify-start text-left h-auto py-3" onClick={() => toast({title: "Fitur Dalam Pengembangan", description: "Pengiriman pengumuman belum tersedia."})}>
                <Bell className="mr-3 h-5 w-5" />
                <div>
                    <p className="font-semibold">Kirim Pengumuman</p>
                    <p className="text-xs text-muted-foreground">Beritahu semua pengguna.</p>
                  </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    