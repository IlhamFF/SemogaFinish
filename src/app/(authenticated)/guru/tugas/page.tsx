
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { FilePlus2, ListTodo, Edit3, CalendarClock, CheckSquare, PlusCircle, Search } from "lucide-react";

export default function GuruTugasPage() {
  const { user } = useAuth();

  if (!user || (user.role !== 'guru' && user.role !== 'superadmin')) {
    return <p>Akses Ditolak. Anda harus menjadi Guru untuk melihat halaman ini.</p>;
  }

  const handlePlaceholderAction = (action: string) => {
    alert(`Fungsi "${action}" belum diimplementasikan.`);
  };

  const mockTugas = [
    { id: "TGS001", mapel: "Matematika", judul: "Latihan Aljabar", kelas: "X-A", tenggat: "2024-08-15", terkumpul: 28, totalSiswa: 30, status: "Aktif" },
    { id: "TGS002", mapel: "Fisika", judul: "Laporan Praktikum Optik", kelas: "XI-IPA", tenggat: "2024-08-10", terkumpul: 25, totalSiswa: 25, status: "Ditutup" },
    { id: "TGS003", mapel: "Bahasa Indonesia", judul: "Analisis Puisi", kelas: "X-B", tenggat: "2024-08-20", terkumpul: 10, totalSiswa: 32, status: "Aktif" },
  ];


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-semibold">Manajemen Tugas</h1>
        <Button onClick={() => handlePlaceholderAction("Buat Tugas Baru")}>
          <PlusCircle className="mr-2 h-4 w-4" /> Buat Tugas Baru
        </Button>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FilePlus2 className="mr-2 h-6 w-6 text-primary" />
            Pengelolaan Tugas Siswa
          </CardTitle>
          <CardDescription>
            Buat, distribusikan, pantau pengumpulan, dan berikan umpan balik untuk tugas-tugas siswa.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Input placeholder="Cari tugas..." className="max-w-xs" onChange={(e) => handlePlaceholderAction(`Pencarian: ${e.target.value}`)} />
            {/* Add filter dropdowns here if needed */}
          </div>

          {mockTugas.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Judul Tugas</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Mapel & Kelas</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Tenggat</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Pengumpulan</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {mockTugas.map((tugas) => (
                    <tr key={tugas.id}>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-foreground">{tugas.judul}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-foreground">{tugas.mapel}</div>
                        <div className="text-xs text-muted-foreground">{tugas.kelas}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">{tugas.tenggat}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">{`${tugas.terkumpul}/${tugas.totalSiswa}`}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tugas.status === "Aktif" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                          {tugas.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button variant="ghost" size="sm" onClick={() => handlePlaceholderAction(`Lihat Detail ${tugas.id}`)} className="mr-2">
                          <Search className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handlePlaceholderAction(`Edit ${tugas.id}`)} className="mr-2">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <ListTodo className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium text-foreground">Belum Ada Tugas</h3>
              <p className="mt-1 text-sm text-muted-foreground">Mulai dengan membuat tugas baru untuk siswa Anda.</p>
              <div className="mt-6">
                <Button onClick={() => handlePlaceholderAction("Buat Tugas Baru")}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Buat Tugas Baru
                </Button>
              </div>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <CalendarClock className="mr-3 h-5 w-5 text-primary" />
                Fitur Tambahan Manajemen Tugas
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Button variant="outline" onClick={() => handlePlaceholderAction("Bank Soal/Tugas")} className="justify-start text-left h-auto py-3">
                <ListTodo className="mr-3 h-5 w-5" />
                <div>
                  <p className="font-semibold">Bank Soal/Tugas</p>
                  <p className="text-xs text-muted-foreground">Gunakan template tugas.</p>
                </div>
              </Button>
              <Button variant="outline" onClick={() => handlePlaceholderAction("Pengaturan Notifikasi")} className="justify-start text-left h-auto py-3">
                <CheckSquare className="mr-3 h-5 w-5" /> {/* Ganti Icon */}
                 <div>
                  <p className="font-semibold">Notifikasi Pengingat</p>
                  <p className="text-xs text-muted-foreground">Atur pengingat untuk siswa.</p>
                </div>
              </Button>
               <Button variant="outline" onClick={() => handlePlaceholderAction("Integrasi Penilaian")} className="justify-start text-left h-auto py-3">
                <Edit3 className="mr-3 h-5 w-5" /> {/* Ganti Icon */}
                 <div>
                  <p className="font-semibold">Integrasi Penilaian</p>
                  <p className="text-xs text-muted-foreground">Hubungkan ke modul nilai.</p>
                </div>
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
