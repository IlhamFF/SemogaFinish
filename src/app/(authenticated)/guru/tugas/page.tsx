
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { FilePlus2, ListTodo, Edit3, CalendarClock, CheckSquare, PlusCircle, Search, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { id as localeID } from 'date-fns/locale';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { MOCK_SUBJECTS, SCHOOL_CLASSES_PER_MAJOR_GRADE, SCHOOL_GRADE_LEVELS, SCHOOL_MAJORS } from "@/lib/constants";

interface Tugas {
  id: string;
  mapel: string;
  judul: string;
  kelas: string;
  tenggat: Date;
  terkumpul: number;
  totalSiswa: number;
  status: "Aktif" | "Ditutup" | "Draf";
  deskripsi?: string;
  namaFileLampiran?: string;
}

const tugasSchema = z.object({
  judul: z.string().min(5, { message: "Judul tugas minimal 5 karakter." }),
  mapel: z.string({ required_error: "Mata pelajaran wajib dipilih." }),
  kelas: z.string({ required_error: "Kelas wajib dipilih." }),
  tenggat: z.date({ required_error: "Tanggal tenggat wajib diisi." }),
  deskripsi: z.string().optional(),
  fileLampiran: z.any().optional(), 
});

type TugasFormValues = z.infer<typeof tugasSchema>;

const initialMockTugas: Tugas[] = [
  { id: "TGS001", mapel: "Matematika Wajib", judul: "Latihan Aljabar Linier", kelas: "X IPA 1", tenggat: new Date(new Date().setDate(new Date().getDate() + 7)), terkumpul: 28, totalSiswa: 30, status: "Aktif", deskripsi: "Kerjakan soal 1-10 dari buku paket halaman 50." },
  { id: "TGS002", mapel: "Fisika", judul: "Laporan Praktikum Optik", kelas: "XI IPA 2", tenggat: new Date(new Date().setDate(new Date().getDate() - 2)), terkumpul: 25, totalSiswa: 25, status: "Ditutup", deskripsi: "Sertakan analisis data dan kesimpulan.", namaFileLampiran: "Panduan_Laporan_Optik.pdf" },
  { id: "TGS003", mapel: "Bahasa Indonesia", judul: "Analisis Puisi Chairil Anwar", kelas: "X IPS 3", tenggat: new Date(new Date().setDate(new Date().getDate() + 14)), terkumpul: 10, totalSiswa: 32, status: "Aktif", deskripsi: "Pilih satu puisi dan analisis unsur intrinsik dan ekstrinsiknya." },
];

export default function GuruTugasPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [mockTugas, setMockTugas] = useState<Tugas[]>(initialMockTugas);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMapel, setFilterMapel] = useState("semua");
  const [filterKelas, setFilterKelas] = useState("semua");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTugas, setEditingTugas] = useState<Tugas | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tugasForm = useForm<TugasFormValues>({
    resolver: zodResolver(tugasSchema),
    defaultValues: { judul: "", mapel: undefined, kelas: undefined, tenggat: new Date(), deskripsi: "", fileLampiran: undefined },
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

  useEffect(() => {
    if (editingTugas) {
      tugasForm.reset({
        judul: editingTugas.judul,
        mapel: editingTugas.mapel,
        kelas: editingTugas.kelas,
        tenggat: editingTugas.tenggat,
        deskripsi: editingTugas.deskripsi || "",
        fileLampiran: undefined, // File input tidak bisa di-prefill
      });
    } else {
      tugasForm.reset({ judul: "", mapel: undefined, kelas: undefined, tenggat: new Date(new Date().setDate(new Date().getDate() + 7)), deskripsi: "", fileLampiran: undefined });
    }
  }, [editingTugas, tugasForm, isFormOpen]);


  if (!user || (user.role !== 'guru' && user.role !== 'superadmin')) {
    return <p>Akses Ditolak. Anda harus menjadi Guru untuk melihat halaman ini.</p>;
  }

  const handlePlaceholderAction = (action: string, id?: string) => {
    toast({ title: "Fitur Disimulasikan", description: `Tindakan "${action}" ${id ? `untuk tugas ${id} ` : ""}telah disimulasikan.`});
  };

  const handleFormSubmit = async (values: TugasFormValues) => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

    if (editingTugas) {
      setMockTugas(prev => prev.map(t => t.id === editingTugas.id ? { 
        ...t, 
        ...values, 
        namaFileLampiran: values.fileLampiran ? (values.fileLampiran as File).name : t.namaFileLampiran, 
        tenggat: values.tenggat 
      } : t));
      toast({ title: "Berhasil!", description: `Tugas "${values.judul}" telah diperbarui.` });
    } else {
      const newTugas: Tugas = {
        id: `TGS${Date.now()}`,
        ...values,
        namaFileLampiran: values.fileLampiran ? (values.fileLampiran as File).name : undefined,
        tenggat: values.tenggat,
        terkumpul: 0,
        totalSiswa: 30, // Default mock
        status: "Aktif",
      };
      setMockTugas(prev => [newTugas, ...prev]);
      toast({ title: "Berhasil!", description: `Tugas "${values.judul}" telah dibuat.` });
    }
    setIsSubmitting(false);
    setIsFormOpen(false);
    setEditingTugas(null);
  };
  
  const openFormDialog = (tugas?: Tugas) => {
    setEditingTugas(tugas || null);
    setIsFormOpen(true);
  }

  const filteredTugas = mockTugas.filter(tugas => 
    (tugas.judul.toLowerCase().includes(searchTerm.toLowerCase()) || tugas.mapel.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterMapel === "semua" || tugas.mapel === filterMapel) &&
    (filterKelas === "semua" || tugas.kelas === filterKelas)
  );
  
  const uniqueMapelOptions = ["semua", ...new Set(mockTugas.map(t => t.mapel))];
  const uniqueKelasOptions = ["semua", ...new Set(mockTugas.map(t => t.kelas))];


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

          {filteredTugas.length > 0 ? (
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
                  {filteredTugas.map((tugas) => (
                    <tr key={tugas.id}>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-foreground">{tugas.judul}</div>
                        {tugas.namaFileLampiran && <div className="text-xs text-muted-foreground">Lampiran: {tugas.namaFileLampiran}</div>}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-foreground">{tugas.mapel}</div>
                        <div className="text-xs text-muted-foreground">{tugas.kelas}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">{format(tugas.tenggat, "dd MMM yyyy, HH:mm", { locale: localeID })}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">{`${tugas.terkumpul}/${tugas.totalSiswa}`}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tugas.status === "Aktif" ? "bg-green-100 text-green-800" : tugas.status === "Ditutup" ? "bg-gray-100 text-gray-800" : "bg-yellow-100 text-yellow-800"}`}>
                          {tugas.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button variant="ghost" size="sm" onClick={() => handlePlaceholderAction(`Lihat Pengumpulan`, tugas.id)} className="mr-2">
                          <Search className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openFormDialog(tugas)} className="mr-2">
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
              <Button variant="outline" onClick={() => handlePlaceholderAction("Bank Soal/Tugas")} className="justify-start text-left h-auto py-3">
                <ListTodo className="mr-3 h-5 w-5" />
                <div>
                  <p className="font-semibold">Bank Soal/Tugas</p>
                  <p className="text-xs text-muted-foreground">Gunakan template tugas.</p>
                </div>
              </Button>
              <Button variant="outline" onClick={() => handlePlaceholderAction("Pengaturan Notifikasi")} className="justify-start text-left h-auto py-3">
                <CheckSquare className="mr-3 h-5 w-5" />
                 <div>
                  <p className="font-semibold">Notifikasi Pengingat</p>
                  <p className="text-xs text-muted-foreground">Atur pengingat untuk siswa.</p>
                </div>
              </Button>
               <Button variant="outline" onClick={() => handlePlaceholderAction("Integrasi Penilaian")} className="justify-start text-left h-auto py-3">
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
                    <FormField control={tugasForm.control} name="deskripsi" render={({ field }) => (<FormItem><FormLabel>Deskripsi Tugas (Opsional)</FormLabel><FormControl><Textarea placeholder="Instruksi detail untuk siswa..." {...field} rows={3} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={tugasForm.control} name="fileLampiran" render={({ field }) => (<FormItem><FormLabel>File Lampiran (Opsional)</FormLabel><FormControl><Input type="file" onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)} /></FormControl><FormMessage /></FormItem>)} />
                    <DialogFooter className="pt-4"><Button type="button" variant="outline" onClick={() => {setIsFormOpen(false); setEditingTugas(null);}} disabled={isSubmitting}>Batal</Button><Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editingTugas ? "Simpan Perubahan" : "Simpan Tugas"}</Button></DialogFooter>
                </form>
            </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

