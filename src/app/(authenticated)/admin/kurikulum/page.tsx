
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/use-auth";
import { BookOpenCheck, Target, BookCopy, BookUp, Layers, FileText, FolderKanban, PlusCircle, Edit, Search, Loader2, UploadCloud, Link2Icon, Trash2 } from "lucide-react";
import Link from "next/link";
import { ROUTES, MOCK_SUBJECTS } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import type { SKL } from "@/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const materiSchema = z.object({
  judul: z.string().min(5, { message: "Judul materi minimal 5 karakter." }),
  deskripsi: z.string().optional(),
  mapel: z.string({ required_error: "Mata pelajaran wajib dipilih."}),
  jenisMateri: z.enum(["File", "Link"], { required_error: "Jenis materi wajib dipilih."}),
  file: z.any().optional(), 
  url: z.string().url({ message: "URL tidak valid."}).optional(),
}).refine(data => {
  if (data.jenisMateri === "Link" && !data.url) return false;
  if (data.jenisMateri === "File" && !data.file) return false; 
  return true;
}, {
  message: "File atau URL wajib diisi sesuai jenis materi.",
  path: ["file"], 
});

type MateriFormValues = z.infer<typeof materiSchema>;

interface MateriAjar {
  id: string;
  judul: string;
  deskripsi?: string;
  mapel: string;
  jenisMateri: "File" | "Link";
  namaFile?: string;
  url?: string;
  tanggalUpload: string;
}

const sklSchema = z.object({
  kode: z.string().min(2, { message: "Kode SKL minimal 2 karakter." }),
  deskripsi: z.string().min(10, { message: "Deskripsi SKL minimal 10 karakter." }),
  kategori: z.enum(["Sikap", "Pengetahuan", "Keterampilan"], { required_error: "Kategori SKL wajib dipilih." }),
});
type SKLFormValues = z.infer<typeof sklSchema>;

const initialSKLData: SKL[] = [
  { id: "SKL001", kode: "S-01", deskripsi: "Menunjukkan perilaku jujur, disiplin, tanggung jawab, peduli (gotong royong, kerja sama, toleran, damai), santun, responsif, dan pro-aktif.", kategori: "Sikap" },
  { id: "SKL002", kode: "P-01", deskripsi: "Memahami, menerapkan, menganalisis pengetahuan faktual, konseptual, prosedural berdasarkan rasa ingin tahunya tentang ilmu pengetahuan.", kategori: "Pengetahuan" },
  { id: "SKL003", kode: "K-01", deskripsi: "Mengolah, menalar, dan menyaji dalam ranah konkret dan ranah abstrak terkait dengan pengembangan dari yang dipelajarinya di sekolah secara mandiri.", kategori: "Keterampilan" },
];

export default function AdminKurikulumPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isMateriFormOpen, setIsMateriFormOpen] = useState(false);
  const [isLoadingMateriSubmit, setIsLoadingMateriSubmit] = useState(false);
  const [materiList, setMateriList] = useState<MateriAjar[]>([]);

  const [isSKLDialogOpen, setIsSKLDialogOpen] = useState(false);
  const [isSKLFormOpen, setIsSKLFormOpen] = useState(false);
  const [editingSKL, setEditingSKL] = useState<SKL | null>(null);
  const [sklToDelete, setSklToDelete] = useState<SKL | null>(null);
  const [sklList, setSklList] = useState<SKL[]>(initialSKLData);
  const [isSKLSubmitting, setIsSKLSubmitting] = useState(false);

  const materiForm = useForm<MateriFormValues>({
    resolver: zodResolver(materiSchema),
    defaultValues: { judul: "", deskripsi: "", mapel: undefined, jenisMateri: undefined, file: undefined, url: "" },
  });

  const sklForm = useForm<SKLFormValues>({
    resolver: zodResolver(sklSchema),
    defaultValues: { kode: "", deskripsi: "", kategori: undefined },
  });

  useEffect(() => {
    if (editingSKL) {
      sklForm.reset(editingSKL);
    } else {
      sklForm.reset({ kode: "", deskripsi: "", kategori: undefined });
    }
  }, [editingSKL, sklForm, isSKLFormOpen]);


  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return <p>Akses Ditolak. Anda harus menjadi admin untuk melihat halaman ini.</p>;
  }

  const handlePlaceholderAction = (action: string) => {
    toast({ title: "Fitur Dalam Pengembangan", description: `Fungsi "${action}" belum diimplementasikan sepenuhnya.`});
  };

  const handleMateriSubmit = async (values: MateriFormValues) => {
    setIsLoadingMateriSubmit(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); 

    const newMateri: MateriAjar = {
      id: `MAT${Date.now()}`,
      judul: values.judul,
      deskripsi: values.deskripsi,
      mapel: values.mapel,
      jenisMateri: values.jenisMateri,
      namaFile: values.jenisMateri === "File" ? (values.file as File)?.name || "file_contoh.pdf" : undefined,
      url: values.jenisMateri === "Link" ? values.url : undefined,
      tanggalUpload: new Date().toLocaleDateString('id-ID'),
    };
    setMateriList(prev => [...prev, newMateri]); 
    
    toast({ title: "Berhasil!", description: `Materi "${values.judul}" telah ditambahkan.` });
    setIsLoadingMateriSubmit(false);
    setIsMateriFormOpen(false);
    materiForm.reset();
  };
  
  const openSKLForm = (skl?: SKL) => {
    setEditingSKL(skl || null);
    setIsSKLFormOpen(true);
  };

  const handleSKLFormSubmit = async (values: SKLFormValues) => {
    setIsSKLSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API

    if (editingSKL) {
      setSklList(sklList.map(s => s.id === editingSKL.id ? { ...editingSKL, ...values } : s));
      toast({ title: "Berhasil!", description: `SKL ${values.kode} telah diperbarui.` });
    } else {
      const newSKL: SKL = { id: `SKL${Date.now()}`, ...values };
      setSklList([...sklList, newSKL]);
      toast({ title: "Berhasil!", description: `SKL ${values.kode} telah ditambahkan.` });
    }
    setIsSKLSubmitting(false);
    setIsSKLFormOpen(false);
    setEditingSKL(null);
  };

  const openDeleteSKLDialog = (skl: SKL) => {
    setSklToDelete(skl);
  };

  const handleDeleteSKLConfirm = async () => {
    if (sklToDelete) {
      setIsSKLSubmitting(true);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API
      setSklList(sklList.filter(s => s.id !== sklToDelete.id));
      toast({ title: "Dihapus!", description: `SKL ${sklToDelete.kode} telah dihapus.` });
      setIsSKLSubmitting(false);
      setSklToDelete(null);
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-semibold">Manajemen Kurikulum</h1>
        <Button onClick={() => handlePlaceholderAction("Buat Kurikulum Baru Keseluruhan")}>
          <PlusCircle className="mr-2 h-4 w-4" /> Buat Kurikulum Baru
        </Button>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpenCheck className="mr-2 h-6 w-6 text-primary" />
            Pengembangan dan Pengelolaan Kurikulum
          </CardTitle>
          <CardDescription>
            Fasilitas komprehensif untuk merancang, mengembangkan, dan mengelola seluruh aspek kurikulum pendidikan. Modul ini memungkinkan administrator untuk menyusun standar pembelajaran, struktur kurikulum, hingga materi ajar yang relevan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Target className="mr-3 h-5 w-5 text-primary" />
                Standar Kompetensi & Capaian Pembelajaran
              </CardTitle>
              <CardDescription>
                Kelola Standar Kompetensi Lulusan (SKL) dan Capaian Pembelajaran (CP) sebagai acuan utama.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Button variant="outline" onClick={() => setIsSKLDialogOpen(true)} className="justify-start text-left h-auto py-3">
                <Layers className="mr-3 h-5 w-5" />
                <div>
                  <p className="font-semibold">Standar Kompetensi Lulusan (SKL)</p>
                  <p className="text-xs text-muted-foreground">Definisikan profil lulusan.</p>
                </div>
              </Button>
              <Button variant="outline" onClick={() => handlePlaceholderAction("Kelola CP")} className="justify-start text-left h-auto py-3">
                <FileText className="mr-3 h-5 w-5" />
                 <div>
                  <p className="font-semibold">Capaian Pembelajaran (CP)</p>
                  <p className="text-xs text-muted-foreground">Tetapkan target per fase/tingkat.</p>
                </div>
              </Button>
               <Button variant="outline" onClick={() => handlePlaceholderAction("Pemetaan SKL-CP")} className="justify-start text-left h-auto py-3">
                <Search className="mr-3 h-5 w-5" />
                 <div>
                  <p className="font-semibold">Pemetaan & Analisis</p>
                  <p className="text-xs text-muted-foreground">Hubungkan SKL dengan CP.</p>
                </div>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <BookCopy className="mr-3 h-5 w-5 text-primary" />
                Struktur Kurikulum, Silabus & RPP
              </CardTitle>
              <CardDescription>
                Susun kerangka kurikulum, alokasi waktu, materi pokok, hingga rencana pelaksanaan pembelajaran. Pastikan merujuk pada <Link href={ROUTES.ADMIN_MATA_PELAJARAN} className="text-primary hover:underline">daftar mata pelajaran</Link> yang sudah ada.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Button variant="outline" onClick={() => handlePlaceholderAction("Kelola Struktur Kurikulum")} className="justify-start text-left h-auto py-3">
                <Layers className="mr-3 h-5 w-5" />
                <div>
                  <p className="font-semibold">Struktur Kurikulum</p>
                  <p className="text-xs text-muted-foreground">Atur mata pelajaran per tingkat.</p>
                </div>
              </Button>
              <Button variant="outline" onClick={() => handlePlaceholderAction("Manajemen Silabus")} className="justify-start text-left h-auto py-3">
                <FileText className="mr-3 h-5 w-5" />
                <div>
                  <p className="font-semibold">Pengembangan Silabus</p>
                  <p className="text-xs text-muted-foreground">Rancang silabus per mapel.</p>
                </div>
              </Button>
              <Button variant="outline" onClick={() => handlePlaceholderAction("Manajemen RPP")} className="justify-start text-left h-auto py-3">
                 <BookUp className="mr-3 h-5 w-5" />
                 <div>
                  <p className="font-semibold">Penyusunan RPP</p>
                  <p className="text-xs text-muted-foreground">Buat rencana pembelajaran detail.</p>
                </div>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <FolderKanban className="mr-3 h-5 w-5 text-primary" />
                Bank Materi & Sumber Pembelajaran
              </CardTitle>
              <CardDescription>
                Kelola dan organisasikan materi ajar, modul, video, dan referensi pendukung lainnya.
                {materiList.length > 0 && ` (Total: ${materiList.length} materi)`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Button variant="default" onClick={() => setIsMateriFormOpen(true)} className="justify-start text-left h-auto py-3">
                  <PlusCircle className="mr-3 h-5 w-5" />
                  <div>
                    <p className="font-semibold">Tambah Materi Baru</p>
                    <p className="text-xs text-muted-foreground">Unggah file atau tautan.</p>
                  </div>
                </Button>
                <Button variant="outline" onClick={() => handlePlaceholderAction("Kelola Kategori Materi")} className="justify-start text-left h-auto py-3">
                  <Edit className="mr-3 h-5 w-5" />
                  <div>
                    <p className="font-semibold">Kategorisasi Materi</p>
                    <p className="text-xs text-muted-foreground">Susun materi per mapel/topik.</p>
                  </div>
                </Button>
                <Button variant="outline" onClick={() => handlePlaceholderAction("Cari Materi")} className="justify-start text-left h-auto py-3">
                  <Search className="mr-3 h-5 w-5" />
                  <div>
                    <p className="font-semibold">Pencarian Materi</p>
                    <p className="text-xs text-muted-foreground">Temukan sumber belajar.</p>
                  </div>
                </Button>
              </div>
              {materiList.length > 0 && (
                <div className="pt-4">
                  <h4 className="text-md font-semibold mb-2">Daftar Materi Terunggah:</h4>
                  <ul className="space-y-2 max-h-60 overflow-y-auto border p-2 rounded-md">
                    {materiList.map(m => (
                      <li key={m.id} className="text-sm p-2 bg-muted/50 rounded-md flex justify-between items-center">
                        <div>
                          <span className="font-medium">{m.judul}</span> ({m.mapel}) - {m.jenisMateri === "File" ? m.namaFile : m.url}
                          <span className="text-xs text-muted-foreground ml-2">({m.tanggalUpload})</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handlePlaceholderAction(`Edit Materi ${m.id}`)}><Edit className="h-3 w-3"/></Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Dialog untuk Bank Materi */}
      <Dialog open={isMateriFormOpen} onOpenChange={setIsMateriFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Tambah Materi Pembelajaran Baru</DialogTitle>
            <DialogDescription>
              Isi detail materi di bawah ini. Anda bisa mengunggah file atau menambahkan tautan.
            </DialogDescription>
          </DialogHeader>
          <Form {...materiForm}>
            <form onSubmit={materiForm.handleSubmit(handleMateriSubmit)} className="space-y-4 py-4">
              <FormField
                control={materiForm.control}
                name="judul"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Judul Materi</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Modul Bab 1 Termodinamika" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={materiForm.control}
                name="mapel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mata Pelajaran</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih mata pelajaran terkait" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MOCK_SUBJECTS.map(subject => (
                          <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={materiForm.control}
                name="deskripsi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi (Opsional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Deskripsi singkat tentang materi..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={materiForm.control}
                name="jenisMateri"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jenis Materi</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenis materi" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="File"><UploadCloud className="inline-block mr-2 h-4 w-4" />Unggah File (PDF, DOC, PPT)</SelectItem>
                        <SelectItem value="Link"><Link2Icon className="inline-block mr-2 h-4 w-4" />Tautan Eksternal (Video, Web)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {materiForm.watch("jenisMateri") === "File" && (
                <FormField
                  control={materiForm.control}
                  name="file"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unggah File</FormLabel>
                      <FormControl>
                        <Input 
                          type="file" 
                          onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)} 
                        />
                      </FormControl>
                      <FormDescription>Pilih file materi (PDF, DOCX, PPTX, dll.). Maks 10MB.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {materiForm.watch("jenisMateri") === "Link" && (
                <FormField
                  control={materiForm.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL Materi</FormLabel>
                      <FormControl>
                        <Input placeholder="https://contoh.com/materi-belajar" {...field} />
                      </FormControl>
                       <FormDescription>Masukkan URL lengkap ke sumber materi.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsMateriFormOpen(false)} disabled={isLoadingMateriSubmit}>
                  Batal
                </Button>
                <Button type="submit" disabled={isLoadingMateriSubmit}>
                  {isLoadingMateriSubmit && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Simpan Materi
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog untuk Manajemen SKL */}
      <Dialog open={isSKLDialogOpen} onOpenChange={setIsSKLDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manajemen Standar Kompetensi Lulusan (SKL)</DialogTitle>
            <DialogDescription>
              Kelola daftar SKL yang menjadi acuan profil lulusan sekolah.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Button onClick={() => openSKLForm()}>
              <PlusCircle className="mr-2 h-4 w-4" /> Tambah SKL Baru
            </Button>
            {sklList.length > 0 ? (
              <div className="overflow-x-auto border rounded-md max-h-96">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Kode</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Deskripsi</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Kategori</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground uppercase">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-border">
                    {sklList.map(skl => (
                      <tr key={skl.id}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">{skl.kode}</td>
                        <td className="px-4 py-2 text-sm text-muted-foreground max-w-md whitespace-pre-wrap">{skl.deskripsi}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-muted-foreground">{skl.kategori}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-right text-sm">
                          <Button variant="ghost" size="sm" onClick={() => openSKLForm(skl)} className="mr-1"><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => openDeleteSKLDialog(skl)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground text-center">Belum ada data SKL.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSKLDialogOpen(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Form untuk Tambah/Edit SKL */}
      <Dialog open={isSKLFormOpen} onOpenChange={(open) => { setIsSKLFormOpen(open); if (!open) setEditingSKL(null); }}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>{editingSKL ? "Edit SKL" : "Tambah SKL Baru"}</DialogTitle>
            </DialogHeader>
            <Form {...sklForm}>
                <form onSubmit={sklForm.handleSubmit(handleSKLFormSubmit)} className="space-y-4 py-2">
                    <FormField
                        control={sklForm.control}
                        name="kode"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Kode SKL</FormLabel>
                                <FormControl><Input placeholder="Contoh: S-01, P-01" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={sklForm.control}
                        name="deskripsi"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Deskripsi SKL</FormLabel>
                                <FormControl><Textarea placeholder="Jelaskan standar kompetensi lulusan..." {...field} rows={4} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={sklForm.control}
                        name="kategori"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Kategori SKL</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Pilih kategori SKL" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Sikap">Sikap</SelectItem>
                                    <SelectItem value="Pengetahuan">Pengetahuan</SelectItem>
                                    <SelectItem value="Keterampilan">Keterampilan</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <DialogFooter className="pt-2">
                        <Button type="button" variant="outline" onClick={() => {setIsSKLFormOpen(false); setEditingSKL(null);}} disabled={isSKLSubmitting}>Batal</Button>
                        <Button type="submit" disabled={isSKLSubmitting}>
                            {isSKLSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editingSKL ? "Simpan Perubahan" : "Simpan SKL"}
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
      </Dialog>
      
      {/* Alert Dialog untuk Konfirmasi Hapus SKL */}
      <AlertDialog open={!!sklToDelete} onOpenChange={(open) => !open && setSklToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Penghapusan SKL</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus SKL dengan kode "{sklToDelete?.kode}"? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSklToDelete(null)} disabled={isSKLSubmitting}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSKLConfirm} className="bg-destructive hover:bg-destructive/90" disabled={isSKLSubmitting}>
              {isSKLSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ya, Hapus SKL
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
