
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/use-auth";
import { CalendarDays, Clock, UserCheck, AlertTriangle, PlusCircle, Edit, Search, Printer, Settings2, Building, Loader2 } from "lucide-react";
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

interface Ruangan {
  id: string;
  nama: string;
  kode: string;
  kapasitas: number;
  fasilitas?: string;
}

const ruanganSchema = z.object({
  nama: z.string().min(3, { message: "Nama ruangan minimal 3 karakter." }),
  kode: z.string().min(2, { message: "Kode ruangan minimal 2 karakter." }),
  kapasitas: z.coerce.number().min(1, { message: "Kapasitas minimal 1." }),
  fasilitas: z.string().optional(),
});

type RuanganFormValues = z.infer<typeof ruanganSchema>;

const initialRuangan: Ruangan[] = [
  { id: "R001", nama: "Ruang Kelas X IPA 1", kode: "X-IPA-1", kapasitas: 32, fasilitas: "Proyektor, AC" },
  { id: "R002", nama: "Laboratorium Fisika", kode: "LAB-FIS", kapasitas: 24, fasilitas: "Alat Praktikum Fisika, Proyektor" },
  { id: "R003", nama: "Aula Serbaguna", kode: "AULA", kapasitas: 150, fasilitas: "Sound System, Panggung" },
];

export default function AdminJadwalPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [ruanganList, setRuanganList] = useState<Ruangan[]>(initialRuangan);
  const [isRuanganDialogOpen, setIsRuanganDialogOpen] = useState(false);
  const [isRuanganFormOpen, setIsRuanganFormOpen] = useState(false);
  const [editingRuangan, setEditingRuangan] = useState<Ruangan | null>(null);
  const [ruanganToDelete, setRuanganToDelete] = useState<Ruangan | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ruanganForm = useForm<RuanganFormValues>({
    resolver: zodResolver(ruanganSchema),
    defaultValues: { nama: "", kode: "", kapasitas: 0, fasilitas: "" },
  });

  useEffect(() => {
    if (editingRuangan) {
      ruanganForm.reset(editingRuangan);
    } else {
      ruanganForm.reset({ nama: "", kode: "", kapasitas: 0, fasilitas: "" });
    }
  }, [editingRuangan, ruanganForm, isRuanganFormOpen]);

  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return <p>Akses Ditolak. Anda harus menjadi admin untuk melihat halaman ini.</p>;
  }

  const handlePlaceholderAction = (action: string) => {
    toast({ title: "Fitur Dalam Pengembangan", description: `Fungsi "${action}" belum diimplementasikan sepenuhnya.`});
  };

  const handleRuanganFormSubmit = async (values: RuanganFormValues) => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API

    if (editingRuangan) {
      setRuanganList(ruanganList.map(r => r.id === editingRuangan.id ? { ...editingRuangan, ...values } : r));
      toast({ title: "Berhasil!", description: `Ruangan ${values.nama} telah diperbarui.` });
    } else {
      const newRuangan: Ruangan = { id: `R${Date.now()}`, ...values };
      setRuanganList([...ruanganList, newRuangan]);
      toast({ title: "Berhasil!", description: `Ruangan ${values.nama} telah ditambahkan.` });
    }
    setIsSubmitting(false);
    setIsRuanganFormOpen(false);
    setEditingRuangan(null);
  };

  const openDeleteRuanganDialog = (ruangan: Ruangan) => {
    setRuanganToDelete(ruangan);
  };

  const handleDeleteRuanganConfirm = async () => {
    if (ruanganToDelete) {
      setIsSubmitting(true);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API
      setRuanganList(ruanganList.filter(r => r.id !== ruanganToDelete.id));
      toast({ title: "Dihapus!", description: `Ruangan ${ruanganToDelete.nama} telah dihapus.` });
      setIsSubmitting(false);
      setRuanganToDelete(null);
    }
  };
  
  const openRuanganForm = (ruangan?: Ruangan) => {
    setEditingRuangan(ruangan || null);
    setIsRuanganFormOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-semibold">Manajemen Jadwal Pelajaran</h1>
         <Button onClick={() => handlePlaceholderAction("Buat Jadwal Baru Keseluruhan")}>
          <PlusCircle className="mr-2 h-4 w-4" /> Buat Jadwal Baru
        </Button>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarDays className="mr-2 h-6 w-6 text-primary" />
            Pengelolaan Jadwal Terpusat
          </CardTitle>
          <CardDescription>
            Modul ini dirancang untuk memfasilitasi pembuatan, pengelolaan, dan publikasi jadwal pelajaran secara efisien dan terintegrasi untuk seluruh tingkatan kelas dan program studi.
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
              <Button variant="outline" onClick={() => handlePlaceholderAction("Konfigurasi Jam Pelajaran")} className="justify-start text-left h-auto py-3">
                <Settings2 className="mr-3 h-5 w-5" />
                <div>
                  <p className="font-semibold">Konfigurasi Jam & Hari</p>
                  <p className="text-xs text-muted-foreground">Atur slot waktu dan hari efektif.</p>
                </div>
              </Button>
              <Button variant="outline" onClick={() => handlePlaceholderAction("Buat Jadwal Kelas")} className="justify-start text-left h-auto py-3">
                <PlusCircle className="mr-3 h-5 w-5" />
                 <div>
                  <p className="font-semibold">Buat Jadwal per Kelas</p>
                  <p className="text-xs text-muted-foreground">Susun jadwal untuk satu kelas.</p>
                </div>
              </Button>
               <Button variant="outline" onClick={() => handlePlaceholderAction("Impor Jadwal")} className="justify-start text-left h-auto py-3">
                <Search className="mr-3 h-5 w-5" />
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
              <Button variant="outline" onClick={() => handlePlaceholderAction("Kelola Ketersediaan Guru")} className="justify-start text-left h-auto py-3">
                <UserCheck className="mr-3 h-5 w-5" />
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
              <Button variant="outline" onClick={() => handlePlaceholderAction("Deteksi Konflik Jadwal")} className="justify-start text-left h-auto py-3">
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
              <Button variant="outline" onClick={() => handlePlaceholderAction("Lihat Jadwal per Kelas")} className="justify-start text-left h-auto py-3">
                <Search className="mr-3 h-5 w-5" />
                <div>
                  <p className="font-semibold">Tampilan Jadwal Kelas</p>
                  <p className="text-xs text-muted-foreground">Lihat jadwal detail per kelas.</p>
                </div>
              </Button>
              <Button variant="outline" onClick={() => handlePlaceholderAction("Cetak Jadwal")} className="justify-start text-left h-auto py-3">
                 <Printer className="mr-3 h-5 w-5" />
                 <div>
                  <p className="font-semibold">Cetak Jadwal</p>
                  <p className="text-xs text-muted-foreground">Cetak jadwal per kelas/guru.</p>
                </div>
              </Button>
              <Button variant="outline" onClick={() => handlePlaceholderAction("Publikasi Jadwal")} className="justify-start text-left h-auto py-3">
                <Edit className="mr-3 h-5 w-5" />
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
               <Button variant="outline" onClick={() => handlePlaceholderAction("Jadwal Pengganti")} className="justify-start text-left h-auto py-3">
                <UserCheck className="mr-3 h-5 w-5" />
                <div>
                  <p className="font-semibold">Atur Jadwal Pengganti</p>
                  <p className="text-xs text-muted-foreground">Jika ada guru berhalangan.</p>
                </div>
              </Button>
              <Button variant="outline" onClick={() => handlePlaceholderAction("Notifikasi Perubahan")} className="justify-start text-left h-auto py-3">
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

      {/* Dialog untuk Manajemen Ruangan */}
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
            {ruanganList.length > 0 ? (
              <div className="overflow-x-auto border rounded-md max-h-96">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Nama Ruangan</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Kode</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground uppercase">Kapasitas</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Fasilitas</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground uppercase">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-border">
                    {ruanganList.map(r => (
                      <tr key={r.id}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">{r.nama}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-muted-foreground">{r.kode}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-muted-foreground text-center">{r.kapasitas}</td>
                        <td className="px-4 py-2 text-sm text-muted-foreground max-w-xs truncate" title={r.fasilitas}>{r.fasilitas || "-"}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-right text-sm">
                          <Button variant="ghost" size="sm" onClick={() => openRuanganForm(r)} className="mr-1"><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => openDeleteRuanganDialog(r)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground text-center">Belum ada data ruangan.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRuanganDialogOpen(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Form untuk Tambah/Edit Ruangan */}
      <Dialog open={isRuanganFormOpen} onOpenChange={(open) => { setIsRuanganFormOpen(open); if (!open) setEditingRuangan(null); }}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>{editingRuangan ? "Edit Ruangan" : "Tambah Ruangan Baru"}</DialogTitle>
            </DialogHeader>
            <Form {...ruanganForm}>
                <form onSubmit={ruanganForm.handleSubmit(handleRuanganFormSubmit)} className="space-y-4 py-2">
                    <FormField
                        control={ruanganForm.control}
                        name="nama"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nama Ruangan</FormLabel>
                                <FormControl><Input placeholder="Contoh: Kelas X IPA 1" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={ruanganForm.control}
                        name="kode"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Kode Ruangan</FormLabel>
                                <FormControl><Input placeholder="Contoh: X-IPA-1, LAB-BIO" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={ruanganForm.control}
                        name="kapasitas"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Kapasitas (Orang)</FormLabel>
                                <FormControl><Input type="number" placeholder="32" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={ruanganForm.control}
                        name="fasilitas"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fasilitas (Opsional)</FormLabel>
                                <FormControl><Textarea placeholder="Contoh: Proyektor, AC, Papan Tulis Digital" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <DialogFooter className="pt-2">
                        <Button type="button" variant="outline" onClick={() => {setIsRuanganFormOpen(false); setEditingRuangan(null);}} disabled={isSubmitting}>Batal</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editingRuangan ? "Simpan Perubahan" : "Simpan Ruangan"}
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
      </Dialog>
      
      {/* Alert Dialog untuk Konfirmasi Hapus Ruangan */}
      <AlertDialog open={!!ruanganToDelete} onOpenChange={(open) => !open && setRuanganToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Penghapusan Ruangan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus ruangan "{ruanganToDelete?.nama}"? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRuanganToDelete(null)} disabled={isSubmitting}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRuanganConfirm} className="bg-destructive hover:bg-destructive/90" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ya, Hapus Ruangan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
