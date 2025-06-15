
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/use-auth";
import { ClipboardList, PlusCircle, Edit, Trash2, Loader2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { MataPelajaran } from "@/types"; 
import { KATEGORI_MAPEL } from "@/lib/constants";


const mataPelajaranSchema = z.object({
  kode: z.string().min(3, { message: "Kode minimal 3 karakter." }).max(50),
  nama: z.string().min(5, { message: "Nama minimal 5 karakter." }).max(255),
  deskripsi: z.string().optional().or(z.literal('')),
  kategori: z.enum(KATEGORI_MAPEL, { required_error: "Kategori wajib diisi." }),
});

type MataPelajaranFormValues = z.infer<typeof mataPelajaranSchema>;

export default function AdminMataPelajaranPage() {
  const { user: currentUserAuth, isLoading: authLoading } = useAuth(); // useAuth from next-auth
  const { toast } = useToast();
  const [mataPelajaranList, setMataPelajaranList] = useState<MataPelajaran[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMapel, setEditingMapel] = useState<MataPelajaran | null>(null);
  const [mapelToDelete, setMapelToDelete] = useState<MataPelajaran | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true); 
  const [isSubmitting, setIsSubmitting] = useState(false); 
  
  const [searchTerm, setSearchTerm] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState<string>("semua");


  const form = useForm<MataPelajaranFormValues>({
    resolver: zodResolver(mataPelajaranSchema),
    defaultValues: {
      kode: "",
      nama: "",
      deskripsi: "",
      kategori: undefined,
    },
  });

  const fetchMataPelajaran = async () => {
    setIsLoadingData(true);
    try {
      const response = await fetch('/api/mapel');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal mengambil data mata pelajaran');
      }
      const data = await response.json();
      setMataPelajaranList(data);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Tidak dapat memuat data.", variant: "destructive" });
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (currentUserAuth && (currentUserAuth.role === 'admin' || currentUserAuth.role === 'superadmin')) {
        fetchMataPelajaran();
    }
  }, [currentUserAuth]); 


  useEffect(() => {
    if (editingMapel) {
      form.reset({
        kode: editingMapel.kode,
        nama: editingMapel.nama,
        deskripsi: editingMapel.deskripsi || "",
        kategori: editingMapel.kategori,
      });
    } else {
      form.reset({ kode: "", nama: "", deskripsi: "", kategori: undefined });
    }
  }, [editingMapel, form, isFormOpen]);


  if (authLoading) { 
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }
  if (!currentUserAuth || (currentUserAuth.role !== 'admin' && currentUserAuth.role !== 'superadmin')) {
    return <p>Akses Ditolak. Anda harus menjadi admin untuk melihat halaman ini.</p>;
  }

  const handleFormSubmit = async (values: MataPelajaranFormValues) => {
    setIsSubmitting(true);
    const url = editingMapel ? `/api/mapel/${editingMapel.id}` : '/api/mapel';
    const method = editingMapel ? 'PUT' : 'POST';
    
    const payload = editingMapel ? { nama: values.nama, deskripsi: values.deskripsi, kategori: values.kategori } : values;

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menyimpan mata pelajaran');
      }
      toast({ title: "Berhasil!", description: `Mata pelajaran ${values.nama} telah ${editingMapel ? 'diperbarui' : 'ditambahkan'}.` });
      setIsFormOpen(false);
      setEditingMapel(null);
      form.reset();
      fetchMataPelajaran(); 
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Terjadi kesalahan.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditMataPelajaran = (mapel: MataPelajaran) => {
    setEditingMapel(mapel);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (mapel: MataPelajaran) => {
    setMapelToDelete(mapel);
  };

  const handleDeleteConfirm = async () => {
    if (mapelToDelete) {
      setIsSubmitting(true);
      try {
        const response = await fetch(`/api/mapel/${mapelToDelete.id}`, { method: 'DELETE' });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Gagal menghapus mata pelajaran');
        }
        toast({ title: "Dihapus!", description: `Mata pelajaran ${mapelToDelete.nama} telah dihapus.` });
        fetchMataPelajaran(); 
      } catch (error: any) {
        toast({ title: "Error", description: error.message || "Terjadi kesalahan.", variant: "destructive" });
      } finally {
        setIsSubmitting(false);
        setMapelToDelete(null);
      }
    }
  };

  const filteredMataPelajaran = useMemo(() => {
    return mataPelajaranList.filter(mapel => {
      const searchMatch = searchTerm === "" || 
                          mapel.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          mapel.kode.toLowerCase().includes(searchTerm.toLowerCase());
      const kategoriMatch = kategoriFilter === "semua" || mapel.kategori === kategoriFilter;
      return searchMatch && kategoriMatch;
    });
  }, [mataPelajaranList, searchTerm, kategoriFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-headline font-semibold">Manajemen Mata Pelajaran</h1>
            <p className="text-muted-foreground mt-1">Kelola semua mata pelajaran yang ditawarkan oleh sekolah.</p>
        </div>
        <Button onClick={() => { setEditingMapel(null); form.reset(); setIsFormOpen(true); }} disabled={isLoadingData}>
          <PlusCircle className="mr-2 h-4 w-4" /> Tambah Mata Pelajaran
        </Button>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <CardTitle className="flex items-center">
                    <ClipboardList className="mr-2 h-6 w-6 text-primary" />
                    Daftar Mata Pelajaran Sekolah
                </CardTitle>
                <CardDescription>
                    Total: {filteredMataPelajaran.length} mata pelajaran.
                </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="relative flex-grow sm:flex-grow-0">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Cari kode atau nama..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-full sm:w-[200px] lg:w-[250px]"
                    />
                </div>
                <Select value={kategoriFilter} onValueChange={setKategoriFilter}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="Filter Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="semua">Semua Kategori</SelectItem>
                        {KATEGORI_MAPEL.map(kat => (
                            <SelectItem key={kat} value={kat}>{kat}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingData ? (
            <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" /> 
                <p className="ml-2">Memuat data...</p>
            </div>
          ) : filteredMataPelajaran.length > 0 ? (
            <ScrollArea className="h-[60vh]">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama Mata Pelajaran</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead className="text-right">Tindakan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMataPelajaran.map((mapel) => (
                    <TableRow key={mapel.id}>
                      <TableCell className="font-medium">{mapel.kode}</TableCell>
                      <TableCell>{mapel.nama}</TableCell>
                      <TableCell>{mapel.kategori}</TableCell>
                      <TableCell className="max-w-xs truncate" title={mapel.deskripsi || ""}>{mapel.deskripsi || "-"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleEditMataPelajaran(mapel)} className="mr-2 text-primary hover:text-primary/80">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(mapel)} className="text-destructive hover:text-destructive/80">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          ) : (
             <div className="p-6 text-center text-muted-foreground bg-muted/30 rounded-md">
                <p className="mb-2">Tidak ada mata pelajaran yang cocok dengan filter saat ini.</p>
                {searchTerm === "" && kategoriFilter === "semua" && (
                    <Button onClick={() => { setEditingMapel(null); form.reset(); setIsFormOpen(true); }}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Tambah Mata Pelajaran Pertama
                    </Button>
                )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if (!open) setEditingMapel(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingMapel ? "Edit Mata Pelajaran" : "Tambah Mata Pelajaran Baru"}</DialogTitle>
            <DialogDescription>
              {editingMapel ? `Perbarui detail untuk ${editingMapel.nama}.` : "Isi detail mata pelajaran baru di bawah ini."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
              <FormField control={form.control} name="kode" render={({ field }) => (<FormItem><FormLabel>Kode Mata Pelajaran</FormLabel><FormControl><Input placeholder="Contoh: MTK-X, FIS-XI-IPA" {...field} disabled={!!editingMapel} /></FormControl>{editingMapel && <FormDescription>Kode tidak dapat diubah.</FormDescription>}<FormMessage /></FormItem>)} />
              <FormField control={form.control} name="nama" render={({ field }) => (<FormItem><FormLabel>Nama Mata Pelajaran</FormLabel><FormControl><Input placeholder="Contoh: Matematika Kelas X" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="kategori" render={({ field }) => (<FormItem><FormLabel>Kategori</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih kategori mata pelajaran" /></SelectTrigger></FormControl><SelectContent>{KATEGORI_MAPEL.map(kat => (<SelectItem key={kat} value={kat}>{kat}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="deskripsi" render={({ field }) => (<FormItem><FormLabel>Deskripsi (Opsional)</FormLabel><FormControl><Textarea placeholder="Deskripsi singkat mata pelajaran..." {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />
              <DialogFooter><Button type="button" variant="outline" onClick={() => { setIsFormOpen(false); setEditingMapel(null); }} disabled={isSubmitting}>Batal</Button><Button type="submit" disabled={isSubmitting || isLoadingData}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editingMapel ? "Simpan Perubahan" : "Simpan Mata Pelajaran"}</Button></DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!mapelToDelete} onOpenChange={(open) => { if(!open) setMapelToDelete(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Konfirmasi Penghapusan</AlertDialogTitle><AlertDialogDescription>Apakah Anda yakin ingin menghapus mata pelajaran "{mapelToDelete?.nama}"? Tindakan ini akan menghapus semua data terkait (struktur kurikulum, silabus, RPP) yang menggunakan mata pelajaran ini.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel onClick={() => setMapelToDelete(null)} disabled={isSubmitting}>Batal</AlertDialogCancel><AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Ya, Hapus</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
    

    