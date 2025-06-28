
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { ScrollText, PlusCircle, Search, Edit3, Trash2, PlayCircle, Loader2, CalendarClock, Users as UsersIcon, ListPlus } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { SCHOOL_CLASSES_PER_MAJOR_GRADE, SCHOOL_GRADE_LEVELS, SCHOOL_MAJORS } from "@/lib/constants";
import type { Test as TestType, TestStatus, TestTipe, TestSubmission, JadwalPelajaran, Soal } from "@/types"; 
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";


const testSchema = z.object({
  judul: z.string().min(5, { message: "Judul test minimal 5 karakter." }),
  mapel: z.string({ required_error: "Mata pelajaran wajib dipilih." }),
  kelas: z.string({ required_error: "Kelas wajib dipilih." }),
  tanggal: z.date({ required_error: "Tanggal pelaksanaan wajib diisi." }),
  durasi: z.coerce.number().min(5, { message: "Durasi minimal 5 menit." }),
  tipe: z.enum(["Kuis", "Ulangan Harian", "UTS", "UAS", "Lainnya"], { required_error: "Tipe test wajib dipilih."}),
  deskripsi: z.string().optional().nullable(),
  status: z.enum(["Draf", "Terjadwal", "Berlangsung", "Selesai", "Dinilai"]).optional(),
});

type TestFormValues = z.infer<typeof testSchema>;


export default function GuruTestPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [testList, setTestList] = useState<TestType[]>([]);
  const [isLoadingTest, setIsLoadingTest] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<TestStatus | "semua">("semua");
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<TestType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testToDelete, setTestToDelete] = useState<TestType | null>(null);
  
  const [isSubmissionDialogOpen, setIsSubmissionDialogOpen] = useState(false);
  const [selectedTestForSubmissions, setSelectedTestForSubmissions] = useState<TestType | null>(null);
  const [submissionsForTest, setSubmissionsForTest] = useState<TestSubmission[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [gradingValues, setGradingValues] = useState<Record<string, { nilai: string; catatanGuru: string }>>({});
  const [isGradingSubmitting, setIsGradingSubmitting] = useState<Record<string, boolean>>({});
  
  const [teachingSubjects, setTeachingSubjects] = useState<string[]>([]);
  const [isLoadingTeachingSubjects, setIsLoadingTeachingSubjects] = useState(true);
  
  // Soal Manager State
  const [isSoalManagerOpen, setIsSoalManagerOpen] = useState(false);
  const [currentTestForSoal, setCurrentTestForSoal] = useState<TestType | null>(null);
  const [allBankSoal, setAllBankSoal] = useState<Soal[]>([]);
  const [isLoadingBankSoal, setIsLoadingBankSoal] = useState(false);
  const [selectedSoalIds, setSelectedSoalIds] = useState<Set<string>>(new Set());
  const [isSoalSubmitting, setIsSoalSubmitting] = useState(false);


  const mockKelasList = React.useMemo(() => {
    const kls: string[] = ["Semua Kelas X", "Semua Kelas XI", "Semua Kelas XII"];
    SCHOOL_GRADE_LEVELS.forEach(grade => {
      SCHOOL_MAJORS.forEach(major => {
        for (let i = 1; i <= SCHOOL_CLASSES_PER_MAJOR_GRADE; i++) {
          kls.push(`${grade} ${major} ${i}`);
        }
      });
    });
    return kls.sort();
  }, []);

  const testForm = useForm<TestFormValues>({
    resolver: zodResolver(testSchema),
    defaultValues: { judul: "", mapel: undefined, kelas: undefined, tanggal: new Date(), durasi: 60, tipe: undefined, deskripsi: "", status: "Draf" },
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
      const data: TestType[] = await response.json();
      setTestList(data); 
    } catch (error: any) {
      toast({ title: "Error Mengambil Test", description: error.message, variant: "destructive" });
    } finally {
      setIsLoadingTest(false);
    }
  }, [user, toast]);

  const fetchTeachingSubjects = useCallback(async () => {
    if (!user || !user.id) return;
    setIsLoadingTeachingSubjects(true);
    try {
      const response = await fetch(`/api/jadwal/pelajaran?guruId=${user.id}`);
      if (!response.ok) throw new Error("Gagal mengambil data jadwal mengajar.");
      const jadwalList: JadwalPelajaran[] = await response.json();
      const uniqueSubjects = [...new Set(jadwalList.map(j => j.mapel.nama).filter(Boolean))].sort();
      setTeachingSubjects(uniqueSubjects);
    } catch (error: any) {
      toast({ title: "Error Data Mapel", description: error.message, variant: "destructive" });
    } finally {
      setIsLoadingTeachingSubjects(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user && (user.role === 'guru' || user.role === 'superadmin')) {
      fetchTests();
      fetchTeachingSubjects();
    }
  }, [user, fetchTests, fetchTeachingSubjects]);

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
          deskripsi: editingTest.deskripsi || "",
          status: editingTest.status
        });
      } else {
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 7);
        defaultDate.setHours(8, 0, 0, 0);
        testForm.reset({ judul: "", mapel: undefined, kelas: undefined, tanggal: defaultDate, durasi: 60, tipe: undefined, deskripsi: "", status: "Draf" });
      }
    }
  }, [editingTest, testForm, isFormOpen]);

  if (!user || (user.role !== 'guru' && user.role !== 'superadmin')) {
    return <p>Akses Ditolak. Anda harus menjadi Guru untuk melihat halaman ini.</p>;
  }

  const handleFormSubmit = async (values: TestFormValues) => {
    setIsSubmitting(true);
    const payload = { ...values, tanggal: formatISO(values.tanggal), status: values.status || (editingTest ? editingTest.status : "Draf"),};
    const url = editingTest ? `/api/test/${editingTest.id}` : '/api/test';
    const method = editingTest ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, { method: method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Gagal ${editingTest ? 'memperbarui' : 'membuat'} test.`);
      }
      toast({ title: "Berhasil!", description: `Test "${values.judul}" telah ${editingTest ? 'diperbarui' : 'dibuat'}.` });
      setIsFormOpen(false);
      setEditingTest(null);
      fetchTests();
    } catch (error: any) {
      toast({ title: "Error Menyimpan Test", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openFormDialog = (test?: TestType) => { setEditingTest(test || null); setIsFormOpen(true); }
  const openDeleteDialog = (test: TestType) => { setTestToDelete(test); };

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

  const filteredTests = useMemo(() => testList.filter(t => 
    (t.judul.toLowerCase().includes(searchTerm.toLowerCase()) || t.mapel.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterStatus === "semua" || t.status === filterStatus)
  ), [testList, searchTerm, filterStatus]);

  const getStatusBadgeClass = (status: TestStatus) => {
    switch(status) {
      case "Terjadwal": return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700";
      case "Berlangsung": return "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700 animate-pulse";
      case "Selesai": return "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700";
      case "Dinilai": return "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700";
      case "Draf": default: return "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700/30 dark:text-gray-300 dark:border-gray-600";
    }
  };

  const handleOpenSubmissionDialog = async (test: TestType) => {
    setSelectedTestForSubmissions(test);
    setIsLoadingSubmissions(true);
    setIsSubmissionDialogOpen(true);
    setGradingValues({});
    try {
      const response = await fetch(`/api/test/${test.id}/submissions`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal mengambil data submission test.");
      }
      const submissions: TestSubmission[] = await response.json();
      setSubmissionsForTest(submissions);
      const initialGradingValues: Record<string, { nilai: string; catatanGuru: string }> = {};
      submissions.forEach(sub => { initialGradingValues[sub.id] = { nilai: sub.nilai?.toString() || "", catatanGuru: sub.catatanGuru || "" }; });
      setGradingValues(initialGradingValues);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setSubmissionsForTest([]);
    } finally {
      setIsLoadingSubmissions(false);
    }
  };

  const handleGradingInputChange = (submissionId: string, field: 'nilai' | 'catatanGuru', value: string) => {
    setGradingValues(prev => ({ ...prev, [submissionId]: { ...prev[submissionId], [field]: value, } }));
  };

  const handleGradeTestSubmission = async (submission: TestSubmission) => {
    const gradeData = gradingValues[submission.id];
    if (!gradeData) {
      toast({ title: "Data Tidak Lengkap", description: "Nilai atau catatan belum diisi.", variant: "destructive" });
      return;
    }
    const parsedNilai = parseFloat(gradeData.nilai);
    if (gradeData.nilai && (isNaN(parsedNilai) || parsedNilai < 0 || parsedNilai > 100)) {
      toast({ title: "Nilai Tidak Valid", description: "Nilai harus antara 0 dan 100.", variant: "destructive" });
      return;
    }
    setIsGradingSubmitting(prev => ({...prev, [submission.id]: true}));
    try {
      const response = await fetch(`/api/test/submissions/${submission.id}/grade`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nilai: gradeData.nilai ? parsedNilai : null, catatanGuru: gradeData.catatanGuru }), });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal menyimpan penilaian.");
      }
      toast({ title: "Penilaian Test Disimpan", description: `Nilai untuk ${submission.siswa?.fullName || submission.siswa?.name} telah disimpan.` });
      setSubmissionsForTest(prevSubmissions => prevSubmissions.map(sub => sub.id === submission.id ? { ...sub, nilai: gradeData.nilai ? parsedNilai : null, catatanGuru: gradeData.catatanGuru, status: "Dinilai" as TestType['status'] } : sub));
    } catch (error: any) {
      toast({ title: "Error Penilaian", description: error.message, variant: "destructive" });
    } finally {
      setIsGradingSubmitting(prev => ({...prev, [submission.id]: false}));
    }
  };

  const handleOpenSoalManager = async (test: TestType) => {
    setCurrentTestForSoal(test);
    setIsSoalManagerOpen(true);
    setIsLoadingBankSoal(true);
    try {
      const [bankSoalRes, testSoalRes] = await Promise.all([
        fetch('/api/bank-soal'),
        fetch(`/api/test/${test.id}/soal`)
      ]);
      if(!bankSoalRes.ok) throw new Error("Gagal mengambil bank soal.");
      if(!testSoalRes.ok) throw new Error("Gagal mengambil soal test ini.");

      const bankSoalData: Soal[] = await bankSoalRes.json();
      const testSoalData: Soal[] = await testSoalRes.json();

      setAllBankSoal(bankSoalData);
      setSelectedSoalIds(new Set(testSoalData.map(s => s.id)));

    } catch (error:any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoadingBankSoal(false);
    }
  }

  const handleToggleSoalSelection = (soalId: string) => {
    setSelectedSoalIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(soalId)) {
        newSet.delete(soalId);
      } else {
        newSet.add(soalId);
      }
      return newSet;
    });
  };

  const handleSaveTestSoal = async () => {
    if (!currentTestForSoal) return;
    setIsSoalSubmitting(true);
    try {
      const response = await fetch(`/api/test/${currentTestForSoal.id}/soal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ soalIds: Array.from(selectedSoalIds) }),
      });
      if (!response.ok) throw new Error((await response.json()).message || "Gagal menyimpan perubahan soal.");
      toast({ title: "Berhasil!", description: `Daftar soal untuk test "${currentTestForSoal.judul}" telah diperbarui.` });
      setIsSoalManagerOpen(false);
      fetchTests(); // Refresh the main test list to update soalCount
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSoalSubmitting(false);
    }
  }


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-headline font-semibold">Manajemen Test & Ujian</h1>
            <p className="text-muted-foreground mt-1">Rancang, jadwalkan, dan kelola berbagai jenis tes untuk siswa.</p>
        </div>
        <Button onClick={() => openFormDialog()} disabled={isLoadingTest}>
          <PlusCircle className="mr-2 h-4 w-4" /> Buat Test Baru
        </Button>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><ScrollText className="mr-2 h-6 w-6 text-primary" />Daftar Test & Ujian</CardTitle>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
                <CardDescription>Total: {filteredTests.length} test/ujian.</CardDescription>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <div className="relative flex-grow sm:flex-grow-0"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Cari judul, mapel..." className="pl-8 w-full sm:w-[200px] lg:w-[250px]" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                    <Select value={filterStatus} onValueChange={(val) => setFilterStatus(val as TestStatus | "semua")}><SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Filter Status" /></SelectTrigger><SelectContent><SelectItem value="semua">Semua Status</SelectItem>{(["Draf", "Terjadwal", "Berlangsung", "Selesai", "Dinilai"] as TestStatus[]).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
                </div>
            </div>
        </CardHeader>
        <CardContent>
          {isLoadingTest ? (<div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /> <p className="ml-2">Memuat data test...</p></div>
          ) : filteredTests.length > 0 ? (
            <ScrollArea className="h-[60vh] border rounded-md">
              <Table>
                <TableHeader className="bg-muted/50 sticky top-0"><TableRow><TableHead className="min-w-[200px]">Judul Test/Ujian</TableHead><TableHead>Mapel & Kelas</TableHead><TableHead>Jadwal</TableHead><TableHead className="text-center">Soal</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Tindakan</TableHead></TableRow></TableHeader>
                <TableBody>{filteredTests.map((test) => (<TableRow key={test.id}><TableCell className="max-w-xs"><div className="font-medium truncate" title={test.judul}>{test.judul}</div>{test.deskripsi && <p className="text-xs text-muted-foreground truncate" title={test.deskripsi}>{test.deskripsi}</p>}</TableCell><TableCell><div className="text-sm">{test.mapel}</div><div className="text-xs text-muted-foreground">{test.kelas}</div></TableCell><TableCell><div className="text-sm">{format(parseISO(test.tanggal), "dd MMM yyyy, HH:mm", { locale: localeID })}</div><div className="text-xs text-muted-foreground">{test.durasi} Menit</div></TableCell><TableCell className="text-center">{test.soalCount ?? 0}</TableCell><TableCell><span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusBadgeClass(test.status)}`}>{test.status}</span></TableCell><td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium"><Button variant="outline" size="sm" onClick={() => handleOpenSoalManager(test)} className="mr-1"><ListPlus className="h-4 w-4 mr-1"/>Kelola Soal</Button>{(test.status === "Selesai" || test.status === "Dinilai") && <Button variant="ghost" size="sm" onClick={() => handleOpenSubmissionDialog(test)} className="mr-1"><UsersIcon className="h-4 w-4"/></Button>}<Button variant="ghost" size="icon" onClick={() => openFormDialog(test)} className="mr-1 h-8 w-8"><Edit3 className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => openDeleteDialog(test)} className="text-destructive hover:text-destructive/80 h-8 w-8"><Trash2 className="h-4 w-4" /></Button></td></TableRow>))}</TableBody>
              </Table>
            </ScrollArea>
          ) : (<div className="text-center py-8 text-muted-foreground"><ScrollText className="mx-auto h-12 w-12" /><p className="mt-2">Belum ada test/ujian yang dibuat atau filter tidak menemukan hasil.</p></div>)}
        </CardContent>
      </Card>
      <Dialog open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if (!open) setEditingTest(null); }}><DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col"><DialogHeader className="flex-shrink-0"><DialogTitle>{editingTest ? "Edit Test/Ujian" : "Buat Test/Ujian Baru"}</DialogTitle><DialogDescription>{editingTest ? `Perbarui detail untuk "${editingTest.judul}".` : "Isi detail test/ujian baru di bawah ini."}</DialogDescription></DialogHeader><Form {...testForm}><form onSubmit={testForm.handleSubmit(handleFormSubmit)} className="flex-grow flex flex-col overflow-y-hidden"><div className="flex-grow overflow-y-auto -m-6 p-6 space-y-4"><FormField control={testForm.control} name="judul" render={({ field }) => (<FormItem><FormLabel>Judul Test/Ujian</FormLabel><FormControl><Input placeholder="Ujian Tengah Semester Gasal" {...field} /></FormControl><FormMessage /></FormItem>)} /><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><FormField control={testForm.control} name="mapel" render={({ field }) => (<FormItem><FormLabel>Mata Pelajaran</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger>{isLoadingTeachingSubjects ? <Loader2 className="h-4 w-4 animate-spin" /> : <SelectValue placeholder="Pilih mapel" />}</SelectTrigger></FormControl><SelectContent>{teachingSubjects.map(subject => (<SelectItem key={subject} value={subject}>{subject}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} /><FormField control={testForm.control} name="kelas" render={({ field }) => (<FormItem><FormLabel>Kelas Ditugaskan</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih kelas" /></SelectTrigger></FormControl><SelectContent><ScrollArea className="h-60">{mockKelasList.map(kls => (<SelectItem key={kls} value={kls}>{kls}</SelectItem>))}</ScrollArea></SelectContent></Select><FormDescription className="text-xs">Bisa spesifik atau umum.</FormDescription><FormMessage /></FormItem>)} /></div><FormField control={testForm.control} name="tanggal" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Tanggal & Waktu</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP HH:mm", { locale: localeID }) : <span>Pilih tanggal & waktu</span>}<CalendarClock className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value || undefined} onSelect={field.onChange} initialFocus /><div className="p-3 border-t border-border"><Input type="time" defaultValue={field.value ? format(field.value, "HH:mm") : "08:00"} onChange={(e) => { const time = e.target.value.split(':'); const newDate = new Date(field.value || new Date()); newDate.setHours(parseInt(time[0]), parseInt(time[1])); field.onChange(newDate); }} className="w-full"/></div></PopoverContent></Popover><FormMessage /></FormItem>)} /><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><FormField control={testForm.control} name="durasi" render={({ field }) => (<FormItem><FormLabel>Durasi (Menit)</FormLabel><FormControl><Input type="number" placeholder="90" {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={testForm.control} name="tipe" render={({ field }) => (<FormItem><FormLabel>Tipe Test</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih tipe" /></SelectTrigger></FormControl><SelectContent>{ (["Kuis", "Ulangan Harian", "UTS", "UAS", "Lainnya"] as TestTipe[]).map(type => (<SelectItem key={type} value={type}>{type}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} /></div><FormField control={testForm.control} name="deskripsi" render={({ field }) => (<FormItem><FormLabel>Deskripsi/Instruksi (Opsional)</FormLabel><FormControl><Textarea placeholder="Instruksi tambahan..." {...field} value={field.value ?? ""} rows={3} /></FormControl><FormMessage /></FormItem>)} /><FormField control={testForm.control} name="status" render={({ field }) => (<FormItem><FormLabel>Status Test</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger></FormControl><SelectContent>{(["Draf", "Terjadwal", "Berlangsung", "Selesai", "Dinilai"] as TestStatus[]).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select><FormDescription>Atur status test.</FormDescription><FormMessage /></FormItem>)} /></div><DialogFooter className="flex-shrink-0 border-t pt-4"><Button type="button" variant="outline" onClick={() => {setIsFormOpen(false); setEditingTest(null);}} disabled={isSubmitting}>Batal</Button><Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editingTest ? "Simpan Perubahan" : "Simpan Test"}</Button></DialogFooter></form></Form></DialogContent></Dialog>
      <AlertDialog open={!!testToDelete} onOpenChange={(open) => !open && setTestToDelete(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Hapus Test</AlertDialogTitle><AlertDialogDescription>Yakin ingin hapus test "{testToDelete?.judul}"?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel onClick={() => setTestToDelete(null)} disabled={isSubmitting}>Batal</AlertDialogCancel><AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Hapus</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
      <Dialog open={isSubmissionDialogOpen} onOpenChange={setIsSubmissionDialogOpen}><DialogContent className="max-w-4xl max-h-[90vh] flex flex-col"><DialogHeader className="flex-shrink-0"><DialogTitle>Submission Test: {selectedTestForSubmissions?.judul}</DialogTitle><DialogDescription>Daftar siswa yang telah mengerjakan test ini. Mapel: {selectedTestForSubmissions?.mapel}, Kelas: {selectedTestForSubmissions?.kelas}</DialogDescription></DialogHeader><div className="flex-grow overflow-y-auto py-4">{isLoadingSubmissions ? (<div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>) : submissionsForTest.length > 0 ? (<Table><TableHeader><TableRow><TableHead className="w-[200px]">Nama Siswa</TableHead><TableHead>Waktu Mulai</TableHead><TableHead>Waktu Selesai</TableHead><TableHead>Status</TableHead><TableHead className="w-[100px]">Nilai</TableHead><TableHead>Catatan Guru</TableHead><TableHead className="text-right w-[120px]">Aksi</TableHead></TableRow></TableHeader><TableBody>{submissionsForTest.map((sub) => (<TableRow key={sub.id}><TableCell className="font-medium">{sub.siswa?.fullName || sub.siswa?.name || sub.siswaId}</TableCell><TableCell>{format(parseISO(sub.waktuMulai), "dd MMM, HH:mm:ss", { locale: localeID })}</TableCell><TableCell>{sub.waktuSelesai ? format(parseISO(sub.waktuSelesai), "dd MMM, HH:mm:ss", { locale: localeID }) : "-"}</TableCell><TableCell><Badge variant={sub.status === "Dinilai" ? "default" : sub.status === "Selesai" ? "secondary" : "outline"}>{sub.status}</Badge></TableCell><TableCell><Input type="number" min="0" max="100" value={gradingValues[sub.id]?.nilai || ""} onChange={(e) => handleGradingInputChange(sub.id, "nilai", e.target.value)} className="h-8 text-sm" disabled={isGradingSubmitting[sub.id] || sub.status === "Dinilai"} /></TableCell><TableCell><Textarea value={gradingValues[sub.id]?.catatanGuru || ""} onChange={(e) => handleGradingInputChange(sub.id, "catatanGuru", e.target.value)} className="text-xs min-h-[40px]" rows={1} placeholder="Catatan..." disabled={isGradingSubmitting[sub.id] || sub.status === "Dinilai"} /></TableCell><TableCell className="text-right">{sub.status !== "Dinilai" ? (<Button size="sm" onClick={() => handleGradeTestSubmission(sub)} disabled={isGradingSubmitting[sub.id]}>{isGradingSubmitting[sub.id] && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}Simpan Nilai</Button>) : (<Button variant="outline" size="sm" onClick={() => { setIsGradingSubmitting(prev => ({...prev, [sub.id]: false})); setSubmissionsForTest(prevSubs => prevSubs.map(s => s.id === sub.id ? {...s, status: "Selesai" as TestType['status']} : s)); }}><Edit3 className="mr-1 h-3 w-3" /> Ubah Nilai</Button>)}</TableCell></TableRow>))}</TableBody></Table>) : (<p className="text-center text-muted-foreground py-6">Belum ada siswa yang mengerjakan test ini.</p>)}</div><DialogFooter className="flex-shrink-0 border-t pt-4"><DialogClose asChild><Button variant="outline">Tutup</Button></DialogClose></DialogFooter></DialogContent></Dialog>
      
      <Dialog open={isSoalManagerOpen} onOpenChange={setIsSoalManagerOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Kelola Soal untuk: {currentTestForSoal?.judul}</DialogTitle>
            <DialogDescription>Pilih soal dari bank soal untuk ditambahkan ke dalam test ini. Total dipilih: {selectedSoalIds.size} soal.</DialogDescription>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto -mx-6 px-6 py-4 border-y">
            {isLoadingBankSoal ? (
              <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : allBankSoal.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow><TableHead className="w-10"></TableHead><TableHead>Pertanyaan</TableHead><TableHead>Paket</TableHead><TableHead>Tipe</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {allBankSoal.map(soal => (
                    <TableRow key={soal.id}>
                      <TableCell><Checkbox checked={selectedSoalIds.has(soal.id)} onCheckedChange={() => handleToggleSoalSelection(soal.id)} /></TableCell>
                      <TableCell className="max-w-md truncate" title={soal.pertanyaan}>{soal.pertanyaan}</TableCell>
                      <TableCell>{soal.paketSoal}</TableCell>
                      <TableCell>{soal.tipeSoal}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-center py-8">Bank soal Anda kosong. Silakan buat soal terlebih dahulu di menu Bank Soal.</p>
            )}
          </div>
          <DialogFooter className="flex-shrink-0">
            <Button variant="outline" onClick={() => setIsSoalManagerOpen(false)}>Batal</Button>
            <Button onClick={handleSaveTestSoal} disabled={isSoalSubmitting}>
              {isSoalSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>} Simpan Perubahan Soal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
