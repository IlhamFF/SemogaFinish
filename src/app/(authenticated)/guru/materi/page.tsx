
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { UploadCloud, FolderKanban, FileText, Link2, PlusCircle, Search, Edit3, Trash2 } from "lucide-react";
import React from "react";

export default function GuruMateriPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = React.useState("");

  if (!user || (user.role !== 'guru' && user.role !== 'superadmin')) {
    return <p>Akses Ditolak. Anda harus menjadi Guru untuk melihat halaman ini.</p>;
  }

  const handlePlaceholderAction = (action: string) => {
    alert(`Fungsi "${action}" belum diimplementasikan.`);
  };

  const mockMateri = [
    { id: "MAT001", judul: "Modul Aljabar Linier", jenis: "PDF", mapel: "Matematika", tanggalUpload: "2024-07-20", ukuran: "2.5 MB" },
    { id: "MAT002", judul: "Video Pembelajaran Termodinamika", jenis: "Video (Link)", mapel: "Fisika", tanggalUpload: "2024-07-22", ukuran: "N/A" },
    { id: "MAT003", judul: "Presentasi Struktur Atom", jenis: "PPTX", mapel: "Kimia", tanggalUpload: "2024-07-18", ukuran: "5.2 MB" },
  ];

  const filteredMateri = mockMateri.filter(m => m.judul.toLowerCase().includes(searchTerm.toLowerCase()) || m.mapel.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-semibold">Upload & Manajemen Materi</h1>
        <Button onClick={() => handlePlaceholderAction("Upload Materi Baru")}>
          <PlusCircle className="mr-2 h-4 w-4" /> Upload Materi Baru
        </Button>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <UploadCloud className="mr-2 h-6 w-6 text-primary" />
            Bank Materi Pembelajaran
          </CardTitle>
          <CardDescription>
            Unggah, kelola, dan bagikan materi pembelajaran seperti modul, presentasi, video, dan tautan sumber belajar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="default" onClick={() => handlePlaceholderAction("Upload File Materi")} className="justify-start text-left h-auto py-3">
              <FileText className="mr-3 h-5 w-5" />
              <div>
                <p className="font-semibold">Upload File (PDF, DOC, PPT)</p>
                <p className="text-xs text-muted-foreground">Unggah materi dari perangkat Anda.</p>
              </div>
            </Button>
            <Button variant="outline" onClick={() => handlePlaceholderAction("Tambah Tautan Video/Sumber")} className="justify-start text-left h-auto py-3">
              <Link2 className="mr-3 h-5 w-5" />
              <div>
                <p className="font-semibold">Tambah Tautan Eksternal</p>
                <p className="text-xs text-muted-foreground">Sematkan video atau sumber lain.</p>
              </div>
            </Button>
            <Button variant="outline" onClick={() => handlePlaceholderAction("Buat Folder Materi")} className="justify-start text-left h-auto py-3">
              <FolderKanban className="mr-3 h-5 w-5" />
              <div>
                <p className="font-semibold">Kelola Folder</p>
                <p className="text-xs text-muted-foreground">Organisasikan materi dalam folder.</p>
              </div>
            </Button>
          </div>

          <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-xl">Daftar Materi Saya</CardTitle>
                        <CardDescription>Materi yang telah Anda unggah atau tambahkan.</CardDescription>
                    </div>
                    <div className="relative w-full max-w-xs">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Cari materi..." 
                            className="pl-8" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
              {filteredMateri.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Judul Materi</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Jenis</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Mapel</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Tgl Upload</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Ukuran</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Tindakan</th>
                      </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                      {filteredMateri.map((m) => (
                        <tr key={m.id}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-foreground">{m.judul}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">{m.jenis}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">{m.mapel}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">{m.tanggalUpload}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">{m.ukuran}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                            <Button variant="ghost" size="sm" onClick={() => handlePlaceholderAction(`Edit ${m.id}`)} className="mr-1">
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handlePlaceholderAction(`Hapus ${m.id}`)} className="text-destructive hover:text-destructive/80">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FolderKanban className="mx-auto h-12 w-12" />
                  <p className="mt-2">Belum ada materi yang diunggah atau filter tidak menemukan hasil.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
