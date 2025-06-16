
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import type { RPP } from "@/types";
import { Presentation, BookOpen, Video, MessageSquare, CalendarCheck2, PlusCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

export default function GuruPengajaranPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [myRpps, setMyRpps] = useState<RPP[]>([]);
  const [isLoadingRpps, setIsLoadingRpps] = useState(true);

  const fetchMyRpps = useCallback(async () => {
    if (!user) return;
    setIsLoadingRpps(true);
    try {
      const response = await fetch('/api/kurikulum/rpp'); // API should filter by uploaderId if user is 'guru'
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal mengambil data RPP.");
      }
      const data: RPP[] = await response.json();
      // Jika API tidak otomatis filter untuk guru, filter di sini (meski idealnya di backend)
      if (user.role === 'guru') {
        setMyRpps(data.filter(rpp => rpp.uploaderId === user.id));
      } else { // Superadmin sees all
        setMyRpps(data);
      }
    } catch (error: any) {
      toast({ title: "Error RPP", description: error.message, variant: "destructive" });
      setMyRpps([]);
    } finally {
      setIsLoadingRpps(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user && (user.role === 'guru' || user.role === 'superadmin')) {
      fetchMyRpps();
    }
  }, [user, fetchMyRpps]);

  if (!user || (user.role !== 'guru' && user.role !== 'superadmin')) {
    return <p>Akses Ditolak. Anda harus menjadi Guru untuk melihat halaman ini.</p>;
  }

  const handlePlaceholderAction = (action: string) => {
    toast({ title: "Fitur Dalam Pengembangan", description: `Fungsi "${action}" belum diimplementasikan.`});
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-semibold">Modul Pengajaran</h1>
        <Button onClick={() => handlePlaceholderAction("Mulai Sesi Pengajaran Baru")}>
          <PlusCircle className="mr-2 h-4 w-4" /> Mulai Sesi Baru
        </Button>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Presentation className="mr-2 h-6 w-6 text-primary" />
            Manajemen Aktivitas Pengajaran
          </CardTitle>
          <CardDescription>
            Kelola semua aspek terkait kegiatan belajar mengajar, mulai dari perencanaan hingga pelaksanaan sesi interaktif.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Daftar Kelas & Mata Pelajaran Saya</CardTitle>
              <CardDescription>Lihat kelas dan mata pelajaran yang Anda ampu.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted/50 rounded-md text-center">
                <p className="text-muted-foreground">Daftar kelas dan mata pelajaran akan ditampilkan di sini. (Data mock/placeholder)</p>
                <p className="text-sm text-muted-foreground">Mata Pelajaran Diampu: {user.mataPelajaran || "Belum ditentukan"}</p>
                {/* <Button variant="link" onClick={() => handlePlaceholderAction("Lihat Jadwal Mengajar")}>Lihat Jadwal Mengajar Lengkap</Button> */}
                 <Button variant="link" asChild><Link href={ROUTES.SISWA_JADWAL}>Lihat Jadwal Mengajar</Link></Button>

              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <BookOpen className="mr-3 h-5 w-5 text-primary" />
                Rencana Pembelajaran (RPP) Saya
              </CardTitle>
              <CardDescription>
                Akses Rencana Pelaksanaan Pembelajaran (RPP) yang telah Anda buat.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Button variant="outline" onClick={() => handlePlaceholderAction("Lihat RPP Minggu Ini")} className="justify-start text-left h-auto py-3">
                  <CalendarCheck2 className="mr-3 h-5 w-5" />
                  <div>
                    <p className="font-semibold">RPP Minggu Ini</p>
                    <p className="text-xs text-muted-foreground">Lihat rencana untuk minggu berjalan.</p>
                  </div>
                </Button>
                {/* Superadmin bisa diarahkan ke halaman admin kurikulum untuk buat RPP */}
                {user.role === 'superadmin' ? (
                    <Button variant="outline" asChild className="justify-start text-left h-auto py-3">
                        <Link href={ROUTES.ADMIN_KURIKULUM}>
                        <PlusCircle className="mr-3 h-5 w-5" />
                        <div>
                            <p className="font-semibold">Buat/Kelola RPP (Admin)</p>
                            <p className="text-xs text-muted-foreground">Akses manajemen RPP lengkap.</p>
                        </div>
                        </Link>
                    </Button>
                ) : (
                    <Button variant="outline" onClick={() => handlePlaceholderAction("Fitur Buat RPP untuk Guru sedang dikembangkan")} className="justify-start text-left h-auto py-3">
                        <PlusCircle className="mr-3 h-5 w-5" />
                        <div>
                        <p className="font-semibold">Buat RPP Baru</p>
                        <p className="text-xs text-muted-foreground">Tambahkan RPP baru.</p>
                        </div>
                    </Button>
                )}
                <Button variant="outline" onClick={() => handlePlaceholderAction("Arsip RPP")} className="justify-start text-left h-auto py-3">
                  <BookOpen className="mr-3 h-5 w-5" />
                  <div>
                    <p className="font-semibold">Arsip RPP</p>
                    <p className="text-xs text-muted-foreground">Akses RPP sebelumnya.</p>
                  </div>
                </Button>
              </div>
              
              {isLoadingRpps ? (
                <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : myRpps.length > 0 ? (
                <ScrollArea className="h-72 border rounded-md mt-4">
                  <Table>
                    <TableHeader className="bg-muted/50 sticky top-0">
                      <TableRow>
                        <TableHead>Judul RPP</TableHead>
                        <TableHead>Mata Pelajaran</TableHead>
                        <TableHead>Kelas</TableHead>
                        <TableHead className="text-center">Pertemuan Ke</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {myRpps.map(rpp => (
                        <TableRow key={rpp.id}>
                          <TableCell className="font-medium max-w-xs truncate">{rpp.judul}</TableCell>
                          <TableCell>{rpp.mapel?.nama || "-"}</TableCell>
                          <TableCell>{rpp.kelas}</TableCell>
                          <TableCell className="text-center">{rpp.pertemuanKe}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => handlePlaceholderAction(`Lihat Detail RPP ${rpp.id}`)}>Detail</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              ) : (
                <p className="text-muted-foreground text-center py-4">Anda belum membuat RPP.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Video className="mr-3 h-5 w-5 text-primary" />
                Sesi Pembelajaran Interaktif
              </CardTitle>
              <CardDescription>
                Fasilitas untuk menjalankan sesi pembelajaran daring atau luring, termasuk video conference dan papan tulis digital.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button variant="default" onClick={() => handlePlaceholderAction("Mulai Video Conference")} className="justify-start text-left h-auto py-3">
                <Video className="mr-3 h-5 w-5" />
                <div>
                  <p className="font-semibold">Mulai Video Conference</p>
                  <p className="text-xs text-muted-foreground">Untuk kelas terjadwal.</p>
                </div>
              </Button>
              <Button variant="outline" onClick={() => handlePlaceholderAction("Buka Papan Tulis Digital")} className="justify-start text-left h-auto py-3">
                 <MessageSquare className="mr-3 h-5 w-5" />
                 <div>
                  <p className="font-semibold">Papan Tulis Digital</p>
                  <p className="text-xs text-muted-foreground">Kolaborasi waktu nyata.</p>
                </div>
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}

