
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { ClipboardCheck, FilePenLine, UploadCloud, Eye, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { format, formatDistanceToNow, parseISO, isPast } from 'date-fns';
import { id as localeID } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast";
import type { Tugas as TugasType } from "@/types"; // Assuming Tugas type is defined in types

// Keep this client-side status for now as backend doesn't store submission status
type TugasSiswaStatus = "Belum Dikerjakan" | "Terlambat" | "Sudah Dikumpulkan" | "Dinilai";

interface TugasDisplay extends TugasType {
  statusFrontend: TugasSiswaStatus;
  // nilaiFrontend?: number; // Renamed to avoid conflict with potential backend field later
  // feedbackGuruFrontend?: string;
}


export default function SiswaTugasPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"mendatang" | "selesai">("mendatang");
  const [tugasList, setTugasList] = useState<TugasDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Client-side status derivation logic
  const getTugasSiswaStatus = (tugas: TugasType): TugasSiswaStatus => {
    // This is a simplified mock. Real status would depend on actual submission data.
    // For now, assume we don't have submission data.
    if (tugas.nilai) return "Dinilai"; // If it has a grade, it's Dinilai
    
    // Example: If we had a 'submittedAt' field on TugasType
    // if (tugas.submittedAt) {
    //   return "Sudah Dikumpulkan"; 
    // }

    if (isPast(parseISO(tugas.tenggat))) {
      return "Terlambat";
    }
    return "Belum Dikerjakan";
  };

  const fetchTugasSiswa = useCallback(async () => {
    if (!user || !user.kelas) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tugas`); // API will filter by session.user.kelas if user is siswa
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal mengambil data tugas.");
      }
      const data: TugasType[] = await response.json();
      const processedData: TugasDisplay[] = data.map(t => ({
        ...t,
        statusFrontend: getTugasSiswaStatus(t),
        // nilaiFrontend: t.nilai, // Assuming 'nilai' might come from backend later
        // feedbackGuruFrontend: t.feedbackGuru, // Assuming 'feedbackGuru' might come from backend later
      }));
      setTugasList(processedData);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setTugasList([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user && user.isVerified) {
      fetchTugasSiswa();
    } else if (user && !user.isVerified) {
      setIsLoading(false); // Stop loading if user is not verified
    }
  }, [user, fetchTugasSiswa]);


  if (!user || (user.role !== 'siswa' && user.role !== 'superadmin')) {
    return <p>Akses Ditolak. Anda harus menjadi Siswa untuk melihat halaman ini.</p>;
  }
  if (user && !user.isVerified) { // Check user specifically, not isLoading
    return <p>Silakan verifikasi email Anda untuk mengakses fitur ini.</p>;
  }

  const handlePlaceholderAction = (action: string, tugasId?: string) => {
    toast({title:"Fitur Belum Tersedia", description:`Fungsi "${action}" ${tugasId ? `untuk tugas ${tugasId} ` : ''}belum diimplementasikan.`});
  };

  const tugasMendatang = tugasList.filter(t => t.statusFrontend === "Belum Dikerjakan" || t.statusFrontend === "Terlambat");
  const tugasSelesai = tugasList.filter(t => t.statusFrontend === "Sudah Dikumpulkan" || t.statusFrontend === "Dinilai");

  const getStatusBadgeVariant = (status: TugasSiswaStatus): "default" | "secondary" | "destructive" | "outline" => {
    if (status === "Dinilai") return "default"; 
    if (status === "Sudah Dikumpulkan") return "secondary";
    if (status === "Terlambat") return "destructive";
    return "outline"; // Belum Dikerjakan
  };
  
  const getStatusIcon = (status: TugasSiswaStatus) => {
    if (status === "Dinilai" || status === "Sudah Dikumpulkan") return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (status === "Terlambat") return <Clock className="h-4 w-4 text-red-500" />;
    return <FilePenLine className="h-4 w-4 text-yellow-500" />;
  }

  const renderTugasList = (listTugas: TugasDisplay[]) => (
    isLoading ? (
        <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
    ) : listTugas.length > 0 ? (
      <ul className="space-y-4">
        {listTugas.map(tugas => (
          <li key={tugas.id}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                        <CardTitle className="text-lg text-primary">{tugas.judul}</CardTitle>
                        <CardDescription>{tugas.mapel} - oleh {tugas.uploader?.fullName || tugas.uploader?.name || "Guru"}</CardDescription>
                    </div>
                    <Badge variant={getStatusBadgeVariant(tugas.statusFrontend)} className="mt-2 sm:mt-0 flex items-center gap-1">
                        {getStatusIcon(tugas.statusFrontend)} {tugas.statusFrontend}
                    </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {tugas.deskripsi && <p className="text-sm text-muted-foreground mb-3">{tugas.deskripsi}</p>}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-muted-foreground">
                  <p>
                    Tenggat: {format(parseISO(tugas.tenggat), "dd MMMM yyyy, HH:mm", { locale: localeID })}
                    ({formatDistanceToNow(parseISO(tugas.tenggat), { addSuffix: true, locale: localeID })})
                  </p>
                  {tugas.namaFileLampiran && <p>Lampiran Guru: {tugas.namaFileLampiran}</p>}
                </div>
                {(tugas.statusFrontend === "Belum Dikerjakan" || tugas.statusFrontend === "Terlambat") && (
                  <Button 
                    size="sm" 
                    className="mt-3 w-full sm:w-auto" 
                    onClick={() => handlePlaceholderAction("Upload Jawaban", tugas.id)}
                  >
                    <UploadCloud className="mr-2 h-4 w-4" /> Upload Jawaban
                  </Button>
                )}
                {tugas.statusFrontend === "Sudah Dikumpulkan" && (
                  <p className="mt-3 text-sm text-green-600 font-medium">Jawaban telah dikumpulkan. Menunggu penilaian.</p>
                )}
                {tugas.statusFrontend === "Dinilai" && (
                  <div className="mt-3 p-3 bg-muted/50 rounded-md">
                    <p className="text-sm font-semibold">Nilai: {tugas.nilai ?? "Belum Dinilai"}{tugas.nilai ? "/100" : ""}</p>
                    {/* {tugas.feedbackGuruFrontend && <p className="text-xs text-muted-foreground mt-1">Feedback: {tugas.feedbackGuruFrontend}</p>} */}
                     <Button 
                        variant="link" 
                        size="sm" 
                        className="p-0 h-auto mt-1 text-xs"
                        onClick={() => handlePlaceholderAction("Lihat Detail Penilaian", tugas.id)}
                    >
                        Lihat Detail Penilaian
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    ) : (
      <div className="text-center py-10 text-muted-foreground">
        <ClipboardCheck className="mx-auto h-12 w-12" />
        <p className="mt-2">Tidak ada tugas dalam kategori ini.</p>
      </div>
    )
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold flex items-center">
        <ClipboardCheck className="mr-3 h-8 w-8 text-primary" />
        Tugas Saya
      </h1>
      <p className="text-muted-foreground">Lihat, kelola, dan kumpulkan tugas sekolah Anda. Kelas: {user?.kelas || "Tidak ada"}</p>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "mendatang" | "selesai")}>
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="mendatang">Tugas Mendatang ({tugasMendatang.length})</TabsTrigger>
          <TabsTrigger value="selesai">Tugas Selesai ({tugasSelesai.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="mendatang">
          <Card className="shadow-lg mt-4">
            <CardHeader>
              <CardTitle>Tugas Harus Dikerjakan</CardTitle>
              <CardDescription>Daftar tugas yang belum dikumpulkan atau terlambat.</CardDescription>
            </CardHeader>
            <CardContent>
              {renderTugasList(tugasMendatang)}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="selesai">
          <Card className="shadow-lg mt-4">
            <CardHeader>
              <CardTitle>Riwayat Tugas</CardTitle>
              <CardDescription>Daftar tugas yang sudah dikumpulkan atau dinilai.</CardDescription>
            </CardHeader>
            <CardContent>
              {renderTugasList(tugasSelesai)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

