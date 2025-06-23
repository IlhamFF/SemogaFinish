
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { UploadCloud, Link2 as LinkIconLucide, PlusCircle, Search, Edit3, Trash2, Loader2, FolderKanban } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { JENIS_MATERI_AJAR } from "@/types";
import type { MateriAjar, JenisMateriAjarType, MataPelajaran } from "@/types"; 
import { format, parseISO } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


const materiClientSchema = z.object({
  judul: z.string().min(3, { message: "Judul materi minimal 3 karakter." }).max(255),
  deskripsi: z.string().optional().nullable(),
  mapelNama: z.string({ required_error: "Mata pelajaran wajib dipilih." }),
  jenisMateri: z.enum(JENIS_MATERI_AJAR, { required_error: "Jenis materi wajib dipilih." }),
  file: z.any().optional(), 
  externalUrl: z.string().url({ message: "URL tidak valid." }).optional().or(z.literal('')),
}).refine(data => {
  if (data.jenisMateri === "Link" && !data.externalUrl) return false;
  return true;
}, {
  message: "Jika jenis 'Link', URL wajib diisi.",
  path: ["externalUrl"],
});
type MateriClientFormValues = z.infer<typeof materiClientSchema>;


export default function GuruMateriPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [materiList, setMateriList] = useState<MateriAjar[]>([]);
  const [isLoadingMateriList, setIsLoadingMateriList] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMapel, setFilterMapel] = useState("semua");
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentEditingMateri, setCurrentEditingMateri] = useState<MateriAjar | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [materiToDelete, setMateriToDelete] = useState<MateriAjar | null>(null);
  
  const [mapelOptions, setMapelOptions] = useState<MataPelajaran[]>([]);

  const materiForm = useForm<MateriClientFormValues>({
    resolver: zodResolver(materiClientSchema),
    defaultValues: { judul: "", deskripsi: "", mapelNama: undefined, jenisMateri: undefined, file: undefined, externalUrl: "" },
  });
  
  const fetchMataPelajaranOptions = async () => { try { const response = await fetch('/api/mapel'); if (!response.ok) throw new Error('Gagal mengambil data mata pelajaran'); setMapelOptions(await response.json()); } catch (error: any) { toast({ title: "Error Mapel", description: error.message, variant: "destructive" }); }};

  const fetchMateriSaya = useCallback(async () => {
    if (!user) return;
    setIsLoadingMateriList(true);
    try {
      const response = await fetch('/api/kurikulum/materi-ajar');
      if (!response.ok) throw new Error('Gagal mengambil data materi ajar');
      const allMateri: MateriAjar[] = await response.json();
      const myMateri = allMateri.filter(m => m.uploaderId === user.id);
      setMateriList(myMateri);
    } catch (error: any) {
      toast({ title: "Error Materi Ajar", description: error.message || "Tidak dapat memuat materi ajar.", variant: "destructive" });
    } finally {
      setIsLoadingMateriList(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user && (user.role === 'guru' || user.role === 'superadmin')) {
      fetchMateriSaya();
      fetchMataPelajaranOptions();
    }
  }, [user, fetchMateriSaya]);
  
  useEffect(() => {
    if (isFormOpen) {
      if (currentEditingMateri) {
        materiForm.reset({
          judul: currentEditingMateri.judul,
          deskripsi: currentEditingMateri.deskripsi || "",
          mapelNama: currentEditingMateri.mapelNama,
          jenisMateri: currentEditingMateri.jenisMateri,
          externalUrl: currentEditingMateri.jenisMateri === "Link" ? currentEditingMateri.fileUrl || "" : "",
          file: undefined,
        });
      } else {
        materiForm.reset({ judul: "", deskripsi: "", mapelNama: undefined, jenisMateri: undefined, file: undefined, externalUrl: "" });
      }
    }
  }, [currentEditingMateri, materiForm, isFormOpen]);


  if (!user || (user.role !== 'guru' && user.role !== 'superadmin')) {
    return <p>Akses Ditolak. Anda harus menjadi Guru untuk melihat halaman ini.</p>;
  }
  
  const handleMateriSubmit = async (values: MateriClientFormValues) => {
    setIsSubmitting(true);
    let uploadedFileData: { url: string | null; originalName: string | null } = { url: currentEditingMateri?.fileUrl ?? null, originalName: currentEditingMateri?.namaFileOriginal ?? null };

    try {
      if (values.jenisMateri === 'File' && values.file && values.file.name) {
        const formData = new FormData();
        formData.append('file', values.file);
        formData.append('category', 'materi');
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        const uploadResult = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadResult.message || 'Gagal mengunggah file.');
        uploadedFileData = { url: uploadResult.url, originalName: uploadResult.originalName };
      }

      const payload: Partial<MateriAjar> & { fileUrl?: string | null } = {
        judul: values.judul,
        deskripsi: values.deskripsi,
        mapelNama: values.mapelNama,
        jenisMateri: values.jenisMateri,
        fileUrl: values.jenisMateri === 'Link' ? values.externalUrl : uploadedFileData.url,
        namaFileOriginal: values.jenisMateri === 'File' ? uploadedFileData.originalName : null,
      };

      const url = currentEditingMateri ? `/api/kurikulum/materi-ajar/${currentEditingMateri.id}` : '/api/kurikulum/materi-ajar';
      const method = currentEditingMateri ? 'PUT' : 'POST';
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Gagal ${currentEditingMateri ? 'memperbarui' : 'menambahkan'} materi.`);
      }
      toast({ title: "Berhasil!", description: `Materi "${values.judul}" telah ${currentEditingMateri ? 'diperbarui' : 'ditambahkan'}.` });
      setIsFormOpen(false);
      setCurrentEditingMateri(null);
      fetchMateriSaya();
    } catch (error: any) {
      toast({ title: "Error Materi", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const openFormDialog = (materi?: MateriAjar) => { setCurrentEditingMateri(materi || null); setIsFormOpen(true); }
  const openDeleteMateriDialog = (materi: MateriAjar) => { setMateriToDelete(materi); };

  const handleDeleteMateriConfirm = async () => {
    if (materiToDelete) {
      setIsSubmitting(true);
      try {
        const response = await fetch(`/api/kurikulum/materi-ajar/${materiToDelete.id}`, { method: 'DELETE' });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Gagal menghapus materi.');
        }
        toast({ title: "Dihapus!", description: `Materi "${materiToDelete.judul}" telah dihapus.` });
        fetchMateriSaya();
      } catch (error: any) {
        toast({ title: "Error Hapus Materi", description: error.message, variant: "destructive" });
      } finally {
        setIsSubmitting(false);
        setMateriToDelete(null);
      }
    }
  };

  const filteredMateri = materiList.filter(m => 
    (m.judul.toLowerCase().includes(searchTerm.toLowerCase()) || m.mapelNama.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterMapel === "semua" || m.mapelNama === filterMapel)
  );

  const uniqueMapelOptions = useMemo(() => ["semua", ...new Set(mapelOptions.map(m => m.nama))], [mapelOptions]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-semibold">Upload & Manajemen Materi</h1>
        <Button onClick={() => openFormDialog()}><PlusCircle className="mr-2 h-4 w-4" /> Upload Materi Baru</Button>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><UploadCloud className="mr-2 h-6 w-6 text-primary" />Bank Materi Pembelajaran Saya</CardTitle>
          <CardDescription>Unggah, kelola, dan bagikan materi pembelajaran yang Anda buat.</CardDescription>
        </CardHeader>
        <CardContent>
          <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                        <CardTitle className="text-xl">Daftar Materi Unggahan Saya</CardTitle>
                        <CardDescription>Total: {filteredMateri.length} materi.</CardDescription>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <div className="relative flex-grow sm:flex-grow-0"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Cari judul, mapel..." className="pl-8 w-full sm:w-[200px]" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                         <Select value={filterMapel} onValueChange={setFilterMapel}><SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Filter Mata Pelajaran" /></SelectTrigger><SelectContent>{uniqueMapelOptions.map(mapel => (<SelectItem key={mapel} value={mapel}>{mapel === "semua" ? "Semua Mapel" : mapel}</SelectItem>))}</SelectContent></Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
              {isLoadingMateriList ? (
                <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : filteredMateri.length > 0 ? (
                <ScrollArea className="h-[60vh] border rounded-md">
                  <Table><TableHeader className="bg-muted/50 sticky top-0"><TableRow><TableHead>Judul Materi</TableHead><TableHead>Mapel</TableHead><TableHead>Jenis</TableHead><TableHead>Tgl Upload</TableHead><TableHead>File/Link</TableHead><TableHead className="text-right">Tindakan</TableHead></TableRow></TableHeader>
                    <TableBody>{filteredMateri.map((m) => (<TableRow key={m.id}><TableCell className="font-medium max-w-xs truncate" title={m.judul}>{m.judul}{m.deskripsi && <p className="text-xs text-muted-foreground truncate" title={m.deskripsi}>{m.deskripsi}</p>}</TableCell><TableCell>{m.mapelNama}</TableCell><TableCell>{m.jenisMateri}</TableCell><TableCell>{m.tanggalUpload ? format(parseISO(m.tanggalUpload), "dd/MM/yyyy") : "-"}</TableCell><TableCell className="text-xs truncate max-w-[150px]" title={m.jenisMateri === 'Link' ? m.fileUrl || "-" : m.namaFileOriginal || "-"}>{m.jenisMateri === 'Link' ? (m.fileUrl || "-") : (m.namaFileOriginal || "-")}</TableCell><td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium"><Button variant="ghost" size="sm" onClick={() => openFormDialog(m)} className="mr-1"><Edit3 className="h-4 w-4" /></Button><Button variant="ghost" size="sm" onClick={() => openDeleteMateriDialog(m)} className="text-destructive hover:text-destructive/80"><Trash2 className="h-4 w-4" /></Button></td></TableRow>))}</TableBody>
                  </Table>
                </ScrollArea>
              ) : (<div className="text-center py-8 text-muted-foreground"><FolderKanban className="mx-auto h-12 w-12" /><p className="mt-2">Belum ada materi yang diunggah.</p></div>)}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
      <Dialog open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if (!open) setCurrentEditingMateri(null); }}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>{currentEditingMateri ? "Edit Materi" : "Upload Materi Baru"}</DialogTitle><DialogDescription>{currentEditingMateri ? `Perbarui detail untuk materi "${currentEditingMateri.judul}".` : "Isi detail materi baru di bawah ini."}</DialogDescription></DialogHeader>
            <Form {...materiForm}><form onSubmit={materiForm.handleSubmit(handleMateriSubmit)} className="space-y-4 py-2"><FormField control={materiForm.control} name="judul" render={({ field }) => (<FormItem><FormLabel>Judul Materi</FormLabel><FormControl><Input placeholder="Contoh: Modul Bab 1" {...field} /></FormControl><FormMessage /></FormItem>)} /><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><FormField control={materiForm.control} name="mapelNama" render={({ field }) => (<FormItem><FormLabel>Mata Pelajaran</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih mapel" /></SelectTrigger></FormControl><SelectContent>{mapelOptions.map(subject => (<SelectItem key={subject.id} value={subject.nama}>{subject.nama}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} /><FormField control={materiForm.control} name="jenisMateri" render={({ field }) => (<FormItem><FormLabel>Jenis Materi</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih jenis" /></SelectTrigger></FormControl><SelectContent>{JENIS_MATERI_AJAR.map(jenis => <SelectItem key={jenis} value={jenis}>{jenis === "File" ? <><UploadCloud className="inline-block mr-2 h-4 w-4" />Unggah File</> : <><LinkIconLucide className="inline-block mr-2 h-4 w-4" />Tautan Eksternal</>}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} /></div><FormField control={materiForm.control} name="deskripsi" render={({ field }) => (<FormItem><FormLabel>Deskripsi (Opsional)</FormLabel><FormControl><Textarea placeholder="Deskripsi singkat..." {...field} rows={3} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />
                    {materiForm.watch("jenisMateri") === "File" && (<FormField control={materiForm.control} name="file" render={({ field: { onChange, value, ...restField } }) => (<FormItem><FormLabel>Unggah File {currentEditingMateri?.namaFileOriginal && materiForm.getValues("jenisMateri") === "File" ? `(Kosongkan jika tidak ubah: ${currentEditingMateri.namaFileOriginal})` : ""}</FormLabel><FormControl><Input type="file" onChange={(e) => onChange(e.target.files ? e.target.files[0] : null)} {...restField} /></FormControl><FormDescription>PDF, DOCX, dll.</FormDescription><FormMessage /></FormItem>)} />)}
                    {materiForm.watch("jenisMateri") === "Link" && (<FormField control={materiForm.control} name="externalUrl" render={({ field }) => (<FormItem><FormLabel>URL Materi/Video</FormLabel><FormControl><Input placeholder="https://contoh.com/materi" {...field} /></FormControl><FormMessage /></FormItem>)} />)}
                    <DialogFooter className="pt-4"><Button type="button" variant="outline" onClick={() => {setIsFormOpen(false); setCurrentEditingMateri(null);}} disabled={isSubmitting}>Batal</Button><Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{currentEditingMateri ? "Simpan Perubahan" : "Simpan Materi"}</Button></DialogFooter>
            </form></Form></DialogContent></Dialog>
      <AlertDialog open={!!materiToDelete} onOpenChange={(open) => !open && setMateriToDelete(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Hapus Materi</AlertDialogTitle><AlertDialogDescription>Yakin ingin hapus materi "{materiToDelete?.judul}"?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel onClick={() => setMateriToDelete(null)} disabled={isSubmitting}>Batal</AlertDialogCancel><AlertDialogAction onClick={handleDeleteMateriConfirm} className="bg-destructive hover:bg-destructive/90" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Ya, Hapus</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  );
}
