
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { UploadCloud, FolderKanban, FileText, Link2, PlusCircle, Search, Edit3, Trash2, Loader2, Link2Icon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { MOCK_SUBJECTS } from "@/lib/constants";

interface Materi {
  id: string;
  judul: string;
  jenis: "PDF" | "Video" | "PPT" | "Link" | "Dokumen" | "Gambar";
  mapel: string;
  tanggalUpload: string;
  ukuran?: string; // Untuk file
  url?: string; // Untuk link
  deskripsi?: string;
  namaFileAsli?: string;
}

const materiSchema = z.object({
  judul: z.string().min(5, { message: "Judul materi minimal 5 karakter." }),
  mapel: z.string({ required_error: "Mata pelajaran wajib dipilih." }),
  jenis: z.enum(["PDF", "Video", "PPT", "Link", "Dokumen", "Gambar"], { required_error: "Jenis materi wajib dipilih."}),
  deskripsi: z.string().optional(),
  file: z.any().optional(), // Untuk jenis File (PDF, PPT, Dokumen, Gambar)
  url: z.string().url({ message: "URL tidak valid."}).optional(), // Untuk jenis Video atau Link
}).refine(data => {
  if ((data.jenis === "Video" || data.jenis === "Link") && !data.url) return false;
  // Jika editing, file tidak wajib diisi lagi
  // if (editingMateri && (data.jenis === "PDF" || data.jenis === "PPT" || data.jenis === "Dokumen" || data.jenis === "Gambar")) return true; 
  if ((data.jenis === "PDF" || data.jenis === "PPT" || data.jenis === "Dokumen" || data.jenis === "Gambar") && !data.file && !editingMateri) return false;
  return true;
}, {
  message: "File atau URL wajib diisi sesuai jenis materi.",
  path: ["file"], // Atau path: ["url"] tergantung logika validasi selanjutnya
});

type MateriFormValues = z.infer<typeof materiSchema>;

let editingMateri: Materi | null = null; // Helper variable outside component to assist refine

const initialMockMateri: Materi[] = [
  { id: "MAT001", judul: "Modul Aljabar Linier", jenis: "PDF", mapel: "Matematika Wajib", tanggalUpload: "2024-07-20", ukuran: "2.5 MB", namaFileAsli: "Modul_Aljabar_Lengkap.pdf", deskripsi: "Materi lengkap Aljabar Linier untuk Kelas X." },
  { id: "MAT002", judul: "Video Pembelajaran Termodinamika", jenis: "Video", mapel: "Fisika", tanggalUpload: "2024-07-22", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", deskripsi: "Penjelasan konsep dasar Termodinamika dengan animasi." },
  { id: "MAT003", judul: "Presentasi Struktur Atom", jenis: "PPT", mapel: "Kimia", tanggalUpload: "2024-07-18", ukuran: "5.2 MB", namaFileAsli: "Struktur_Atom_XI.pptx" },
  { id: "MAT004", judul: "Artikel Ilmiah tentang Fotosintesis", jenis: "Link", mapel: "Biologi", tanggalUpload: "2024-07-25", url:"https://example.com/fotosintesis", deskripsi: "Bacaan pendukung materi fotosintesis."}
];


export default function GuruMateriPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [mockMateri, setMockMateri] = useState<Materi[]>(initialMockMateri);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMapel, setFilterMapel] = useState("semua");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentEditingMateri, setCurrentEditingMateri] = useState<Materi | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const materiForm = useForm<MateriFormValues>({
    resolver: zodResolver(materiSchema),
    defaultValues: { judul: "", mapel: undefined, jenis: undefined, deskripsi: "", file: undefined, url: "" },
  });
  
  useEffect(() => {
    editingMateri = currentEditingMateri; // Update helper for zod refine
    if (currentEditingMateri) {
      materiForm.reset({
        judul: currentEditingMateri.judul,
        mapel: currentEditingMateri.mapel,
        jenis: currentEditingMateri.jenis,
        deskripsi: currentEditingMateri.deskripsi || "",
        url: currentEditingMateri.url || "",
        file: undefined,
      });
    } else {
      materiForm.reset({ judul: "", mapel: undefined, jenis: undefined, deskripsi: "", file: undefined, url: "" });
    }
  }, [currentEditingMateri, materiForm, isFormOpen]);


  if (!user || (user.role !== 'guru' && user.role !== 'superadmin')) {
    return <p>Akses Ditolak. Anda harus menjadi Guru untuk melihat halaman ini.</p>;
  }

  const handlePlaceholderAction = (action: string, id?: string) => {
    toast({ title: "Fitur Disimulasikan", description: `Tindakan "${action}" ${id ? `untuk materi ${id} ` : ""}telah disimulasikan.`});
  };
  
  const handleFormSubmit = async (values: MateriFormValues) => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

    const isFileBased = ["PDF", "PPT", "Dokumen", "Gambar"].includes(values.jenis);

    if (currentEditingMateri) {
      setMockMateri(prev => prev.map(m => m.id === currentEditingMateri.id ? { 
        ...currentEditingMateri, 
        ...values,
        namaFileAsli: isFileBased && values.file ? (values.file as File).name : (isFileBased ? currentEditingMateri.namaFileAsli : undefined),
        ukuran: isFileBased && values.file ? `${((values.file as File).size / (1024*1024)).toFixed(1)} MB` : (isFileBased ? currentEditingMateri.ukuran : undefined),
        url: !isFileBased ? values.url : undefined,
        tanggalUpload: format(new Date(), "yyyy-MM-dd"),
      } : m));
      toast({ title: "Berhasil!", description: `Materi "${values.judul}" telah diperbarui.` });
    } else {
      const newMateri: Materi = {
        id: `MAT${Date.now()}`,
        ...values,
        namaFileAsli: isFileBased && values.file ? (values.file as File).name : undefined,
        ukuran: isFileBased && values.file ? `${((values.file as File).size / (1024*1024)).toFixed(1)} MB` : undefined,
        url: !isFileBased ? values.url : undefined,
        tanggalUpload: format(new Date(), "yyyy-MM-dd"),
      };
      setMockMateri(prev => [newMateri, ...prev]);
      toast({ title: "Berhasil!", description: `Materi "${values.judul}" telah ditambahkan.` });
    }
    setIsSubmitting(false);
    setIsFormOpen(false);
    setCurrentEditingMateri(null);
  };
  
  const openFormDialog = (materi?: Materi) => {
    setCurrentEditingMateri(materi || null);
    setIsFormOpen(true);
  }

  const filteredMateri = mockMateri.filter(m => 
    (m.judul.toLowerCase().includes(searchTerm.toLowerCase()) || m.mapel.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterMapel === "semua" || m.mapel === filterMapel)
  );

  const uniqueMapelOptions = ["semua", ...new Set(MOCK_SUBJECTS)];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-semibold">Upload & Manajemen Materi</h1>
        <Button onClick={() => openFormDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Upload Materi Baru
        </Button>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <UploadCloud className="mr-2 h-6 w-6 text-primary" />
            Bank Materi Pembelajaran
          </CardTitle>
          <CardDescription>
            Unggah, kelola, dan bagikan materi pembelajaran seperti modul, presentasi, video, dan tautan sumber belajar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="default" onClick={() => openFormDialog()} className="justify-start text-left h-auto py-3">
              <FileText className="mr-3 h-5 w-5" />
              <div>
                <p className="font-semibold">Upload File (PDF, DOC, PPT, Gambar)</p>
                <p className="text-xs text-muted-foreground">Unggah materi dari perangkat Anda.</p>
              </div>
            </Button>
            <Button variant="outline" onClick={() => { setCurrentEditingMateri(null); materiForm.setValue("jenis", "Link"); setIsFormOpen(true); }} className="justify-start text-left h-auto py-3">
              <Link2 className="mr-3 h-5 w-5" />
              <div>
                <p className="font-semibold">Tambah Tautan Video/Sumber</p>
                <p className="text-xs text-muted-foreground">Sematkan video atau sumber lain.</p>
              </div>
            </Button>
            {/* <Button variant="outline" onClick={() => handlePlaceholderAction("Buat Folder Materi")} className="justify-start text-left h-auto py-3 md:col-span-2 lg:col-span-1">
              <FolderKanban className="mr-3 h-5 w-5" />
              <div>
                <p className="font-semibold">Kelola Folder</p>
                <p className="text-xs text-muted-foreground">Organisasikan materi dalam folder.</p>
              </div>
            </Button> */}
          </div>

          <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                        <CardTitle className="text-xl">Daftar Materi Saya</CardTitle>
                        <CardDescription>Materi yang telah Anda unggah atau tambahkan.</CardDescription>
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
                    </div>
                </div>
            </CardHeader>
            <CardContent>
              {filteredMateri.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Judul Materi</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Jenis</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Mapel</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Tgl Upload</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Detail</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Tindakan</th>
                      </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                      {filteredMateri.map((m) => (
                        <tr key={m.id}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-foreground max-w-xs truncate" title={m.judul}>{m.judul}
                            {m.deskripsi && <p className="text-xs text-muted-foreground truncate" title={m.deskripsi}>{m.deskripsi}</p>}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">{m.jenis}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">{m.mapel}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">{m.tanggalUpload}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">{m.url || m.namaFileAsli || m.ukuran || "-"}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                            <Button variant="ghost" size="sm" onClick={() => openFormDialog(m)} className="mr-1">
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handlePlaceholderAction(`Hapus`, m.id)} className="text-destructive hover:text-destructive/80">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FolderKanban className="mx-auto h-12 w-12" />
                  <p className="mt-2">Belum ada materi yang diunggah atau filter tidak menemukan hasil.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>

       {/* Dialog Form Tambah/Edit Materi */}
      <Dialog open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if (!open) setCurrentEditingMateri(null); }}>
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle>{currentEditingMateri ? "Edit Materi" : "Upload Materi Baru"}</DialogTitle>
                <DialogDescription>{currentEditingMateri ? `Perbarui detail untuk materi "${currentEditingMateri.judul}".` : "Isi detail materi baru di bawah ini."}</DialogDescription>
            </DialogHeader>
            <Form {...materiForm}>
                <form onSubmit={materiForm.handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
                    <FormField control={materiForm.control} name="judul" render={({ field }) => (<FormItem><FormLabel>Judul Materi</FormLabel><FormControl><Input placeholder="Contoh: Modul Bab 1 Aljabar" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <FormField control={materiForm.control} name="mapel" render={({ field }) => (<FormItem><FormLabel>Mata Pelajaran</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih mapel" /></SelectTrigger></FormControl><SelectContent>{MOCK_SUBJECTS.map(subject => (<SelectItem key={subject} value={subject}>{subject}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                         <FormField control={materiForm.control} name="jenis" render={({ field }) => (<FormItem><FormLabel>Jenis Materi</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih jenis" /></SelectTrigger></FormControl><SelectContent>{ (["PDF", "Dokumen", "PPT", "Gambar", "Video", "Link"] as Materi["jenis"][]).map(type => (<SelectItem key={type} value={type}>{type}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                    </div>
                    <FormField control={materiForm.control} name="deskripsi" render={({ field }) => (<FormItem><FormLabel>Deskripsi (Opsional)</FormLabel><FormControl><Textarea placeholder="Deskripsi singkat tentang materi..." {...field} rows={3} /></FormControl><FormMessage /></FormItem>)} />
                    
                    {(materiForm.watch("jenis") === "PDF" || materiForm.watch("jenis") === "PPT" || materiForm.watch("jenis") === "Dokumen" || materiForm.watch("jenis") === "Gambar") && (
                        <FormField control={materiForm.control} name="file" render={({ field }) => (<FormItem><FormLabel>Unggah File {currentEditingMateri && currentEditingMateri.namaFileAsli ? `(Kosongkan jika tidak ingin mengubah file: ${currentEditingMateri.namaFileAsli})` : ""}</FormLabel><FormControl><Input type="file" onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)} /></FormControl><FormDescription>Maks. 10MB.</FormDescription><FormMessage /></FormItem>)} />
                    )}
                    {(materiForm.watch("jenis") === "Video" || materiForm.watch("jenis") === "Link") && (
                         <FormField control={materiForm.control} name="url" render={({ field }) => (<FormItem><FormLabel>URL Materi/Video</FormLabel><FormControl><Input placeholder="https://contoh.com/materi_atau_video" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    )}

                    <DialogFooter className="pt-4"><Button type="button" variant="outline" onClick={() => {setIsFormOpen(false); setCurrentEditingMateri(null);}} disabled={isSubmitting}>Batal</Button><Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{currentEditingMateri ? "Simpan Perubahan" : "Simpan Materi"}</Button></DialogFooter>
                </form>
            </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

