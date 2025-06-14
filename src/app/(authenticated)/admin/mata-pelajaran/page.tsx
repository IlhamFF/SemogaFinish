
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { ClipboardList, PlusCircle, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock data for subjects - replace with actual data fetching and state management later
const mockMataPelajaran = [
  { id: "MP001", kode: "MTK-X", nama: "Matematika Kelas X", deskripsi: "Dasar-dasar matematika untuk kelas X.", kategori: "Wajib" },
  { id: "MP002", kode: "FIS-XI", nama: "Fisika Kelas XI", deskripsi: "Mekanika, Termodinamika, dan Optik.", kategori: "IPA" },
  { id: "MP003", kode: "EKO-XII", nama: "Ekonomi Kelas XII", deskripsi: "Ekonomi makro dan mikro lanjutan.", kategori: "IPS" },
  { id: "MP004", kode: "BIG-UM", nama: "Bahasa Inggris", deskripsi: "Kemampuan berbahasa Inggris umum.", kategori: "Wajib" },
];


export default function AdminMataPelajaranPage() {
  const { user } = useAuth();

  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return <p>Akses Ditolak. Anda harus menjadi admin untuk melihat halaman ini.</p>;
  }

  // Placeholder functions for CRUD operations
  const handleAddMataPelajaran = () => alert("Fungsi tambah mata pelajaran belum diimplementasikan.");
  const handleEditMataPelajaran = (id: string) => alert(`Fungsi edit mata pelajaran ${id} belum diimplementasikan.`);
  const handleDeleteMataPelajaran = (id: string) => alert(`Fungsi hapus mata pelajaran ${id} belum diimplementasikan.`);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-semibold">Manajemen Mata Pelajaran</h1>
        <Button onClick={handleAddMataPelajaran}>
          <PlusCircle className="mr-2 h-4 w-4" /> Tambah Mata Pelajaran
        </Button>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ClipboardList className="mr-2 h-6 w-6 text-primary" />
            Daftar Mata Pelajaran Sekolah
          </CardTitle>
          <CardDescription>
            Kelola semua mata pelajaran yang ditawarkan oleh sekolah. Mata pelajaran ini akan menjadi dasar penyusunan kurikulum dan jadwal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mockMataPelajaran.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Kode</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Nama Mata Pelajaran</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Kategori</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Deskripsi</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {mockMataPelajaran.map((mapel) => (
                    <tr key={mapel.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{mapel.kode}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{mapel.nama}</td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{mapel.kategori}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs truncate">{mapel.deskripsi}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button variant="ghost" size="sm" onClick={() => handleEditMataPelajaran(mapel.id)} className="mr-2 text-blue-600 hover:text-blue-800">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteMataPelajaran(mapel.id)} className="text-red-600 hover:text-red-800">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
             <div className="p-6 text-center text-muted-foreground bg-muted/30 rounded-md">
                <p className="mb-2">Belum ada mata pelajaran yang ditambahkan.</p>
                <Button onClick={handleAddMataPelajaran}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Tambah Mata Pelajaran Pertama
                </Button>
            </div>
          )}
          
          <div className="mt-8 p-6 text-muted-foreground bg-muted/20 rounded-md border">
            <h3 className="text-lg font-semibold text-foreground mb-3">Fitur yang Akan Datang:</h3>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Formulir lengkap untuk menambah dan mengedit mata pelajaran.</li>
              <li>Integrasi dengan database untuk penyimpanan data permanen.</li>
              <li>Validasi input dan penanganan error.</li>
              <li>Fitur pencarian dan filter lanjutan untuk mata pelajaran.</li>
              <li>Pengelolaan kategori mata pelajaran.</li>
              <li>Penentuan jumlah jam pelajaran efektif per minggu/semester.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

