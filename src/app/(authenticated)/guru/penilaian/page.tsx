
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { GraduationCap, BookOpenCheck, Edit, Percent, FileText, BarChart, Search, Eye, MessageSquare, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { JadwalPelajaran } from "@/types";
import { useToast } from "@/hooks/use-toast";

export default function GuruPenilaianPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = React.useState<string | undefined>();
  const [selectedSubject, setSelectedSubject] = React.useState<string | undefined>();

  const [uniqueTeachingClasses, setUniqueTeachingClasses] = useState<string[]>([]);
  const [uniqueTeachingSubjects, setUniqueTeachingSubjects] = useState<string[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);


  const fetchTeachingData = useCallback(async () => {
    if (!user || !user.id) return;
    setIsLoadingData(true);
    try {
      const response = await fetch(`/api/jadwal/pelajaran?guruId=${user.id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal mengambil data jadwal mengajar.");
      }
      const jadwalList: JadwalPelajaran[] = await response.json();
      
      const classes = [...new Set(jadwalList.map(j => j.kelas).filter(Boolean))].sort();
      const subjects = [...new Set(jadwalList.map(j => j.mapel?.nama).filter(Boolean))].sort();
      
      setUniqueTeachingClasses(classes as string[]);
      setUniqueTeachingSubjects(subjects as string[]);

    } catch (error: any) {
      toast({ title: "Error Data Pengajaran", description: error.message, variant: "destructive" });
      setUniqueTeachingClasses([]);
      setUniqueTeachingSubjects([]);
    } finally {
      setIsLoadingData(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user && (user.role === 'guru' || user.role === 'superadmin')) {
      fetchTeachingData();
    }
  }, [user, fetchTeachingData]);


  if (!user || (user.role !== 'guru' && user.role !== 'superadmin')) {
    return <p>Akses Ditolak. Anda harus menjadi Guru untuk melihat halaman ini.</p>;
  }

  const handlePlaceholderAction = (action: string) => {
    alert(`Fungsi "${action}" belum diimplementasikan.`);
  };

  const mockStudentsGrades = [
    { id: "S001", name: "Ahmad Subarjo", tugas: 85, uts: 78, uas: 80, akhir: 81, predikat: "B+" },
    { id: "S002", name: "Budi Santoso", tugas: 90, uts: 88, uas: 92, akhir: 90, predikat: "A" },
    { id: "S003", name: "Citra Lestari", tugas: 70, uts: 65, uas: 72, akhir: 69, predikat: "C" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold">Penilaian & Rapor Siswa</h1>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <GraduationCap className="mr-2 h-6 w-6 text-primary" />
            Manajemen Penilaian Akademik
          </CardTitle>
          <CardDescription>
            Input nilai, kelola komponen penilaian, hitung nilai akhir, dan publikasikan rapor siswa.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label htmlFor="kelas-select" className="block text-sm font-medium text-muted-foreground mb-1">Pilih Kelas</label>
              {isLoadingData ? (
                <div className="flex items-center h-10"><Loader2 className="h-5 w-5 animate-spin mr-2" /> Memuat...</div>
              ) : (
                <Select value={selectedClass} onValueChange={setSelectedClass} disabled={uniqueTeachingClasses.length === 0}>
                    <SelectTrigger id="kelas-select">
                    <SelectValue placeholder={uniqueTeachingClasses.length === 0 ? "Tidak ada kelas" : "Pilih Kelas"} />
                    </SelectTrigger>
                    <SelectContent>
                    {uniqueTeachingClasses.map(cls => <SelectItem key={cls} value={cls}>{cls}</SelectItem>)}
                    </SelectContent>
                </Select>
              )}
            </div>
            <div>
              <label htmlFor="subject-select" className="block text-sm font-medium text-muted-foreground mb-1">Pilih Mata Pelajaran</label>
               {isLoadingData ? (
                <div className="flex items-center h-10"><Loader2 className="h-5 w-5 animate-spin mr-2" /> Memuat...</div>
              ) : (
                <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={uniqueTeachingSubjects.length === 0}>
                    <SelectTrigger id="subject-select">
                    <SelectValue placeholder={uniqueTeachingSubjects.length === 0 ? "Tidak ada mapel" : "Pilih Mapel"} />
                    </SelectTrigger>
                    <SelectContent>
                    {uniqueTeachingSubjects.map(sub => <SelectItem key={sub} value={sub}>{sub}</SelectItem>)}
                    </SelectContent>
                </Select>
              )}
            </div>
             <Button onClick={() => handlePlaceholderAction(`Tampilkan Data Nilai untuk ${selectedClass} - ${selectedSubject}`)} disabled={!selectedClass || !selectedSubject || isLoadingData}>
                <Search className="mr-2 h-4 w-4" /> Tampilkan Data Nilai
            </Button>
          </div>

          {selectedClass && selectedSubject && (
             <Card>
                <CardHeader>
                    <CardTitle>Daftar Nilai: {selectedClass} - {selectedSubject}</CardTitle>
                    <CardDescription>Input dan kelola nilai siswa (data mock).</CardDescription>
                </CardHeader>
                <CardContent>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted/50">
                        <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Nama Siswa</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Tugas</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">UTS</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">UAS</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Nilai Akhir</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Predikat</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Tindakan</th>
                        </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                        {mockStudentsGrades.map(siswa => (
                        <tr key={siswa.id}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-foreground">{siswa.name}</td>
                            <td className="px-4 py-3"><Input type="number" defaultValue={siswa.tugas} className="w-20 h-8 text-sm" onChange={(e) => handlePlaceholderAction(`Update nilai tugas ${siswa.name}`)} /></td>
                            <td className="px-4 py-3"><Input type="number" defaultValue={siswa.uts} className="w-20 h-8 text-sm" onChange={(e) => handlePlaceholderAction(`Update nilai UTS ${siswa.name}`)} /></td>
                            <td className="px-4 py-3"><Input type="number" defaultValue={siswa.uas} className="w-20 h-8 text-sm" onChange={(e) => handlePlaceholderAction(`Update nilai UAS ${siswa.name}`)} /></td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground font-semibold">{siswa.akhir}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">{siswa.predikat}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-center">
                                <Button variant="ghost" size="sm" onClick={() => handlePlaceholderAction(`Detail nilai ${siswa.name}`)} className="mr-1"><Eye className="h-4 w-4"/></Button>
                                <Button variant="ghost" size="sm" onClick={() => handlePlaceholderAction(`Beri feedback ${siswa.name}`)}><MessageSquare className="h-4 w-4"/></Button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                <div className="mt-4 flex justify-end">
                    <Button onClick={() => handlePlaceholderAction("Simpan Semua Perubahan Nilai")}>Simpan Semua Nilai</Button>
                </div>
                </CardContent>
            </Card>
          )}


          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <BookOpenCheck className="mr-3 h-5 w-5 text-primary" />
                Pengelolaan Komponen & Rapor
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Button variant="outline" onClick={() => handlePlaceholderAction("Atur Bobot Penilaian")} className="justify-start text-left h-auto py-3">
                <Percent className="mr-3 h-5 w-5" />
                <div>
                  <p className="font-semibold">Bobot Nilai</p>
                  <p className="text-xs text-muted-foreground">Atur persentase komponen.</p>
                </div>
              </Button>
              <Button variant="outline" onClick={() => handlePlaceholderAction("Generate Rapor Sementara")} className="justify-start text-left h-auto py-3">
                <FileText className="mr-3 h-5 w-5" />
                 <div>
                  <p className="font-semibold">Generate Rapor</p>
                  <p className="text-xs text-muted-foreground">Buat draf rapor siswa.</p>
                </div>
              </Button>
               <Button variant="outline" onClick={() => handlePlaceholderAction("Analisis Hasil Belajar")} className="justify-start text-left h-auto py-3">
                <BarChart className="mr-3 h-5 w-5" />
                 <div>
                  <p className="font-semibold">Analisis Nilai</p>
                  <p className="text-xs text-muted-foreground">Statistik pencapaian siswa.</p>
                </div>
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
