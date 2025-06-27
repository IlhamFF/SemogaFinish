
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { ClipboardCheck, FilePenLine, UploadCloud, Eye, Clock, CheckCircle2, Loader2, Send, Download } from "lucide-react";
import { format, formatDistanceToNow, parseISO, isPast } from 'date-fns';
import { id as localeID } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast";
import type { Tugas as TugasType, TugasSubmission } from "@/types"; 
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";


type TugasSiswaStatus = "Belum Dikerjakan" | "Terlambat" | "Sudah Dikumpulkan" | "Dinilai";

interface TugasDisplay extends TugasType {
  statusFrontend: TugasSiswaStatus;
  submission?: TugasSubmission | null;
}

export default function SiswaTugasPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"mendatang" | "selesai">("mendatang");
  const [tugasList, setTugasList] = useState<TugasDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State untuk dialog submission
  const [isSubmissionDialogOpen, setIsSubmissionDialogOpen] = useState(false);
  const [selectedTugas, setSelectedTugas] = useState<TugasDisplay | null>(null);
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [submissionNotes, setSubmissionNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);


  const fetchTugasDanSubmissions = useCallback(async () => {
    if (!user || !user.kelas) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [tugasRes, submissionsRes] = await Promise.all([
        fetch(`/api/tugas`),
        fetch(`/api/tugas/submissions/me`)
      ]);
      
      if (!tugasRes.ok || !submissionsRes.ok) {
        throw new Error("Gagal mengambil data tugas atau submissions.");
      }
      
      const tugasData: TugasType[] = await tugasRes.json();
      const submissionsData: TugasSubmission[] = await submissionsRes.json();
      const submissionsMap = new Map(submissionsData.map(sub => [sub.tugasId, sub]));

      const processedData: TugasDisplay[] = tugasData.map(t => {
        const submission = submissionsMap.get(t.id);
        let status: TugasSiswaStatus;

        if (submission) {
          status = submission.status === "Dinilai" ? "Dinilai" : "Sudah Dikumpulkan";
        } else {
          status = isPast(parseISO(t.tenggat)) ? "Terlambat" : "Belum Dikerjakan";
        }

        return {
          ...t,
          statusFrontend: status,
          submission: submission,
        };
      });
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
      fetchTugasDanSubmissions();
    } else if (user && !user.isVerified) {
      setIsLoading(false);
    }
  }, [user, fetchTugasDanSubmissions]);


  if (!user || (user.role !== 'siswa' && user.role !== 'superadmin')) {
    return <p>Akses Ditolak. Anda harus menjadi Siswa untuk melihat halaman ini.</p>;
  }
  if (user && !user.isVerified) {
    return <p>Silakan verifikasi email Anda untuk mengakses fitur ini.</p>;
  }
  
  const handleOpenSubmissionDialog = (tugas: TugasDisplay) => {
    setSelectedTugas(tugas);
    setSubmissionFile(null);
    setSubmissionNotes(tugas.submission?.catatanSiswa || "");
    setIsSubmissionDialogOpen(true);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSubmissionFile(event.target.files[0]);
    } else {
      setSubmissionFile(null);
    }
  };
  
  const handleSubmissionSubmit = async () => {
    if (!selectedTugas) return;
    if (!submissionFile && !submissionNotes) {
        toast({ title: "Submission Kosong", description: "Harap lampirkan file atau isi catatan jawaban.", variant: "destructive" });
        return;
    }
    
    setIsSubmitting(true);
    
    let uploadedFileData: { url: string | null, originalName: string | null } = { url: null, originalName: null };

    try {
        if (submissionFile) {
            const formData = new FormData();
            formData.append('file', submissionFile);
            formData.append('category', 'jawaban');

            const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
            const uploadResult = await uploadRes.json();
            if (!uploadRes.ok) throw new Error(uploadResult.message || 'Gagal mengunggah file jawaban.');
            
            uploadedFileData = { url: uploadResult.url, originalName: uploadResult.originalName };
        }

        const payload = {
            tugasId: selectedTugas.id,
            namaFileJawaban: uploadedFileData.originalName,
            fileUrlJawaban: uploadedFileData.url,
            catatanSiswa: submissionNotes,
        };

        const response = await fetch('/api/tugas/submissions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Gagal mengirimkan tugas.");
        }
        
        toast({ title: "Berhasil!", description: `Tugas "${selectedTugas.judul}" telah dikumpulkan.` });
        setIsSubmissionDialogOpen(false);
        fetchTugasDanSubmissions();
    } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
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
                  {tugas.namaFileLampiran && (
                    <Button variant="link" size="sm" asChild className="p-0 h-auto text-xs">
                        <a href={tugas.fileUrlLampiran || "#"} target="_blank" rel="noopener noreferrer">
                            <Download className="mr-1 h-3 w-3" /> Unduh Lampiran
                        </a>
                    </Button>
                  )}
                </div>
                {(tugas.statusFrontend === "Belum Dikerjakan" || tugas.statusFrontend === "Terlambat") && (
                  <Button 
                    size="sm" 
                    className="mt-3 w-full sm:w-auto" 
                    onClick={() => handleOpenSubmissionDialog(tugas)}
                  >
                    <UploadCloud className="mr-2 h-4 w-4" /> Kumpulkan Jawaban
                  </Button>
                )}
                {tugas.statusFrontend === "Sudah Dikumpulkan" && (
                  <p className="mt-3 text-sm text-green-600 font-medium">Jawaban telah dikumpulkan. Menunggu penilaian.</p>
                )}
                {tugas.statusFrontend === "Dinilai" && (
                  <div className="mt-3 p-3 bg-muted/50 rounded-md">
                    <p className="text-sm font-semibold">Nilai: {tugas.submission?.nilai ?? "N/A"}/100</p>
                    {tugas.submission?.feedbackGuru && <p className="text-xs text-muted-foreground mt-1">Feedback: {tugas.submission.feedbackGuru}</p>}
                     <Button 
                        variant="link" 
                        size="sm" 
                        className="p-0 h-auto mt-1 text-xs"
                        onClick={() => handleOpenSubmissionDialog(tugas)}
                    >
                        Lihat Detail Submission
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
    <>
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold flex items-center">
        <ClipboardCheck className="mr-3 h-8 w-8 text-primary" />
        Tugas Saya
      </h1>
      <p className="text-muted-foreground">Lihat, kelola, dan kumpulkan tugas sekolah Anda. Kelas: {user?.kelas || "Tidak ada"}</p>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "mendatang" | "selesai")}>
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="mendatang">Tugas Mendatang ({tugasMendatang.length})</TabsTrigger>
          <TabsTrigger value="selesai">Riwayat Tugas ({tugasSelesai.length})</TabsTrigger>
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

    <Dialog open={isSubmissionDialogOpen} onOpenChange={setIsSubmissionDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Pengumpulan Tugas: {selectedTugas?.judul}</DialogTitle>
                <DialogDescription>
                    {selectedTugas?.statusFrontend === "Dinilai" || selectedTugas?.statusFrontend === "Sudah Dikumpulkan" 
                        ? "Melihat detail submission Anda." 
                        : `Tenggat: ${selectedTugas ? format(parseISO(selectedTugas.tenggat), "dd MMM yyyy, HH:mm", { locale: localeID }) : ''}`}
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
                {selectedTugas?.submission ? (
                    <div className="space-y-3 text-sm">
                        <div>
                            <p className="font-semibold">Status:</p>
                            <p>{selectedTugas.statusFrontend}</p>
                        </div>
                         <div>
                            <p className="font-semibold">Dikumpulkan Pada:</p>
                            <p>{format(parseISO(selectedTugas.submission.dikumpulkanPada), "dd MMM yyyy, HH:mm", { locale: localeID })}</p>
                        </div>
                        {selectedTugas.submission.namaFileJawaban && (
                             <div>
                                <p className="font-semibold">File Terlampir:</p>
                                <a href={selectedTugas.submission.fileUrlJawaban || '#'} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{selectedTugas.submission.namaFileJawaban}</a>
                            </div>
                        )}
                         {selectedTugas.submission.catatanSiswa && (
                             <div>
                                <p className="font-semibold">Catatan Anda:</p>
                                <p className="p-2 bg-muted rounded-md whitespace-pre-wrap">{selectedTugas.submission.catatanSiswa}</p>
                            </div>
                        )}
                        {selectedTugas.statusFrontend === "Dinilai" && (
                             <div className="p-3 border rounded-md bg-primary/5">
                                <p className="font-semibold">Nilai: <span className="text-lg text-primary">{selectedTugas.submission.nilai}/100</span></p>
                                {selectedTugas.submission.feedbackGuru && <p className="font-semibold mt-2">Feedback Guru:</p>}
                                {selectedTugas.submission.feedbackGuru && <p className="text-muted-foreground whitespace-pre-wrap">{selectedTugas.submission.feedbackGuru}</p>}
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <div>
                            <Label htmlFor="file-submission">Unggah File Jawaban (Opsional jika ada jawaban teks)</Label>
                            <Input id="file-submission" type="file" onChange={handleFileChange} disabled={isSubmitting}/>
                            {submissionFile && <p className="text-xs text-muted-foreground mt-1">File terpilih: {submissionFile.name}</p>}
                        </div>
                        <div>
                            <Label htmlFor="catatan-submission">Catatan / Jawaban Teks</Label>
                            <Textarea 
                                id="catatan-submission" 
                                placeholder="Tulis jawaban atau catatan Anda di sini..." 
                                value={submissionNotes}
                                onChange={(e) => setSubmissionNotes(e.target.value)}
                                disabled={isSubmitting}
                                rows={5}
                            />
                        </div>
                    </>
                )}

            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="outline">Tutup</Button></DialogClose>
                {(!selectedTugas?.submission) && (
                     <Button onClick={handleSubmissionSubmit} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Send className="mr-2 h-4 w-4" /> Kirim Jawaban
                    </Button>
                )}
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}
