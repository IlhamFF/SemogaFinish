
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/use-auth";
import { CalendarDays, Clock, UserCheck, AlertTriangle, PlusCircle, Edit, Search, Printer, Settings2, Building, Loader2, Trash2, GripVertical, Upload, Users, CalendarCheck, FileSymlink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Ruangan, SlotWaktu } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


const ruanganSchema = z.object({
  nama: z.string().min(3, { message: "Nama ruangan minimal 3 karakter." }),
  kode: z.string().min(2, { message: "Kode ruangan minimal 2 karakter." }),
  kapasitas: z.coerce.number().min(1, { message: "Kapasitas minimal 1." }),
  fasilitas: z.string().optional(),
});
type RuanganFormValues = z.infer<typeof ruanganSchema>;

const slotWaktuFormSchema = z.object({ // Renamed to avoid conflict
  id: z.string().optional(), // To track existing slots
  namaSlot: z.string().min(3, { message: "Nama slot minimal 3 karakter." }),
  waktuMulai: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Format HH:MM, contoh: 07:30"}),
  waktuSelesai: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Format HH:MM, contoh: 09:00"}),
  urutan: z.coerce.number().optional().nullable(),
}).refine(data => data.waktuMulai < data.waktuSelesai, {
  message: "Waktu mulai harus sebelum waktu selesai.",
  path: ["waktuSelesai"],
});
type SlotWaktuFormValues = z.infer<typeof slotWaktuFormSchema>;

const konfigurasiJadwalSchema = z.object({
  slots: z.array(slotWaktuFormSchema).min(1, "Minimal ada satu slot waktu."),
  hariEfektif: z.array(z.string()).refine(value => value.some(item => item), {
    message: "Minimal pilih satu hari efektif.",
  }),
});
type KonfigurasiJadwalFormValues = z.infer<typeof konfigurasiJadwalSchema>;


const namaHari = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

// Mock data (akan digantikan dengan data dari API jika sudah terintegrasi)
const mockGuruKetersediaan = [
    { id: "G001", nama: "Ratna Dewi, S.Pd.", mapel: "Matematika", ketersediaan: "Tersedia Penuh"},
    { id: "G002", nama: "Dimas Prasetyo, M.Sc.", mapel: "Fisika", ketersediaan: "Senin & Rabu Pagi Tidak Tersedia"},
    { id: "G003", nama: "Indah Permatasari, S.Si.", mapel: "Kimia", ketersediaan: "Tersedia Penuh"},
];
const mockJadwalKelasContoh = [
    { hari: "Senin", waktu: "07:30-09:00", mapel: "Matematika", guru: "Ratna Dewi, S.Pd.", ruangan: "X IPA 1"},
    { hari: "Senin", waktu: "09:15-10:45", mapel: "Bahasa Indonesia", guru: "Budi Santoso, S.S.", ruangan: "X IPA 1"},
    { hari: "Selasa", waktu: "07:30-09:00", mapel: "Fisika", guru: "Dimas Prasetyo, M.Sc.", ruangan: "LAB-FIS"},
];


export default function AdminJadwalPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Ruangan State & Form
  const [ruanganList, setRuanganList] = useState<Ruangan[]>([]);
  const [isLoadingRuangan, setIsLoadingRuangan] = useState(true);
  const [isRuanganDialogOpen, setIsRuanganDialogOpen] = useState(false);
  const [isRuanganFormOpen, setIsRuanganFormOpen] = useState(false);
  const [editingRuangan, setEditingRuangan] = useState<Ruangan | null>(null);
  const [ruanganToDelete, setRuanganToDelete] = useState<Ruangan | null>(null);
  const [isRuanganSubmitting, setIsRuanganSubmitting] = useState(false);
  const ruanganForm = useForm<RuanganFormValues>({
    resolver: zodResolver(ruanganSchema),
    defaultValues: { nama: "", kode: "", kapasitas: 0, fasilitas: "" },
  });

  // Konfigurasi Jadwal (Jam & Hari) State & Form
  const [isKonfigurasiOpen, setIsKonfigurasiOpen] = useState(false);
  const [slotsWaktu, setSlotsWaktu] = useState<SlotWaktu[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(true);
  const [hariEfektif, setHariEfektif] = useState<string[]>(["Senin", "Selasa", "Rabu", "Kamis", "Jumat"]); // Tetap lokal
  const [isKonfigurasiSubmitting, setIsKonfigurasiSubmitting] = useState(false);
  const [slotsToDelete, setSlotsToDelete] = useState<string[]>([]); // Untuk menyimpan ID slot yang akan dihapus

  const konfigurasiForm = useForm<KonfigurasiJadwalFormValues>({
    resolver: zodResolver(konfigurasiJadwalSchema),
    defaultValues: {
      slots: [], 
      hariEfektif: hariEfektif,
    },
  });
  const { fields: slotFields, append: appendSlot, remove: removeSlot, move: moveSlot } = useFieldArray({
    control: konfigurasiForm.control,
    name: "slots",
  });

  // Dialog State
  const [isImporJadwalOpen, setIsImporJadwalOpen] = useState(false);
  const [isKetersediaanGuruOpen, setIsKetersediaanGuruOpen] = useState(false);
  const [isTampilanJadwalOpen, setIsTampilanJadwalOpen] = useState(false);
  const [isJadwalPenggantiOpen, setIsJadwalPenggantiOpen] = useState(false);


  const fetchRuangan = useCallback(async () => {
    setIsLoadingRuangan(true);
    try {
      const response = await fetch('/api/jadwal/ruangan');
      if (!response.ok) throw new Error('Gagal mengambil data ruangan');
      const data = await response.json();
      setRuanganList(data);
    } catch (error: any) {
      toast({ title: "Error Ruangan", description: error.message, variant: "destructive" });
    } finally {
      setIsLoadingRuangan(false);
    }
  }, [toast]);

  const fetchSlotsWaktu = useCallback(async () => {
    setIsLoadingSlots(true);
    try {
      const response = await fetch('/api/jadwal/slot-waktu');
      if (!response.ok) throw new Error('Gagal mengambil data slot waktu');
      const data = await response.json();
      setSlotsWaktu(data);
    } catch (error: any) {
      toast({ title: "Error Slot Waktu", description: error.message, variant: "destructive" });
    } finally {
      setIsLoadingSlots(false);
    }
  }, [toast]);

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'superadmin')) {
      fetchRuangan();
      fetchSlotsWaktu();
    }
  }, [user, fetchRuangan, fetchSlotsWaktu]);

  useEffect(() => {
    if (editingRuangan) {
      ruanganForm.reset({
        nama: editingRuangan.nama,
        kode: editingRuangan.kode,
        kapasitas: editingRuangan.kapasitas,
        fasilitas: editingRuangan.fasilitas || "",
      });
    } else {
      ruanganForm.reset({ nama: "", kode: "", kapasitas: 0, fasilitas: "" });
    }
  }, [editingRuangan, ruanganForm, isRuanganFormOpen]);

  useEffect(() => {
    if (isKonfigurasiOpen) {
      konfigurasiForm.reset({
        slots: slotsWaktu.map(s => ({ id: s.id, namaSlot: s.namaSlot, waktuMulai: s.waktuMulai, waktuSelesai: s.waktuSelesai, urutan: s.urutan })),
        hariEfektif: hariEfektif,
      });
      setSlotsToDelete([]); // Reset daftar slot yang akan dihapus saat dialog dibuka
    }
  }, [isKonfigurasiOpen, slotsWaktu, hariEfektif, konfigurasiForm]);


  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return <p>Akses Ditolak. Anda harus menjadi admin untuk melihat halaman ini.</p>;
  }

  const handlePlaceholderAction = (action: string) => {
    toast({ title: "Fitur Dalam Pengembangan", description: `Fungsi "${action}" belum diimplementasikan sepenuhnya.`});
  };

  const handleSimulateAction = (action: string, description: string) => {
     toast({ title: "Simulasi Berhasil", description: `Simulasi untuk "${action}" telah dijalankan. ${description}`});
  };

  const handleRuanganFormSubmit = async (values: RuanganFormValues) => {
    setIsRuanganSubmitting(true);
    const url = editingRuangan ? `/api/jadwal/ruangan/${editingRuangan.id}` : '/api/jadwal/ruangan';
    const method = editingRuangan ? 'PUT' : 'POST';
    const payload = editingRuangan ? { nama: values.nama, kapasitas: values.kapasitas, fasilitas: values.fasilitas } : values;

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Gagal ${editingRuangan ? 'memperbarui' : 'menambah'} ruangan.`);
      }
      toast({ title: "Berhasil!", description: `Ruangan ${values.nama} telah ${editingRuangan ? 'diperbarui' : 'ditambahkan'}.` });
      setIsRuanganFormOpen(false);
      setEditingRuangan(null);
      fetchRuangan();
    } catch (error: any) {
      toast({ title: "Error Ruangan", description: error.message, variant: "destructive" });
    } finally {
      setIsRuanganSubmitting(false);
    }
  };

  const openDeleteRuanganDialog = (ruangan: Ruangan) => {
    setRuanganToDelete(ruangan);
  };

  const handleDeleteRuanganConfirm = async () => {
    if (ruanganToDelete) {
      setIsRuanganSubmitting(true);
      try {
        const response = await fetch(`/api/jadwal/ruangan/${ruanganToDelete.id}`, { method: 'DELETE' });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Gagal menghapus ruangan.');
        }
        toast({ title: "Dihapus!", description: `Ruangan ${ruanganToDelete.nama} telah dihapus.` });
        fetchRuangan();
      } catch (error: any) {
        toast({ title: "Error Hapus Ruangan", description: error.message, variant: "destructive" });
      } finally {
        setIsRuanganSubmitting(false);
        setRuanganToDelete(null);
      }
    }
  };
  
  const openRuanganForm = (ruangan?: Ruangan) => {
    setEditingRuangan(ruangan || null);
    setIsRuanganFormOpen(true);
  }
  
  const handleRemoveSlot = (index: number) => {
    const slotToRemove = konfigurasiForm.getValues("slots")[index];
    if (slotToRemove && slotToRemove.id) {
      setSlotsToDelete(prev => [...prev, slotToRemove.id!]);
    }
    removeSlot(index);
  };

  const handleKonfigurasiSubmit = async (values: KonfigurasiJadwalFormValues) => {
    setIsKonfigurasiSubmitting(true);
    let success = true;
    const errors: string[] = [];

    // Process deletions
    for (const slotId of slotsToDelete) {
      try {
        const response = await fetch(`/api/jadwal/slot-waktu/${slotId}`, { method: 'DELETE' });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Gagal menghapus slot ID ${slotId}.`);
        }
      } catch (error: any) {
        success = false;
        errors.push(error.message);
      }
    }

    // Process creations and updates
    for (const slot of values.slots) {
      const payload = { namaSlot: slot.namaSlot, waktuMulai: slot.waktuMulai, waktuSelesai: slot.waktuSelesai, urutan: slot.urutan };
      const url = slot.id ? `/api/jadwal/slot-waktu/${slot.id}` : '/api/jadwal/slot-waktu';
      const method = slot.id ? 'PUT' : 'POST';
      try {
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Gagal ${slot.id ? 'memperbarui' : 'menambah'} slot "${slot.namaSlot}".`);
        }
      } catch (error: any) {
        success = false;
        errors.push(error.message);
      }
    }
    
    if (success && errors.length === 0) {
      setHariEfektif(values.hariEfektif); // Simpan hari efektif (lokal)
      toast({ title: "Berhasil!", description: "Konfigurasi jam dan hari telah disimpan."});
      fetchSlotsWaktu(); // Panggil ulang data slot waktu
      setSlotsToDelete([]); // Bersihkan daftar slot yang dihapus
      setIsKonfigurasiOpen(false);
    } else {
      toast({ title: "Error Konfigurasi", description: `Terjadi beberapa kesalahan: ${errors.join(", ")}`, variant: "destructive" });
    }
    setIsKonfigurasiSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-semibold">Manajemen Jadwal Pelajaran</h1>
         <Button onClick={() => handleSimulateAction("Buat Jadwal Baru Keseluruhan", "Proses pembuatan jadwal otomatis telah dimulai.")}>
          <PlusCircle className="mr-2 h-4 w-4" /> Buat Jadwal Baru (Otomatis)
        </Button>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarDays className="mr-2 h-6 w-6 text-primary" />
            Pengelolaan Jadwal Terpusat
          </CardTitle>
          <CardDescription>
            Modul ini dirancang untuk memfasilitasi pembuatan, pengelolaan, dan publikasi jadwal pelajaran secara efisien dan terintegrasi.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Clock className="mr-3 h-5 w-5 text-primary" />
                Pembuatan & Konfigurasi Jadwal
              </CardTitle>
              <CardDescription>
                Atur slot waktu, hari efektif, durasi pelajaran, dan buat jadwal per kelas atau tingkatan.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Button variant="outline" onClick={() => setIsKonfigurasiOpen(true)} className="justify-start text-left h-auto py-3">
                <Settings2 className="mr-3 h-5 w-5" />
                <div>
                  <p className="font-semibold">Konfigurasi Jam & Hari</p>
                  <p className="text-xs text-muted-foreground">Atur slot waktu dan hari efektif.</p>
                </div>
              </Button>
              <Button variant="outline" onClick={() => handleSimulateAction("Buat Jadwal per Kelas", "Pilih kelas dan mulai susun jadwal secara manual atau otomatis.")} className="justify-start text-left h-auto py-3">
                <CalendarCheck className="mr-3 h-5 w-5" />
                 <div>
                  <p className="font-semibold">Buat Jadwal per Kelas</p>
                  <p className="text-xs text-muted-foreground">Susun jadwal untuk satu kelas.</p>
                </div>
              </Button>
               <Button variant="outline" onClick={() => setIsImporJadwalOpen(true)} className="justify-start text-left h-auto py-3">
                <Upload className="mr-3 h-5 w-5" />
                 <div>
                  <p className="font-semibold">Impor Jadwal</p>
                  <p className="text-xs text-muted-foreground">Unggah jadwal dari template.</p>
                </div>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <UserCheck className="mr-3 h-5 w-5 text-primary" />
                Alokasi Guru & Ruangan
              </CardTitle>
              <CardDescription>
                Tetapkan guru pengampu untuk setiap mata pelajaran dan alokasikan ruangan kelas atau laboratorium.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Button variant="outline" onClick={() => setIsKetersediaanGuruOpen(true)} className="justify-start text-left h-auto py-3">
                <Users className="mr-3 h-5 w-5" />
                <div>
                  <p className="font-semibold">Ketersediaan Guru</p>
                  <p className="text-xs text-muted-foreground">Lihat dan atur jadwal guru.</p>
                </div>
              </Button>
              <Button variant="outline" onClick={() => setIsRuanganDialogOpen(true)} className="justify-start text-left h-auto py-3">
                <Building className="mr-3 h-5 w-5" />
                <div>
                  <p className="font-semibold">Manajemen Ruangan</p>
                  <p className="text-xs text-muted-foreground">Kelola daftar dan kapasitas.</p>
                </div>
              </Button>
              <Button variant="outline" onClick={() => handleSimulateAction("Deteksi Konflik Jadwal", "Tidak ditemukan konflik jadwal berdasarkan data saat ini.")} className="justify-start text-left h-auto py-3">
                 <AlertTriangle className="mr-3 h-5 w-5" />
                 <div>
                  <p className="font-semibold">Deteksi Konflik</p>
                  <p className="text-xs text-muted-foreground">Periksa bentrok jadwal.</p>
                </div>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <CalendarDays className="mr-3 h-5 w-5 text-primary" />
                Visualisasi & Publikasi
              </CardTitle>
              <CardDescription>
                Tampilkan jadwal dalam format yang mudah dibaca dan publikasikan kepada stakeholder.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Button variant="outline" onClick={() => setIsTampilanJadwalOpen(true)} className="justify-start text-left h-auto py-3">
                <Search className="mr-3 h-5 w-5" />
                <div>
                  <p className="font-semibold">Tampilan Jadwal Kelas</p>
                  <p className="text-xs text-muted-foreground">Lihat jadwal detail per kelas.</p>
                </div>
              </Button>
              <Button variant="outline" onClick={() => handleSimulateAction("Cetak Jadwal", "Jadwal untuk Kelas X IPA 1 telah diunduh dalam format PDF.")} className="justify-start text-left h-auto py-3">
                 <Printer className="mr-3 h-5 w-5" />
                 <div>
                  <p className="font-semibold">Cetak Jadwal</p>
                  <p className="text-xs text-muted-foreground">Cetak jadwal per kelas/guru.</p>
                </div>
              </Button>
              <Button variant="outline" onClick={() => handleSimulateAction("Publikasi Jadwal", "Jadwal semester baru telah dipublikasikan ke portal siswa dan guru.")} className="justify-start text-left h-auto py-3">
                <FileSymlink className="mr-3 h-5 w-5" /> 
                <div>
                  <p className="font-semibold">Publikasikan Jadwal</p>
                  <p className="text-xs text-muted-foreground">Umumkan jadwal terbaru.</p>
                </div>
              </Button>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Clock className="mr-3 h-5 w-5 text-primary" />
                 Manajemen Perubahan Jadwal
              </CardTitle>
              <CardDescription>
                Fasilitas untuk mengakomodasi perubahan jadwal insidental dan penjadwalan ulang.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
               <Button variant="outline" onClick={() => setIsJadwalPenggantiOpen(true)} className="justify-start text-left h-auto py-3">
                <UserCheck className="mr-3 h-5 w-5" />
                <div>
                  <p className="font-semibold">Atur Jadwal Pengganti</p>
                  <p className="text-xs text-muted-foreground">Jika ada guru berhalangan.</p>
                </div>
              </Button>
              <Button variant="outline" onClick={() => handleSimulateAction("Notifikasi Perubahan Jadwal", "Notifikasi perubahan jadwal untuk kelas XI IPS 2 telah dikirim.")} className="justify-start text-left h-auto py-3">
                 <AlertTriangle className="mr-3 h-5 w-5" />
                 <div>
                  <p className="font-semibold">Notifikasi Perubahan</p>
                  <p className="text-xs text-muted-foreground">Info ke guru/siswa terkait.</p>
                </div>
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Dialog Manajemen Ruangan */}
      <Dialog open={isRuanganDialogOpen} onOpenChange={setIsRuanganDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manajemen Ruangan Kelas & Laboratorium</DialogTitle>
            <DialogDescription>
              Lihat, tambah, edit, atau hapus data ruangan yang tersedia di sekolah.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Button onClick={() => openRuanganForm()}>
              <PlusCircle className="mr-2 h-4 w-4" /> Tambah Ruangan Baru
            </Button>
            {isLoadingRuangan ? (
                <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : ruanganList.length > 0 ? (
              <ScrollArea className="max-h-96 border rounded-md">
                <Table>
                  <TableHeader className="bg-muted/50 sticky top-0">
                    <TableRow>
                      <TableHead>Nama Ruangan</TableHead>
                      <TableHead>Kode</TableHead>
                      <TableHead className="text-center">Kapasitas</TableHead>
                      <TableHead>Fasilitas</TableHead>
                      <TableHead className="text-right">Tindakan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ruanganList.map(r => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.nama}</TableCell>
                        <TableCell>{r.kode}</TableCell>
                        <TableCell className="text-center">{r.kapasitas}</TableCell>
                        <TableCell className="max-w-xs truncate" title={r.fasilitas || ""}>{r.fasilitas || "-"}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => openRuanganForm(r)} className="mr-1"><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => openDeleteRuanganDialog(r)} className="text-destructive hover:text-destructive/80"><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            ) : (
              <p className="text-muted-foreground text-center">Belum ada data ruangan.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRuanganDialogOpen(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Form Tambah/Edit Ruangan */}
      <Dialog open={isRuanganFormOpen} onOpenChange={(open) => { setIsRuanganFormOpen(open); if (!open) setEditingRuangan(null); }}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>{editingRuangan ? "Edit Ruangan" : "Tambah Ruangan Baru"}</DialogTitle>
            </DialogHeader>
            <Form {...ruanganForm}>
                <form onSubmit={ruanganForm.handleSubmit(handleRuanganFormSubmit)} className="space-y-4 py-2">
                    <FormField control={ruanganForm.control} name="nama" render={({ field }) => (<FormItem><FormLabel>Nama Ruangan</FormLabel><FormControl><Input placeholder="Contoh: Kelas X IPA 1" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={ruanganForm.control} name="kode" render={({ field }) => (<FormItem><FormLabel>Kode Ruangan</FormLabel><FormControl><Input placeholder="Contoh: X-IPA-1, LAB-BIO" {...field} disabled={!!editingRuangan} /></FormControl>{editingRuangan && <FormMessage>Kode tidak dapat diubah.</FormMessage>}<FormMessage /></FormItem>)} />
                    <FormField control={ruanganForm.control} name="kapasitas" render={({ field }) => (<FormItem><FormLabel>Kapasitas (Orang)</FormLabel><FormControl><Input type="number" placeholder="32" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={ruanganForm.control} name="fasilitas" render={({ field }) => (<FormItem><FormLabel>Fasilitas (Opsional)</FormLabel><FormControl><Textarea placeholder="Contoh: Proyektor, AC, Papan Tulis Digital" {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>)} />
                    <DialogFooter className="pt-2"><Button type="button" variant="outline" onClick={() => {setIsRuanganFormOpen(false); setEditingRuangan(null);}} disabled={isRuanganSubmitting}>Batal</Button><Button type="submit" disabled={isRuanganSubmitting}>{isRuanganSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editingRuangan ? "Simpan Perubahan" : "Simpan Ruangan"}</Button></DialogFooter>
                </form>
            </Form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!ruanganToDelete} onOpenChange={(open) => !open && setRuanganToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Konfirmasi Penghapusan Ruangan</AlertDialogTitle><AlertDialogDescription>Apakah Anda yakin ingin menghapus ruangan "{ruanganToDelete?.nama}"? Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel onClick={() => setRuanganToDelete(null)} disabled={isRuanganSubmitting}>Batal</AlertDialogCancel><AlertDialogAction onClick={handleDeleteRuanganConfirm} className="bg-destructive hover:bg-destructive/90" disabled={isRuanganSubmitting}>{isRuanganSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Ya, Hapus Ruangan</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Konfigurasi Jam & Hari */}
      <Dialog open={isKonfigurasiOpen} onOpenChange={setIsKonfigurasiOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader><DialogTitle>Konfigurasi Jam Pelajaran & Hari Efektif</DialogTitle><DialogDescription>Atur slot waktu pelajaran dan pilih hari-hari efektif dalam seminggu.</DialogDescription></DialogHeader>
          <Form {...konfigurasiForm}>
            <form onSubmit={konfigurasiForm.handleSubmit(handleKonfigurasiSubmit)} className="space-y-6 py-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Slot Waktu Pelajaran</h3>
                {isLoadingSlots ? (
                     <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : (
                  <ScrollArea className="max-h-72 pr-2">
                    <div className="space-y-3">
                      {slotFields.map((field, index) => (
                          <Card key={field.id || `new-${index}`} className="p-3 relative">
                          <div className="flex items-start gap-2">
                              <Button type="button" variant="ghost" size="sm" className="cursor-grab p-1 mt-6" title="Geser urutan (fungsi belum aktif)" onClick={() => toast({title: "Info", description: "Fitur geser urutan slot belum aktif."})}><GripVertical className="h-4 w-4" /></Button>
                              <div className="flex-grow grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <FormField control={konfigurasiForm.control} name={`slots.${index}.namaSlot`} render={({ field: formField }) => (<FormItem><FormLabel className="text-xs">Nama Slot</FormLabel><FormControl><Input placeholder="Jam ke-1" {...formField} /></FormControl><FormMessage className="text-xs"/></FormItem>)} />
                              <FormField control={konfigurasiForm.control} name={`slots.${index}.waktuMulai`} render={({ field: formField }) => (<FormItem><FormLabel className="text-xs">Mulai (HH:MM)</FormLabel><FormControl><Input type="time" {...formField} /></FormControl><FormMessage className="text-xs"/></FormItem>)} />
                              <FormField control={konfigurasiForm.control} name={`slots.${index}.waktuSelesai`} render={({ field: formField }) => (<FormItem><FormLabel className="text-xs">Selesai (HH:MM)</FormLabel><FormControl><Input type="time" {...formField} /></FormControl><FormMessage className="text-xs"/></FormItem>)} />
                              </div>
                              <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveSlot(index)} className="text-destructive hover:text-destructive/80 absolute top-1 right-1"><Trash2 className="h-4 w-4" /></Button>
                          </div>
                          </Card>
                      ))}
                    </div>
                  </ScrollArea>
                )}
                <Button type="button" variant="outline" size="sm" onClick={() => appendSlot({ namaSlot: "", waktuMulai: "00:00", waktuSelesai: "00:00", urutan: slotsWaktu.length + 1 })} className="mt-2"><PlusCircle className="mr-2 h-4 w-4"/> Tambah Slot</Button>
                 <FormMessage>{konfigurasiForm.formState.errors.slots?.message || konfigurasiForm.formState.errors.slots?.root?.message}</FormMessage>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Hari Efektif Sekolah</h3>
                <FormField control={konfigurasiForm.control} name="hariEfektif" render={() => (<FormItem className="grid grid-cols-2 sm:grid-cols-3 gap-2">{namaHari.slice(0,6).map((hari) => (<FormField key={hari} control={konfigurasiForm.control} name="hariEfektif" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0 p-2 border rounded-md hover:bg-muted/50"><FormControl><Checkbox checked={field.value?.includes(hari)} onCheckedChange={(checked) => { return checked ? field.onChange([...field.value, hari]) : field.onChange(field.value?.filter(value => value !== hari))}}/></FormControl><FormLabel className="font-normal text-sm">{hari}</FormLabel></FormItem>)} />))} <FormMessage className="col-span-full">{konfigurasiForm.formState.errors.hariEfektif?.message}</FormMessage></FormItem>)} />
              </div>
              <DialogFooter className="pt-4"><Button type="button" variant="outline" onClick={() => setIsKonfigurasiOpen(false)} disabled={isKonfigurasiSubmitting}>Batal</Button><Button type="submit" disabled={isKonfigurasiSubmitting || isLoadingSlots}>{isKonfigurasiSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Simpan Konfigurasi</Button></DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog Impor Jadwal */}
      <Dialog open={isImporJadwalOpen} onOpenChange={setIsImporJadwalOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Impor Jadwal dari File</DialogTitle><DialogDescription>Unggah file (CSV, Excel) untuk mengimpor jadwal secara massal. (Simulasi)</DialogDescription></DialogHeader>
            <div className="py-4 space-y-4">
                <Input type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />
                <Button onClick={() => {handleSimulateAction("Impor File Jadwal", "File jadwal sedang diproses."); setIsImporJadwalOpen(false);}} className="w-full">Impor Jadwal</Button>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setIsImporJadwalOpen(false)}>Tutup</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Ketersediaan Guru */}
      <Dialog open={isKetersediaanGuruOpen} onOpenChange={setIsKetersediaanGuruOpen}>
        <DialogContent className="sm:max-w-lg">
            <DialogHeader><DialogTitle>Ketersediaan Guru</DialogTitle><DialogDescription>Lihat status ketersediaan guru untuk penjadwalan. (Data Mock)</DialogDescription></DialogHeader>
            <div className="py-4">
                <ScrollArea className="h-72 border rounded-md">
                    <Table>
                        <TableHeader><TableRow><TableHead>Nama Guru</TableHead><TableHead>Mapel</TableHead><TableHead>Status Ketersediaan</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {mockGuruKetersediaan.map(guru => (
                                <TableRow key={guru.id}><TableCell>{guru.nama}</TableCell><TableCell>{guru.mapel}</TableCell><TableCell>{guru.ketersediaan}</TableCell></TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setIsKetersediaanGuruOpen(false)}>Tutup</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Tampilan Jadwal Kelas */}
      <Dialog open={isTampilanJadwalOpen} onOpenChange={setIsTampilanJadwalOpen}>
        <DialogContent className="sm:max-w-xl">
            <DialogHeader><DialogTitle>Tampilan Jadwal Kelas (Contoh X IPA 1)</DialogTitle><DialogDescription>Jadwal pelajaran untuk kelas terpilih. (Data Mock)</DialogDescription></DialogHeader>
            <div className="py-4">
                <ScrollArea className="h-80 border rounded-md">
                    <Table>
                        <TableHeader><TableRow><TableHead>Hari</TableHead><TableHead>Waktu</TableHead><TableHead>Mata Pelajaran</TableHead><TableHead>Guru</TableHead><TableHead>Ruangan</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {mockJadwalKelasContoh.map((item, idx) => (
                                <TableRow key={idx}><TableCell>{item.hari}</TableCell><TableCell>{item.waktu}</TableCell><TableCell>{item.mapel}</TableCell><TableCell>{item.guru}</TableCell><TableCell>{item.ruangan}</TableCell></TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setIsTampilanJadwalOpen(false)}>Tutup</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Jadwal Pengganti */}
      <Dialog open={isJadwalPenggantiOpen} onOpenChange={setIsJadwalPenggantiOpen}>
          <DialogContent className="sm:max-w-lg">
              <DialogHeader><DialogTitle>Atur Jadwal Pengganti (Simulasi)</DialogTitle><DialogDescription>Pilih jadwal yang akan diganti dan tentukan guru pengganti.</DialogDescription></DialogHeader>
              <div className="py-4 space-y-4">
                  <p className="text-sm">Pilih Jadwal: (Dropdown/Selector Jadwal Terjadwal)</p>
                  <p className="text-sm">Pilih Guru Pengganti: (Dropdown/Selector Guru)</p>
                  <Button onClick={() => {handleSimulateAction("Pengaturan Jadwal Pengganti", "Guru pengganti telah dialokasikan."); setIsJadwalPenggantiOpen(false);}} className="w-full">Simpan Jadwal Pengganti</Button>
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setIsJadwalPenggantiOpen(false)}>Tutup</Button></DialogFooter>
          </DialogContent>
      </Dialog>

    </div>
  );
}

