
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { FileQuestion, PlusCircle, Edit, Trash2, Loader2, Search } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import type { Soal, MataPelajaran, JadwalPelajaran, TingkatKesulitan } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const pilihanJawabanSchema = z.object({
  id: z.string().min(1, "ID Opsi tidak boleh kosong"),
  text: z.string().min(1, "Teks Opsi tidak boleh kosong"),
});

const soalSchema = z.object({
  pertanyaan: z.string().min(10, { message: "Pertanyaan minimal 10 karakter." }),
  mapelId: z.string({ required_error: "Mata pelajaran wajib dipilih." }),
  tingkatKesulitan: z.enum(["Mudah", "Sedang", "Sulit"], { required_error: "Tingkat kesulitan wajib dipilih." }),
  pilihanJawaban: z.array(pilihanJawabanSchema).min(2, "Minimal harus ada 2 pilihan jawaban."),
  kunciJawaban: z.string({ required_error: "Kunci jawaban wajib dipilih." }),
});

type SoalFormValues = z.infer<typeof soalSchema>;

export default function GuruBankSoalPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [soalList, setSoalList] = useState<Soal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSoal, setEditingSoal] = useState<Soal | null>(null);
  const [soalToDelete, setSoalToDelete] = useState<Soal | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [mapelOptions, setMapelOptions] = useState<MataPelajaran[]>([]);

  const soalForm = useForm<SoalFormValues>({
    resolver: zodResolver(soalSchema),
    defaultValues: {
      pertanyaan: "",
      mapelId: undefined,
      tingkatKesulitan: "Sedang",
      pilihanJawaban: [
        { id: "A", text: "" },
        { id: "B", text: "" },
        { id: "C", text: "" },
        { id: "D", text: "" },
      ],
      kunciJawaban: undefined,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: soalForm.control,
    name: "pilihanJawaban",
  });

  const fetchBankSoal = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/bank-soal');
      if (!response.ok) throw new Error("Gagal mengambil data bank soal.");
      setSoalList(await response.json());
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  const fetchMapelOptions = useCallback(async () => {
    try {
      const res = await fetch('/api/mapel');
      if (!res.ok) throw new Error('Gagal mengambil mapel');
      setMapelOptions(await res.json());
    } catch (e: any) {
      toast({ title: "Error Mapel", description: e.message, variant: "destructive" });
    }
  }, [toast]);

  useEffect(() => {
    if (user) {
      fetchBankSoal();
      fetchMapelOptions();
    }
  }, [user, fetchBankSoal, fetchMapelOptions]);
  
  useEffect(() => {
    if(isFormOpen) {
        if(editingSoal) {
            soalForm.reset({
                pertanyaan: editingSoal.pertanyaan,
                mapelId: editingSoal.mapel.id,
                tingkatKesulitan: editingSoal.tingkatKesulitan,
                pilihanJawaban: editingSoal.pilihanJawaban,
                kunciJawaban: editingSoal.kunciJawaban
            });
        } else {
            soalForm.reset({
                pertanyaan: "",
                mapelId: undefined,
                tingkatKesulitan: "Sedang",
                pilihanJawaban: [ { id: "A", text: "" }, { id: "B", text: "" }, { id: "C", text: "" }, { id: "D", text: "" } ],
                kunciJawaban: undefined,
            });
        }
    }
  }, [isFormOpen, editingSoal, soalForm]);


  const handleFormSubmit = async (values: SoalFormValues) => {
    setIsSubmitting(true);
    const url = editingSoal ? `/api/bank-soal/${editingSoal.id}` : '/api/bank-soal';
    const method = editingSoal ? 'PUT' : 'POST';
    try {
      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `Gagal ${editingSoal ? 'memperbarui' : 'menyimpan'} soal.`);
      }
      toast({ title: "Berhasil!", description: `Soal telah ${editingSoal ? 'diperbarui' : 'disimpan'}.` });
      setIsFormOpen(false);
      fetchBankSoal();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteConfirm = async () => {
    if (!soalToDelete) return;
    setIsSubmitting(true);
    try {
        const response = await fetch(`/api/bank-soal/${soalToDelete.id}`, { method: 'DELETE' });
        if(!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Gagal menghapus soal.');
        }
        toast({ title: "Soal Dihapus", description: "Soal berhasil dihapus dari bank soal."});
        fetchBankSoal();
    } catch (error: any) {
        toast({ title: "Error Hapus", description: error.message, variant: "destructive"});
    } finally {
        setIsSubmitting(false);
        setSoalToDelete(null);
    }
  }

  if (!user || (user.role !== 'guru' && user.role !== 'admin' && user.role !== 'superadmin')) {
    return <p>Akses Ditolak.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-semibold">Bank Soal</h1>
          <p className="text-muted-foreground mt-1">Kelola koleksi soal untuk kuis dan ujian.</p>
        </div>
        <Button onClick={() => { setEditingSoal(null); setIsFormOpen(true); }} disabled={isLoading}>
          <PlusCircle className="mr-2 h-4 w-4" /> Buat Soal Baru
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Daftar Soal</CardTitle>
          <CardDescription>Total {soalList.length} soal tersedia.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : (
            <ScrollArea className="h-[60vh] border rounded-md">
                <Table>
                    <TableHeader className="bg-muted/50 sticky top-0">
                        <TableRow>
                            <TableHead>Pertanyaan</TableHead>
                            <TableHead>Mapel</TableHead>
                            <TableHead>Kesulitan</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {soalList.map(soal => (
                            <TableRow key={soal.id}>
                                <TableCell className="font-medium max-w-lg truncate" title={soal.pertanyaan}>{soal.pertanyaan}</TableCell>
                                <TableCell>{soal.mapel?.nama}</TableCell>
                                <TableCell>{soal.tingkatKesulitan}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" onClick={() => { setEditingSoal(soal); setIsFormOpen(true); }}><Edit className="h-4 w-4"/></Button>
                                    <Button variant="ghost" size="sm" onClick={() => setSoalToDelete(soal)} className="text-destructive"><Trash2 className="h-4 w-4"/></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
      
      {/* Dialog Form Soal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>{editingSoal ? 'Edit Soal' : 'Buat Soal Baru'}</DialogTitle>
            <DialogDescription>Isi detail pertanyaan dan pilihan jawaban di bawah ini.</DialogDescription>
          </DialogHeader>
          <Form {...soalForm}>
            <form onSubmit={soalForm.handleSubmit(handleFormSubmit)} className="flex-grow flex flex-col overflow-y-hidden">
                <ScrollArea className="-m-6 p-6 space-y-6">
                    <FormField control={soalForm.control} name="pertanyaan" render={({ field }) => (<FormItem><FormLabel>Teks Pertanyaan</FormLabel><FormControl><Textarea rows={4} placeholder="Tuliskan pertanyaan di sini..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={soalForm.control} name="mapelId" render={({ field }) => (<FormItem><FormLabel>Mata Pelajaran</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih Mapel" /></SelectTrigger></FormControl><SelectContent>{mapelOptions.map(m => <SelectItem key={m.id} value={m.id}>{m.nama}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                        <FormField control={soalForm.control} name="tingkatKesulitan" render={({ field }) => (<FormItem><FormLabel>Tingkat Kesulitan</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih Kesulitan" /></SelectTrigger></FormControl><SelectContent>{["Mudah", "Sedang", "Sulit"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                    </div>
                    <div>
                        <FormField control={soalForm.control} name="kunciJawaban" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Pilihan Jawaban &amp; Kunci</FormLabel>
                                <FormDescription>Pilih salah satu opsi sebagai kunci jawaban yang benar.</FormDescription>
                                <RadioGroup onValueChange={field.onChange} value={field.value} className="space-y-2 pt-2">
                                    {fields.map((item, index) => (
                                        <div key={item.id} className="flex items-center gap-2">
                                            <RadioGroupItem value={item.id} id={`kunci-${item.id}`} />
                                            <FormField control={soalForm.control} name={`pilihanJawaban.${index}.text`} render={({ field }) => (<FormItem className="flex-grow"><FormControl><Input placeholder={`Teks untuk Opsi ${item.id}`} {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        </div>
                                    ))}
                                </RadioGroup>
                                <FormMessage>{soalForm.formState.errors.kunciJawaban?.message}</FormMessage>
                            </FormItem>
                        )}/>
                    </div>
                </ScrollArea>
                <DialogFooter className="flex-shrink-0 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} disabled={isSubmitting}>Batal</Button>
                    <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : "Simpan Soal"}</Button>
                </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Alert Dialog Hapus Soal */}
      <AlertDialog open={!!soalToDelete} onOpenChange={() => setSoalToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus Soal</AlertDialogTitle>
            <AlertDialogDescription>Apakah Anda yakin ingin menghapus soal ini dari bank soal? Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>} Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
