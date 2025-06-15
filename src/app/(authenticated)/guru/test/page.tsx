
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { ScrollText, FileQuestion, CheckSquare, Clock, BarChartHorizontalBig, PlusCircle, Search, Edit3, Trash2, PlayCircle, Loader2, CalendarClock } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
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

type TestStatus = "Terjadwal" | "Berlangsung" | "Selesai" | "Draf";
type TestType = "Kuis" | "Ulangan Harian" | "UTS" | "UAS" | "Lainnya";

interface Test {
  id: string;
  judul: string;
  mapel: string;
  kelas: string; // Bisa beberapa kelas, misal "X IPA 1, X IPA 2" atau "Semua Kelas X"
  tanggal: Date;
  durasi: number; // dalam menit
  status: TestStatus;
  tipe: TestType;
  jumlahSoal?: number;
  deskripsi?: string;
}

const testSchema = z.object({
  judul: z.string().min(5, { message: "Judul test minimal 5 karakter." }),
  mapel: z.string({ required_error: "Mata pelajaran wajib dipilih." }),
  kelas: z.string({ required_error: "Kelas wajib dipilih." }), // Untuk prototipe, kita buat string saja
  tanggal: z.date({ required_error: "Tanggal pelaksanaan wajib diisi." }),
  durasi: z.coerce.number().min(5, { message: "Durasi minimal 5 menit." }),
  tipe: z.enum(["Kuis", "Ulangan Harian", "UTS", "UAS", "Lainnya"], { required_error: "Tipe test wajib dipilih."}),
  jumlahSoal: z.coerce.number().min(1, { message: "Jumlah soal minimal 1."}).optional(),
  deskripsi: z.string().optional(),
});

type TestFormValues = z.infer<typeof testSchema>;

const initialMockTests: Test[] = [
  { id: "TEST001", judul: "Ujian Tengah Semester Matematika", mapel: "Matematika Wajib", kelas: "X IPA 1, X IPA 2", tanggal: new Date(new Date().setDate(new Date().getDate() + 10)), durasi: 90, status: "Terjadwal", tipe: "UTS", jumlahSoal: 25, deskripsi: "Materi Bab 1-5." },
  { id: "TEST002", judul: "Kuis Harian Fisika Bab 1", mapel: "Fisika", kelas: "XI IPA 3", tanggal: new Date(new Date().setDate(new Date().getDate() + 2)), durasi: 30, status: "Terjadwal", tipe: "Kuis", jumlahSoal: 10 },
  { id: "TEST003", judul: "Ulangan Harian Bahasa Inggris Chapter 3", mapel: "Bahasa Inggris", kelas: "XII IPS Semua", tanggal: new Date(new Date().setDate(new Date().getDate() - 1)), durasi: 45, status: "Berlangsung", tipe: "Ulangan Harian", jumlahSoal: 15, deskripsi: "Pastikan koneksi internet stabil." },
  { id: "TEST004", judul: "UAS Kimia Semester Ganjil", mapel: "Kimia", kelas: "XI IPA Semua", tanggal: new Date(new Date().setDate(new Date().getDate() - 30)), durasi: 120, status: "Selesai", tipe: "UAS", jumlahSoal: 40 },
];


export default function GuruTestPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [mockTests, setMockTests] = useState<Test[]>(initialMockTests);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<TestStatus | "semua">("semua");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  useEffect(() => {
    if (editingTest) {
      testForm.reset({
        judul: editingTest.judul,
        mapel: editingTest.mapel,
        kelas: editingTest.kelas,
        tanggal: editingTest.tanggal,
        durasi: editingTest.durasi,
        tipe: editingTest.tipe,
        jumlahSoal: editingTest.jumlahSoal,
        deskripsi: editingTest.deskripsi || "",
      });
    } else {
      testForm.reset({ judul: "", mapel: undefined, kelas: undefined, tanggal: new Date(new Date().setDate(new Date().getDate() + 7)), durasi: 60, tipe: undefined, jumlahSoal: undefined, deskripsi: "" });
    }
  }, [editingTest, testForm, isFormOpen]);

  if (!user || (user.role !== 'guru' && user.role !== 'superadmin')) {
    return <p>Akses Ditolak. Anda harus menjadi Guru untuk melihat halaman ini.</p>;
  }

  const handlePlaceholderAction = (action: string, id?: string) => {
     toast({ title: "Fitur Disimulasikan", description: `Tindakan "${action}" ${id ? `untuk test ${id} ` : ""}telah disimulasikan.`});
  };

  const handleFormSubmit = async (values: TestFormValues) => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

    if (editingTest) {
      setMockTests(prev => prev.map(t => t.id === editingTest.id ? { ...editingTest, ...values } : t));
      toast({ title: "Berhasil!", description: `Test "${values.judul}" telah diperbarui.` });
    } else {
      const newTest: Test = {
        id: `TEST${Date.now()}`,
        ...values,
        status: "Terjadwal", // Default status for new test
      };
      setMockTests(prev => [newTest, ...prev]);
      toast({ title: "Berhasil!", description: `Test "${values.judul}" telah dibuat.` });
    }
    setIsSubmitting(false);
    setIsFormOpen(false);
    setEditingTest(null);
  };

  const openFormDialog = (test?: Test) => {
    setEditingTest(test || null);
    setIsFormOpen(true);
  }
  
  const filteredTests = mockTests.filter(t => 
    (t.judul.toLowerCase().includes(searchTerm.toLowerCase()) || t.mapel.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterStatus === "semua" || t.status === filterStatus)
  );

  const getStatusBadgeClass = (status: TestStatus) => {
    switch(status) {
      case "Terjadwal": return "bg-blue-100 text-blue-800";
      case "Berlangsung": return "bg-yellow-100 text-yellow-800 animate-pulse";
      case "Selesai": return "bg-green-100 text-green-800";
      case "Draf": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
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
                        <CardDescription>Semua test/ujian yang telah dibuat atau dijadwalkan.</CardDescription>
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
                                <SelectItem value="Terjadwal">Terjadwal</SelectItem>
                                <SelectItem value="Berlangsung">Berlangsung</SelectItem>
                                <SelectItem value="Selesai">Selesai</SelectItem>
                                <SelectItem value="Draf">Draf</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
              {filteredTests.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Judul Test/Ujian</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Mapel & Kelas</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Tanggal & Durasi</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Tipe</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Tindakan</th>
                      </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                      {filteredTests.map((test) => (
                        <tr key={test.id}>
                          <td className="px-4 py-3 whitespace-normal text-sm font-medium text-foreground max-w-xs">{test.judul}
                            {test.deskripsi && <p className="text-xs text-muted-foreground truncate" title={test.deskripsi}>{test.deskripsi}</p>}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-foreground">{test.mapel}</div>
                            <div className="text-xs text-muted-foreground">{test.kelas}</div>
                          </td>
                           <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-muted-foreground">{format(test.tanggal, "dd MMM yyyy, HH:mm", { locale: localeID })}</div>
                            <div className="text-xs text-muted-foreground">{test.durasi} Menit</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">{test.tipe}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                             <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(test.status)}`}>
                              {test.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                             {test.status === "Terjadwal" && <Button variant="ghost" size="sm" onClick={() => handlePlaceholderAction(`Mulai Test`, test.id)} className="mr-1 text-green-600"><PlayCircle className="h-4 w-4 mr-1"/> Mulai</Button>}
                             <Button variant="ghost" size="sm" onClick={() => openFormDialog(test)} className="mr-1"><Edit3 className="h-4 w-4" /></Button>
                             <Button variant="ghost" size="sm" onClick={() => handlePlaceholderAction(`Hapus Test`, test.id)} className="text-destructive hover:text-destructive/80"><Trash2 className="h-4 w-4" /></Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
              <Button variant="outline" onClick={() => handlePlaceholderAction("Bank Soal")} className="justify-start text-left h-auto py-3">
                <FileQuestion className="mr-3 h-5 w-5" />
                <div>
                  <p className="font-semibold">Bank Soal</p>
                  <p className="text-xs text-muted-foreground">Kelola dan gunakan soal tersimpan.</p>
                </div>
              </Button>
              <Button variant="outline" onClick={() => handlePlaceholderAction("Pengaturan Acak Soal")} className="justify-start text-left h-auto py-3">
                <CheckSquare className="mr-3 h-5 w-5" />
                 <div>
                  <p className="font-semibold">Acak Soal & Opsi</p>
                  <p className="text-xs text-muted-foreground">Konfigurasi pengacakan.</p>
                </div>
              </Button>
               <Button variant="outline" onClick={() => handlePlaceholderAction("Pengaturan Waktu & Pembatasan")} className="justify-start text-left h-auto py-3">
                <Clock className="mr-3 h-5 w-5" />
                 <div>
                  <p className="font-semibold">Timer & Pembatasan Akses</p>
                  <p className="text-xs text-muted-foreground">Atur durasi dan jadwal.</p>
                </div>
              </Button>
               <Button variant="outline" onClick={() => handlePlaceholderAction("Pantau Pelaksanaan Test")} className="justify-start text-left h-auto py-3">
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
                        <FormField control={testForm.control} name="kelas" render={({ field }) => (<FormItem><FormLabel>Kelas Ditugaskan</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih kelas" /></SelectTrigger></FormControl><SelectContent>{mockKelasList.map(kls => (<SelectItem key={kls} value={kls}>{kls}</SelectItem>))}</SelectContent></Select><FormDescription className="text-xs">Pisahkan dengan koma untuk beberapa kelas.</FormDescription><FormMessage /></FormItem>)} />
                    </div>
                    <FormField control={testForm.control} name="tanggal" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Tanggal & Waktu Pelaksanaan</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP HH:mm", { locale: localeID }) : <span>Pilih tanggal & waktu</span>}<CalendarClock className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /><div className="p-3 border-t border-border"><Input type="time" defaultValue={field.value ? format(field.value, "HH:mm") : "08:00"} onChange={(e) => { const time = e.target.value.split(':'); const newDate = new Date(field.value || new Date()); newDate.setHours(parseInt(time[0]), parseInt(time[1])); field.onChange(newDate); }} className="w-full"/></div></PopoverContent></Popover><FormMessage /></FormItem>)} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField control={testForm.control} name="durasi" render={({ field }) => (<FormItem><FormLabel>Durasi (Menit)</FormLabel><FormControl><Input type="number" placeholder="Contoh: 90" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={testForm.control} name="tipe" render={({ field }) => (<FormItem><FormLabel>Tipe Test</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih tipe" /></SelectTrigger></FormControl><SelectContent>{ (["Kuis", "Ulangan Harian", "UTS", "UAS", "Lainnya"] as TestType[]).map(type => (<SelectItem key={type} value={type}>{type}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                    </div>
                    <FormField control={testForm.control} name="jumlahSoal" render={({ field }) => (<FormItem><FormLabel>Jumlah Soal (Opsional)</FormLabel><FormControl><Input type="number" placeholder="Contoh: 25" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={testForm.control} name="deskripsi" render={({ field }) => (<FormItem><FormLabel>Deskripsi/Instruksi (Opsional)</FormLabel><FormControl><Textarea placeholder="Instruksi tambahan untuk siswa..." {...field} rows={3} /></FormControl><FormMessage /></FormItem>)} />
                    <DialogFooter className="pt-4"><Button type="button" variant="outline" onClick={() => {setIsFormOpen(false); setEditingTest(null);}} disabled={isSubmitting}>Batal</Button><Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editingTest ? "Simpan Perubahan" : "Simpan Test"}</Button></DialogFooter>
                </form>
            </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
