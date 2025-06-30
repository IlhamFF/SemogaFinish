
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";
import { CalendarDays, Clock, User, Home, ChevronLeft, ChevronRight, Search, Loader2 } from "lucide-react";
import { format, addDays, subDays, startOfWeek, endOfWeek, parseISO } from "date-fns";
import { id as localeID } from 'date-fns/locale';
import type { JadwalPelajaran, SlotWaktu } from "@/types";
import { useToast } from "@/hooks/use-toast";

type DayName = "Senin" | "Selasa" | "Rabu" | "Kamis" | "Jumat" | "Sabtu" | "Minggu";
const DAY_ORDER: DayName[] = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

export default function SiswaJadwalPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  
  const [mySchedule, setMySchedule] = useState<JadwalPelajaran[]>([]);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(true);
  const [definedTimeSlots, setDefinedTimeSlots] = useState<SlotWaktu[]>([]);
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(true);

  const fetchSchedule = useCallback(async () => {
    if (!user || !user.kelasId) {
      setIsLoadingSchedule(false);
      return;
    }
    setIsLoadingSchedule(true);
    try {
      const response = await fetch(`/api/jadwal/pelajaran?kelas=${encodeURIComponent(user.kelasId)}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal mengambil data jadwal.");
      }
      const data: JadwalPelajaran[] = await response.json();
      setMySchedule(data);
    } catch (error: any) {
      toast({ title: "Error Jadwal", description: error.message, variant: "destructive" });
      setMySchedule([]);
    } finally {
      setIsLoadingSchedule(false);
    }
  }, [user, toast]);

  const fetchDefinedTimeSlots = useCallback(async () => {
    setIsLoadingTimeSlots(true);
    try {
      const response = await fetch('/api/jadwal/slot-waktu');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal mengambil data slot waktu.");
      }
      const data: SlotWaktu[] = await response.json();
      // API sudah mengurutkan, jika tidak, urutkan di sini
      setDefinedTimeSlots(data.sort((a, b) => (a.urutan ?? 0) - (b.urutan ?? 0) || a.waktuMulai.localeCompare(b.waktuMulai)));
    } catch (error: any) {
      toast({ title: "Error Slot Waktu", description: error.message, variant: "destructive" });
      setDefinedTimeSlots([]);
    } finally {
      setIsLoadingTimeSlots(false);
    }
  }, [toast]);


  useEffect(() => {
    if (user && user.isVerified) {
      fetchSchedule();
      fetchDefinedTimeSlots();
    } else {
      setIsLoadingSchedule(false);
      setIsLoadingTimeSlots(false);
    }
  }, [user, fetchSchedule, fetchDefinedTimeSlots]);


  if (!user || (user.role !== 'siswa' && user.role !== 'superadmin')) {
    return <p>Akses Ditolak. Anda harus menjadi Siswa untuk melihat halaman ini.</p>;
  }

  if (!user.isVerified) {
    return <p>Silakan verifikasi email Anda untuk mengakses fitur ini.</p>;
  }

  const handlePlaceholderAction = (action: string) => {
    toast({ title: "Fitur Dalam Pengembangan", description: `Fungsi "${action}" belum diimplementasikan.`});
  };

  const getDayNameFromDate = (date: Date): DayName => {
    const dayIndex = date.getDay();
    return DAY_ORDER[dayIndex === 0 ? 6 : dayIndex - 1];
  };

  const scheduleForSelectedDay = useMemo(() => {
    if (isLoadingSchedule || !mySchedule) return [];
    const dayName = getDayNameFromDate(selectedDate);
    return mySchedule
      .filter(item => item.hari === dayName)
      .sort((a, b) => {
        if (a.slotWaktu?.waktuMulai && b.slotWaktu?.waktuMulai) {
          return a.slotWaktu.waktuMulai.localeCompare(b.slotWaktu.waktuMulai);
        }
        return 0;
      });
  }, [mySchedule, selectedDate, isLoadingSchedule]);
  
  const nextWeek = () => setCurrentWeekStart(addDays(currentWeekStart, 7));
  const prevWeek = () => setCurrentWeekStart(subDays(currentWeekStart, 7));
  const currentWeekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });

  const getLessonsForDayAndSlotId = (dayDate: Date, slotId: string) => {
    const dayName = getDayNameFromDate(dayDate);
    return mySchedule.filter(
      (item) =>
        item.hari === dayName &&
        item.slotWaktuId === slotId
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-headline font-semibold flex items-center">
            <CalendarDays className="mr-3 h-8 w-8 text-primary" />
            Jadwal Pelajaran Saya
            </h1>
            <p className="text-muted-foreground">Lihat jadwal pelajaran harian dan mingguan Anda. Kelas: {user.kelasId || "Tidak terdaftar"}</p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full md:w-auto justify-start text-left font-normal">
              <CalendarDays className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP", { locale: localeID }) : <span>Pilih tanggal</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Jadwal untuk: {format(selectedDate, "eeee, dd MMMM yyyy", { locale: localeID })}</CardTitle>
          <CardDescription>Mata pelajaran yang dijadwalkan untuk hari yang dipilih.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingSchedule ? (
            <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-2">Memuat jadwal...</p></div>
          ) : scheduleForSelectedDay.length > 0 ? (
            <ul className="space-y-4">
              {scheduleForSelectedDay.map((item) => (
                <li key={item.id} className="p-4 border rounded-lg shadow-sm bg-card hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div className="mb-2 sm:mb-0">
                      <h3 className="text-lg font-semibold text-primary">{item.mapel?.nama || "Nama Mapel Tidak Ada"}</h3>
                      <p className="text-sm text-muted-foreground flex items-center"><User className="mr-2 h-4 w-4" /> {item.guru?.fullName || item.guru?.name || "Guru Tidak Ada"}</p>
                    </div>
                    <div className="text-sm text-right">
                      <p className="flex items-center justify-end"><Clock className="mr-2 h-4 w-4" /> {item.slotWaktu?.namaSlot} ({item.slotWaktu?.waktuMulai} - {item.slotWaktu?.waktuSelesai})</p>
                      <p className="flex items-center justify-end"><Home className="mr-2 h-4 w-4" /> {item.ruangan?.nama || "Ruangan Tidak Ada"}</p>
                    </div>
                  </div>
                   {item.catatan && <p className="mt-2 text-xs text-muted-foreground border-t pt-2">Catatan: {item.catatan}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarDays className="mx-auto h-12 w-12" />
              <p className="mt-2">Tidak ada jadwal untuk hari ini.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="shadow-lg">
        <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle>Jadwal Mingguan</CardTitle>
                    <CardDescription>
                        {format(currentWeekStart, "dd MMM", { locale: localeID })} - {format(currentWeekEnd, "dd MMM yyyy", { locale: localeID })}
                         {user.kelasId && <span className="ml-2 text-xs">({user.kelasId})</span>}
                    </CardDescription>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={prevWeek}><ChevronLeft className="h-4 w-4" /></Button>
                    <Button variant="outline" size="icon" onClick={nextWeek}><ChevronRight className="h-4 w-4" /></Button>
                </div>
            </div>
        </CardHeader>
        <CardContent>
             {(isLoadingSchedule || isLoadingTimeSlots) ? (
                <div className="flex justify-center items-center h-60"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-2">Memuat jadwal mingguan...</p></div>
             ) : definedTimeSlots.length > 0 && mySchedule.length > 0 ? (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-[150px] sticky left-0 bg-muted/50 z-10">Waktu (Slot)</TableHead>
                                {Array.from({length: 5}).map((_, dayIndex) => ( // Senin - Jumat
                                    <TableHead key={dayIndex} className="min-w-[150px]">{format(addDays(currentWeekStart, dayIndex), "eeee", {locale: localeID})}</TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {definedTimeSlots.map(slot => (
                                <TableRow key={slot.id}>
                                    <TableCell className="font-medium sticky left-0 bg-card z-10">
                                        {slot.namaSlot}
                                        <div className="text-xs text-muted-foreground">{slot.waktuMulai} - {slot.waktuSelesai}</div>
                                    </TableCell>
                                    {Array.from({length: 5}).map((_, dayIndex) => {
                                        const dayDate = addDays(currentWeekStart, dayIndex);
                                        const lessonsInSlot = getLessonsForDayAndSlotId(dayDate, slot.id);
                                        return (
                                            <TableCell key={dayIndex} className="align-top p-1">
                                                {lessonsInSlot.length > 0 ? lessonsInSlot.map(lesson => (
                                                    <div key={lesson.id} className="p-1.5 mb-1 rounded-md bg-primary/10 border border-primary/20 text-xs">
                                                        <p className="font-semibold text-primary">{lesson.mapel?.nama}</p>
                                                        <p className="text-muted-foreground text-[11px]">{lesson.guru?.fullName || lesson.guru?.name}</p>
                                                        <p className="text-muted-foreground text-[10px]">R: {lesson.ruangan?.nama}</p>
                                                    </div>
                                                )) : <span className="text-muted-foreground text-xs">-</span>}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
             ) : (
                <div className="text-center py-8 text-muted-foreground">
                    <CalendarDays className="mx-auto h-12 w-12" />
                    <p className="mt-2">Tidak ada jadwal pelajaran atau konfigurasi slot waktu yang ditemukan.</p>
                     {definedTimeSlots.length === 0 && <p className="text-xs">(Admin perlu mengkonfigurasi slot waktu terlebih dahulu)</p>}
                </div>
             )}
             <div className="mt-4 flex justify-end">
                <Button variant="outline" onClick={() => handlePlaceholderAction("Cetak Jadwal Mingguan")}>
                    <Search className="mr-2 h-4 w-4" /> Lihat Detail / Cetak
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
