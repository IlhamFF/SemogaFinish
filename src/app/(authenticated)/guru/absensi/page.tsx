
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { UserCheck, CalendarDays, ListChecks, PieChart, Printer, PlusCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import React from "react";
import { format } from "date-fns";

export default function GuruAbsensiPage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  const [selectedClass, setSelectedClass] = React.useState<string | undefined>();

  if (!user || (user.role !== 'guru' && user.role !== 'superadmin')) {
    return <p>Akses Ditolak. Anda harus menjadi Guru untuk melihat halaman ini.</p>;
  }

  const handlePlaceholderAction = (action: string) => {
    alert(`Fungsi "${action}" belum diimplementasikan.`);
  };
  
  const mockClasses = ["Kelas X-A", "Kelas X-B", "Kelas XI-IPA", "Kelas XII-IPS"];
  const mockAttendance = [
    { id: "S001", name: "Ahmad Subarjo", status: "Hadir" },
    { id: "S002", name: "Budi Santoso", status: "Sakit" },
    { id: "S003", name: "Citra Lestari", status: "Izin" },
    { id: "S004", name: "Dewi Anggraini", status: "Alpha" },
    { id: "S005", name: "Eko Prasetyo", status: "Hadir" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-semibold">Manajemen Absensi Siswa</h1>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserCheck className="mr-2 h-6 w-6 text-primary" />
            Pencatatan Kehadiran Siswa
          </CardTitle>
          <CardDescription>
            Catat dan kelola kehadiran siswa untuk setiap sesi pembelajaran atau kegiatan sekolah.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label htmlFor="kelas-select" className="block text-sm font-medium text-muted-foreground mb-1">Pilih Kelas</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger id="kelas-select">
                  <SelectValue placeholder="Pilih Kelas" />
                </SelectTrigger>
                <SelectContent>
                  {mockClasses.map(cls => <SelectItem key={cls} value={cls}>{cls}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Pilih Tanggal</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pilih tanggal</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <Button onClick={() => handlePlaceholderAction(`Ambil Absensi untuk ${selectedClass} pada ${selectedDate ? format(selectedDate, "PPP") : ""}`)} disabled={!selectedClass || !selectedDate}>
                <PlusCircle className="mr-2 h-4 w-4" /> Ambil Absensi
            </Button>
          </div>

          {selectedClass && selectedDate && (
            <Card>
              <CardHeader>
                <CardTitle>Absensi: {selectedClass} - {format(selectedDate, "dd MMMM yyyy")}</CardTitle>
                <CardDescription>Daftar kehadiran siswa.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Nama Siswa</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status Kehadiran</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Tindakan</th>
                      </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                      {mockAttendance.map(siswa => (
                        <tr key={siswa.id}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-foreground">{siswa.name}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                             <Select defaultValue={siswa.status} onValueChange={(value) => handlePlaceholderAction(`Ubah status ${siswa.name} menjadi ${value}`)}>
                                <SelectTrigger className="w-[120px] h-8 text-xs">
                                  <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Hadir">Hadir</SelectItem>
                                  <SelectItem value="Sakit">Sakit</SelectItem>
                                  <SelectItem value="Izin">Izin</SelectItem>
                                  <SelectItem value="Alpha">Alpha</SelectItem>
                                </SelectContent>
                              </Select>
                          </td>
                           <td className="px-4 py-3 whitespace-nowrap">
                            <Button variant="ghost" size="sm" onClick={() => handlePlaceholderAction(`Detail ${siswa.name}`)}>Catatan</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                 <div className="mt-4 flex justify-end">
                    <Button onClick={() => handlePlaceholderAction("Simpan Absensi")}>Simpan Perubahan Absensi</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <CalendarDays className="mr-3 h-5 w-5 text-primary" />
                Fitur Tambahan Absensi
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Button variant="outline" onClick={() => handlePlaceholderAction("Rekapitulasi Absensi Bulanan")} className="justify-start text-left h-auto py-3">
                <ListChecks className="mr-3 h-5 w-5" />
                <div>
                  <p className="font-semibold">Rekap Bulanan</p>
                  <p className="text-xs text-muted-foreground">Lihat rekapitulasi per bulan.</p>
                </div>
              </Button>
              <Button variant="outline" onClick={() => handlePlaceholderAction("Laporan Statistik Kehadiran")} className="justify-start text-left h-auto py-3">
                <PieChart className="mr-3 h-5 w-5" />
                 <div>
                  <p className="font-semibold">Statistik Kehadiran</p>
                  <p className="text-xs text-muted-foreground">Grafik dan analisis.</p>
                </div>
              </Button>
               <Button variant="outline" onClick={() => handlePlaceholderAction("Cetak Laporan Absensi")} className="justify-start text-left h-auto py-3">
                <Printer className="mr-3 h-5 w-5" />
                 <div>
                  <p className="font-semibold">Cetak Laporan</p>
                  <p className="text-xs text-muted-foreground">Ekspor data absensi.</p>
                </div>
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
