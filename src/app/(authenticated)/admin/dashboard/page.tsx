
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { BarChart3, Users, BookOpenText, PieChart as PieChartIcon, Database } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { ROUTES, ROLES } from "@/lib/constants";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import type { User, MataPelajaran, Role } from "@/types"; 
import { Loader2 } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { ChartContainer, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";


const ROLE_COLORS: Record<Role, string> = {
    admin: "hsl(var(--chart-1))",
    guru: "hsl(var(--chart-2))",
    siswa: "hsl(var(--chart-3))",
    pimpinan: "hsl(var(--chart-4))",
    superadmin: "hsl(var(--chart-5))",
};

export default function AdminDashboardPage() {
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [allMataPelajaran, setAllMataPelajaran] = useState<MataPelajaran[]>([]);
  const [isLoadingMapel, setIsLoadingMapel] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  const isDev = process.env.NODE_ENV === 'development';

  const handleSeedDatabase = async () => {
    if (!confirm("Apakah Anda yakin ingin mengisi database? Ini akan menghapus semua data (kecuali superadmin) dan menggantinya dengan data dummy yang komprehensif.")) {
      return;
    }
    setIsSeeding(true);
    toast({ title: "Memulai Proses Seeding...", description: "Mohon tunggu, ini mungkin memakan waktu beberapa saat." });
    try {
      const response = await fetch('/api/dev/seed');
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Gagal melakukan seeding.');
      toast({ title: "Seeding Berhasil!", description: data.message, duration: 7000 });
      window.location.reload();
    } catch (error: any) {
      toast({ title: "Seeding Gagal", description: error.message, variant: "destructive", duration: 7000 });
    } finally {
      setIsSeeding(false);
    }
  };


  const fetchUsersForStats = useCallback(async () => {
    if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'superadmin')) {
      setIsLoadingUsers(true);
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
        setIsLoadingUsers(false);
      }
    } else {
      setIsLoadingUsers(false); 
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
  
  const adminRoleDistributionData = useMemo(() => {
    if (allUsers.length === 0) return [];
    const roleCounts = allUsers.reduce((acc, currentUser) => {
      acc[currentUser.role] = (acc[currentUser.role] || 0) + 1;
      return acc;
    }, {} as Record<Role, number>);

    return Object.entries(roleCounts).map(([role, count]) => ({
      name: ROLES[role as Role] || role,
      value: count,
      fill: ROLE_COLORS[role as Role] || "hsl(var(--muted))",
    }));
  }, [allUsers]);
  
  const recentlyJoinedUsers = useMemo(() => {
    return [...allUsers]
      .sort((a, b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime())
      .slice(0, 5);
  }, [allUsers]);


  if (authLoading || !currentUser) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (currentUser.role !== 'admin' && currentUser.role !== 'superadmin') {
    return <p>Akses Ditolak. Anda harus menjadi admin untuk melihat halaman ini.</p>;
  }
  
  const totalPengguna = allUsers.length;
  const verifikasiTertunda = allUsers.filter(u => u.role === 'siswa' && !u.isVerified).length;
  const totalMataPelajaran = allMataPelajaran.length;
  const totalGuru = allUsers.filter(u => u.role === 'guru').length;

  const statCards = [
    { title: "Total Pengguna", value: isLoadingUsers ? <Loader2 className="h-5 w-5 animate-spin" /> : totalPengguna.toString(), icon: Users, color: "text-primary", link: ROUTES.ADMIN_USERS, description: `${totalGuru} Guru, ${totalPengguna - totalGuru} lainnya` },
    { title: "Total Mapel", value: isLoadingMapel ? <Loader2 className="h-5 w-5 animate-spin" /> : totalMataPelajaran.toString(), icon: BookOpenText, color: "text-green-500", link: ROUTES.ADMIN_MATA_PELAJARAN, description: "Jumlah mata pelajaran terdaftar" },
    { title: "Verifikasi Tertunda", value: isLoadingUsers ? <Loader2 className="h-5 w-5 animate-spin" /> : verifikasiTertunda.toString(), icon: Users, color: "text-yellow-500", link: ROUTES.ADMIN_USERS, description: "Siswa menunggu verifikasi" },
    { title: "Tindakan Cepat", value: "Kelola", icon: BarChart3, color: "text-indigo-500", link: ROUTES.ADMIN_USERS, description: "Kelola Pengguna \u2192" },
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
            <CardTitle className="flex items-center"><PieChartIcon className="mr-2 h-5 w-5 text-primary" /> Distribusi Peran Pengguna</CardTitle>
            <CardDescription>Visualisasi jumlah pengguna berdasarkan peran.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] flex items-center justify-center">
            {isLoadingUsers ? (
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            ) : adminRoleDistributionData.length > 0 ? (
                <ChartContainer 
                    config={adminRoleDistributionData.reduce((acc, cur) => ({...acc, [cur.name]: {label: cur.name, color: cur.fill}}), {})} 
                    className="mx-auto aspect-square h-full"
                >
                    <RechartsPieChart>
                        <Tooltip content={<ChartTooltipContent hideLabel />} />
                        <Legend content={<ChartLegendContent nameKey="name" />} />
                        <Pie data={adminRoleDistributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                            {adminRoleDistributionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                    </RechartsPieChart>
                </ChartContainer>
            ) : (
                <p className="text-muted-foreground">Data pengguna tidak tersedia.</p>
            )}
          </CardContent>
        </Card>
         <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5 text-primary" /> Pengguna Bergabung Terbaru</CardTitle>
                <CardDescription>5 pengguna terakhir yang terdaftar di sistem.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
                 {isLoadingUsers ? (
                    <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : recentlyJoinedUsers.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama</TableHead>
                                <TableHead>Peran</TableHead>
                                <TableHead>Tanggal</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentlyJoinedUsers.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.fullName || user.name}</TableCell>
                                    <TableCell>{ROLES[user.role]}</TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {user.createdAt ? format(parseISO(user.createdAt as string), 'dd MMM yyyy') : '-'}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <p className="text-muted-foreground text-center pt-8">Tidak ada data pengguna.</p>
                )}
            </CardContent>
        </Card>
      </div>

      {isDev && (
        <Card className="shadow-lg border-dashed border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center text-primary"><Database className="mr-2 h-5 w-5" /> Tindakan Developer</CardTitle>
            <CardDescription>Aksi ini hanya tersedia dalam mode pengembangan.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleSeedDatabase} disabled={isSeeding}>
              {isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
              Seed Database dengan Data Dummy
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Aksi ini akan menghapus semua data (kecuali superadmin) dan mengisi ulang dengan data dummy baru (termasuk jadwal, tugas, dan nilai).
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
