
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";
import { BookOpen, DownloadCloud, Search, FileText, Video, Link as LinkIcon, Loader2, FolderKanban } from "lucide-react";
import type { MateriAjar as Materi, JadwalPelajaran } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";

export default function SiswaMateriPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [allAvailableMaterials, setAllAvailableMaterials] = useState<Materi[]>([]);
  const [studentSubjects, setStudentSubjects] = useState<string[]>([]);
  
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(true);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMapel, setFilterMapel] = useState<string>("semua");

  const fetchStudentSchedule = useCallback(async () => {
    if (!user || !user.kelas) {
      setIsLoadingSchedule(false);
      return;
    }
    setIsLoadingSchedule(true);
    try {
      const response = await fetch(`/api/jadwal/pelajaran?kelas=${encodeURIComponent(user.kelas)}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal mengambil jadwal siswa.");
      }
      const schedule: JadwalPelajaran[] = await response.json();
      const uniqueSubjects = [...new Set(schedule.map(item => item.mapel?.nama).filter(Boolean) as string[])].sort();
      setStudentSubjects(uniqueSubjects);
    } catch (error: any) {
      toast({ title: "Error Jadwal", description: error.message, variant: "destructive" });
      setStudentSubjects([]);
    } finally {
      setIsLoadingSchedule(false);
    }
  }, [user, toast]);

  const fetchAllMaterials = useCallback(async () => {
    setIsLoadingMaterials(true);
    try {
      const response = await fetch('/api/kurikulum/materi-ajar');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal mengambil materi ajar.");
      }
      setAllAvailableMaterials(await response.json());
    } catch (error: any) {
      toast({ title: "Error Materi", description: error.message, variant: "destructive" });
      setAllAvailableMaterials([]);
    } finally {
      setIsLoadingMaterials(false);
    }
  }, [toast]);

  useEffect(() => {
    if (user && user.isVerified) {
      fetchStudentSchedule();
      fetchAllMaterials();
    } else {
      setIsLoadingSchedule(false);
      setIsLoadingMaterials(false);
    }
  }, [user, fetchStudentSchedule, fetchAllMaterials]);


  if (!user || (user.role !== 'siswa' && user.role !== 'superadmin')) {
    return <p>Akses Ditolak. Anda harus menjadi Siswa untuk melihat halaman ini.</p>;
  }
  if (user && !user.isVerified) {
    return <p>Silakan verifikasi email Anda untuk mengakses fitur ini.</p>;
  }

  const handleDownloadOrOpenLink = (materi: Materi) => {
    if (materi.jenisMateri === "Link" && materi.fileUrl) {
        window.open(materi.fileUrl, '_blank', 'noopener,noreferrer');
    } else if (materi.jenisMateri === "File" && materi.fileUrl) {
        // For demo, assume fileUrl is a direct link. In reality, this might be an API endpoint.
        toast({ title: "Simulasi Unduh", description: `Mengunduh ${materi.namaFileOriginal || materi.judul}... (URL: ${materi.fileUrl})` });
        window.open(materi.fileUrl, '_blank'); 
    } else {
        toast({ title: "Aksi Tidak Tersedia", description: "Tidak ada file atau tautan yang valid untuk materi ini.", variant: "destructive"});
    }
  };

  const uniqueMapelOptionsForFilter = useMemo(() => {
    return ["semua", ...studentSubjects];
  }, [studentSubjects]);

  const displayedMaterials = useMemo(() => {
    if (isLoadingSchedule || studentSubjects.length === 0) {
      // If schedule is loading or student has no subjects, filter based on all materials for now,
      // or return empty if no materials are relevant.
      // Let's filter by search term and selected mapel from ALL materials if student subjects not yet loaded.
      return allAvailableMaterials.filter(m =>
        (m.judul.toLowerCase().includes(searchTerm.toLowerCase()) || (m.uploader?.fullName || m.uploader?.name || "").toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filterMapel === "semua" || m.mapelNama === filterMapel)
      );
    }
    
    return allAvailableMaterials.filter(m => 
      studentSubjects.includes(m.mapelNama) && // Filter by student's actual subjects
      (m.judul.toLowerCase().includes(searchTerm.toLowerCase()) || (m.uploader?.fullName || m.uploader?.name || "").toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterMapel === "semua" || m.mapelNama === filterMapel)
    );
  }, [allAvailableMaterials, studentSubjects, searchTerm, filterMapel, isLoadingSchedule]);
  
  const getJenisIcon = (jenis: Materi["jenisMateri"]) => {
    switch(jenis) {
        case "File": return <FileText className="h-5 w-5 text-sky-500" />; // Generic file
        case "Link": return <LinkIcon className="h-5 w-5 text-gray-500" />;
        default: return <FileText className="h-5 w-5" />;
    }
  }

  const isLoading = isLoadingMaterials || isLoadingSchedule;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold flex items-center">
        <BookOpen className="mr-3 h-8 w-8 text-primary" />
        Materi Pelajaran Saya
      </h1>
      <p className="text-muted-foreground">Akses dan unduh materi pembelajaran yang relevan dengan mata pelajaran Anda. Kelas: {user.kelas || "Tidak terdaftar"}</p>

      <Card className="shadow-lg">
        <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <CardTitle>Daftar Materi Tersedia</CardTitle>
                    <CardDescription>Cari dan filter materi untuk mata pelajaran Anda.</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <div className="relative flex-grow sm:flex-grow-0 sm:w-[200px] lg:w-[300px]">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Cari judul, guru..." 
                            className="pl-8 w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)} 
                            disabled={isLoading}
                        />
                    </div>
                    <Select value={filterMapel} onValueChange={setFilterMapel} disabled={isLoading || studentSubjects.length === 0}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter Mata Pelajaran" />
                        </SelectTrigger>
                        <SelectContent>
                            {uniqueMapelOptionsForFilter.map(mapel => (
                                <SelectItem key={mapel} value={mapel}>{mapel === "semua" ? "Semua Mapel Saya" : mapel}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-60"><Loader2 className="h-10 w-10 animate-spin text-primary" /> <p className="ml-3">Memuat materi...</p></div>
          ) : displayedMaterials.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Jenis</TableHead>
                    <TableHead>Judul Materi</TableHead>
                    <TableHead>Mata Pelajaran</TableHead>
                    <TableHead>Guru</TableHead>
                    <TableHead>Tgl Upload</TableHead>
                    <TableHead className="text-right">Tindakan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedMaterials.map((materi) => (
                    <TableRow key={materi.id}>
                      <TableCell>{getJenisIcon(materi.jenisMateri)}</TableCell>
                      <TableCell className="font-medium max-w-sm truncate" title={materi.judul}>{materi.judul}</TableCell>
                      <TableCell>{materi.mapelNama}</TableCell>
                      <TableCell>{materi.uploader?.fullName || materi.uploader?.name || "N/A"}</TableCell>
                      <TableCell>{format(parseISO(materi.tanggalUpload), "dd/MM/yyyy")}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                            variant={materi.jenisMateri === "Link" ? "outline" : "default"} 
                            size="sm" 
                            onClick={() => handleDownloadOrOpenLink(materi)}
                        >
                          {materi.jenisMateri === "Link" ? <LinkIcon className="mr-2 h-4 w-4" /> : <DownloadCloud className="mr-2 h-4 w-4" />}
                          {materi.jenisMateri === "Link" ? "Buka Tautan" : "Unduh/Lihat"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <FolderKanban className="mx-auto h-12 w-12" />
              <p className="mt-2">
                {studentSubjects.length === 0 && !isLoadingSchedule ? "Jadwal Anda belum tersedia atau tidak ada mata pelajaran." : "Tidak ada materi yang cocok dengan filter atau untuk mata pelajaran Anda saat ini."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

