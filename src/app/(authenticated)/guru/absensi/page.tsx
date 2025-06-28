
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { UserCheck, CalendarDays, ListChecks, Printer, Loader2, BookOpen, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { format, parseISO } from "date-fns";
import { id as localeID } from 'date-fns/locale';
import type { JadwalPelajaran, AbsensiSiswa, StatusKehadiran, User as AppUser } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";

interface SiswaWithAbsensi {
  siswaId: string;
  fullName?: string | null;
  nis?: string | null;
  statusKehadiran: StatusKehadiran | null;
  catatan?: string | null;
  absensiId?: string | null; 
}

interface RekapSiswa {
  id: string;
  nama: string;
  nis?: string | null;
  hadir: number;
  izin: number;
  sakit: number;
  alpha: number;
}

const MONTHS = [
  { value: 1, label: "Januari" }, { value: 2, label: "Februari" }, { value: 3, label: "Maret" },
  { value: 4, label: "April" }, { value: 5, label: "Mei" }, { value: 6, label: "Juni" },
  { value: 7, label: "Juli" }, { value: 8, label: "Agustus" }, { value: 9, label: "September" },
  { value: 10, label: "Oktober" }, { value: 11, label: "November" }, { value: 12, label: "Desember" }
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

export default function GuruAbsensiPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedClass, setSelectedClass] = useState<string | undefined>();
  const [teachingClasses, setTeachingClasses] = useState<string[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);

  const [scheduledLessons, setScheduledLessons] = useState<JadwalPelajaran[]>([]);
  const [isLoadingScheduledLessons, setIsLoadingScheduledLessons] = useState(false);
  const [selectedJadwalPelajaranId, setSelectedJadwalPelajaranId] = useState<string | undefined>();
  
  const [siswaListForAttendance, setSiswaListForAttendance] = useState<SiswaWithAbsensi[]>([]);
  const [isLoadingSiswaForAttendance, setIsLoadingSiswaForAttendance] = useState(false);
  const [isSubmittingAttendance, setIsSubmittingAttendance] = useState(false);

  const [isRekapDialogOpen, setIsRekapDialogOpen] = useState(false);
  const [selectedRekapKelas, setSelectedRekapKelas] = useState<string | undefined>(selectedClass);
  const [selectedRekapBulan, setSelectedRekapBulan] = useState<string>(String(new Date().getMonth() + 1));
  const [selectedRekapTahun, setSelectedRekapTahun] = useState<string>(String(CURRENT_YEAR));
  const [rekapData, setRekapData] = useState<RekapSiswa[]>([]);
  const [isLoadingRekap, setIsLoadingRekap] = useState(false);


  const fetchTeachingClasses = useCallback(async () => {
    if (!user || !user.id) return;
    setIsLoadingClasses(true);
    try {
      const response = await fetch(`/api/jadwal/pelajaran?guruId=${user.id}`);
      if (!response.ok) throw new Error("Gagal mengambil data jadwal mengajar.");
      const jadwalList: JadwalPelajaran[] = await response.json();
      const uniqueClasses = [...new Set(jadwalList.map(jadwal => jadwal.kelas).filter(Boolean))].sort();
      setTeachingClasses(uniqueClasses as string[]);
    } catch (error: any) {
      toast({ title: "Error Data Kelas", description: error.message, variant: "destructive" });
      setTeachingClasses([]);
    } finally {
      setIsLoadingClasses(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user && (user.role === 'guru' || user.role === 'superadmin')) {
      fetchTeachingClasses();
    }
  }, [user, fetchTeachingClasses]);
  
  useEffect(() => {
    if(selectedClass && !selectedRekapKelas) {
        setSelectedRekapKelas(selectedClass);
    }
  }, [selectedClass, selectedRekapKelas]);

  const fetchScheduledLessons = useCallback(async () => {
    if (!user || !user.id || !selectedClass || !selectedDate) {
      setScheduledLessons([]);
      return;
    }
    setIsLoadingScheduledLessons(true);
    const dayName = format(selectedDate, "eeee", { locale: localeID }); 
    try {
      const response = await fetch(`/api/jadwal/pelajaran?guruId=${user.id}&kelas=${encodeURIComponent(selectedClass)}&hari=${dayName}`);
      if (!response.ok) throw new Error("Gagal mengambil sesi pelajaran terjadwal.");
      const lessons: JadwalPelajaran[] = await response.json();
      setScheduledLessons(lessons.sort((a,b) => (a.slotWaktu?.waktuMulai || "").localeCompare(b.slotWaktu?.waktuMulai || "")));
      setSelectedJadwalPelajaranId(undefined); 
      setSiswaListForAttendance([]); 
    } catch (error: any) {
      toast({ title: "Error Sesi Pelajaran", description: error.message, variant: "destructive" });
      setScheduledLessons([]);
    } finally {
      setIsLoadingScheduledLessons(false);
    }
  }, [user, selectedClass, selectedDate, toast]);

  useEffect(() => {
    fetchScheduledLessons();
  }, [selectedClass, selectedDate, fetchScheduledLessons]);

  const fetchAttendanceData = async () => {
    if (!selectedJadwalPelajaranId || !selectedDate) {
      setSiswaListForAttendance([]);
      return;
    }
    setIsLoadingSiswaForAttendance(true);
    try {
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      const response = await fetch(`/api/absensi?jadwalPelajaranId=${selectedJadwalPelajaranId}&tanggal=${formattedDate}`);
      if (!response.ok) throw new Error("Gagal mengambil data absensi siswa.");
      const data: { jadwalPelajaran: any; siswaDenganAbsensi: SiswaWithAbsensi[] } = await response.json();
      setSiswaListForAttendance(data.siswaDenganAbsensi);
    } catch (error: any) {
      toast({ title: "Error Data Absensi", description: error.message, variant: "destructive" });
      setSiswaListForAttendance([]);
    } finally {
      setIsLoadingSiswaForAttendance(false);
    }
  };

  const handleSelectJadwalPelajaran = (jadwalId: string) => {
    setSelectedJadwalPelajaranId(jadwalId);
  };
  
  const handleAttendanceStatusChange = (siswaId: string, status: StatusKehadiran) => {
    setSiswaListForAttendance(prev => 
      prev.map(s => s.siswaId === siswaId ? { ...s, statusKehadiran: status } : s)
    );
  };

  const handleAttendanceCatatanChange = (siswaId: string, catatan: string) => {
    setSiswaListForAttendance(prev => 
      prev.map(s => s.siswaId === siswaId ? { ...s, catatan: catatan } : s)
    );
  };

  const handleSaveAttendance = async () => {
    if (!selectedJadwalPelajaranId || !selectedDate || siswaListForAttendance.length === 0) {
      toast({ title: "Data Tidak Lengkap", description: "Pilih sesi pelajaran dan pastikan ada data siswa.", variant: "destructive"});
      return;
    }
    setIsSubmittingAttendance(true);
    const payload = {
      jadwalPelajaranId: selectedJadwalPelajaranId,
      tanggalAbsensi: format(selectedDate, "yyyy-MM-dd"),
      dataAbsensi: siswaListForAttendance
        .filter(s => s.statusKehadiran) 
        .map(s => ({
          siswaId: s.siswaId,
          statusKehadiran: s.statusKehadiran!,
          catatan: s.catatan || null,
        })),
    };
    if (payload.dataAbsensi.length === 0) {
        toast({title: "Tidak Ada Data", description: "Tidak ada status kehadiran yang diatur untuk disimpan.", variant: "default"});
        setIsSubmittingAttendance(false);
        return;
    }

    try {
      const response = await fetch('/api/absensi/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || "Gagal menyimpan absensi.");
      }
      toast({ title: "Absensi Disimpan", description: responseData.message || "Data kehadiran siswa telah disimpan." });
      fetchAttendanceData(); 
    } catch (error: any) {
      toast({ title: "Error Simpan Absensi", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmittingAttendance(false);
    }
  };

  const handleShowRekap = async () => {
    if (!selectedRekapKelas || !selectedRekapBulan || !selectedRekapTahun) {
      toast({ title: "Filter Tidak Lengkap", description: "Pilih kelas, bulan, dan tahun untuk rekap.", variant: "default"});
      setRekapData([]);
      return;
    }
    setIsLoadingRekap(true);
    try {
        const response = await fetch(`/api/absensi/rekap?kelasId=${encodeURIComponent(selectedRekapKelas)}&bulan=${selectedRekapBulan}&tahun=${selectedRekapTahun}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Gagal mengambil data rekap.");
        }
        const data: RekapSiswa[] = await response.json();
        setRekapData(data);
        if (data.length === 0) {
            toast({title: "Info", description: "Tidak ada data rekap ditemukan untuk periode ini."});
        }
    } catch(e: any) {
        toast({title: "Error Rekap", description: e.message, variant: "destructive"});
        setRekapData([]);
    } finally {
        setIsLoadingRekap(false);
    }
  };


  if (!user || (user.role !== 'guru' && user.role !== 'superadmin')) {
    return <p>Akses Ditolak. Anda harus menjadi Guru untuk melihat halaman ini.</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold">Manajemen Absensi Siswa</h1>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><UserCheck className="mr-2 h-6 w-6 text-primary" />Pencatatan Kehadiran</CardTitle>
          <CardDescription>Pilih kelas, tanggal, dan sesi pelajaran untuk mencatat kehadiran siswa.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
              <label htmlFor="kelas-select" className="block text-sm font-medium text-muted-foreground mb-1">Pilih Kelas</label>
              {isLoadingClasses ? ( <div className="flex items-center h-10"><Loader2 className="h-5 w-5 animate-spin mr-2" /> Memuat kelas...</div> ) : (
                <Select value={selectedClass} onValueChange={setSelectedClass} disabled={teachingClasses.length === 0}>
                  <SelectTrigger id="kelas-select"><SelectValue placeholder={teachingClasses.length === 0 ? "Tidak ada kelas diajar" : "Pilih Kelas"} /></SelectTrigger>
                  <SelectContent>{teachingClasses.map(cls => <SelectItem key={cls} value={cls}>{cls}</SelectItem>)}</SelectContent>
                </Select>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Pilih Tanggal</label>
              <Popover>
                <PopoverTrigger asChild><Button variant="outline" className="w-full justify-start text-left font-normal">{selectedDate ? format(selectedDate, "PPP", { locale: localeID }) : <span>Pilih tanggal</span>}</Button></PopoverTrigger>
                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus /></PopoverContent>
              </Popover>
            </div>
          </div>

          {selectedClass && selectedDate && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Pilih Sesi Pelajaran untuk {selectedClass} ({format(selectedDate, "eeee, dd MMM yyyy", { locale: localeID })})</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingScheduledLessons ? (<div className="flex justify-center items-center h-20"><Loader2 className="h-6 w-6 animate-spin" /></div>
                ) : scheduledLessons.length > 0 ? (
                  <div className="space-y-2">
                    {scheduledLessons.map(lesson => (
                      <Button 
                        key={lesson.id} 
                        variant={selectedJadwalPelajaranId === lesson.id ? "default" : "outline"} 
                        className="w-full justify-start text-left"
                        onClick={() => handleSelectJadwalPelajaran(lesson.id)}
                      >
                        <BookOpen className="mr-2 h-4 w-4" /> {lesson.mapel?.nama} ({lesson.slotWaktu?.waktuMulai} - {lesson.slotWaktu?.waktuSelesai}) - Ruang: {lesson.ruangan?.nama}
                      </Button>
                    ))}
                     <Button onClick={fetchAttendanceData} disabled={!selectedJadwalPelajaranId || isLoadingSiswaForAttendance} className="mt-2">
                        <Search className="mr-2 h-4 w-4"/> Ambil Data Absensi Sesi Ini
                    </Button>
                  </div>
                ) : ( <p className="text-muted-foreground text-center">Tidak ada sesi pelajaran terjadwal untuk Anda pada kelas dan tanggal ini.</p> )}
              </CardContent>
            </Card>
          )}

          {selectedJadwalPelajaranId && selectedDate && (
            <Card>
              <CardHeader>
                <CardTitle>Absensi: {scheduledLessons.find(l=>l.id === selectedJadwalPelajaranId)?.mapel?.nama} - {selectedClass} - {format(selectedDate, "dd MMMM yyyy", { locale: localeID })}</CardTitle>
                <CardDescription>Daftar kehadiran siswa. Silakan pilih status untuk setiap siswa.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingSiswaForAttendance ? (<div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin" /></div>
                ) : siswaListForAttendance.length > 0 ? (
                  <>
                    <ScrollArea className="max-h-[50vh]">
                      <Table>
                        <TableHeader><TableRow><TableHead>Nama Siswa (NIS)</TableHead><TableHead className="w-[150px]">Status</TableHead><TableHead>Catatan (Opsional)</TableHead></TableRow></TableHeader>
                        <TableBody>
                          {siswaListForAttendance.map(siswa => (
                            <TableRow key={siswa.siswaId}>
                              <TableCell className="font-medium">{siswa.fullName || "Nama Siswa"} <span className="text-xs text-muted-foreground">({siswa.nis || "N/A"})</span></TableCell>
                              <TableCell>
                                <Select 
                                  value={siswa.statusKehadiran || ""} 
                                  onValueChange={(value) => handleAttendanceStatusChange(siswa.siswaId, value as StatusKehadiran)}
                                >
                                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Pilih Status" /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Hadir">Hadir</SelectItem>
                                    <SelectItem value="Izin">Izin</SelectItem>
                                    <SelectItem value="Sakit">Sakit</SelectItem>
                                    <SelectItem value="Alpha">Alpha</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Input 
                                    type="text" 
                                    placeholder="Catatan..." 
                                    className="h-8 text-xs"
                                    value={siswa.catatan || ""}
                                    onChange={(e) => handleAttendanceCatatanChange(siswa.siswaId, e.target.value)}
                                />
                                </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                    <div className="mt-4 flex justify-end">
                      <Button onClick={handleSaveAttendance} disabled={isSubmittingAttendance}>
                        {isSubmittingAttendance && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Simpan Absensi
                      </Button>
                    </div>
                  </>
                ) : ( <p className="text-muted-foreground text-center py-4">Tidak ada data siswa untuk kelas ini, atau data absensi belum diambil.</p> )}
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader><CardTitle className="flex items-center text-xl"><CalendarDays className="mr-3 h-5 w-5 text-primary" />Laporan & Rekapitulasi Absensi</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <Button variant="outline" onClick={() => setIsRekapDialogOpen(true)} className="justify-start text-left h-auto py-3 col-span-full"><ListChecks className="mr-3 h-5 w-5" /><div><p className="font-semibold">Rekap & Cetak Absensi Bulanan</p><p className="text-xs text-muted-foreground">Lihat dan cetak rekapitulasi kehadiran per bulan.</p></div></Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <Dialog open={isRekapDialogOpen} onOpenChange={setIsRekapDialogOpen}>
        <DialogContent className="max-w-3xl print:shadow-none print:border-none">
          <DialogHeader className="print:hidden">
            <DialogTitle>Rekap Absensi Bulanan</DialogTitle>
            <DialogDescription>Pilih kelas, bulan, dan tahun untuk melihat rekap absensi.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 print:hidden">
            <div>
              <Label htmlFor="rekap-kelas-select" className="text-sm font-medium text-muted-foreground mb-1">Kelas</Label>
              <Select value={selectedRekapKelas} onValueChange={setSelectedRekapKelas} disabled={teachingClasses.length === 0}>
                <SelectTrigger id="rekap-kelas-select"><SelectValue placeholder={teachingClasses.length === 0 ? "Tidak ada kelas" : "Pilih Kelas"} /></SelectTrigger>
                <SelectContent>{teachingClasses.map(cls => <SelectItem key={cls} value={cls}>{cls}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="rekap-bulan-select" className="text-sm font-medium text-muted-foreground mb-1">Bulan</Label>
              <Select value={selectedRekapBulan} onValueChange={setSelectedRekapBulan}>
                <SelectTrigger id="rekap-bulan-select"><SelectValue placeholder="Pilih Bulan" /></SelectTrigger>
                <SelectContent>{MONTHS.map(m => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="rekap-tahun-select" className="text-sm font-medium text-muted-foreground mb-1">Tahun</Label>
              <Select value={selectedRekapTahun} onValueChange={setSelectedRekapTahun}>
                <SelectTrigger id="rekap-tahun-select"><SelectValue placeholder="Pilih Tahun" /></SelectTrigger>
                <SelectContent>{YEARS.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleShowRekap} disabled={isLoadingRekap || !selectedRekapKelas} className="print:hidden">
            {isLoadingRekap && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Tampilkan Rekap
          </Button>
          
          <div className="printable-rekap-area">
            <div className="hidden print:block text-center mb-4">
              <h2 className="text-lg font-bold">Rekap Absensi Bulanan</h2>
              <p>Kelas: {selectedRekapKelas}</p>
              <p>Periode: {MONTHS.find(m => m.value.toString() === selectedRekapBulan)?.label} {selectedRekapTahun}</p>
            </div>
            {isLoadingRekap ? (
              <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin"/></div>
            ) : rekapData.length > 0 ? (
              <ScrollArea className="max-h-[50vh] mt-4 border rounded-md print:border-none print:max-h-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Siswa</TableHead>
                      <TableHead>NIS</TableHead>
                      <TableHead className="text-center">Hadir</TableHead>
                      <TableHead className="text-center">Izin</TableHead>
                      <TableHead className="text-center">Sakit</TableHead>
                      <TableHead className="text-center">Alpha</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rekapData.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.nama}</TableCell>
                        <TableCell>{item.nis || "N/A"}</TableCell>
                        <TableCell className="text-center">{item.hadir}</TableCell>
                        <TableCell className="text-center">{item.izin}</TableCell>
                        <TableCell className="text-center">{item.sakit}</TableCell>
                        <TableCell className="text-center">{item.alpha}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            ) : (
              <p className="mt-4 text-center text-muted-foreground">
                { (selectedRekapKelas) ? "Tidak ada data rekap untuk periode ini." : "Silakan pilih filter untuk menampilkan data."}
              </p>
            )}
          </div>
          
          <DialogFooter className="mt-4 print:hidden">
            <Button variant="outline" onClick={() => window.print()} disabled={rekapData.length === 0}><Printer className="mr-2 h-4 w-4"/>Cetak Rekap</Button>
            <DialogClose asChild><Button variant="outline">Tutup</Button></DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
