
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";
import { BookOpen, DownloadCloud, Search, FileText, Video, Link as LinkIcon } from "lucide-react";

interface Materi {
  id: string;
  judul: string;
  mapel: string;
  guru: string;
  jenis: "PDF" | "Video" | "PPT" | "Link" | "Dokumen";
  tanggalUpload: string;
  link?: string; // For Video or Link type
  fileName?: string; // For PDF, PPT, Dokumen
}

const mockMateri: Materi[] = [
  { id: "MAT001", judul: "Modul Aljabar Linier Bab 1-3", mapel: "Matematika", guru: "Bu Ani", jenis: "PDF", tanggalUpload: "2024-07-20", fileName: "Modul_Aljabar.pdf" },
  { id: "MAT002", judul: "Video Pembelajaran Termodinamika", mapel: "Fisika", guru: "Pak Eko", jenis: "Video", tanggalUpload: "2024-07-22", link: "https://youtube.com/example" },
  { id: "MAT003", judul: "Presentasi Struktur Atom", mapel: "Kimia", guru: "Bu Rina", jenis: "PPT", tanggalUpload: "2024-07-18", fileName: "Struktur_Atom.pptx" },
  { id: "MAT004", judul: "Kumpulan Soal UN Bahasa Indonesia", mapel: "Bahasa Indonesia", guru: "Pak Budi", jenis: "Dokumen", tanggalUpload: "2024-07-15", fileName: "Soal_UN_BI.docx" },
  { id: "MAT005", judul: "Sumber Belajar Online Sejarah Dunia", mapel: "Sejarah", guru: "Pak Agus", jenis: "Link", tanggalUpload: "2024-07-25", link: "https://wikipedia.org/wiki/Sejarah_Dunia" },
];

export default function SiswaMateriPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMapel, setFilterMapel] = useState<string>("semua");

  if (!user || (user.role !== 'siswa' && user.role !== 'superadmin')) {
    return <p>Akses Ditolak. Anda harus menjadi Siswa untuk melihat halaman ini.</p>;
  }
  if (!user.isVerified) {
    return <p>Silakan verifikasi email Anda untuk mengakses fitur ini.</p>;
  }

  const handlePlaceholderAction = (action: string, materiId?: string, link?: string) => {
    if (link) {
        window.open(link, '_blank');
    } else {
        alert(`Fungsi "${action}" ${materiId ? `untuk materi ${materiId} ` : ''}belum diimplementasikan.`);
    }
  };

  const uniqueMapel = ["semua", ...new Set(mockMateri.map(m => m.mapel))];

  const filteredMateri = mockMateri.filter(m => 
    (m.judul.toLowerCase().includes(searchTerm.toLowerCase()) || m.guru.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterMapel === "semua" || m.mapel === filterMapel)
  );
  
  const getJenisIcon = (jenis: Materi["jenis"]) => {
    switch(jenis) {
        case "PDF": return <FileText className="h-5 w-5 text-red-500" />;
        case "Video": return <Video className="h-5 w-5 text-blue-500" />;
        case "PPT": return <FileText className="h-5 w-5 text-orange-500" />;
        case "Dokumen": return <FileText className="h-5 w-5 text-sky-500" />;
        case "Link": return <LinkIcon className="h-5 w-5 text-gray-500" />;
        default: return <FileText className="h-5 w-5" />;
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold flex items-center">
        <BookOpen className="mr-3 h-8 w-8 text-primary" />
        Materi Pelajaran
      </h1>
      <p className="text-muted-foreground">Akses dan unduh materi pembelajaran yang dibagikan oleh guru Anda.</p>

      <Card className="shadow-lg">
        <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <CardTitle>Daftar Materi</CardTitle>
                    <CardDescription>Cari dan filter materi yang tersedia.</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <div className="relative flex-grow sm:flex-grow-0 sm:w-[200px] lg:w-[300px]">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Cari judul, guru..." 
                            className="pl-8 w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)} 
                        />
                    </div>
                    <Select value={filterMapel} onValueChange={setFilterMapel}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter Mata Pelajaran" />
                        </SelectTrigger>
                        <SelectContent>
                            {uniqueMapel.map(mapel => (
                                <SelectItem key={mapel} value={mapel}>{mapel === "semua" ? "Semua Mapel" : mapel}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </CardHeader>
        <CardContent>
          {filteredMateri.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Jenis</TableHead>
                    <TableHead>Judul Materi</TableHead>
                    <TableHead>Mata Pelajaran</TableHead>
                    <TableHead>Guru</TableHead>
                    <TableHead>Tgl Upload</TableHead>
                    <TableHead className="text-right">Tindakan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMateri.map((materi) => (
                    <TableRow key={materi.id}>
                      <TableCell>{getJenisIcon(materi.jenis)}</TableCell>
                      <TableCell className="font-medium">{materi.judul}</TableCell>
                      <TableCell>{materi.mapel}</TableCell>
                      <TableCell>{materi.guru}</TableCell>
                      <TableCell>{materi.tanggalUpload}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                            variant={materi.link ? "outline" : "default"} 
                            size="sm" 
                            onClick={() => handlePlaceholderAction(materi.link ? "Buka Tautan" : "Unduh Materi", materi.id, materi.link)}
                        >
                          {materi.link ? <LinkIcon className="mr-2 h-4 w-4" /> : <DownloadCloud className="mr-2 h-4 w-4" />}
                          {materi.link ? "Buka Tautan" : "Unduh"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <BookOpen className="mx-auto h-12 w-12" />
              <p className="mt-2">Tidak ada materi yang cocok dengan filter Anda.</p>
              {user.kelas && <p className="text-xs mt-1">(Pastikan Anda terdaftar di kelas yang benar: {user.kelas})</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

