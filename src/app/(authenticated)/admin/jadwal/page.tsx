
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/use-auth";
import { CalendarCheck, PlusCircle, Edit, Search, Loader2, Trash2, Save, Eraser, Building, Settings2, CalendarDays, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Ruangan, SlotWaktu, MataPelajaran, User as AppUser, JadwalPelajaran } from "@/types";
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
import { SCHOOL_GRADE_LEVELS, SCHOOL_MAJORS, SCHOOL_CLASSES_PER_MAJOR_GRADE } from "@/lib/constants";
import { Label } from "@/components/ui/label";


const ruanganSchema = z.object({
  nama: z.string().min(3, { message: "Nama ruangan minimal 3 karakter." }),
  kode: z.string().min(2, { message: "Kode ruangan minimal 2 karakter." }),
  kapasitas: z.coerce.number().min(1, { message: "Kapasitas minimal 1." }),
  fasilitas: z.string().optional(),
});
type RuanganFormValues = z.infer<typeof ruanganSchema>;

const slotWaktuFormSchema = z.object({
  id: z.string().optional(),
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

const jadwalPelajaranEntrySchema = z.object({
  id: z.string().uuid().optional(), 
  slotWaktuId: z.string().uuid({ message: "Slot waktu wajib dipilih."}),
  mapelId: z.string().uuid({ message: "Mata pelajaran wajib dipilih."}),
  guruId: z.string().uuid({ message: "Guru wajib dipilih."}),
  ruanganId: z.string().uuid({ message: "Ruangan wajib dipilih."}),
  catatan: z.string().optional().nullable(),
});
type JadwalPelajaranEntryFormValues = z.infer<typeof jadwalPelajaranEntrySchema>;


const NAMA_HARI = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

export default function AdminJadwalPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isRuanganFormOpen, setIsRuanganFormOpen] = useState(false);
  const [editingRuangan, setEditingRuangan] = useState<Ruangan | null>(null);
  const [ruanganToDelete, setRuanganToDelete] = useState<Ruangan | null>(null);
  const [isRuanganSubmitting, setIsRuanganSubmitting] = useState(false);
  const ruanganForm = useForm<RuanganFormValues>({ resolver: zodResolver(ruanganSchema), defaultValues: { nama: "", kode: "", kapasitas: 0, fasilitas: "" },});
  const [isKonfigurasiOpen, setIsKonfigurasiOpen] = useState(false);
  const [isKonfigurasiSubmitting, setIsKonfigurasiSubmitting] = useState(false);
  const [slotsToDelete, setSlotsToDelete] = useState<string[]>([]);
  const konfigurasiForm = useForm<KonfigurasiJadwalFormValues>({ resolver: zodResolver(konfigurasiJadwalSchema), defaultValues: { slots: [], hariEfektif: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"] },});
  const { fields: slotFields, append: appendSlot, remove: removeSlot } = useFieldArray({ control: konfigurasiForm.control, name: "slots",});
  const [isBuatJadwalManualOpen, setIsBuatJadwalManualOpen] = useState(false);
  const [selectedKelas, setSelectedKelas] = useState<string>("");
  const [selectedHari, setSelectedHari] = useState<string>("");
  const [jadwalPelajaranList, setJadwalPelajaranList] = useState<JadwalPelajaran[]>([]);
  const [isLoadingJadwalPelajaran, setIsLoadingJadwalPelajaran] = useState(false);
  const [isJadwalPelajaranSubmitting, setIsJadwalPelajaranSubmitting] = useState(false);
  const [editingJadwalPelajaranEntry, setEditingJadwalPelajaranEntry] = useState<JadwalPelajaran | JadwalPelajaranEntryFormValues | null>(null);
  const [isJadwalEntryFormOpen, setIsJadwalEntryFormOpen] = useState(false);
  const jadwalPelajaranEntryForm = useForm<JadwalPelajaranEntryFormValues>({ resolver: zodResolver(jadwalPelajaranEntrySchema), defaultValues: { slotWaktuId: undefined, mapelId: undefined, guruId: undefined, ruanganId: undefined, catatan: "" },});
  
  // Data State
  const [ruanganList, setRuanganList] = useState<Ruangan[]>([]);
  const [slotsWaktu, setSlotsWaktu] = useState<SlotWaktu[]>([]);
  const [hariEfektif, setHariEfektif] = useState<string[]>(["Senin", "Selasa", "Rabu", "Kamis", "Jumat"]);
  const [mapelOptions, setMapelOptions] = useState<MataPelajaran[]>([]);
  const [guruOptions, setGuruOptions] = useState<AppUser[]>([]);

  // Loading State
  const [isLoadingRuangan, setIsLoadingRuangan] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(true);

  const mockKelasList = React.useMemo(() => {
    const kls: string[] = [];
    SCHOOL_GRADE_LEVELS.forEach(grade => {
      SCHOOL_MAJORS.forEach(major => {
        for (let i = 1; i <= SCHOOL_CLASSES_PER_MAJOR_GRADE; i++) {
          kls.push(`${grade} ${major} ${i}`);
        }
      });
    });
    return kls.sort();
  }, []);

  const fetchRuangan = useCallback(async () => { setIsLoadingRuangan(true); try { const response = await fetch('/api/jadwal/ruangan'); if (!response.ok) throw new Error('Gagal mengambil data ruangan'); setRuanganList(await response.json()); } catch (e:any) { toast({ title: "Error Ruangan", description: e.message, variant: "destructive" });} finally { setIsLoadingRuangan(false);}}, [toast]);
  const fetchSlotsWaktu = useCallback(async () => { setIsLoadingSlots(true); try { const response = await fetch('/api/jadwal/slot-waktu'); if (!response.ok) throw new Error('Gagal mengambil data slot waktu'); setSlotsWaktu(await response.json()); } catch (e:any) { toast({ title: "Error Slot Waktu", description: e.message, variant: "destructive" });} finally { setIsLoadingSlots(false);}}, [toast]);
  const fetchMapelOptions = useCallback(async () => { try { const response = await fetch('/api/mapel'); if (!response.ok) throw new Error('Gagal mengambil mapel'); setMapelOptions(await response.json()); } catch (e:any) { toast({ title: "Error Mapel", description: e.message, variant: "destructive" });}}, [toast]);
  const fetchGuruOptions = useCallback(async () => { try { const response = await fetch('/api/users?role=guru'); if (!response.ok) throw new Error('Gagal mengambil guru'); setGuruOptions(await response.json()); } catch (e:any) { toast({ title: "Error Guru", description: e.message, variant: "destructive" });}}, [toast]);

  const fetchJadwalPelajaran = useCallback(async (kelas: string, hari: string) => {
    if (!kelas || !hari) { setJadwalPelajaranList([]); return; }
    setIsLoadingJadwalPelajaran(true);
    try {
      const response = await fetch(`/api/jadwal/pelajaran?kelas=${encodeURIComponent(kelas)}&hari=${encodeURIComponent(hari)}`);
      if (!response.ok) throw new Error('Gagal mengambil data jadwal pelajaran');
      setJadwalPelajaranList(await response.json());
    } catch (error: any) {
      toast({ title: "Error Jadwal Pelajaran", description: error.message, variant: "destructive" });
      setJadwalPelajaranList([]);
    } finally {
      setIsLoadingJadwalPelajaran(false);
    }
  }, [toast]);

  useEffect(() => { if (user && (user.role === 'admin' || user.role === 'superadmin')) { fetchRuangan(); fetchSlotsWaktu(); fetchMapelOptions(); fetchGuruOptions(); } }, [user, fetchRuangan, fetchSlotsWaktu, fetchMapelOptions, fetchGuruOptions]);
  useEffect(() => { if (selectedKelas && selectedHari) fetchJadwalPelajaran(selectedKelas, selectedHari); }, [selectedKelas, selectedHari, fetchJadwalPelajaran]);
  useEffect(() => { if (editingRuangan) ruanganForm.reset({...editingRuangan, fasilitas: editingRuangan.fasilitas || ""}); else ruanganForm.reset({ nama: "", kode: "", kapasitas: 0, fasilitas: "" }); }, [editingRuangan, ruanganForm, isRuanganFormOpen]);
  useEffect(() => { if (isKonfigurasiOpen) { konfigurasiForm.reset({ slots: slotsWaktu.map(s => ({ ...s })), hariEfektif }); setSlotsToDelete([]); } }, [isKonfigurasiOpen, slotsWaktu, hariEfektif, konfigurasiForm]);
  useEffect(() => {
    if (isJadwalEntryFormOpen) {
      if (editingJadwalPelajaranEntry && 'slotWaktuId' in editingJadwalPelajaranEntry) {
        jadwalPelajaranEntryForm.reset({ id: (editingJadwalPelajaranEntry as JadwalPelajaran).id, slotWaktuId: editingJadwalPelajaranEntry.slotWaktuId, mapelId: editingJadwalPelajaranEntry.mapelId, guruId: editingJadwalPelajaranEntry.guruId, ruanganId: editingJadwalPelajaranEntry.ruanganId, catatan: editingJadwalPelajaranEntry.catatan || "" });
      } else if (editingJadwalPelajaranEntry) {
        jadwalPelajaranEntryForm.reset(editingJadwalPelajaranEntry as JadwalPelajaranEntryFormValues);
      } else {
        jadwalPelajaranEntryForm.reset({ slotWaktuId: undefined, mapelId: undefined, guruId: undefined, ruanganId: undefined, catatan: "" });
      }
    }
  }, [isJadwalEntryFormOpen, editingJadwalPelajaranEntry, jadwalPelajaranEntryForm]);

  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) return <p>Akses Ditolak.</p>;

  const handleRuanganFormSubmit = async (values: RuanganFormValues) => { setIsRuanganSubmitting(true); const url = editingRuangan ? `/api/jadwal/ruangan/${editingRuangan.id}` : '/api/jadwal/ruangan'; const method = editingRuangan ? 'PUT' : 'POST'; const payload = editingRuangan ? { nama: values.nama, kapasitas: values.kapasitas, fasilitas: values.fasilitas } : values; try { const response = await fetch(url, { method: method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),}); if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.message || `Gagal ${editingRuangan ? 'memperbarui' : 'menambah'} ruangan.`); } toast({ title: "Berhasil!", description: `Ruangan ${values.nama} telah ${editingRuangan ? 'diperbarui' : 'ditambahkan'}.` }); setIsRuanganFormOpen(false); setEditingRuangan(null); fetchRuangan(); } catch (error: any) { toast({ title: "Error Ruangan", description: error.message, variant: "destructive" }); } finally { setIsRuanganSubmitting(false); }};
  const openDeleteRuanganDialog = (ruangan: Ruangan) => setRuanganToDelete(ruangan);
  const handleDeleteRuanganConfirm = async () => { if (ruanganToDelete) { setIsRuanganSubmitting(true); try { const response = await fetch(`/api/jadwal/ruangan/${ruanganToDelete.id}`, { method: 'DELETE' }); if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.message || 'Gagal menghapus ruangan.'); } toast({ title: "Dihapus!", description: `Ruangan ${ruanganToDelete.nama} telah dihapus.` }); fetchRuangan(); } catch (error: any) { toast({ title: "Error Hapus Ruangan", description: error.message, variant: "destructive" }); } finally { setIsRuanganSubmitting(false); setRuanganToDelete(null); } } };
  const openRuanganForm = (ruangan?: Ruangan) => { setEditingRuangan(ruangan || null); setIsRuanganFormOpen(true); }
  const handleRemoveSlot = (index: number) => { const slotToRemove = konfigurasiForm.getValues("slots")[index]; if (slotToRemove && slotToRemove.id) setSlotsToDelete(prev => [...prev, slotToRemove.id!]); removeSlot(index); };
  const handleKonfigurasiSubmit = async (values: KonfigurasiJadwalFormValues) => { setIsKonfigurasiSubmitting(true); let success = true; const errors: string[] = []; for (const slotId of slotsToDelete) { try { const response = await fetch(`/api/jadwal/slot-waktu/${slotId}`, { method: 'DELETE' }); if (!response.ok) throw new Error(`Gagal hapus slot ID ${slotId}.`); } catch (e:any) { success = false; errors.push(e.message);}} for (const slot of values.slots) { const payload = { namaSlot: slot.namaSlot, waktuMulai: slot.waktuMulai, waktuSelesai: slot.waktuSelesai, urutan: slot.urutan }; const url = slot.id ? `/api/jadwal/slot-waktu/${slot.id}` : '/api/jadwal/slot-waktu'; const method = slot.id ? 'PUT' : 'POST'; try { const response = await fetch(url, {method,headers: {'Content-Type':'application/json'},body:JSON.stringify(payload)}); if(!response.ok) throw new Error(`Gagal ${slot.id?'update':'tambah'} slot ${slot.namaSlot}.`);} catch(e:any){success=false;errors.push(e.message);}} if(success&&errors.length===0){setHariEfektif(values.hariEfektif);toast({title:"Berhasil!",description:"Konfigurasi jam & hari disimpan."});fetchSlotsWaktu();setSlotsToDelete([]);setIsKonfigurasiOpen(false);}else{toast({title:"Error Konfigurasi",description:`Kesalahan: ${errors.join(", ")}`,variant:"destructive"});}setIsKonfigurasiSubmitting(false);};
  const handleOpenBuatJadwalManual = () => { if (mockKelasList[0]) setSelectedKelas(mockKelasList[0]); if (hariEfektif[0]) setSelectedHari(hariEfektif[0]); setIsBuatJadwalManualOpen(true); };
  const handleJadwalEntryFormSubmit = (values: JadwalPelajaranEntryFormValues) => { const newEntry: JadwalPelajaran = { id: editingJadwalPelajaranEntry && 'id' in editingJadwalPelajaranEntry ? (editingJadwalPelajaranEntry as JadwalPelajaran).id : `draft-${Date.now()}`, hari: selectedHari, kelas: selectedKelas, ...values, slotWaktu: slotsWaktu.find(s => s.id === values.slotWaktuId), mapel: mapelOptions.find(m => m.id === values.mapelId), guru: guruOptions.find(g => g.id === values.guruId), ruangan: ruanganList.find(r => r.id === values.ruanganId),}; if (editingJadwalPelajaranEntry && 'id' in editingJadwalPelajaranEntry) { setJadwalPelajaranList(prev => prev.map(j => j.id === newEntry.id ? newEntry : j)); } else { setJadwalPelajaranList(prev => [...prev, newEntry]); } setIsJadwalEntryFormOpen(false); setEditingJadwalPelajaranEntry(null); };
  const handleSaveJadwalKelasHari = async () => { if (!selectedKelas || !selectedHari || jadwalPelajaranList.length === 0) { toast({ title: "Info", description: "Pilih kelas, hari, dan tambahkan minimal satu jadwal.", variant: "default" }); return; } setIsJadwalPelajaranSubmitting(true); const payload = jadwalPelajaranList.map(j => ({ hari: j.hari, kelas: j.kelas, slotWaktuId: j.slotWaktuId, mapelId: j.mapelId, guruId: j.guruId, ruanganId: j.ruanganId, catatan: j.catatan, })); try { const deleteResponse = await fetch(`/api/jadwal/pelajaran/by-criteria?kelas=${encodeURIComponent(selectedKelas)}&hari=${encodeURIComponent(selectedHari)}`, { method: 'DELETE' }); if (!deleteResponse.ok && deleteResponse.status !== 404) { const errorData = await deleteResponse.json(); throw new Error(errorData.message || `Gagal membersihkan jadwal lama untuk ${selectedKelas} - ${selectedHari}.`); } const response = await fetch('/api/jadwal/pelajaran/batch', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), }); const responseData = await response.json(); if (response.status === 207 && responseData.results) { const successes = responseData.results.filter((r:any) => r.success).length; const failures = responseData.results.filter((r:any) => !r.success); if (failures.length > 0) { toast({ title: "Sebagian Jadwal Gagal Disimpan", description: `Berhasil: ${successes}, Gagal: ${failures.length}. Error: ${failures.map((f:any) => f.error).join("; ")}`, variant: "destructive", duration: 7000 }); } else { toast({ title: "Berhasil!", description: `Jadwal untuk ${selectedKelas} - ${selectedHari} telah disimpan.` }); } fetchJadwalPelajaran(selectedKelas, selectedHari); } else if (!response.ok) { throw new Error(responseData.message || 'Gagal menyimpan jadwal pelajaran.'); } else { toast({ title: "Berhasil!", description: `Jadwal untuk ${selectedKelas} - ${selectedHari} telah disimpan.` }); fetchJadwalPelajaran(selectedKelas, selectedHari); } } catch (error: any) { toast({ title: "Error Simpan Jadwal", description: error.message, variant: "destructive" }); } finally { setIsJadwalPelajaranSubmitting(false); } };
  const handleEditJadwalEntry = (entry: JadwalPelajaran) => { setEditingJadwalPelajaranEntry(entry); jadwalPelajaranEntryForm.reset({ id: entry.id, slotWaktuId: entry.slotWaktuId, mapelId: entry.mapelId, guruId: entry.guruId, ruanganId: entry.ruanganId, catatan: entry.catatan || "" }); setIsJadwalEntryFormOpen(true); };
  const handleDeleteJadwalEntry = async (entryId: string) => { if (entryId.startsWith('draft-')) { setJadwalPelajaranList(prev => prev.filter(j => j.id !== entryId)); toast({title: "Entri Dihapus dari Draf", description: "Entri jadwal telah dihapus dari daftar saat ini."}); return; } setIsJadwalPelajaranSubmitting(true); try { const response = await fetch(`/api/jadwal/pelajaran/${entryId}`, { method: 'DELETE' }); if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.message || 'Gagal menghapus entri jadwal.'); } toast({ title: "Entri Dihapus!", description: "Entri jadwal telah dihapus dari database."}); if(selectedKelas && selectedHari) fetchJadwalPelajaran(selectedKelas, selectedHari); } catch (error: any) { toast({ title: "Error Hapus Entri", description: error.message, variant: "destructive" }); } finally { setIsJadwalPelajaranSubmitting(false); } };
  const handleClearJadwalKelasHari = async () => { if (!selectedKelas || !selectedHari) return; setIsJadwalPelajaranSubmitting(true); try { const response = await fetch(`/api/jadwal/pelajaran/by-criteria?kelas=${encodeURIComponent(selectedKelas)}&hari=${encodeURIComponent(selectedHari)}`, { method: 'DELETE', }); if (!response.ok && response.status !== 404) { const errorData = await response.json(); throw new Error(errorData.message || `Gagal membersihkan jadwal untuk ${selectedKelas} - ${selectedHari}.`); } toast({ title: "Jadwal Dikosongkan", description: `Semua jadwal untuk ${selectedKelas} - ${selectedHari} telah dihapus.`}); setJadwalPelajaranList([]); } catch (error: any) { toast({ title: "Error Kosongkan Jadwal", description: error.message, variant: "destructive" }); } finally { setIsJadwalPelajaranSubmitting(false); } };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-semibold">Manajemen Jadwal Pelajaran</h1>
         <Button onClick={handleOpenBuatJadwalManual}>
          <CalendarCheck className="mr-2 h-4 w-4" /> Buat Jadwal Manual
        </Button>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><CalendarDays className="mr-2 h-6 w-6 text-primary" />Pengelolaan Jadwal Terpusat</CardTitle>
          <CardDescription>Atur slot waktu, ruangan, dan buat jadwal pelajaran manual per kelas.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" onClick={() => setIsKonfigurasiOpen(true)} className="justify-start text-left h-auto py-3"><Settings2 className="mr-3 h-5 w-5" /><div><p className="font-semibold">Konfigurasi Jam & Hari</p><p className="text-xs text-muted-foreground">Atur slot waktu dan hari efektif.</p></div></Button>
            <Button variant="outline" onClick={() => setIsRuanganDialogOpen(true)} className="justify-start text-left h-auto py-3"><Building className="mr-3 h-5 w-5" /><div><p className="font-semibold">Manajemen Ruangan</p><p className="text-xs text-muted-foreground">Kelola daftar dan kapasitas.</p></div></Button>
        </CardContent>
      </Card>

      <Dialog open={isRuanganDialogOpen} onOpenChange={setIsRuanganDialogOpen}><DialogContent className="sm:max-w-2xl"><DialogHeader><DialogTitle>Manajemen Ruangan</DialogTitle><DialogDescription>Lihat, tambah, edit, atau hapus data ruangan.</DialogDescription></DialogHeader><div className="py-4 space-y-4"><Button onClick={() => openRuanganForm()}><PlusCircle className="mr-2 h-4 w-4" /> Tambah Ruangan</Button>{isLoadingRuangan ? (<div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>) : ruanganList.length > 0 ? (<ScrollArea className="max-h-96 border rounded-md"><Table><TableHeader className="bg-muted/50 sticky top-0"><TableRow><TableHead>Nama</TableHead><TableHead>Kode</TableHead><TableHead className="text-center">Kapasitas</TableHead><TableHead>Fasilitas</TableHead><TableHead className="text-right">Tindakan</TableHead></TableRow></TableHeader><TableBody>{ruanganList.map(r => (<TableRow key={r.id}><TableCell className="font-medium">{r.nama}</TableCell><TableCell>{r.kode}</TableCell><TableCell className="text-center">{r.kapasitas}</TableCell><TableCell className="max-w-xs truncate" title={r.fasilitas || ""}>{r.fasilitas || "-"}</TableCell><TableCell className="text-right"><Button variant="ghost" size="sm" onClick={() => openRuanganForm(r)} className="mr-1"><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="sm" onClick={() => openDeleteRuanganDialog(r)} className="text-destructive hover:text-destructive/80"><Trash2 className="h-4 w-4" /></Button></TableCell></TableRow>))}</TableBody></Table></ScrollArea>) : (<p className="text-muted-foreground text-center">Belum ada data ruangan.</p>)}</div><DialogFooter><Button variant="outline" onClick={() => setIsRuanganDialogOpen(false)}>Tutup</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={isRuanganFormOpen} onOpenChange={(open) => { setIsRuanganFormOpen(open); if (!open) setEditingRuangan(null); }}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>{editingRuangan ? "Edit Ruangan" : "Tambah Ruangan"}</DialogTitle></DialogHeader><Form {...ruanganForm}><form onSubmit={ruanganForm.handleSubmit(handleRuanganFormSubmit)} className="space-y-4 py-2"><FormField control={ruanganForm.control} name="nama" render={({ field }) => (<FormItem><FormLabel>Nama Ruangan</FormLabel><FormControl><Input placeholder="Contoh: Kelas X IPA 1" {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={ruanganForm.control} name="kode" render={({ field }) => (<FormItem><FormLabel>Kode</FormLabel><FormControl><Input placeholder="Contoh: X-IPA-1" {...field} disabled={!!editingRuangan} /></FormControl>{editingRuangan && <FormMessage>Kode tidak dapat diubah.</FormMessage>}<FormMessage /></FormItem>)} /><FormField control={ruanganForm.control} name="kapasitas" render={({ field }) => (<FormItem><FormLabel>Kapasitas</FormLabel><FormControl><Input type="number" placeholder="32" {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={ruanganForm.control} name="fasilitas" render={({ field }) => (<FormItem><FormLabel>Fasilitas</FormLabel><FormControl><Textarea placeholder="Proyektor, AC..." {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>)} /><DialogFooter className="pt-2"><Button type="button" variant="outline" onClick={() => {setIsRuanganFormOpen(false); setEditingRuangan(null);}} disabled={isRuanganSubmitting}>Batal</Button><Button type="submit" disabled={isRuanganSubmitting}>{isRuanganSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editingRuangan ? "Simpan" : "Tambah"}</Button></DialogFooter></form></Form></DialogContent></Dialog>
      <AlertDialog open={!!ruanganToDelete} onOpenChange={(open) => !open && setRuanganToDelete(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle><AlertDialogDescription>Yakin hapus ruangan "{ruanganToDelete?.nama}"?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel onClick={() => setRuanganToDelete(null)} disabled={isRuanganSubmitting}>Batal</AlertDialogCancel><AlertDialogAction onClick={handleDeleteRuanganConfirm} className="bg-destructive hover:bg-destructive/90" disabled={isRuanganSubmitting}>{isRuanganSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Hapus</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
      <Dialog open={isKonfigurasiOpen} onOpenChange={setIsKonfigurasiOpen}><DialogContent className="sm:max-w-xl"><DialogHeader><DialogTitle>Konfigurasi Jam & Hari</DialogTitle><DialogDescription>Atur slot waktu dan hari efektif.</DialogDescription></DialogHeader><Form {...konfigurasiForm}><form onSubmit={konfigurasiForm.handleSubmit(handleKonfigurasiSubmit)} className="space-y-6 py-4"><div><h3 className="text-lg font-medium mb-2">Slot Waktu</h3>{isLoadingSlots ? (<div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>) : (<ScrollArea className="max-h-72 pr-2"><div className="space-y-3">{slotFields.map((field, index) => (<Card key={field.id || `new-${index}`} className="p-3 relative"><div className="flex items-start gap-2"><div className="flex-grow grid grid-cols-1 sm:grid-cols-3 gap-3"><FormField control={konfigurasiForm.control} name={`slots.${index}.namaSlot`} render={({ field:ff }) => (<FormItem><FormLabel className="text-xs">Nama Slot</FormLabel><FormControl><Input placeholder="Jam ke-1" {...ff} /></FormControl><FormMessage className="text-xs"/></FormItem>)} /><FormField control={konfigurasiForm.control} name={`slots.${index}.waktuMulai`} render={({ field:ff }) => (<FormItem><FormLabel className="text-xs">Mulai</FormLabel><FormControl><Input type="time" {...ff} /></FormControl><FormMessage className="text-xs"/></FormItem>)} /><FormField control={konfigurasiForm.control} name={`slots.${index}.waktuSelesai`} render={({ field:ff }) => (<FormItem><FormLabel className="text-xs">Selesai</FormLabel><FormControl><Input type="time" {...ff} /></FormControl><FormMessage className="text-xs"/></FormItem>)} /></div><Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveSlot(index)} className="text-destructive hover:text-destructive/80 absolute top-1 right-1"><Trash2 className="h-4 w-4" /></Button></div></Card>))}</div></ScrollArea>)}<Button type="button" variant="outline" size="sm" onClick={() => appendSlot({ namaSlot: "", waktuMulai: "00:00", waktuSelesai: "00:00", urutan: slotsWaktu.length + 1 })} className="mt-2"><PlusCircle className="mr-2 h-4 w-4"/> Tambah Slot</Button><FormMessage>{konfigurasiForm.formState.errors.slots?.message || konfigurasiForm.formState.errors.slots?.root?.message}</FormMessage></div><div> <h3 className="text-lg font-medium mb-2">Hari Efektif</h3><FormField control={konfigurasiForm.control} name="hariEfektif" render={() => (<FormItem className="grid grid-cols-2 sm:grid-cols-3 gap-2">{NAMA_HARI.slice(0,6).map((hari) => (<FormField key={hari} control={konfigurasiForm.control} name="hariEfektif" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0 p-2 border rounded-md hover:bg-muted/50"><FormControl><Checkbox checked={field.value?.includes(hari)} onCheckedChange={(checked) => { return checked ? field.onChange([...field.value, hari]) : field.onChange(field.value?.filter(v => v !== hari))}}/></FormControl><FormLabel className="font-normal text-sm">{hari}</FormLabel></FormItem>)} />))} <FormMessage className="col-span-full">{konfigurasiForm.formState.errors.hariEfektif?.message}</FormMessage></FormItem>)} /></div><DialogFooter className="pt-4"><Button type="button" variant="outline" onClick={() => setIsKonfigurasiOpen(false)} disabled={isKonfigurasiSubmitting}>Batal</Button><Button type="submit" disabled={isKonfigurasiSubmitting || isLoadingSlots}>{isKonfigurasiSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Simpan</Button></DialogFooter></form></Form></DialogContent></Dialog>
      <Dialog open={isBuatJadwalManualOpen} onOpenChange={setIsBuatJadwalManualOpen}><DialogContent className="max-w-4xl max-h-[90vh] flex flex-col"><DialogHeader><DialogTitle>Buat/Edit Jadwal Pelajaran Manual</DialogTitle><DialogDescription>Pilih kelas dan hari, lalu susun jadwal pelajarannya.</DialogDescription></DialogHeader><div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-b pb-6"><div><Label htmlFor="select-kelas-jadwal">Pilih Kelas</Label><Select value={selectedKelas} onValueChange={setSelectedKelas}><SelectTrigger id="select-kelas-jadwal"><SelectValue placeholder="Pilih Kelas" /></SelectTrigger><SelectContent>{mockKelasList.map(kls => <SelectItem key={kls} value={kls}>{kls}</SelectItem>)}</SelectContent></Select></div><div><Label htmlFor="select-hari-jadwal">Pilih Hari</Label><Select value={selectedHari} onValueChange={setSelectedHari}><SelectTrigger id="select-hari-jadwal"><SelectValue placeholder="Pilih Hari" /></SelectTrigger><SelectContent>{hariEfektif.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent></Select></div></div><div className="flex-grow overflow-y-auto py-4">{isLoadingJadwalPelajaran && (<div className="flex justify-center items-center h-full"><Loader2 className="h-10 w-10 animate-spin text-primary" /> <p className="ml-3">Memuat jadwal...</p></div>)}{!isLoadingJadwalPelajaran && selectedKelas && selectedHari && (<><div className="flex justify-between items-center mb-4"><h3 className="text-lg font-semibold">Jadwal untuk: {selectedKelas} - {selectedHari}</h3><Button size="sm" onClick={() => { setEditingJadwalPelajaranEntry(null); jadwalPelajaranEntryForm.reset(); setIsJadwalEntryFormOpen(true); }}><PlusCircle className="mr-2 h-4 w-4"/> Tambah Pelajaran</Button></div>{jadwalPelajaranList.length > 0 ? (<ScrollArea className="max-h-[calc(90vh-350px)]"><Table><TableHeader><TableRow><TableHead>Slot Waktu</TableHead><TableHead>Mapel</TableHead><TableHead>Guru</TableHead><TableHead>Ruangan</TableHead><TableHead>Catatan</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader><TableBody>{jadwalPelajaranList.sort((a,b) => a.slotWaktu?.waktuMulai.localeCompare(b.slotWaktu?.waktuMulai || '') || 0).map(j => (<TableRow key={j.id}><TableCell>{j.slotWaktu?.namaSlot} ({j.slotWaktu?.waktuMulai}-{j.slotWaktu?.waktuSelesai})</TableCell><TableCell>{j.mapel?.nama}</TableCell><TableCell>{j.guru?.fullName || j.guru?.name}</TableCell><TableCell>{j.ruangan?.nama}</TableCell><TableCell className="max-w-[150px] truncate" title={j.catatan || ""}>{j.catatan || "-"}</TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => handleEditJadwalEntry(j)} className="mr-1 h-7 w-7"><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => handleDeleteJadwalEntry(j.id)} className="text-destructive h-7 w-7"><Trash2 className="h-4 w-4" /></Button></TableCell></TableRow>))}</TableBody></Table></ScrollArea>) : (<p className="text-muted-foreground text-center py-6">Belum ada jadwal pelajaran untuk kelas dan hari ini.</p>)}</>)}{!selectedKelas && !selectedHari && <p className="text-muted-foreground text-center py-6">Pilih kelas dan hari untuk melihat atau membuat jadwal.</p>}</div><DialogFooter className="pt-6 border-t"><Button variant="outline" onClick={() => setIsBuatJadwalManualOpen(false)} disabled={isJadwalPelajaranSubmitting}>Batal</Button><Button onClick={handleClearJadwalKelasHari} variant="destructive" className="mr-auto" disabled={isJadwalPelajaranSubmitting || jadwalPelajaranList.length === 0 || isLoadingJadwalPelajaran}><Eraser className="mr-2 h-4 w-4"/> Kosongkan Jadwal Hari Ini</Button><Button onClick={handleSaveJadwalKelasHari} disabled={isJadwalPelajaranSubmitting || jadwalPelajaranList.length === 0 || isLoadingJadwalPelajaran}><Save className="mr-2 h-4 w-4"/> Simpan Jadwal Kelas Ini</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={isJadwalEntryFormOpen} onOpenChange={setIsJadwalEntryFormOpen}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>{editingJadwalPelajaranEntry ? "Edit Entri Jadwal" : "Tambah Entri Jadwal Baru"}</DialogTitle><DialogDescription>Untuk {selectedKelas} - {selectedHari}</DialogDescription></DialogHeader><Form {...jadwalPelajaranEntryForm}><form onSubmit={jadwalPelajaranEntryForm.handleSubmit(handleJadwalEntryFormSubmit)} className="space-y-4 py-4"><FormField control={jadwalPelajaranEntryForm.control} name="slotWaktuId" render={({ field }) => (<FormItem><FormLabel>Slot Waktu</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih slot waktu" /></SelectTrigger></FormControl><SelectContent>{slotsWaktu.sort((a,b)=> a.waktuMulai.localeCompare(b.waktuMulai)).map(s => <SelectItem key={s.id} value={s.id}>{s.namaSlot} ({s.waktuMulai}-{s.waktuSelesai})</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} /><FormField control={jadwalPelajaranEntryForm.control} name="mapelId" render={({ field }) => (<FormItem><FormLabel>Mata Pelajaran</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih mapel" /></SelectTrigger></FormControl><SelectContent>{mapelOptions.map(m => <SelectItem key={m.id} value={m.id}>{m.nama} ({m.kode})</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} /><FormField control={jadwalPelajaranEntryForm.control} name="guruId" render={({ field }) => (<FormItem><FormLabel>Guru Pengampu</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih guru" /></SelectTrigger></FormControl><SelectContent>{guruOptions.map(g => <SelectItem key={g.id} value={g.id}>{g.fullName || g.name} ({g.email})</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} /><FormField control={jadwalPelajaranEntryForm.control} name="ruanganId" render={({ field }) => (<FormItem><FormLabel>Ruangan</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih ruangan" /></SelectTrigger></FormControl><SelectContent>{ruanganList.map(r => <SelectItem key={r.id} value={r.id}>{r.nama} ({r.kode}) - Kap: {r.kapasitas}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} /><FormField control={jadwalPelajaranEntryForm.control} name="catatan" render={({ field }) => (<FormItem><FormLabel>Catatan (Opsional)</FormLabel><FormControl><Textarea placeholder="Catatan tambahan..." {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>)} /><DialogFooter><Button type="button" variant="outline" onClick={() => setIsJadwalEntryFormOpen(false)}>Batal</Button><Button type="submit">Simpan Entri</Button></DialogFooter></form></Form></DialogContent></Dialog>
    </div>
  );
}

    