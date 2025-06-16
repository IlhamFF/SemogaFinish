
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { FilePlus2, ListTodo, Edit3, CalendarClock, CheckSquare, PlusCircle, Search, Loader2, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, formatISO, parseISO } from "date-fns";
import { id as localeID } from 'date-fns/locale';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { MOCK_SUBJECTS, SCHOOL_CLASSES_PER_MAJOR_GRADE, SCHOOL_GRADE_LEVELS, SCHOOL_MAJORS } from "@/lib/constants";
import type { Tugas } from "@/types"; // Import Tugas from global types
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";


const tugasSchema = z.object({
  judul: z.string().min(5, { message: "Judul tugas minimal 5 karakter." }),
  mapel: z.string({ required_error: "Mata pelajaran wajib dipilih." }),
  kelas: z.string({ required_error: "Kelas wajib dipilih." }),
  tenggat: z.date({ required_error: "Tanggal tenggat wajib diisi." }), // Form uses Date object
  deskripsi: z.string().optional().nullable(),
  fileLampiranInput: z.any().optional(), // For file input in form
});

type TugasFormValues = z.infer<typeof tugasSchema>;


export default function GuruTugasPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [tugasList, setTugasList] = useState<Tugas[]>([]);
  const [isLoadingTugas, setIsLoadingTugas] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMapel, setFilterMapel] = useState("semua");
  const [filterKelas, setFilterKelas] = useState("semua");
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTugas, setEditingTugas] = useState<Tugas | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tugasToDelete, setTugasToDelete] = useState<Tugas | null>(null);


  const tugasForm = useForm<TugasFormValues>({
    resolver: zodResolver(tugasSchema),
    defaultValues: { judul: "", mapel: undefined, kelas: undefined, tenggat: new Date(), deskripsi: "", fileLampiranInput: undefined },
  });
  
  const mockKelasList = React.useMemo(() => {
    const kls: string[] = [];
    SCHOOL_GRADE_LEVELS.forEach(grade => {
      SCHOOL_MAJORS.forEach(major => {
        for (let i = 1; i <= SCHOOL_CLASSES_PER_MAJOR_GRADE; i++) {
          kls.push(`${grade} ${major} ${i}`);
        }
      });
    });
    return kls;
  }, []);

  const fetchTugas = useCallback(async () => {
    if (!user) return;
    setIsLoadingTugas(true);
    try {
      const response = await fetch('/api/tugas');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal mengambil data tugas.");
      }
      const data: Tugas[] = await response.json();
      setTugasList(data.map(t => ({...t, tenggat: t.tenggat ? parseISO(t.tenggat).toISOString() : new Date().toISOString() })));
    } catch (error: any) {
      toast({ title: "Error Tugas", description: error.message, variant: "destructive" });
    } finally {
      setIsLoadingTugas(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user && (user.role === 'guru' || user.role === 'superadmin')) {
      fetchTugas();
    }
  }, [user, fetchTugas]);

  useEffect(() => {
    if (isFormOpen) {
      if (editingTugas) {
        tugasForm.reset({
          judul: editingTugas.judul,
          mapel: editingTugas.mapel,
          kelas: editingTugas.kelas,
          tenggat: editingTugas.tenggat ? parseISO(editingTugas.tenggat) : new Date(),
          deskripsi: editingTugas.deskripsi || "",
          fileLampiranInput: undefined, // File input cannot be pre-filled for security reasons
        });
      } else {
        tugasForm.reset({ judul: "", mapel: undefined, kelas: undefined, tenggat: new Date(new Date().setDate(new Date().getDate() + 7)), deskripsi: "", fileLampiranInput: undefined });
      }
    }
  }, [editingTugas, tugasForm, isFormOpen]);


  if (!user || (user.role !== 'guru' && user.role !== 'superadmin')) {
    return <p>Akses Ditolak. Anda harus menjadi Guru untuk melihat halaman ini.</p>;
  }

  const handleFormSubmit = async (values: TugasFormValues) => {
    setIsSubmitting(true);
    
    const payload: Partial<Tugas> & {tenggat: string, namaFileLampiran?: string | null} = {
      judul: values.judul,
      mapel: values.mapel,
      kelas: values.kelas,
      tenggat: formatISO(values.tenggat), // Convert Date to ISO string for API
      deskripsi: values.deskripsi,
      namaFileLampiran: values.fileLampiranInput ? (values.fileLampiranInput as File).name : (editingTugas ? editingTugas.namaFileLampiran : null),
    };
    
    // If not editing or if file is changed during edit, set namaFileLampiran from input
    if (!editingTugas || (editingTugas && values.fileLampiranInput)) {
        payload.namaFileLampiran = values.fileLampiranInput ? (values.fileLampiranInput as File).name : null;
    } else if (editingTugas && !values.fileLampiranInput) {
        // If editing and no new file selected, retain the old file name
        payload.namaFileLampiran = editingTugas.namaFileLampiran;
    }


    const url = editingTugas ? `/api/tugas/${editingTugas.id}` : '/api/tugas';
    const method = editingTugas ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Gagal ${editingTugas ? 'memperbarui' : 'membuat'} tugas.`);
      }
      toast({ title: "Berhasil!", description: `Tugas "${values.judul}" telah ${editingTugas ? 'diperbarui' : 'dibuat'}.` });
      setIsFormOpen(false);
      setEditingTugas(null);
      fetchTugas();
    } catch (error: any) {
      toast({ title: "Error Tugas", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const openFormDialog = (tugas?: Tugas) => {
    setEditingTugas(tugas || null);
    setIsFormOpen(true);
  }

  const openDeleteDialog = (tugas: Tugas) => {
    setTugasToDelete(tugas);
  };

  const handleDeleteConfirm = async () => {
    if (tugasToDelete) {
      setIsSubmitting(true);
      try {
        const response = await fetch(`/api/tugas/${tugasToDelete.id}`, { method: 'DELETE' });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Gagal menghapus tugas.');
        }
        toast({ title: "Dihapus!", description: `Tugas "${tugasToDelete.judul}" telah dihapus.` });
        fetchTugas();
      } catch (error: any) {
        toast({ title: "Error Hapus Tugas", description: error.message, variant: "destructive" });
      } finally {
        setIsSubmitting(false);
        setTugasToDelete(null);
      }
    }
  };

  const filteredTugas = useMemo(() => tugasList.filter(tugas => 
    (tugas.judul.toLowerCase().includes(searchTerm.toLowerCase()) || tugas.mapel.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterMapel === "semua" || tugas.mapel === filterMapel) &&
    (filterKelas === "semua" || tugas.kelas === filterKelas)
  ), [tugasList, searchTerm, filterMapel, filterKelas]);
  
  const uniqueMapelOptions = ["semua", ...new Set(tugasList.map(t => t.mapel).sort())];
  const uniqueKelasOptions = ["semua", ...new Set(tugasList.map(t => t.kelas).sort())];

  const getStatusTugas = (tugas: Tugas): Tugas["status"] => {
    // This is a simplified status logic for frontend display
    // Real status would involve checking submissions, grading, etc.
    if (new Date(tugas.tenggat) < new Date() && tugas.status !== "Ditutup") { // Assuming Draf is not an API status
        return "Ditutup"; // Auto-close past due tasks for display if not explicitly closed
    }
    return tugas.status || "Aktif"; // Default to Aktif if no status from API
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-semibold">Manajemen Tugas</h1>
        <Button onClick={() => openFormDialog()}>
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-auto sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Cari judul, mapel..." 
                className="pl-8" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Select value={filterMapel} onValueChange={setFilterMapel}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter Mata Pelajaran" />
                    </SelectTrigger>
                    <SelectContent>
                        {uniqueMapelOptions.map(mapel => (
                            <SelectItem key={mapel} value={mapel}>{mapel === "semua" ? "Semua Mapel" : mapel}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                 <Select value={filterKelas} onValueChange={setFilterKelas}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter Kelas" />
                    </SelectTrigger>
                    <SelectContent>
                        {uniqueKelasOptions.map(kls => (
                            <SelectItem key={kls} value={kls}>{kls === "semua" ? "Semua Kelas" : kls}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </div>

          {isLoadingTugas ? (
            <div className="flex justify-center items-center h-60"><Loader2 className="h-10 w-10 animate-spin text-primary"/></div>
          ) : filteredTugas.length > 0 ? (
            <ScrollArea className="h-[60vh] border rounded-md">
              <Table>
                <TableHeader className="bg-muted/50 sticky top-0">
                  <TableRow>
                    <TableHead>Judul Tugas</TableHead>
                    <TableHead>Mapel & Kelas</TableHead>
                    <TableHead>Tenggat</TableHead>
                    <TableHead>Pengumpulan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Tindakan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTugas.map((tugas) => {
                    const statusTugas = getStatusTugas(tugas);
                    return (
                    <TableRow key={tugas.id}>
                      <TableCell className="max-w-xs">
                        <div className="font-medium truncate" title={tugas.judul}>{tugas.judul}</div>
                        {tugas.namaFileLampiran && <div className="text-xs text-muted-foreground truncate" title={tugas.namaFileLampiran}>Lampiran: {tugas.namaFileLampiran}</div>}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{tugas.mapel}</div>
                        <div className="text-xs text-muted-foreground">{tugas.kelas}</div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{format(parseISO(tugas.tenggat), "dd MMM yyyy, HH:mm", { locale: localeID })}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{tugas.terkumpul ?? 0}/{tugas.totalSiswa ?? 30}</TableCell> {/* Mocked */}
                      <TableCell>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusTugas === "Aktif" ? "bg-green-100 text-green-800" : statusTugas === "Ditutup" ? "bg-gray-100 text-gray-800" : "bg-yellow-100 text-yellow-800"}`}>
                          {statusTugas}
                        </span>
                      </TableCell>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button variant="ghost" size="sm" onClick={() => toast({title: "Fitur Dalam Pengembangan", description: "Fitur lihat pengumpulan tugas belum tersedia."})} className="mr-1">
                          <Search className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openFormDialog(tugas)} className="mr-1">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(tugas)} className="text-destructive hover:text-destructive/80">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </TableRow>
                  )})}
                </TableBody>
              </Table>
            </ScrollArea>
          ) : (
            <div className="text-center py-8">
              <ListTodo className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium text-foreground">Belum Ada Tugas</h3>
              <p className="mt-1 text-sm text-muted-foreground">Filter tidak menemukan hasil atau belum ada tugas yang dibuat.</p>
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
              <Button variant="outline" onClick={() => toast({title:"Placeholder", description:"Bank Soal/Tugas belum diimplementasikan."})} className="justify-start text-left h-auto py-3">
                <ListTodo className="mr-3 h-5 w-5" />
                <div>
                  <p className="font-semibold">Bank Soal/Tugas</p>
                  <p className="text-xs text-muted-foreground">Gunakan template tugas.</p>
                </div>
              </Button>
              <Button variant="outline" onClick={() => toast({title:"Placeholder", description:"Pengaturan Notifikasi belum diimplementasikan."})} className="justify-start text-left h-auto py-3">
                <CheckSquare className="mr-3 h-5 w-5" />
                 <div>
                  <p className="font-semibold">Notifikasi Pengingat</p>
                  <p className="text-xs text-muted-foreground">Atur pengingat untuk siswa.</p>
                </div>
              </Button>
               <Button variant="outline" onClick={() => toast({title:"Placeholder", description:"Integrasi Penilaian belum diimplementasikan."})} className="justify-start text-left h-auto py-3">
                <Edit3 className="mr-3 h-5 w-5" />
                 <div>
                  <p className="font-semibold">Integrasi Penilaian</p>
                  <p className="text-xs text-muted-foreground">Hubungkan ke modul nilai.</p>
                </div>
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Dialog Form Tambah/Edit Tugas */}
      <Dialog open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if (!open) setEditingTugas(null); }}>
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle>{editingTugas ? "Edit Tugas" : "Buat Tugas Baru"}</DialogTitle>
                <DialogDescription>{editingTugas ? `Perbarui detail untuk tugas "${editingTugas.judul}".` : "Isi detail tugas baru di bawah ini."}</DialogDescription>
            </DialogHeader>
            <Form {...tugasForm}>
                <form onSubmit={tugasForm.handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
                    <FormField control={tugasForm.control} name="judul" render={({ field }) => (<FormItem><FormLabel>Judul Tugas</FormLabel><FormControl><Input placeholder="Contoh: Latihan Soal Bab 1" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField control={tugasForm.control} name="mapel" render={({ field }) => (<FormItem><FormLabel>Mata Pelajaran</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih mapel" /></SelectTrigger></FormControl><SelectContent>{MOCK_SUBJECTS.map(subject => (<SelectItem key={subject} value={subject}>{subject}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                        <FormField control={tugasForm.control} name="kelas" render={({ field }) => (<FormItem><FormLabel>Kelas Ditugaskan</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih kelas" /></SelectTrigger></FormControl><SelectContent>{mockKelasList.map(kls => (<SelectItem key={kls} value={kls}>{kls}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                    </div>
                    <FormField control={tugasForm.control} name="tenggat" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Tanggal & Waktu Tenggat</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP HH:mm", { locale: localeID }) : <span>Pilih tanggal & waktu</span>}<CalendarClock className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /><div className="p-3 border-t border-border"><Input type="time" defaultValue={field.value ? format(field.value, "HH:mm") : "23:59"} onChange={(e) => { const time = e.target.value.split(':'); const newDate = new Date(field.value || new Date()); newDate.setHours(parseInt(time[0]), parseInt(time[1])); field.onChange(newDate); }} className="w-full"/></div></PopoverContent></Popover><FormMessage /></FormItem>)} />
                    <FormField control={tugasForm.control} name="deskripsi" render={({ field }) => (<FormItem><FormLabel>Deskripsi Tugas (Opsional)</FormLabel><FormControl><Textarea placeholder="Instruksi detail untuk siswa..." {...field} value={field.value ?? ""} rows={3} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={tugasForm.control} name="fileLampiranInput" render={({ field: { onChange, value, ...restField } }) => (<FormItem><FormLabel>File Lampiran (Opsional) {editingTugas?.namaFileLampiran ? `(File saat ini: ${editingTugas.namaFileLampiran}. Kosongkan jika tidak diubah)` : ""}</FormLabel><FormControl><Input type="file" onChange={(e) => onChange(e.target.files ? e.target.files[0] : null)} {...restField} /></FormControl><FormDescription>PDF, DOC, dll.</FormDescription><FormMessage /></FormItem>)} />
                    <DialogFooter className="pt-4"><Button type="button" variant="outline" onClick={() => {setIsFormOpen(false); setEditingTugas(null);}} disabled={isSubmitting}>Batal</Button><Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editingTugas ? "Simpan Perubahan" : "Simpan Tugas"}</Button></DialogFooter>
                </form>
            </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!tugasToDelete} onOpenChange={(open) => !open && setTugasToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus Tugas</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus tugas "{tugasToDelete?.judul}"? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTugasToDelete(null)} disabled={isSubmitting}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ya, Hapus Tugas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
