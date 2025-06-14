
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/use-auth";
import { ClipboardList, PlusCircle, Edit, Trash2, Loader2 } from "lucide-react";
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

interface MataPelajaran {
  id: string;
  kode: string;
  nama: string;
  deskripsi: string;
  kategori: string;
}

const mataPelajaranSchema = z.object({
  kode: z.string().min(3, { message: "Kode minimal 3 karakter." }),
  nama: z.string().min(5, { message: "Nama minimal 5 karakter." }),
  deskripsi: z.string().min(10, { message: "Deskripsi minimal 10 karakter." }).optional().or(z.literal('')),
  kategori: z.enum(["Wajib Umum", "Wajib Peminatan IPA", "Wajib Peminatan IPS", "Pilihan Lintas Minat", "Muatan Lokal"], { required_error: "Kategori wajib diisi." }),
});

type MataPelajaranFormValues = z.infer<typeof mataPelajaranSchema>;

const initialMataPelajaran: MataPelajaran[] = [
  { id: "MP001", kode: "MTK-X", nama: "Matematika Kelas X", deskripsi: "Dasar-dasar matematika untuk kelas X.", kategori: "Wajib Umum" },
  { id: "MP002", kode: "FIS-XI-IPA", nama: "Fisika Kelas XI (IPA)", deskripsi: "Mekanika, Termodinamika, dan Optik.", kategori: "Wajib Peminatan IPA" },
  { id: "MP003", kode: "EKO-XII-IPS", nama: "Ekonomi Kelas XII (IPS)", deskripsi: "Ekonomi makro dan mikro lanjutan.", kategori: "Wajib Peminatan IPS" },
  { id: "MP004", kode: "BIG-UM", nama: "Bahasa Inggris Umum", deskripsi: "Kemampuan berbahasa Inggris umum.", kategori: "Wajib Umum" },
  { id: "MP005", kode: "SJR-LM-IPA", nama: "Sejarah (Lintas Minat IPA)", deskripsi: "Sejarah sebagai pilihan lintas minat.", kategori: "Pilihan Lintas Minat" },
];


export default function AdminMataPelajaranPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [mataPelajaranList, setMataPelajaranList] = useState<MataPelajaran[]>(initialMataPelajaran);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMapel, setEditingMapel] = useState<MataPelajaran | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [mapelToDelete, setMapelToDelete] = useState<MataPelajaran | null>(null);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);


  const form = useForm<MataPelajaranFormValues>({
    resolver: zodResolver(mataPelajaranSchema),
    defaultValues: {
      kode: "",
      nama: "",
      deskripsi: "",
      kategori: undefined,
    },
  });

  useEffect(() => {
    if (editingMapel) {
      form.reset(editingMapel);
    } else {
      form.reset({ kode: "", nama: "", deskripsi: "", kategori: undefined });
    }
  }, [editingMapel, form, isFormOpen]);


  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return <p>Akses Ditolak. Anda harus menjadi admin untuk melihat halaman ini.</p>;
  }

  const handleFormSubmit = async (values: MataPelajaranFormValues) => {
    setIsLoadingSubmit(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (editingMapel) {
      setMataPelajaranList(mataPelajaranList.map(mp => mp.id === editingMapel.id ? { ...mp, ...values } : mp));
      toast({ title: "Berhasil!", description: `Mata pelajaran ${values.nama} telah diperbarui.` });
    } else {
      const newMapel: MataPelajaran = { id: `MP${Date.now()}`, ...values };
      setMataPelajaranList([...mataPelajaranList, newMapel]);
      toast({ title: "Berhasil!", description: `Mata pelajaran ${values.nama} telah ditambahkan.` });
    }
    setIsLoadingSubmit(false);
    setIsFormOpen(false);
    setEditingMapel(null);
  };

  const handleEditMataPelajaran = (mapel: MataPelajaran) => {
    setEditingMapel(mapel);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (mapel: MataPelajaran) => {
    setMapelToDelete(mapel);
    setIsDeleting(true);
  };

  const handleDeleteConfirm = async () => {
    if (mapelToDelete) {
      setIsLoadingSubmit(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMataPelajaranList(mataPelajaranList.filter(mp => mp.id !== mapelToDelete.id));
      toast({ title: "Dihapus!", description: `Mata pelajaran ${mapelToDelete.nama} telah dihapus.` });
      setIsLoadingSubmit(false);
      setIsDeleting(false);
      setMapelToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-semibold">Manajemen Mata Pelajaran</h1>
        <Button onClick={() => { setEditingMapel(null); setIsFormOpen(true); }}>
          <PlusCircle className="mr-2 h-4 w-4" /> Tambah Mata Pelajaran
        </Button>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ClipboardList className="mr-2 h-6 w-6 text-primary" />
            Daftar Mata Pelajaran Sekolah
          </CardTitle>
          <CardDescription>
            Kelola semua mata pelajaran yang ditawarkan oleh sekolah. Mata pelajaran ini akan menjadi dasar penyusunan kurikulum dan jadwal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mataPelajaranList.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Kode</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Nama Mata Pelajaran</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Kategori</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Deskripsi</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {mataPelajaranList.map((mapel) => (
                    <tr key={mapel.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{mapel.kode}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{mapel.nama}</td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{mapel.kategori}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs truncate" title={mapel.deskripsi}>{mapel.deskripsi}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button variant="ghost" size="sm" onClick={() => handleEditMataPelajaran(mapel)} className="mr-2 text-blue-600 hover:text-blue-800">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(mapel)} className="text-red-600 hover:text-red-800">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
             <div className="p-6 text-center text-muted-foreground bg-muted/30 rounded-md">
                <p className="mb-2">Belum ada mata pelajaran yang ditambahkan.</p>
                <Button onClick={() => { setEditingMapel(null); setIsFormOpen(true); }}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Tambah Mata Pelajaran Pertama
                </Button>
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
              <FormField
                control={form.control}
                name="kode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kode Mata Pelajaran</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: MTK-X, FIS-XI-IPA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nama"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Mata Pelajaran</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Matematika Kelas X" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="kategori"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori mata pelajaran" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Wajib Umum">Wajib Umum</SelectItem>
                        <SelectItem value="Wajib Peminatan IPA">Wajib Peminatan IPA</SelectItem>
                        <SelectItem value="Wajib Peminatan IPS">Wajib Peminatan IPS</SelectItem>
                        <SelectItem value="Pilihan Lintas Minat">Pilihan Lintas Minat</SelectItem>
                        <SelectItem value="Muatan Lokal">Muatan Lokal</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="deskripsi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi (Opsional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Deskripsi singkat mata pelajaran..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setIsFormOpen(false); setEditingMapel(null); }} disabled={isLoadingSubmit}>
                  Batal
                </Button>
                <Button type="submit" disabled={isLoadingSubmit}>
                  {isLoadingSubmit && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingMapel ? "Simpan Perubahan" : "Simpan Mata Pelajaran"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Penghapusan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus mata pelajaran "{mapelToDelete?.nama}"? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMapelToDelete(null)} disabled={isLoadingSubmit}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90" disabled={isLoadingSubmit}>
              {isLoadingSubmit && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
