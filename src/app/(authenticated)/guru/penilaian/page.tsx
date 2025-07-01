
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { GraduationCap, Search, Loader2, Save, Download } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { JadwalPelajaran, NilaiSemesterSiswa, SemesterType, User as AppUser, MataPelajaran } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import Papa from "papaparse";


type StudentGradeRow = {
  siswa: Pick<AppUser, 'id' | 'fullName' | 'name' | 'nis' | 'email'>;
  nilaiSemester: NilaiSemesterSiswa | null;
};

type EditableGrade = {
  nilaiTugas?: number | null;
  nilaiUTS?: number | null;
  nilaiUAS?: number | null;
  nilaiHarian?: number | null;
  catatanGuru?: string | null;
  nilaiAkhir?: number | null; 
  predikat?: string | null;
};

function calculateNilaiAkhirClient(data: EditableGrade): number | null {
  const { nilaiTugas, nilaiUTS, nilaiUAS, nilaiHarian } = data;
  const bobotTugas = 0.20;
  const bobotUTS = 0.30;
  const bobotUAS = 0.40;
  const bobotHarian = 0.10;

  let totalNilai = 0;
  let totalBobot = 0;

  if (typeof nilaiTugas === 'number' && !isNaN(nilaiTugas)) { totalNilai += nilaiTugas * bobotTugas; totalBobot += bobotTugas; }
  if (typeof nilaiUTS === 'number' && !isNaN(nilaiUTS)) { totalNilai += nilaiUTS * bobotUTS; totalBobot += bobotUTS; }
  if (typeof nilaiUAS === 'number' && !isNaN(nilaiUAS)) { totalNilai += nilaiUAS * bobotUAS; totalBobot += bobotUAS; }
  if (typeof nilaiHarian === 'number' && !isNaN(nilaiHarian)) { totalNilai += nilaiHarian * bobotHarian; totalBobot += bobotHarian; }
  
  if (totalBobot === 0) return null;
  return parseFloat((totalNilai / totalBobot).toFixed(2));
}

function determinePredikatClient(nilaiAkhir: number | null): string | null {
  if (nilaiAkhir === null || isNaN(nilaiAkhir)) return null;
  if (nilaiAkhir >= 90) return "A";
  if (nilaiAkhir >= 80) return "B";
  if (nilaiAkhir >= 70) return "C";
  if (nilaiAkhir >= 60) return "D";
  return "E";
}


export default function GuruPenilaianPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedClass, setSelectedClass] = useState<string | undefined>();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | undefined>();
  const [selectedSemester, setSelectedSemester] = useState<SemesterType | undefined>();
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState<string>(`${new Date().getFullYear() -1}/${new Date().getFullYear()}`);

  const [uniqueTeachingClasses, setUniqueTeachingClasses] = useState<string[]>([]);
  const [uniqueTeachingSubjects, setUniqueTeachingSubjects] = useState<Array<{ id: string; nama: string }>>([]);
  const [isLoadingTeachingData, setIsLoadingTeachingData] = useState(true);

  const [studentGradesData, setStudentGradesData] = useState<StudentGradeRow[]>([]);
  const [editableGrades, setEditableGrades] = useState<Record<string, EditableGrade>>({});
  const [isLoadingStudentGrades, setIsLoadingStudentGrades] = useState(false);
  const [isSubmittingGrades, setIsSubmittingGrades] = useState(false);

  const semesterOptions: SemesterType[] = ["Ganjil", "Genap"];

  const fetchTeachingData = useCallback(async () => {
    if (!user || !user.id) return;
    setIsLoadingTeachingData(true);
    try {
      const response = await fetch(`/api/jadwal/pelajaran?guruId=${user.id}`);
      if (!response.ok) throw new Error("Gagal mengambil data jadwal mengajar.");
      const jadwalList: JadwalPelajaran[] = await response.json();
      
      const classes = [...new Set(jadwalList.map(j => j.kelas).filter(Boolean))].sort();
      
      const subjectMap = new Map<string, { id: string, nama: string }>();
      jadwalList.forEach(j => {
          if (j.mapel?.id && j.mapel.nama && !subjectMap.has(j.mapel.id)) {
              subjectMap.set(j.mapel.id, { id: j.mapel.id, nama: j.mapel.nama });
          }
      });
      const subjects = Array.from(subjectMap.values()).sort((a,b) => a.nama.localeCompare(b.nama));
      
      setUniqueTeachingClasses(classes as string[]);
      setUniqueTeachingSubjects(subjects);

    } catch (error: any) {
      toast({ title: "Error Data Pengajaran", description: error.message, variant: "destructive" });
    } finally {
      setIsLoadingTeachingData(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user && (user.role === 'guru' || user.role === 'superadmin')) {
      fetchTeachingData();
    }
  }, [user, fetchTeachingData]);

  const fetchStudentGrades = async () => {
    if (!selectedClass || !selectedSubjectId || !selectedSemester || !selectedTahunAjaran) {
      toast({ title: "Filter Tidak Lengkap", description: "Harap pilih Kelas, Mata Pelajaran, Semester, dan Tahun Ajaran.", variant: "default" });
      setStudentGradesData([]);
      setEditableGrades({});
      return;
    }
    setIsLoadingStudentGrades(true);
    try {
      const response = await fetch(`/api/penilaian/semester?kelasId=${encodeURIComponent(selectedClass)}&mapelId=${selectedSubjectId}&semester=${selectedSemester}&tahunAjaran=${encodeURIComponent(selectedTahunAjaran)}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal mengambil data nilai siswa.");
      }
      const data: StudentGradeRow[] = await response.json();
      setStudentGradesData(data);
      
      const initialEditableGrades: Record<string, EditableGrade> = {};
      data.forEach(row => {
        initialEditableGrades[row.siswa.id] = {
          nilaiTugas: row.nilaiSemester?.nilaiTugas ?? null,
          nilaiUTS: row.nilaiSemester?.nilaiUTS ?? null,
          nilaiUAS: row.nilaiSemester?.nilaiUAS ?? null,
          nilaiHarian: row.nilaiSemester?.nilaiHarian ?? null,
          catatanGuru: row.nilaiSemester?.catatanGuru ?? null,
          nilaiAkhir: row.nilaiSemester?.nilaiAkhir ?? null,
          predikat: row.nilaiSemester?.predikat ?? null,
        };
        const calculatedAkhir = calculateNilaiAkhirClient(initialEditableGrades[row.siswa.id]);
        initialEditableGrades[row.siswa.id].nilaiAkhir = calculatedAkhir;
        initialEditableGrades[row.siswa.id].predikat = determinePredikatClient(calculatedAkhir);
      });
      setEditableGrades(initialEditableGrades);

    } catch (error: any) {
      toast({ title: "Error Ambil Nilai", description: error.message, variant: "destructive" });
      setStudentGradesData([]);
      setEditableGrades({});
    } finally {
      setIsLoadingStudentGrades(false);
    }
  };

  const handleGradeInputChange = (siswaId: string, field: keyof EditableGrade, value: string | number | null) => {
    setEditableGrades(prev => {
      const updatedStudentGrade = {
        ...prev[siswaId],
        [field]: value === '' || value === null ? null : (typeof value === 'string' && field !== 'catatanGuru' ? parseFloat(value) : value)
      };
      
      if (field !== 'nilaiAkhir' && field !== 'predikat' && field !== 'catatanGuru') {
          const calculatedAkhir = calculateNilaiAkhirClient(updatedStudentGrade);
          updatedStudentGrade.nilaiAkhir = calculatedAkhir;
          updatedStudentGrade.predikat = determinePredikatClient(calculatedAkhir);
      }

      return { ...prev, [siswaId]: updatedStudentGrade };
    });
  };

  const handleSaveAllGrades = async () => {
    if (!selectedClass || !selectedSubjectId || !selectedSemester || !selectedTahunAjaran || studentGradesData.length === 0) {
      toast({ title: "Data Tidak Lengkap", description: "Pastikan filter dan data siswa sudah terisi.", variant: "default" });
      return;
    }
    setIsSubmittingGrades(true);
    
    const payload = studentGradesData.map(row => {
      const grades = editableGrades[row.siswa.id] || {};
      return {
        siswaId: row.siswa.id,
        mapelId: selectedSubjectId, 
        kelasId: selectedClass,
        semester: selectedSemester,
        tahunAjaran: selectedTahunAjaran,
        nilaiTugas: grades.nilaiTugas,
        nilaiUTS: grades.nilaiUTS,
        nilaiUAS: grades.nilaiUAS,
        nilaiHarian: grades.nilaiHarian,
        catatanGuru: grades.catatanGuru,
        nilaiAkhir: grades.nilaiAkhir, 
        predikat: grades.predikat
      };
    });

    try {
      const response = await fetch('/api/penilaian/semester/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const responseData = await response.json();
      if (!response.ok && response.status !== 207) {
        throw new Error(responseData.message || "Gagal menyimpan data nilai.");
      }
      toast({ title: "Nilai Disimpan", description: responseData.message || "Data nilai berhasil disimpan/diperbarui.", duration: 5000 });
      fetchStudentGrades(); 
    } catch (error: any) {
      toast({ title: "Error Simpan Nilai", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmittingGrades(false);
    }
  };
  
  const handleExportNilai = () => {
    if (studentGradesData.length === 0 || !selectedClass || !selectedSubjectId || !selectedSemester || !selectedTahunAjaran) {
      toast({ title: "Tidak Ada Data", description: "Tidak ada data nilai untuk diekspor.", variant: "default" });
      return;
    }

    const mapelName = uniqueTeachingSubjects.find(s => s.id === selectedSubjectId)?.nama.replace(/ /g, '_') || "mapel";
    const kelasName = selectedClass?.replace(/ /g, '_') || "kelas";
    const tahunAjaranFormatted = selectedTahunAjaran.replace('/', '-');
    const fileName = `nilai_${mapelName}_${kelasName}_${selectedSemester}_${tahunAjaranFormatted}.csv`;
    
    const dataToExport = studentGradesData.map(row => {
        const grades = editableGrades[row.siswa.id] || {};
        return {
            "NIS": row.siswa.nis || "N/A",
            "Nama Siswa": row.siswa.fullName || row.siswa.name,
            "Tugas": grades.nilaiTugas ?? "",
            "UTS": grades.nilaiUTS ?? "",
            "UAS": grades.nilaiUAS ?? "",
            "Harian": grades.nilaiHarian ?? "",
            "Nilai Akhir": grades.nilaiAkhir?.toFixed(2) ?? "",
            "Predikat": grades.predikat ?? "",
            "Catatan Guru": grades.catatanGuru ?? "",
        };
    });

    const csv = Papa.unparse(dataToExport, { header: true });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };


  if (!user || (user.role !== 'guru' && user.role !== 'superadmin')) {
    return <p>Akses Ditolak.</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold">Penilaian & Rapor Siswa</h1>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><GraduationCap className="mr-2 h-6 w-6 text-primary" />Filter Data Penilaian</CardTitle>
          <CardDescription>Pilih kelas, mata pelajaran, semester, dan tahun ajaran untuk mengelola nilai.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <Label htmlFor="kelas-select" className="text-sm font-medium text-muted-foreground mb-1">Kelas</Label>
              {isLoadingTeachingData ? <Loader2 className="h-5 w-5 animate-spin"/> : (
                <Select value={selectedClass} onValueChange={setSelectedClass} disabled={uniqueTeachingClasses.length === 0}>
                    <SelectTrigger id="kelas-select"><SelectValue placeholder={uniqueTeachingClasses.length === 0 ? "Tidak ada kelas" : "Pilih Kelas"} /></SelectTrigger>
                    <SelectContent>{uniqueTeachingClasses.map(cls => <SelectItem key={cls} value={cls}>{cls}</SelectItem>)}</SelectContent>
                </Select>
              )}
            </div>
            <div>
              <Label htmlFor="subject-select" className="text-sm font-medium text-muted-foreground mb-1">Mata Pelajaran</Label>
               {isLoadingTeachingData ?  <Loader2 className="h-5 w-5 animate-spin"/> : (
                <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId} disabled={uniqueTeachingSubjects.length === 0}>
                    <SelectTrigger id="subject-select"><SelectValue placeholder={uniqueTeachingSubjects.length === 0 ? "Tidak ada mapel" : "Pilih Mapel"} /></SelectTrigger>
                    <SelectContent>{uniqueTeachingSubjects.map(sub => <SelectItem key={sub.id} value={sub.id}>{sub.nama}</SelectItem>)}</SelectContent>
                </Select>
              )}
            </div>
            <div>
              <Label htmlFor="semester-select" className="text-sm font-medium text-muted-foreground mb-1">Semester</Label>
              <Select value={selectedSemester} onValueChange={(val) => setSelectedSemester(val as SemesterType)}>
                <SelectTrigger id="semester-select"><SelectValue placeholder="Pilih Semester" /></SelectTrigger>
                <SelectContent>{semesterOptions.map(sem => <SelectItem key={sem} value={sem}>{sem}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tahun-ajaran-input" className="text-sm font-medium text-muted-foreground mb-1">Tahun Ajaran</Label>
              <Input id="tahun-ajaran-input" placeholder="Contoh: 2023/2024" value={selectedTahunAjaran} onChange={(e) => setSelectedTahunAjaran(e.target.value)} />
            </div>
          </div>
          <Button onClick={fetchStudentGrades} disabled={isLoadingStudentGrades || isLoadingTeachingData || !selectedClass || !selectedSubjectId || !selectedSemester || !selectedTahunAjaran}>
            {isLoadingStudentGrades ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Search className="mr-2 h-4 w-4" />} Tampilkan Data Nilai
          </Button>
        </CardContent>
      </Card>

      {studentGradesData.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
              <CardTitle>Daftar Nilai Siswa: {selectedClass} - {uniqueTeachingSubjects.find(s => s.id === selectedSubjectId)?.nama} - {selectedSemester} {selectedTahunAjaran}</CardTitle>
              <CardDescription>Input dan kelola nilai siswa. Perubahan nilai akan otomatis menghitung nilai akhir dan predikat.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[70vh]">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow>
                    <TableHead className="min-w-[180px]">Nama Siswa (NIS)</TableHead>
                    <TableHead className="w-[100px] text-center">Tugas</TableHead>
                    <TableHead className="w-[100px] text-center">UTS</TableHead>
                    <TableHead className="w-[100px] text-center">UAS</TableHead>
                    <TableHead className="w-[100px] text-center">Harian</TableHead>
                    <TableHead className="w-[100px] text-center font-semibold">Akhir</TableHead>
                    <TableHead className="w-[100px] text-center font-semibold">Predikat</TableHead>
                    <TableHead className="min-w-[200px]">Catatan Guru</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentGradesData.map((row) => {
                    const currentGrade = editableGrades[row.siswa.id] || {};
                    return (
                      <TableRow key={row.siswa.id}>
                        <TableCell className="font-medium">{row.siswa.fullName || row.siswa.name} <span className="text-xs text-muted-foreground">({row.siswa.nis || "N/A"})</span></TableCell>
                        <TableCell><Input type="number" min="0" max="100" value={currentGrade.nilaiTugas ?? ""} onChange={(e) => handleGradeInputChange(row.siswa.id, "nilaiTugas", e.target.value)} className="w-20 h-8 text-sm text-center" /></TableCell>
                        <TableCell><Input type="number" min="0" max="100" value={currentGrade.nilaiUTS ?? ""} onChange={(e) => handleGradeInputChange(row.siswa.id, "nilaiUTS", e.target.value)} className="w-20 h-8 text-sm text-center" /></TableCell>
                        <TableCell><Input type="number" min="0" max="100" value={currentGrade.nilaiUAS ?? ""} onChange={(e) => handleGradeInputChange(row.siswa.id, "nilaiUAS", e.target.value)} className="w-20 h-8 text-sm text-center" /></TableCell>
                        <TableCell><Input type="number" min="0" max="100" value={currentGrade.nilaiHarian ?? ""} onChange={(e) => handleGradeInputChange(row.siswa.id, "nilaiHarian", e.target.value)} className="w-20 h-8 text-sm text-center" /></TableCell>
                        <TableCell className="text-center font-semibold">{currentGrade.nilaiAkhir?.toFixed(2) ?? "-"}</TableCell>
                        <TableCell className="text-center font-semibold">{currentGrade.predikat ?? "-"}</TableCell>
                        <TableCell><Textarea value={currentGrade.catatanGuru ?? ""} onChange={(e) => handleGradeInputChange(row.siswa.id, "catatanGuru", e.target.value)} placeholder="Catatan..." className="min-h-[40px] text-xs" rows={1} /></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
            <div className="mt-6 flex justify-end gap-2">
                <Button variant="outline" onClick={handleExportNilai} disabled={studentGradesData.length === 0}>
                    <Download className="mr-2 h-4 w-4"/> Export CSV
                </Button>
                <Button onClick={handleSaveAllGrades} disabled={isSubmittingGrades || isLoadingStudentGrades}>
                  {isSubmittingGrades && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4"/> Simpan Semua Nilai
                </Button>
            </div>
          </CardContent>
        </Card>
      )}
      {(!isLoadingStudentGrades && studentGradesData.length === 0 && selectedClass && selectedSubjectId && selectedSemester && selectedTahunAjaran) && (
        <Card className="shadow-lg">
            <CardContent className="pt-6">
                <p className="text-muted-foreground text-center">Tidak ada data siswa ditemukan untuk filter yang dipilih.</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}

    