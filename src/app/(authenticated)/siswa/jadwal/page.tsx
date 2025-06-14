
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";
import { CalendarDays, Clock, User, Home, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { format, addDays, subDays, startOfWeek, endOfWeek } from "date-fns";
import { id as localeID } from 'date-fns/locale';

const mockSchedule = {
  "Senin": [
    { time: "07:30 - 09:00", subject: "Matematika", teacher: "Bu Ani", room: "Kelas X-A" },
    { time: "09:30 - 11:00", subject: "Bahasa Indonesia", teacher: "Pak Budi", room: "Kelas X-A" },
  ],
  "Selasa": [
    { time: "07:30 - 09:00", subject: "Fisika", teacher: "Pak Eko", room: "Lab Fisika" },
    { time: "09:30 - 11:00", subject: "Bahasa Inggris", teacher: "Ms. Jane", room: "Kelas X-A" },
  ],
  "Rabu": [{ time: "08:00 - 09:30", subject: "Kimia", teacher: "Bu Rina", room: "Lab Kimia" }],
  "Kamis": [{ time: "07:30 - 09:00", subject: "Sejarah", teacher: "Pak Agus", room: "Kelas X-A" }],
  "Jumat": [{ time: "07:30 - 09:00", subject: "Olahraga", teacher: "Pak Doni", room: "Lapangan" }],
};

type DayName = keyof typeof mockSchedule;

export default function SiswaJadwalPage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));

  if (!user || (user.role !== 'siswa' && user.role !== 'superadmin')) {
    return <p>Akses Ditolak. Anda harus menjadi Siswa untuk melihat halaman ini.</p>;
  }

  if (!user.isVerified) {
    return <p>Silakan verifikasi email Anda untuk mengakses fitur ini.</p>;
  }

  const handlePlaceholderAction = (action: string) => {
    alert(`Fungsi "${action}" belum diimplementasikan.`);
  };

  const getDayName = (date: Date): DayName => {
    const dayIndex = date.getDay();
    const days: DayName[] = ["Minggu" as any, "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu" as any]; // Cast for non-school days
    return days[dayIndex];
  };

  const selectedDayName = getDayName(selectedDate);
  const scheduleForSelectedDay = mockSchedule[selectedDayName] || [];
  
  const nextWeek = () => setCurrentWeekStart(addDays(currentWeekStart, 7));
  const prevWeek = () => setCurrentWeekStart(subDays(currentWeekStart, 7));
  const currentWeekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-headline font-semibold flex items-center">
            <CalendarDays className="mr-3 h-8 w-8 text-primary" />
            Jadwal Pelajaran Saya
            </h1>
            <p className="text-muted-foreground">Lihat jadwal pelajaran harian dan mingguan Anda.</p>
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
          {scheduleForSelectedDay.length > 0 ? (
            <ul className="space-y-4">
              {scheduleForSelectedDay.map((item, index) => (
                <li key={index} className="p-4 border rounded-lg shadow-sm bg-card hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div className="mb-2 sm:mb-0">
                      <h3 className="text-lg font-semibold text-primary">{item.subject}</h3>
                      <p className="text-sm text-muted-foreground flex items-center"><User className="mr-2 h-4 w-4" /> {item.teacher}</p>
                    </div>
                    <div className="text-sm text-right">
                      <p className="flex items-center justify-end"><Clock className="mr-2 h-4 w-4" /> {item.time}</p>
                      <p className="flex items-center justify-end"><Home className="mr-2 h-4 w-4" /> {item.room}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarDays className="mx-auto h-12 w-12" />
              <p className="mt-2">Tidak ada jadwal untuk hari ini.</p>
              <p className="text-xs">({user.kelas ? `Kelas Anda: ${user.kelas}` : "Kelas tidak terdaftar"})</p>
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
                         {user.kelas && <span className="ml-2 text-xs">({user.kelas})</span>}
                    </CardDescription>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={prevWeek}><ChevronLeft className="h-4 w-4" /></Button>
                    <Button variant="outline" size="icon" onClick={nextWeek}><ChevronRight className="h-4 w-4" /></Button>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[120px]">Waktu</TableHead>
                            {Array.from({length: 5}).map((_, dayIndex) => (
                                <TableHead key={dayIndex}>{format(addDays(currentWeekStart, dayIndex), "eeee", {locale: localeID})}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {/* Mocking time slots for simplicity */}
                        {["07:30-09:00", "09:30-11:00", "11:30-13:00"].map(slot => (
                            <TableRow key={slot}>
                                <TableCell className="font-medium">{slot}</TableCell>
                                {Array.from({length: 5}).map((_, dayIndex) => {
                                    const dayDate = addDays(currentWeekStart, dayIndex);
                                    const dayName = getDayName(dayDate);
                                    const lesson = mockSchedule[dayName]?.find(l => l.time.startsWith(slot.split('-')[0]));
                                    return (
                                        <TableCell key={dayIndex}>
                                            {lesson ? (
                                                <div className="p-2 rounded-md bg-primary/10 border border-primary/20 text-xs">
                                                    <p className="font-semibold text-primary">{lesson.subject}</p>
                                                    <p className="text-muted-foreground">{lesson.teacher}</p>
                                                    <p className="text-muted-foreground text-[10px]">R: {lesson.room}</p>
                                                </div>
                                            ) : <span className="text-muted-foreground">-</span>}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
             <div className="mt-4 flex justify-end">
                <Button variant="outline" onClick={() => handlePlaceholderAction("Cetak Jadwal Mingguan")}>
                    <Search className="mr-2 h-4 w-4" /> Lihat Jadwal Lengkap / Cetak
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

