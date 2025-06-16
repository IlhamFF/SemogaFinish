
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { ScrollText, FileQuestion, CheckSquare, Clock, BarChartHorizontalBig, PlusCircle, Search, Edit3, Trash2, PlayCircle, Loader2, CalendarClock } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, parseISO, formatISO } from "date-fns";
import { id as localeID } from 'date-fns/locale';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { MOCK_SUBJECTS, SCHOOL_CLASSES_PER_MAJOR_GRADE, SCHOOL_GRADE_LEVELS, SCHOOL_MAJORS } from "@/lib/constants";
import type { Test, TestStatus, TestTipe } from "@/types"; // Import Test, TestStatus, TestTipe from global types
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";


const testSchema = z.object({
  judul: z.string().min(5, { message: "Judul test minimal 5 karakter." }),
  mapel: z.string({ required_error: "Mata pelajaran wajib dipilih." }),
  kelas: z.string({ required_error: "Kelas wajib dipilih." }),
  tanggal: z.date({ required_error: "Tanggal pelaksanaan wajib diisi." }),
  durasi: z.coerce.number().min(5, { message: "Durasi minimal 5 menit." }),
  tipe: z.enum(["Kuis", "Ulangan Harian", "UTS", "UAS", "Lainnya"], { required_error: "Tipe test wajib dipilih."}),
  jumlahSoal: z.coerce.number().min(1, { message: "Jumlah soal minimal 1."}).optional().nullable(),
  deskripsi: z.string().optional().nullable(),
  // Status will be handled by API, default to 'Draf' or 'Terjadwal' on creation
});

type TestFormValues = z.infer<typeof testSchema>;


export default function GuruTestPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [testList, setTestList] = useState<Test[]>([]);
  const [isLoadingTest, setIsLoadingTest] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<TestStatus | "semua">("semua");
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testToDelete, setTestToDelete] = useState<Test | null>(null);
  
  const mockKelasList = React.useMemo(() => {
    const kls: string[] = ["Semua Kelas X", "Semua Kelas XI", "Semua Kelas XII"];
    SCHOOL_GRADE_LEVELS.forEach(grade => {
      SCHOOL_MAJORS.forEach(major => {
        for (let i = 1; i <= SCHOOL_CLASSES_PER_MAJOR_GRADE; i++) {
          kls.push(`${grade} ${major} ${i}`);
        }
      });
    });
    return kls;
  }, []);

  const testForm = useForm<TestFormValues>({
    resolver: zodResolver(testSchema),
    defaultValues: { judul: "", mapel: undefined, kelas: undefined, tanggal: new Date(), durasi: 60, tipe: undefined, jumlahSoal: undefined, deskripsi: "" },
  });
  
  const fetchTests = useCallback(async () => {
    if (!user) return;
    setIsLoadingTest(true);
    try {
      const response = await fetch('/api/test');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal mengambil data test.");
      }
      const data: Test[] = await response.json();
      setTestList(data.map(t => ({...t, tanggal: t.tanggal ? parseISO(t.tanggal).toISOString() : new Date().toISOString() }))); // Keep as ISO string for consistency
    } catch (error: any) {
      toast({ title: "Error Test", description: error.message, variant: "destructive" });
    } finally {
      setIsLoadingTest(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user && (user.role === 'guru' || user.role === 'superadmin')) {
      fetchTests();
    }
  }, [user, fetchTests]);

  useEffect(() => {
    if (isFormOpen) {
      if (editingTest) {
        testForm.reset({
          judul: editingTest.judul,
          mapel: editingTest.mapel,
          kelas: editingTest.kelas,
          tanggal: editingTest.tanggal ? parseISO(editingTest.tanggal) : new Date(),
          durasi: editingTest.durasi,
          tipe: editingTest.tipe as TestTipe,
          jumlahSoal: editingTest.jumlahSoal ?? undefined,
          deskripsi: editingTest.deskripsi || "",
        });
      } else {
        testForm.reset({ judul: "", mapel: undefined, kelas: undefined, tanggal: new Date(new Date().setDate(new Date().getDate() + 7)), durasi: 60, tipe: undefined, jumlahSoal: undefined, deskripsi: "" });
      }
    }
  }, [editingTest, testForm, isFormOpen]);

  if (!user || (user.role !== 'guru' && user.role !== 'superadmin')) {
    return <p>Akses Ditolak. Anda harus menjadi Guru untuk melihat halaman ini.</p>;
  }

  const handleFormSubmit = async (values: TestFormValues) => {
    setIsSubmitting(true);
    const payload = {
      ...values,
      tanggal: formatISO(values.tanggal), // Convert Date to ISO string for API
      status: editingTest ? editingTest.status : "Draf", // Preserve status on edit, default Draf on create
    };

    const url = editingTest ? `/api/test/${editingTest.id}` : '/api/test';
    const method = editingTest ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Gagal ${editingTest ? 'memperbarui' : 'membuat'} test.`);
      }
      toast({ title: "Berhasil!", description: `Test "${values.judul}" telah ${editingTest ? 'diperbarui' : 'dibuat'}.` });
      setIsFormOpen(false);
      setEditingTest(null);
      fetchTests();
    } catch (error: any) {
      toast({ title: "Error Test", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openFormDialog = (test?: Test) => {
    setEditingTest(test || null);
    setIsFormOpen(true);
  }
  
  const openDeleteDialog = (test: Test) => {
    setTestToDelete(test);
  };

  const handleDeleteConfirm = async () => {
    if (testToDelete) {
      setIsSubmitting(true);
      try {
        const response = await fetch(`/api/test/${testToDelete.id}`, { method: 'DELETE' });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Gagal menghapus test.');
        }
        toast({ title: "Dihapus!", description: `Test "${testToDelete.judul}" telah dihapus.` });
        fetchTests();
      } catch (error: any) {
        toast({ title: "Error Hapus Test", description: error.message, variant: "destructive" });
      } finally {
        setIsSubmitting(false);
        setTestToDelete(null);
      }
    }
  };

  const filteredTests = testList.filter(t => 
    (t.judul.toLowerCase().includes(searchTerm.toLowerCase()) || t.mapel.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterStatus === "semua" || t.status === filterStatus)
  );

  const getStatusBadgeClass = (status: TestStatus) => {
    switch(status) {
      case "Terjadwal": return "bg-blue-100 text-blue-800 border-blue-300";
      case "Berlangsung": return "bg-yellow-100 text-yellow-800 border-yellow-300 animate-pulse";
      case "Selesai": return "bg-green-100 text-green-800 border-green-300";
      case "Dinilai": return "bg-purple-100 text-purple-800 border-purple-300";
      case "Draf": return "bg-gray-100 text-gray-800 border-gray-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-semibold">Manajemen Test & Ujian</h1>
        <Button onClick={() => openFormDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Buat Test Baru
        </Button>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ScrollText className="mr-2 h-6 w-6 text-primary" />
            Pembuatan dan Pelaksanaan Test/Ujian
          </CardTitle>
          <CardDescription>
            Rancang, jadwalkan, dan kelola berbagai jenis tes, kuis, atau ujian untuk siswa secara online.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                        <CardTitle className="text-xl">Daftar Test & Ujian</CardTitle>
                        <CardDescription>Total: {filteredTests.length} test/ujian.</CardDescription>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <div className="relative flex-grow sm:flex-grow-0">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Cari judul, mapel..." 
                                className="pl-8 w-full sm:w-[200px]" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={filterStatus} onValueChange={(val) => setFilterStatus(val as TestStatus | "semua")}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Filter Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="semua">Semua Status</SelectItem>
                                <SelectItem value="Draf">Draf</SelectItem>
                                <SelectItem value="Terjadwal">Terjadwal</SelectItem>
                                <SelectItem value="Berlangsung">Berlangsung</SelectItem>
                                <SelectItem value="Selesai">Selesai</SelectItem>
                                <SelectItem value="Dinilai">Dinilai</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
              {isLoadingTest ? (
                 <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : filteredTests.length > 0 ? (
                <ScrollArea className="h-[60vh] border rounded-md">
                  <Table>
                    <TableHeader className="bg-muted/50 sticky top-0">
                      <TableRow>
                        <TableHead>Judul Test/Ujian</TableHead>
                        <TableHead>Mapel & Kelas</TableHead>
                        <TableHead>Tanggal & Durasi</TableHead>
                        <TableHead>Tipe</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Tindakan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTests.map((test) => (
                        <TableRow key={test.id}>
                          <TableCell className="max-w-xs">
                            <div className="font-medium truncate" title={test.judul}>{test.judul}</div>
                            {test.deskripsi && <p className="text-xs text-muted-foreground truncate" title={test.deskripsi}>{test.deskripsi}</p>}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{test.mapel}</div>
                            <div className="text-xs text-muted-foreground">{test.kelas}</div>
                          </TableCell>
                           <TableCell>
                            <div className="text-sm text-muted-foreground">{format(parseISO(test.tanggal), "dd MMM yyyy, HH:mm", { locale: localeID })}</div>
                            <div className="text-xs text-muted-foreground">{test.durasi} Menit</div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{test.tipe}</TableCell>
                          <TableCell>
                             <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusBadgeClass(test.status)}`}>
                              {test.status}
                            </span>
                          </TableCell>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                             {test.status === "Terjadwal" && <Button variant="ghost" size="sm" onClick={() => toast({title:"Placeholder", description:"Mulai Test belum diimplementasikan."})} className="mr-1 text-green-600 hover:text-green-700"><PlayCircle className="h-4 w-4 mr-1"/> Mulai</Button>}
                             <Button variant="ghost" size="icon" onClick={() => openFormDialog(test)} className="mr-1 h-8 w-8"><Edit3 className="h-4 w-4" /></Button>
                             <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(test)} className="text-destructive hover:text-destructive/80 h-8 w-8"><Trash2 className="h-4 w-4" /></Button>
                          </td>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              ) : (
                 <div className="text-center py-8 text-muted-foreground">
                  <FileQuestion className="mx-auto h-12 w-12" />
                  <p className="mt-2">Belum ada test/ujian yang dibuat atau filter tidak menemukan hasil.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <FileQuestion className="mr-3 h-5 w-5 text-primary" />
                Fitur Pembuatan Soal & Pengaturan Test
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Button variant="outline" onClick={() => toast({title:"Placeholder", description:"Bank Soal belum diimplementasikan."})} className="justify-start text-left h-auto py-3">
                <FileQuestion className="mr-3 h-5 w-5" />
                <div>
                  <p className="font-semibold">Bank Soal</p>
                  <p className="text-xs text-muted-foreground">Kelola dan gunakan soal tersimpan.</p>
                </div>
              </Button>
              <Button variant="outline" onClick={() => toast({title:"Placeholder", description:"Pengaturan Acak Soal belum diimplementasikan."})} className="justify-start text-left h-auto py-3">
                <CheckSquare className="mr-3 h-5 w-5" />
                 <div>
                  <p className="font-semibold">Acak Soal & Opsi</p>
                  <p className="text-xs text-muted-foreground">Konfigurasi pengacakan.</p>
                </div>
              </Button>
               <Button variant="outline" onClick={() => toast({title:"Placeholder", description:"Pengaturan Waktu & Pembatasan belum diimplementasikan."})} className="justify-start text-left h-auto py-3">
                <Clock className="mr-3 h-5 w-5" />
                 <div>
                  <p className="font-semibold">Timer & Pembatasan Akses</p>
                  <p className="text-xs text-muted-foreground">Atur durasi dan jadwal.</p>
                </div>
              </Button>
               <Button variant="outline" onClick={() => toast({title:"Placeholder", description:"Pantau Pelaksanaan Test belum diimplementasikan."})} className="justify-start text-left h-auto py-3">
                <BarChartHorizontalBig className="mr-3 h-5 w-5" />
                 <div>
                  <p className="font-semibold">Monitoring Real-time</p>
                  <p className="text-xs text-muted-foreground">Pantau siswa saat ujian.</p>
                </div>
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Dialog Form Tambah/Edit Test */}
      <Dialog open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if (!open) setEditingTest(null); }}>
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle>{editingTest ? "Edit Test/Ujian" : "Buat Test/Ujian Baru"}</DialogTitle>
                <DialogDescription>{editingTest ? `Perbarui detail untuk "${editingTest.judul}".` : "Isi detail test/ujian baru di bawah ini."}</DialogDescription>
            </DialogHeader>
            <Form {...testForm}>
                <form onSubmit={testForm.handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
                    <FormField control={testForm.control} name="judul" render={({ field }) => (<FormItem><FormLabel>Judul Test/Ujian</FormLabel><FormControl><Input placeholder="Contoh: Ujian Tengah Semester Gasal" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField control={testForm.control} name="mapel" render={({ field }) => (<FormItem><FormLabel>Mata Pelajaran</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih mapel" /></SelectTrigger></FormControl><SelectContent>{MOCK_SUBJECTS.map(subject => (<SelectItem key={subject} value={subject}>{subject}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                        <FormField control={testForm.control} name="kelas" render={({ field }) => (<FormItem><FormLabel>Kelas Ditugaskan</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih kelas" /></SelectTrigger></FormControl><SelectContent>{mockKelasList.map(kls => (<SelectItem key={kls} value={kls}>{kls}</SelectItem>))}</SelectContent></Select><FormDescription className="text-xs">Bisa "Semua Kelas X", atau spesifik.</FormDescription><FormMessage /></FormItem>)} />
                    </div>
                    <FormField control={testForm.control} name="tanggal" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Tanggal & Waktu Pelaksanaan</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP HH:mm", { locale: localeID }) : <span>Pilih tanggal & waktu</span>}<CalendarClock className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value || undefined} onSelect={field.onChange} initialFocus /><div className="p-3 border-t border-border"><Input type="time" defaultValue={field.value ? format(field.value, "HH:mm") : "08:00"} onChange={(e) => { const time = e.target.value.split(':'); const newDate = new Date(field.value || new Date()); newDate.setHours(parseInt(time[0]), parseInt(time[1])); field.onChange(newDate); }} className="w-full"/></div></PopoverContent></Popover><FormMessage /></FormItem>)} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField control={testForm.control} name="durasi" render={({ field }) => (<FormItem><FormLabel>Durasi (Menit)</FormLabel><FormControl><Input type="number" placeholder="Contoh: 90" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={testForm.control} name="tipe" render={({ field }) => (<FormItem><FormLabel>Tipe Test</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih tipe" /></SelectTrigger></FormControl><SelectContent>{ (["Kuis", "Ulangan Harian", "UTS", "UAS", "Lainnya"] as TestTipe[]).map(type => (<SelectItem key={type} value={type}>{type}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                    </div>
                    <FormField control={testForm.control} name="jumlahSoal" render={({ field }) => (<FormItem><FormLabel>Jumlah Soal (Opsional)</FormLabel><FormControl><Input type="number" placeholder="Contoh: 25" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={testForm.control} name="deskripsi" render={({ field }) => (<FormItem><FormLabel>Deskripsi/Instruksi (Opsional)</FormLabel><FormControl><Textarea placeholder="Instruksi tambahan untuk siswa..." {...field} value={field.value ?? ""} rows={3} /></FormControl><FormMessage /></FormItem>)} />
                    <DialogFooter className="pt-4"><Button type="button" variant="outline" onClick={() => {setIsFormOpen(false); setEditingTest(null);}} disabled={isSubmitting}>Batal</Button><Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editingTest ? "Simpan Perubahan" : "Simpan Test"}</Button></DialogFooter>
                </form>
            </Form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!testToDelete} onOpenChange={(open) => !open && setTestToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus Test</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus test/ujian "{testToDelete?.judul}"? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTestToDelete(null)} disabled={isSubmitting}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ya, Hapus Test
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
