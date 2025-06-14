
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { ScrollText, FileQuestion, CheckSquare, Clock, BarChartHorizontalBig, PlusCircle, Search, Edit3, Trash2, PlayCircle } from "lucide-react";
import React from "react";

export default function GuruTestPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = React.useState("");

  if (!user || (user.role !== 'guru' && user.role !== 'superadmin')) {
    return <p>Akses Ditolak. Anda harus menjadi Guru untuk melihat halaman ini.</p>;
  }

  const handlePlaceholderAction = (action: string) => {
    alert(`Fungsi "${action}" belum diimplementasikan.`);
  };
  
  const mockTests = [
    { id: "TEST001", judul: "Ujian Tengah Semester Matematika", mapel: "Matematika", kelas: "X-A, X-B", tanggal: "2024-09-15", durasi: "90 Menit", status: "Terjadwal" },
    { id: "TEST002", judul: "Kuis Harian Fisika Bab 1", mapel: "Fisika", kelas: "XI-IPA", tanggal: "2024-08-05", durasi: "30 Menit", status: "Selesai" },
    { id: "TEST003", judul: "Ulangan Harian Bahasa Inggris", mapel: "Bahasa Inggris", kelas: "XII-Semua", tanggal: "2024-08-10", durasi: "45 Menit", status: "Berlangsung" },
  ];

  const filteredTests = mockTests.filter(t => t.judul.toLowerCase().includes(searchTerm.toLowerCase()) || t.mapel.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-semibold">Manajemen Test & Ujian</h1>
        <Button onClick={() => handlePlaceholderAction("Buat Test/Ujian Baru")}>
          <PlusCircle className="mr-2 h-4 w-4" /> Buat Test Baru
        </Button>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ScrollText className="mr-2 h-6 w-6 text-primary" />
            Pembuatan dan Pelaksanaan Test/Ujian
          </CardTitle>
          <CardDescription>
            Rancang, jadwalkan, dan kelola berbagai jenis tes, kuis, atau ujian untuk siswa secara online.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-xl">Daftar Test & Ujian</CardTitle>
                        <CardDescription>Semua test/ujian yang telah dibuat atau dijadwalkan.</CardDescription>
                    </div>
                     <div className="relative w-full max-w-xs">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Cari test/ujian..." 
                            className="pl-8" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
              {filteredTests.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Judul Test/Ujian</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Mapel & Kelas</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Tanggal</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Durasi</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Tindakan</th>
                      </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                      {filteredTests.map((test) => (
                        <tr key={test.id}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-foreground">{test.judul}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-foreground">{test.mapel}</div>
                            <div className="text-xs text-muted-foreground">{test.kelas}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">{test.tanggal}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">{test.durasi}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                             <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${test.status === "Terjadwal" ? "bg-blue-100 text-blue-800" : test.status === "Selesai" ? "bg-gray-100 text-gray-800" : "bg-yellow-100 text-yellow-800"}`}>
                              {test.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                             {test.status === "Terjadwal" && <Button variant="ghost" size="sm" onClick={() => handlePlaceholderAction(`Mulai Test ${test.id}`)} className="mr-1 text-green-600"><PlayCircle className="h-4 w-4 mr-1"/> Mulai</Button>}
                             <Button variant="ghost" size="sm" onClick={() => handlePlaceholderAction(`Edit ${test.id}`)} className="mr-1"><Edit3 className="h-4 w-4" /></Button>
                             <Button variant="ghost" size="sm" onClick={() => handlePlaceholderAction(`Hapus ${test.id}`)} className="text-destructive hover:text-destructive/80"><Trash2 className="h-4 w-4" /></Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                 <div className="text-center py-8 text-muted-foreground">
                  <FileQuestion className="mx-auto h-12 w-12" />
                  <p className="mt-2">Belum ada test/ujian yang dibuat atau filter tidak menemukan hasil.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <FileQuestion className="mr-3 h-5 w-5 text-primary" />
                Fitur Pembuatan Soal & Pengaturan Test
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Button variant="outline" onClick={() => handlePlaceholderAction("Bank Soal")} className="justify-start text-left h-auto py-3">
                <FileQuestion className="mr-3 h-5 w-5" />
                <div>
                  <p className="font-semibold">Bank Soal</p>
                  <p className="text-xs text-muted-foreground">Kelola dan gunakan soal tersimpan.</p>
                </div>
              </Button>
              <Button variant="outline" onClick={() => handlePlaceholderAction("Pengaturan Acak Soal")} className="justify-start text-left h-auto py-3">
                <CheckSquare className="mr-3 h-5 w-5" />
                 <div>
                  <p className="font-semibold">Acak Soal & Opsi</p>
                  <p className="text-xs text-muted-foreground">Konfigurasi pengacakan.</p>
                </div>
              </Button>
               <Button variant="outline" onClick={() => handlePlaceholderAction("Pengaturan Waktu & Pembatasan")} className="justify-start text-left h-auto py-3">
                <Clock className="mr-3 h-5 w-5" />
                 <div>
                  <p className="font-semibold">Timer & Pembatasan Akses</p>
                  <p className="text-xs text-muted-foreground">Atur durasi dan jadwal.</p>
                </div>
              </Button>
               <Button variant="outline" onClick={() => handlePlaceholderAction("Pantau Pelaksanaan Test")} className="justify-start text-left h-auto py-3">
                <BarChartHorizontalBig className="mr-3 h-5 w-5" />
                 <div>
                  <p className="font-semibold">Monitoring Real-time</p>
                  <p className="text-xs text-muted-foreground">Pantau siswa saat ujian.</p>
                </div>
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
