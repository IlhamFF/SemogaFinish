
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import type { RPP, JadwalPelajaran } from "@/types";
import { Presentation, Loader2, BookHeart, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

interface TeachingAssignment {
  kelas: string;
  mapel: string;
}

export default function GuruPengajaranPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [myRpps, setMyRpps] = useState<RPP[]>([]);
  const [isLoadingRpps, setIsLoadingRpps] = useState(true);
  const [teachingAssignments, setTeachingAssignments] = useState<TeachingAssignment[]>([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(true);

  const fetchMyRpps = useCallback(async () => {
    if (!user) return;
    setIsLoadingRpps(true);
    try {
      const response = await fetch('/api/kurikulum/rpp'); 
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal mengambil data RPP.");
      }
      const data: RPP[] = await response.json();
      setMyRpps(data);
    } catch (error: any) {
      toast({ title: "Error RPP", description: error.message, variant: "destructive" });
    } finally {
      setIsLoadingRpps(false);
    }
  }, [user, toast]);

  const fetchTeachingAssignments = useCallback(async () => {
    if (!user || !user.id) return;
    setIsLoadingAssignments(true);
    try {
      const response = await fetch(`/api/jadwal/pelajaran?guruId=${user.id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal mengambil data jadwal mengajar.");
      }
      const jadwalList: JadwalPelajaran[] = await response.json();
      
      const assignmentsMap = new Map<string, TeachingAssignment>();
      jadwalList.forEach(jadwal => {
        if (jadwal.kelas && jadwal.mapel?.nama) {
          const key = `${jadwal.kelas}-${jadwal.mapel.nama}`;
          if (!assignmentsMap.has(key)) {
            assignmentsMap.set(key, { kelas: jadwal.kelas, mapel: jadwal.mapel.nama });
          }
        }
      });
      setTeachingAssignments(Array.from(assignmentsMap.values()).sort((a,b) => a.kelas.localeCompare(b.kelas) || a.mapel.localeCompare(b.mapel)));

    } catch (error: any) {
      toast({ title: "Error Jadwal Mengajar", description: error.message, variant: "destructive" });
    } finally {
      setIsLoadingAssignments(false);
    }
  }, [user, toast]);


  useEffect(() => {
    if (user && (user.role === 'guru' || user.role === 'superadmin')) {
      fetchMyRpps();
      fetchTeachingAssignments();
    }
  }, [user, fetchMyRpps, fetchTeachingAssignments]);

  if (!user || (user.role !== 'guru' && user.role !== 'superadmin')) {
    return <p>Akses Ditolak. Anda harus menjadi Guru untuk melihat halaman ini.</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold">Modul Pengajaran</h1>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Presentation className="mr-2 h-6 w-6 text-primary" />
            Ringkasan Aktivitas Pengajaran
          </CardTitle>
          <CardDescription>
            Kelola RPP dan lihat daftar kelas yang Anda ampu.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl"><Users className="mr-3 h-5 w-5 text-primary"/>Kelas & Mata Pelajaran Saya</CardTitle>
              <CardDescription>Daftar kelas dan mata pelajaran yang Anda ampu berdasarkan jadwal.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAssignments ? (
                <div className="flex justify-center items-center h-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : teachingAssignments.length > 0 ? (
                <ScrollArea className="max-h-52 border rounded-md">
                  <Table size="sm">
                    <TableHeader className="bg-muted/30">
                      <TableRow><TableHead>Kelas</TableHead><TableHead>Mata Pelajaran</TableHead></TableRow>
                    </TableHeader>
                    <TableBody>
                      {teachingAssignments.map((assignment, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{assignment.kelas}</TableCell>
                          <TableCell>{assignment.mapel}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              ) : (
                <p className="text-muted-foreground text-center py-4">Belum ada data kelas dan mata pelajaran yang diajarkan.</p>
              )}
              <Button variant="link" asChild className="px-0 h-auto mt-2 text-sm">
                <Link href={ROUTES.GURU_JADWAL}>Lihat Jadwal Mengajar Lengkap</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <BookHeart className="mr-3 h-5 w-5 text-primary" />
                Rencana Pembelajaran (RPP) Saya
              </CardTitle>
              <CardDescription>
                Daftar Rencana Pelaksanaan Pembelajaran (RPP) yang telah Anda buat.
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {myRpps.map(rpp => (
                        <TableRow key={rpp.id}>
                          <TableCell className="font-medium max-w-xs truncate">{rpp.judul}</TableCell>
                          <TableCell>{rpp.mapel?.nama || "-"}</TableCell>
                          <TableCell>{rpp.kelas}</TableCell>
                          <TableCell className="text-center">{rpp.pertemuanKe}</TableCell>
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
        </CardContent>
      </Card>
    </div>
  );
}
