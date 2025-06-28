"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { FileQuestion, PlusCircle, Edit, Trash2, Loader2, Search, BookCopy, PackagePlus, ChevronsUpDown, Package } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import type { Soal, MataPelajaran, TingkatKesulitan, TipeSoal } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";


const pilihanJawabanSchema = z.object({
  id: z.string(),
  text: z.string().min(1, "Teks Opsi tidak boleh kosong"),
});

const soalSchema = z.object({
  paketSoal: z.string().min(3, { message: "Nama paket soal minimal 3 karakter."}),
  tipeSoal: z.enum(["Pilihan Ganda", "Esai"], { required_error: "Tipe soal wajib dipilih."}),
  pertanyaan: z.string().min(10, { message: "Pertanyaan minimal 10 karakter." }),
  mapelId: z.string({ required_error: "Mata pelajaran wajib dipilih." }),
  tingkatKesulitan: z.enum(["Mudah", "Sedang", "Sulit"], { required_error: "Tingkat kesulitan wajib dipilih." }),
  pilihanJawaban: z.array(pilihanJawabanSchema).optional(),
  kunciJawaban: z.string().optional(),
}).refine(data => {
    if (data.tipeSoal === 'Pilihan Ganda') {
        return !!data.kunciJawaban && data.pilihanJawaban && data.pilihanJawaban.length >= 2;
    }
    return true;
}, {
    message: "Untuk Pilihan Ganda, Kunci jawaban dan minimal 2 opsi wajib diisi.",
    path: ["kunciJawaban"],
});


type SoalFormValues = z.infer<typeof soalSchema>;

type SoalGroupedByPaket = Record<string, Soal[]>;

export default function GuruBankSoalPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [soalList, setSoalList] = useState<Soal[]>([]);
  const [groupedSoal, setGroupedSoal] = useState<SoalGroupedByPaket>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSoal, setEditingSoal] = useState<Soal | null>(null);
  const [soalToDelete, setSoalToDelete] = useState<Soal | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [mapelOptions, setMapelOptions] = useState<MataPelajaran[]>([]);

  const soalForm = useForm<SoalFormValues>({
    resolver: zodResolver(soalSchema),
    defaultValues: {
      paketSoal: "",
      tipeSoal: "Pilihan Ganda",
      pertanyaan: "",
      mapelId: undefined,
      tingkatKesulitan: "Sedang",
      pilihanJawaban: [ { id: 'A', text: "" }, { id: 'B', text: "" }, { id: 'C', text: "" }, { id: 'D', text: "" } ],
      kunciJawaban: undefined,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: soalForm.control,
    name: "pilihanJawaban",
  });
  
  const tipeSoalWatch = soalForm.watch("tipeSoal");

  const fetchBankSoal = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/bank-soal');
      if (!response.ok) throw new Error("Gagal mengambil data bank soal.");
      const data: Soal[] = await response.json();
      setSoalList(data);
      const grouped = data.reduce((acc, soal) => {
        const paket = soal.paketSoal || "Tanpa Paket";
        if (!acc[paket]) {
          acc[paket] = [];
        }
        acc[paket].push(soal);
        return acc;
      }, {} as SoalGroupedByPaket);
      setGroupedSoal(grouped);

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
  
  const getInitialOptions = () => [ { id: 'A', text: "" }, { id: 'B', text: "" }, { id: 'C', text: "" }, { id: 'D', text: "" } ];

  useEffect(() => {
    if(isFormOpen) {
        if(editingSoal) {
            soalForm.reset({
                paketSoal: editingSoal.paketSoal,
                tipeSoal: editingSoal.tipeSoal,
                pertanyaan: editingSoal.pertanyaan,
                mapelId: editingSoal.mapel.id,
                tingkatKesulitan: editingSoal.tingkatKesulitan,
                pilihanJawaban: editingSoal.pilihanJawaban || getInitialOptions(),
                kunciJawaban: editingSoal.kunciJawaban || undefined
            });
        } else {
            soalForm.reset({
                paketSoal: "",
                tipeSoal: "Pilihan Ganda",
                pertanyaan: "",
                mapelId: undefined,
                tingkatKesulitan: "Sedang",
                pilihanJawaban: getInitialOptions(),
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

  const handleAddNewOption = () => {
    if (fields.length < 5) {
      append({ id: String.fromCharCode(65 + fields.length), text: "" });
    }
  };
  
  const handleRemoveOption = (index: number) => {
    if (fields.length > 2) {
      remove(index);
    }
  };

  if (!user || (user.role !== 'guru' && user.role !== 'admin' && user.role !== 'superadmin')) {
    return <p>Akses Ditolak.</p>;
  }
  
  const sortedPaketKeys = useMemo(() => Object.keys(groupedSoal).sort(), [groupedSoal]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-semibold">Bank Soal</h1>
          <p className="text-muted-foreground mt-1">Kelola koleksi paket soal untuk kuis dan ujian.</p>
        </div>
        <Button onClick={() => { setEditingSoal(null); setIsFormOpen(true); }} disabled={isLoading}>
          <PackagePlus className="mr-2 h-4 w-4" /> Buat Soal / Paket Baru
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><Package className="mr-2 h-5 w-5 text-primary"/>Daftar Paket Soal</CardTitle>
          <CardDescription>Total {sortedPaketKeys.length} paket soal tersedia.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : sortedPaketKeys.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {sortedPaketKeys.map((paket) => (
                <AccordionItem value={paket} key={paket}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-3">
                        <span className="text-lg font-medium text-primary">{paket}</span>
                        <span className="flex items-center text-sm font-normal text-muted-foreground">
                            <FileQuestion className="mr-1.5 h-4 w-4" />
                            {groupedSoal[paket].length} Soal
                        </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                            <TableHead>Pertanyaan</TableHead>
                            <TableHead>Tipe</TableHead>
                            <TableHead>Mapel</TableHead>
                            <TableHead>Kesulitan</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {groupedSoal[paket].map(soal => (
                          <TableRow key={soal.id}>
                            <TableCell className="font-medium max-w-md truncate" title={soal.pertanyaan}>{soal.pertanyaan}</TableCell>
                            <TableCell>{soal.tipeSoal}</TableCell>
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
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center py-8">
                <FileQuestion className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium text-foreground">Belum Ada Soal</h3>
                <p className="mt-1 text-sm text-muted-foreground">Silakan buat paket soal pertama Anda.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>{editingSoal ? 'Edit Soal' : 'Buat Soal Baru'}</DialogTitle>
            <DialogDescription>Isi detail pertanyaan dan pilihan jawaban di bawah ini.</DialogDescription>
          </DialogHeader>
          <Form {...soalForm}>
            <form onSubmit={soalForm.handleSubmit(handleFormSubmit)} className="flex-grow flex flex-col overflow-y-hidden">
                <ScrollArea className="-m-6 p-6 space-y-6">
                    <FormField control={soalForm.control} name="paketSoal" render={({ field }) => (<FormItem><FormLabel>Nama Paket Soal</FormLabel><FormControl><Input placeholder="Contoh: UTS Matematika 2024" {...field} /></FormControl><FormDescription>Kelompokkan soal dalam satu paket yang sama.</FormDescription><FormMessage /></FormItem>)} />
                    <FormField control={soalForm.control} name="tipeSoal" render={({ field }) => (<FormItem><FormLabel>Tipe Soal</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih Tipe Soal" /></SelectTrigger></FormControl><SelectContent>{(["Pilihan Ganda", "Esai"] as TipeSoal[]).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                    <FormField control={soalForm.control} name="pertanyaan" render={({ field }) => (<FormItem><FormLabel>Teks Pertanyaan</FormLabel><FormControl><Textarea rows={4} placeholder="Tuliskan pertanyaan di sini..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={soalForm.control} name="mapelId" render={({ field }) => (<FormItem><FormLabel>Mata Pelajaran</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih Mapel" /></SelectTrigger></FormControl><SelectContent>{mapelOptions.map(m => <SelectItem key={m.id} value={m.id}>{m.nama}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                        <FormField control={soalForm.control} name="tingkatKesulitan" render={({ field }) => (<FormItem><FormLabel>Tingkat Kesulitan</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih Kesulitan" /></SelectTrigger></FormControl><SelectContent>{["Mudah", "Sedang", "Sulit"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                    </div>
                    {tipeSoalWatch === 'Pilihan Ganda' && (
                        <div>
                            <FormField control={soalForm.control} name="kunciJawaban" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Pilihan Jawaban &amp; Kunci</FormLabel>
                                    <FormDescription>Pilih salah satu opsi sebagai kunci jawaban yang benar.</FormDescription>
                                    <RadioGroup onValueChange={field.onChange} value={field.value} className="space-y-3 pt-2">
                                        {fields.map((item, index) => (
                                            <div key={item.id} className="flex items-center gap-2">
                                                <FormControl>
                                                    <RadioGroupItem value={item.id} id={`kunci-${item.id}`} />
                                                </FormControl>
                                                <FormField control={soalForm.control} name={`pilihanJawaban.${index}.text`} render={({ field: optionField }) => (<FormItem className="flex-grow"><FormControl><Input placeholder={`Teks untuk Opsi ${String.fromCharCode(65 + index)}`} {...optionField} /></FormControl><FormMessage /></FormItem>)} />
                                                <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveOption(index)} disabled={fields.length <= 2} className="text-destructive"><Trash2 className="h-4 w-4"/></Button>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                    <FormMessage>{soalForm.formState.errors.kunciJawaban?.message || soalForm.formState.errors.pilihanJawaban?.message}</FormMessage>
                                </FormItem>
                            )}/>
                            <Button type="button" variant="outline" size="sm" onClick={handleAddNewOption} disabled={fields.length >= 5} className="mt-3">
                                <PlusCircle className="mr-2 h-4 w-4"/> Tambah Opsi
                            </Button>
                        </div>
                    )}
                </ScrollArea>
                <DialogFooter className="flex-shrink-0 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} disabled={isSubmitting}>Batal</Button>
                    <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : "Simpan Soal"}</Button>
                </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
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
