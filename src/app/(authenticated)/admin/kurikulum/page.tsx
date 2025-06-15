
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/use-auth";
import { BookOpenCheck, Target, BookCopy, BookUp, Layers, FileText, FolderKanban, PlusCircle, Edit, Search, Loader2, UploadCloud, Link2Icon, Trash2, ArrowRightLeft, BarChartHorizontalBig, Book, Library, List } from "lucide-react";
import Link from "next/link";
import { ROUTES, MOCK_SUBJECTS, SCHOOL_GRADE_LEVELS, SCHOOL_MAJORS, KATEGORI_MAPEL } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import type { SKL, CapaianPembelajaran, MateriKategori, StrukturKurikulumItem, Silabus, RPP, KategoriSklType, FaseCpType } from "@/types";
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
import { Separator } from "@/components/ui/separator";
import { Table, TableHead, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table";


const materiSchema = z.object({
  judul: z.string().min(5, { message: "Judul materi minimal 5 karakter." }),
  deskripsi: z.string().optional(),
  mapel: z.string({ required_error: "Mata pelajaran wajib dipilih."}),
  jenisMateri: z.enum(["File", "Link"], { required_error: "Jenis materi wajib dipilih."}),
  file: z.any().optional(), 
  url: z.string().url({ message: "URL tidak valid."}).optional(),
}).refine(data => {
  if (data.jenisMateri === "Link" && !data.url) return false;
  if (data.jenisMateri === "File" && !data.file && !editingMateri) return false; // Cek `editingMateri` dari scope luar
  return true;
}, {
  message: "File atau URL wajib diisi sesuai jenis materi.",
  path: ["file"], 
});
type MateriFormValues = z.infer<typeof materiSchema>;
interface MateriAjar {
  id: string;
  judul: string;
  deskripsi?: string;
  mapel: string;
  jenisMateri: "File" | "Link";
  namaFile?: string;
  url?: string;
  tanggalUpload: string;
}

const sklSchema = z.object({
  kode: z.string().min(2, { message: "Kode SKL minimal 2 karakter." }).max(50),
  deskripsi: z.string().min(10, { message: "Deskripsi SKL minimal 10 karakter." }),
  kategori: z.enum(["Sikap", "Pengetahuan", "Keterampilan"], { required_error: "Kategori SKL wajib dipilih." }),
});
type SKLFormValues = z.infer<typeof sklSchema>;

const cpSchema = z.object({
  kode: z.string().min(2, { message: "Kode CP minimal 2 karakter." }).max(100),
  deskripsi: z.string().min(10, { message: "Deskripsi CP minimal 10 karakter." }),
  fase: z.enum(["A", "B", "C", "D", "E", "F", "Lainnya"], { required_error: "Fase wajib dipilih."}),
  elemen: z.string().min(3, {message: "Elemen minimal 3 karakter."}).max(255),
});
type CPFormValues = z.infer<typeof cpSchema>;

const kategoriMateriSchema = z.object({
  nama: z.string().min(3, { message: "Nama kategori minimal 3 karakter." }).max(255),
});
type KategoriMateriFormValues = z.infer<typeof kategoriMateriSchema>;

const strukturKurikulumSchema = z.object({
  idMapel: z.string({ required_error: "Mata pelajaran wajib dipilih."}),
  alokasiJam: z.coerce.number().min(1, { message: "Alokasi jam minimal 1."}),
});
type StrukturKurikulumFormValues = z.infer<typeof strukturKurikulumSchema>;

const silabusSchema = z.object({
  judul: z.string().min(5, { message: "Judul silabus minimal 5 karakter." }),
  idMapel: z.string({ required_error: "Mata pelajaran wajib dipilih."}),
  kelas: z.string().min(2, {message: "Kelas minimal 2 karakter."}),
  deskripsiSingkat: z.string().optional(),
  file: z.any().optional(),
});
type SilabusFormValues = z.infer<typeof silabusSchema>;

const rppSchema = z.object({
  judul: z.string().min(5, { message: "Judul RPP minimal 5 karakter." }),
  idMapel: z.string({ required_error: "Mata pelajaran wajib dipilih."}),
  kelas: z.string().min(2, {message: "Kelas minimal 2 karakter."}),
  pertemuanKe: z.coerce.number().min(1, { message: "Pertemuan minimal 1."}),
  materiPokok: z.string().optional(),
  kegiatanPembelajaran: z.string().optional(),
  penilaian: z.string().optional(),
  file: z.any().optional(),
});
type RPPFormValues = z.infer<typeof rppSchema>;


// Data mock untuk bagian yang belum terintegrasi
const initialStrukturKurikulum: Record<string, StrukturKurikulumItem[]> = {
    "X-IPA": [{ id: "SK001", idMapel: MOCK_SUBJECTS[0], namaMapel: MOCK_SUBJECTS[0], alokasiJam: 4, guruPengampu: "Bu Ani" }],
    "XI-IPS": [{ id: "SK002", idMapel: MOCK_SUBJECTS[6], namaMapel: MOCK_SUBJECTS[6], alokasiJam: 3, guruPengampu: "Pak Budi" }],
};
const initialSilabus: Silabus[] = [
    {id: "SIL001", judul: "Silabus Matematika Kelas X Semester 1", idMapel: MOCK_SUBJECTS[0], namaMapel: MOCK_SUBJECTS[0], kelas: "X IPA 1", deskripsiSingkat: "Mencakup bab Aljabar dan Geometri dasar.", namaFile: "silabus_mtk_x_1.pdf"},
];
const initialRPP: RPP[] = [
    {id: "RPP001", judul: "RPP Pertemuan 1 - Fungsi Kuadrat", idMapel: MOCK_SUBJECTS[0], namaMapel: MOCK_SUBJECTS[0], kelas: "X IPA 1", pertemuanKe: 1, materiPokok: "Definisi dan grafik fungsi kuadrat."},
];

let editingMateri: MateriAjar | null = null; 
let editingSilabus: Silabus | null = null;
let editingRPP: RPP | null = null;

export default function AdminKurikulumPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Materi Ajar State & Form (Masih Mock)
  const [isMateriFormOpen, setIsMateriFormOpen] = useState(false);
  const [currentEditingMateri, setCurrentEditingMateri] = useState<MateriAjar | null>(null);
  const [isLoadingMateriSubmit, setIsLoadingMateriSubmit] = useState(false);
  const [materiList, setMateriList] = useState<MateriAjar[]>([]);
  const materiForm = useForm<MateriFormValues>({ resolver: zodResolver(materiSchema), defaultValues: { judul: "", deskripsi: "", mapel: undefined, jenisMateri: undefined, file: undefined, url: "" } });

  // SKL State & Form
  const [isSKLDialogOpen, setIsSKLDialogOpen] = useState(false);
  const [isSKLFormOpen, setIsSKLFormOpen] = useState(false);
  const [editingSKL, setEditingSKL] = useState<SKL | null>(null);
  const [sklToDelete, setSklToDelete] = useState<SKL | null>(null);
  const [sklList, setSklList] = useState<SKL[]>([]);
  const [isLoadingSkl, setIsLoadingSkl] = useState(true);
  const [isSKLSubmitting, setIsSKLSubmitting] = useState(false);
  const sklForm = useForm<SKLFormValues>({ resolver: zodResolver(sklSchema), defaultValues: { kode: "", deskripsi: "", kategori: undefined } });
  
  // CP State & Form
  const [isCPDialogOpen, setIsCPDialogOpen] = useState(false);
  const [isCPFormOpen, setIsCPFormOpen] = useState(false);
  const [editingCP, setEditingCP] = useState<CapaianPembelajaran | null>(null);
  const [cpToDelete, setCpToDelete] = useState<CapaianPembelajaran | null>(null);
  const [cpList, setCpList] = useState<CapaianPembelajaran[]>([]);
  const [isLoadingCp, setIsLoadingCp] = useState(true);
  const [isCPSubmitting, setIsCPSubmitting] = useState(false);
  const cpForm = useForm<CPFormValues>({ resolver: zodResolver(cpSchema), defaultValues: { kode: "", deskripsi: "", fase: undefined, elemen: "" } });

  // Pemetaan SKL-CP State
  const [isPemetaanDialogOpen, setIsPemetaanDialogOpen] = useState(false);

  // Kategori Materi State & Form
  const [isKategoriMateriDialogOpen, setIsKategoriMateriDialogOpen] = useState(false);
  const [kategoriMateriList, setKategoriMateriList] = useState<MateriKategori[]>([]);
  const [isLoadingKategoriMateri, setIsLoadingKategoriMateri] = useState(true);
  const [isKategoriMateriSubmitting, setIsKategoriMateriSubmitting] = useState(false);
  const [kategoriMateriToDelete, setKategoriMateriToDelete] = useState<MateriKategori | null>(null);
  const kategoriMateriForm = useForm<KategoriMateriFormValues>({ resolver: zodResolver(kategoriMateriSchema), defaultValues: { nama: "" }});

  // Struktur Kurikulum State & Form (Masih Mock)
  const [isStrukturKurikulumDialogOpen, setIsStrukturKurikulumDialogOpen] = useState(false);
  const [isStrukturKurikulumFormOpen, setIsStrukturKurikulumFormOpen] = useState(false);
  const [strukturKurikulumData, setStrukturKurikulumData] = useState(initialStrukturKurikulum);
  const [selectedTingkat, setSelectedTingkat] = useState<string>(SCHOOL_GRADE_LEVELS[0]);
  const [selectedJurusan, setSelectedJurusan] = useState<string>(SCHOOL_MAJORS[0]);
  const [isStrukturSubmitting, setIsStrukturSubmitting] = useState(false);
  const strukturKurikulumForm = useForm<StrukturKurikulumFormValues>({resolver: zodResolver(strukturKurikulumSchema), defaultValues: {idMapel: undefined, alokasiJam: 0}});

  // Silabus State & Form (Masih Mock)
  const [isSilabusDialogOpen, setIsSilabusDialogOpen] = useState(false);
  const [isSilabusFormOpen, setIsSilabusFormOpen] = useState(false);
  const [currentEditingSilabus, setCurrentEditingSilabus] = useState<Silabus | null>(null);
  const [silabusToDelete, setSilabusToDelete] = useState<Silabus | null>(null);
  const [silabusList, setSilabusList] = useState<Silabus[]>(initialSilabus);
  const [isSilabusSubmitting, setIsSilabusSubmitting] = useState(false);
  const silabusForm = useForm<SilabusFormValues>({ resolver: zodResolver(silabusSchema), defaultValues: { judul: "", idMapel: undefined, kelas: "", deskripsiSingkat: "", file: undefined }});

  // RPP State & Form (Masih Mock)
  const [isRPPDialogOpen, setIsRPPDialogOpen] = useState(false);
  const [isRPPFormOpen, setIsRPPFormOpen] = useState(false);
  const [currentEditingRPP, setCurrentEditingRPP] = useState<RPP | null>(null);
  const [rppToDelete, setRppToDelete] = useState<RPP | null>(null);
  const [rppList, setRppList] = useState<RPP[]>(initialRPP);
  const [isRPPSubmitting, setIsRPPSubmitting] = useState(false);
  const rppForm = useForm<RPPFormValues>({ resolver: zodResolver(rppSchema), defaultValues: { judul: "", idMapel: undefined, kelas: "", pertemuanKe: 1, materiPokok: "", kegiatanPembelajaran: "", penilaian: "", file: undefined }});

  // Data Fetching
  const fetchSklData = async () => {
    setIsLoadingSkl(true);
    try {
      const response = await fetch('/api/kurikulum/skl');
      if (!response.ok) throw new Error('Gagal mengambil data SKL');
      const data = await response.json();
      setSklList(data);
    } catch (error: any) {
      toast({ title: "Error SKL", description: error.message || "Tidak dapat memuat SKL.", variant: "destructive" });
    } finally {
      setIsLoadingSkl(false);
    }
  };

  const fetchCpData = async () => {
    setIsLoadingCp(true);
    try {
      const response = await fetch('/api/kurikulum/cp');
      if (!response.ok) throw new Error('Gagal mengambil data CP');
      const data = await response.json();
      setCpList(data);
    } catch (error: any) {
      toast({ title: "Error CP", description: error.message || "Tidak dapat memuat CP.", variant: "destructive" });
    } finally {
      setIsLoadingCp(false);
    }
  };
  
  const fetchKategoriMateriData = async () => {
    setIsLoadingKategoriMateri(true);
    try {
      const response = await fetch('/api/kurikulum/materi-kategori');
      if (!response.ok) throw new Error('Gagal mengambil data kategori materi');
      const data = await response.json();
      setKategoriMateriList(data);
    } catch (error: any) {
      toast({ title: "Error Kategori Materi", description: error.message || "Tidak dapat memuat kategori materi.", variant: "destructive" });
    } finally {
      setIsLoadingKategoriMateri(false);
    }
  };

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'superadmin')) {
      fetchSklData();
      fetchCpData();
      fetchKategoriMateriData();
    }
  }, [user]);

  useEffect(() => {
    if (editingSKL) sklForm.reset(editingSKL); else sklForm.reset({ kode: "", deskripsi: "", kategori: undefined });
  }, [editingSKL, sklForm, isSKLFormOpen]);
  
  useEffect(() => {
    if (editingCP) cpForm.reset(editingCP); else cpForm.reset({ kode: "", deskripsi: "", fase: undefined, elemen: "" });
  }, [editingCP, cpForm, isCPFormOpen]);

  useEffect(() => {
    editingMateri = currentEditingMateri; 
    if (currentEditingMateri) materiForm.reset({ judul: currentEditingMateri.judul, deskripsi: currentEditingMateri.deskripsi, mapel: currentEditingMateri.mapel, jenisMateri: currentEditingMateri.jenisMateri, url: currentEditingMateri.url, file: undefined });
    else materiForm.reset({ judul: "", deskripsi: "", mapel: undefined, jenisMateri: undefined, file: undefined, url: "" });
  }, [currentEditingMateri, materiForm, isMateriFormOpen]);

  useEffect(() => {
    editingSilabus = currentEditingSilabus;
    if (currentEditingSilabus) silabusForm.reset({ judul: currentEditingSilabus.judul, idMapel: currentEditingSilabus.idMapel, kelas: currentEditingSilabus.kelas, deskripsiSingkat: currentEditingSilabus.deskripsiSingkat, file: undefined });
    else silabusForm.reset({ judul: "", idMapel: undefined, kelas: "", deskripsiSingkat: "", file: undefined });
  }, [currentEditingSilabus, silabusForm, isSilabusFormOpen]);

  useEffect(() => {
    editingRPP = currentEditingRPP;
    if (currentEditingRPP) rppForm.reset({ judul: currentEditingRPP.judul, idMapel: currentEditingRPP.idMapel, kelas: currentEditingRPP.kelas, pertemuanKe: currentEditingRPP.pertemuanKe, materiPokok: currentEditingRPP.materiPokok, kegiatanPembelajaran: currentEditingRPP.kegiatanPembelajaran, penilaian: currentEditingRPP.penilaian, file: undefined });
    else rppForm.reset({ judul: "", idMapel: undefined, kelas: "", pertemuanKe: 1, materiPokok: "", kegiatanPembelajaran: "", penilaian: "", file: undefined });
  }, [currentEditingRPP, rppForm, isRPPFormOpen]);


  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return <p>Akses Ditolak. Anda harus menjadi admin untuk melihat halaman ini.</p>;
  }

  const handlePlaceholderAction = (action: string) => {
    toast({ title: "Fitur Dalam Pengembangan", description: `Fungsi "${action}" belum diimplementasikan sepenuhnya.`});
  };

  const openMateriForm = (materi?: MateriAjar) => { setCurrentEditingMateri(materi || null); setIsMateriFormOpen(true); }
  const handleMateriSubmit = async (values: MateriFormValues) => {
    setIsLoadingMateriSubmit(true); await new Promise(resolve => setTimeout(resolve, 1000)); 
    if (currentEditingMateri) {
      setMateriList(materiList.map(m => m.id === currentEditingMateri.id ? { ...currentEditingMateri, ...values, namaFile: values.jenisMateri === "File" && values.file ? (values.file as File).name : currentEditingMateri.namaFile, url: values.jenisMateri === "Link" ? values.url : undefined } : m));
      toast({ title: "Berhasil!", description: `Materi "${values.judul}" diperbarui.` });
    } else {
      const newMateri: MateriAjar = { id: `MAT${Date.now()}`, ...values, namaFile: values.jenisMateri === "File" ? (values.file as File)?.name || "file_contoh.pdf" : undefined, url: values.jenisMateri === "Link" ? values.url : undefined, tanggalUpload: new Date().toLocaleDateString('id-ID') };
      setMateriList(prev => [...prev, newMateri]); 
      toast({ title: "Berhasil!", description: `Materi "${values.judul}" ditambahkan.` });
    }
    setIsLoadingMateriSubmit(false); setIsMateriFormOpen(false); setCurrentEditingMateri(null); materiForm.reset();
  };
  
  const openSKLForm = (skl?: SKL) => { setEditingSKL(skl || null); setIsSKLFormOpen(true); };
  const handleSKLFormSubmit = async (values: SKLFormValues) => {
    setIsSKLSubmitting(true);
    const url = editingSKL ? `/api/kurikulum/skl/${editingSKL.id}` : '/api/kurikulum/skl';
    const method = editingSKL ? 'PUT' : 'POST';
    const payload = editingSKL ? { deskripsi: values.deskripsi, kategori: values.kategori } : values;

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menyimpan SKL');
      }
      toast({ title: "Berhasil!", description: `SKL ${values.kode || editingSKL?.kode} telah ${editingSKL ? 'diperbarui' : 'ditambahkan'}.` });
      setIsSKLFormOpen(false); setEditingSKL(null);
      fetchSklData(); 
    } catch (error: any) {
      toast({ title: "Error SKL", description: error.message, variant: "destructive" });
    } finally {
      setIsSKLSubmitting(false);
    }
  };
  const openDeleteSKLDialog = (skl: SKL) => setSklToDelete(skl);
  const handleDeleteSKLConfirm = async () => {
    if (sklToDelete) {
      setIsSKLSubmitting(true);
      try {
        const response = await fetch(`/api/kurikulum/skl/${sklToDelete.id}`, { method: 'DELETE' });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Gagal menghapus SKL');
        }
        toast({ title: "Dihapus!", description: `SKL ${sklToDelete.kode} telah dihapus.` });
        fetchSklData();
      } catch (error: any) {
        toast({ title: "Error SKL", description: error.message, variant: "destructive" });
      } finally {
        setIsSKLSubmitting(false); setSklToDelete(null);
      }
    }
  };
  
  const openCPForm = (cp?: CapaianPembelajaran) => { setEditingCP(cp || null); setIsCPFormOpen(true); };
  const handleCPFormSubmit = async (values: CPFormValues) => {
    setIsCPSubmitting(true);
    const url = editingCP ? `/api/kurikulum/cp/${editingCP.id}` : '/api/kurikulum/cp';
    const method = editingCP ? 'PUT' : 'POST';
    const payload = editingCP ? { deskripsi: values.deskripsi, fase: values.fase, elemen: values.elemen } : values;
    
    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menyimpan CP');
      }
      toast({ title: "Berhasil!", description: `CP ${values.kode || editingCP?.kode} telah ${editingCP ? 'diperbarui' : 'ditambahkan'}.` });
      setIsCPFormOpen(false); setEditingCP(null);
      fetchCpData();
    } catch (error: any) {
      toast({ title: "Error CP", description: error.message, variant: "destructive" });
    } finally {
      setIsCPSubmitting(false);
    }
  };
  const openDeleteCPDialog = (cp: CapaianPembelajaran) => setCpToDelete(cp);
  const handleDeleteCPConfirm = async () => {
    if (cpToDelete) {
      setIsCPSubmitting(true);
      try {
        const response = await fetch(`/api/kurikulum/cp/${cpToDelete.id}`, { method: 'DELETE' });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Gagal menghapus CP');
        }
        toast({ title: "Dihapus!", description: `CP ${cpToDelete.kode} telah dihapus.` });
        fetchCpData();
      } catch (error: any) {
        toast({ title: "Error CP", description: error.message, variant: "destructive" });
      } finally {
        setIsCPSubmitting(false); setCpToDelete(null);
      }
    }
  };

  const handleKategoriMateriSubmit = async (values: KategoriMateriFormValues) => {
    setIsKategoriMateriSubmitting(true);
    // Untuk Kategori, kita asumsikan hanya tambah, edit belum diimplementasi di UI mock ini
    try {
      const response = await fetch('/api/kurikulum/materi-kategori', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menyimpan kategori materi');
      }
      toast({ title: "Berhasil!", description: `Kategori "${values.nama}" ditambahkan.` });
      kategoriMateriForm.reset();
      fetchKategoriMateriData();
    } catch (error: any) {
      toast({ title: "Error Kategori Materi", description: error.message, variant: "destructive" });
    } finally {
      setIsKategoriMateriSubmitting(false);
    }
  };
  const openDeleteKategoriMateriDialog = (kategori: MateriKategori) => setKategoriMateriToDelete(kategori);
  const handleDeleteKategoriMateriConfirm = async () => {
    if (kategoriMateriToDelete) {
      setIsKategoriMateriSubmitting(true);
      try {
        const response = await fetch(`/api/kurikulum/materi-kategori/${kategoriMateriToDelete.id}`, { method: 'DELETE' });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Gagal menghapus kategori materi');
        }
        toast({ title: "Dihapus!", description: `Kategori "${kategoriMateriToDelete.nama}" telah dihapus.` });
        fetchKategoriMateriData();
      } catch (error: any) {
        toast({ title: "Error Kategori Materi", description: error.message, variant: "destructive" });
      } finally {
        setIsKategoriMateriSubmitting(false); setKategoriMateriToDelete(null);
      }
    }
  };


  const handleStrukturKurikulumSubmit = async (values: StrukturKurikulumFormValues) => {
    setIsStrukturSubmitting(true); await new Promise(resolve => setTimeout(resolve, 1000));
    const key = `${selectedTingkat}-${selectedJurusan}`;
    const selectedMapel = MOCK_SUBJECTS.find(s => s === values.idMapel);
    if (!selectedMapel) {
        toast({title: "Error", description: "Mata pelajaran tidak ditemukan.", variant: "destructive"});
        setIsStrukturSubmitting(false); return;
    }
    const newItem: StrukturKurikulumItem = {id: `SKSTR${Date.now()}`, idMapel: values.idMapel, namaMapel: selectedMapel, alokasiJam: values.alokasiJam, guruPengampu: "Belum Ditentukan"};
    setStrukturKurikulumData(prev => ({...prev, [key]: [...(prev[key] || []), newItem]}));
    toast({title: "Berhasil!", description: `${selectedMapel} ditambahkan ke struktur ${key}.`});
    setIsStrukturSubmitting(false); setIsStrukturKurikulumFormOpen(false); strukturKurikulumForm.reset();
  };

  const openSilabusForm = (silabus?: Silabus) => { setCurrentEditingSilabus(silabus || null); setIsSilabusFormOpen(true); };
  const handleSilabusSubmit = async (values: SilabusFormValues) => {
    setIsSilabusSubmitting(true); await new Promise(resolve => setTimeout(resolve, 1000));
    const namaMapel = MOCK_SUBJECTS.find(s => s === values.idMapel) || "N/A";
    if (currentEditingSilabus) {
        setSilabusList(silabusList.map(s => s.id === currentEditingSilabus.id ? {...currentEditingSilabus, ...values, namaMapel, namaFile: values.file ? (values.file as File).name : currentEditingSilabus.namaFile} : s));
        toast({title: "Berhasil!", description: `Silabus "${values.judul}" diperbarui.`});
    } else {
        const newSilabus: Silabus = {id: `SIL${Date.now()}`, ...values, namaMapel, namaFile: values.file ? (values.file as File).name : "contoh_silabus.pdf"};
        setSilabusList(prev => [...prev, newSilabus]);
        toast({title: "Berhasil!", description: `Silabus "${values.judul}" ditambahkan.`});
    }
    setIsSilabusSubmitting(false); setIsSilabusFormOpen(false); setCurrentEditingSilabus(null); silabusForm.reset();
  };
  const openDeleteSilabusDialog = (silabus: Silabus) => setSilabusToDelete(silabus);
  const handleDeleteSilabusConfirm = async () => {
    if (silabusToDelete) {
        setIsSilabusSubmitting(true); await new Promise(resolve => setTimeout(resolve, 1000));
        setSilabusList(silabusList.filter(s => s.id !== silabusToDelete.id));
        toast({ title: "Dihapus!", description: `Silabus ${silabusToDelete.judul} dihapus.` });
        setIsSilabusSubmitting(false); setSilabusToDelete(null);
    }
  };

  const openRPPForm = (rpp?: RPP) => { setCurrentEditingRPP(rpp || null); setIsRPPFormOpen(true); };
  const handleRPPSubmit = async (values: RPPFormValues) => {
    setIsRPPSubmitting(true); await new Promise(resolve => setTimeout(resolve, 1000));
    const namaMapel = MOCK_SUBJECTS.find(s => s === values.idMapel) || "N/A";
    if (currentEditingRPP) {
        setRppList(rppList.map(r => r.id === currentEditingRPP.id ? {...currentEditingRPP, ...values, namaMapel, namaFile: values.file ? (values.file as File).name : currentEditingRPP.namaFile} : r));
        toast({title: "Berhasil!", description: `RPP "${values.judul}" diperbarui.`});
    } else {
        const newRPP: RPP = {id: `RPP${Date.now()}`, ...values, namaMapel, namaFile: values.file ? (values.file as File).name : "contoh_rpp.pdf"};
        setRppList(prev => [...prev, newRPP]);
        toast({title: "Berhasil!", description: `RPP "${values.judul}" ditambahkan.`});
    }
    setIsRPPSubmitting(false); setIsRPPFormOpen(false); setCurrentEditingRPP(null); rppForm.reset();
  };
  const openDeleteRPPDialog = (rpp: RPP) => setRppToDelete(rpp);
  const handleDeleteRPPConfirm = async () => {
    if (rppToDelete) {
        setIsRPPSubmitting(true); await new Promise(resolve => setTimeout(resolve, 1000));
        setRppList(rppList.filter(r => r.id !== rppToDelete.id));
        toast({ title: "Dihapus!", description: `RPP ${rppToDelete.judul} dihapus.` });
        setIsRPPSubmitting(false); setRppToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-semibold">Manajemen Kurikulum</h1>
        <Button onClick={() => handlePlaceholderAction("Buat Kurikulum Baru Keseluruhan")}>
          <PlusCircle className="mr-2 h-4 w-4" /> Buat Kurikulum Baru (Holistik)
        </Button>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><BookOpenCheck className="mr-2 h-6 w-6 text-primary" />Pengembangan Kurikulum</CardTitle>
          <CardDescription>Rancang standar, struktur, silabus, RPP, dan materi ajar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl"><Target className="mr-3 h-5 w-5 text-primary" />Standar Kompetensi & Capaian</CardTitle>
              <CardDescription>Kelola SKL dan CP sebagai acuan utama.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Button variant="outline" onClick={() => setIsSKLDialogOpen(true)} className="justify-start text-left h-auto py-3"><Layers className="mr-3 h-5 w-5" /><div><p className="font-semibold">Standar Kompetensi Lulusan (SKL)</p><p className="text-xs text-muted-foreground">Definisikan profil lulusan.</p></div></Button>
              <Button variant="outline" onClick={() => setIsCPDialogOpen(true)} className="justify-start text-left h-auto py-3"><FileText className="mr-3 h-5 w-5" /><div><p className="font-semibold">Capaian Pembelajaran (CP)</p><p className="text-xs text-muted-foreground">Tetapkan target per fase/tingkat.</p></div></Button>
              <Button variant="outline" onClick={() => setIsPemetaanDialogOpen(true)} className="justify-start text-left h-auto py-3"><ArrowRightLeft className="mr-3 h-5 w-5" /><div><p className="font-semibold">Pemetaan & Analisis SKL-CP</p><p className="text-xs text-muted-foreground">Hubungkan & analisis keselarasan.</p></div></Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl"><BookCopy className="mr-3 h-5 w-5 text-primary" />Struktur Kurikulum, Silabus & RPP</CardTitle>
              <CardDescription>Susun kerangka, materi pokok, hingga rencana pembelajaran. Pastikan merujuk pada <Link href={ROUTES.ADMIN_MATA_PELAJARAN} className="text-primary hover:underline">daftar mata pelajaran</Link>.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Button variant="outline" onClick={() => setIsStrukturKurikulumDialogOpen(true)} className="justify-start text-left h-auto py-3"><Library className="mr-3 h-5 w-5" /><div><p className="font-semibold">Struktur Kurikulum</p><p className="text-xs text-muted-foreground">Atur mapel & alokasi jam.</p></div></Button>
              <Button variant="outline" onClick={() => setIsSilabusDialogOpen(true)} className="justify-start text-left h-auto py-3"><Book className="mr-3 h-5 w-5" /><div><p className="font-semibold">Pengembangan Silabus</p><p className="text-xs text-muted-foreground">Rancang silabus per mapel.</p></div></Button>
              <Button variant="outline" onClick={() => setIsRPPDialogOpen(true)} className="justify-start text-left h-auto py-3"><BookUp className="mr-3 h-5 w-5" /><div><p className="font-semibold">Penyusunan RPP</p><p className="text-xs text-muted-foreground">Buat rencana detail per pertemuan.</p></div></Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl"><FolderKanban className="mr-3 h-5 w-5 text-primary" />Bank Materi & Sumber Pembelajaran</CardTitle>
              <CardDescription>Kelola materi ajar, modul, video, dll.{materiList.length > 0 && ` (Total: ${materiList.length} materi)`}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Button variant="default" onClick={() => openMateriForm()} className="justify-start text-left h-auto py-3"><PlusCircle className="mr-3 h-5 w-5" /><div><p className="font-semibold">Tambah Materi Baru</p><p className="text-xs text-muted-foreground">Unggah file atau tautan.</p></div></Button>
                <Button variant="outline" onClick={() => setIsKategoriMateriDialogOpen(true)} className="justify-start text-left h-auto py-3"><List className="mr-3 h-5 w-5" /><div><p className="font-semibold">Kategorisasi Materi</p><p className="text-xs text-muted-foreground">Kelola kategori sumber belajar.</p></div></Button>
                <Button variant="outline" onClick={() => handlePlaceholderAction("Cari Materi")} className="justify-start text-left h-auto py-3"><Search className="mr-3 h-5 w-5" /><div><p className="font-semibold">Pencarian Materi</p><p className="text-xs text-muted-foreground">Temukan sumber belajar.</p></div></Button>
              </div>
              {materiList.length > 0 && (<div className="pt-4"><h4 className="text-md font-semibold mb-2">Daftar Materi Terunggah:</h4><ScrollArea className="max-h-60 border p-2 rounded-md">{materiList.map(m => (<div key={m.id} className="text-sm p-2 bg-muted/50 rounded-md flex justify-between items-center"><div><span className="font-medium">{m.judul}</span> ({m.mapel}) - {m.jenisMateri === "File" ? m.namaFile : m.url}<span className="text-xs text-muted-foreground ml-2">({m.tanggalUpload})</span></div><Button variant="ghost" size="sm" onClick={() => openMateriForm(m)}><Edit className="h-3 w-3"/></Button></div>))}</ScrollArea></div>)}
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Dialog Form Tambah/Edit Materi Ajar */}
      <Dialog open={isMateriFormOpen} onOpenChange={(open) => { setIsMateriFormOpen(open); if (!open) setCurrentEditingMateri(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{currentEditingMateri ? "Edit Materi" : "Tambah Materi Baru"}</DialogTitle></DialogHeader>
          <Form {...materiForm}>
            <form onSubmit={materiForm.handleSubmit(handleMateriSubmit)} className="space-y-4 py-4">
              <FormField control={materiForm.control} name="judul" render={({ field }) => (<FormItem><FormLabel>Judul Materi</FormLabel><FormControl><Input placeholder="Modul Bab 1 Termodinamika" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={materiForm.control} name="mapel" render={({ field }) => (<FormItem><FormLabel>Mata Pelajaran</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih mata pelajaran" /></SelectTrigger></FormControl><SelectContent>{MOCK_SUBJECTS.map(subject => (<SelectItem key={subject} value={subject}>{subject}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
              <FormField control={materiForm.control} name="deskripsi" render={({ field }) => (<FormItem><FormLabel>Deskripsi (Opsional)</FormLabel><FormControl><Textarea placeholder="Deskripsi singkat materi..." {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={materiForm.control} name="jenisMateri" render={({ field }) => (<FormItem><FormLabel>Jenis Materi</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih jenis materi" /></SelectTrigger></FormControl><SelectContent><SelectItem value="File"><UploadCloud className="inline-block mr-2 h-4 w-4" />Unggah File</SelectItem><SelectItem value="Link"><Link2Icon className="inline-block mr-2 h-4 w-4" />Tautan Eksternal</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
              {materiForm.watch("jenisMateri") === "File" && (<FormField control={materiForm.control} name="file" render={({ field }) => (<FormItem><FormLabel>Unggah File {currentEditingMateri ? "(Kosongkan jika tidak diubah)" : ""}</FormLabel><FormControl><Input type="file" onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)} /></FormControl><FormDescription>PDF, DOCX, PPTX, dll. Maks 10MB.</FormDescription><FormMessage /></FormItem>)} />)}
              {materiForm.watch("jenisMateri") === "Link" && (<FormField control={materiForm.control} name="url" render={({ field }) => (<FormItem><FormLabel>URL Materi</FormLabel><FormControl><Input placeholder="https://contoh.com/materi" {...field} /></FormControl><FormDescription>URL lengkap sumber materi.</FormDescription><FormMessage /></FormItem>)} />)}
              <DialogFooter><Button type="button" variant="outline" onClick={() => { setIsMateriFormOpen(false); setCurrentEditingMateri(null); }} disabled={isLoadingMateriSubmit}>Batal</Button><Button type="submit" disabled={isLoadingMateriSubmit}>{isLoadingMateriSubmit && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{currentEditingMateri ? "Simpan Perubahan" : "Simpan Materi"}</Button></DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog Manajemen SKL */}
      <Dialog open={isSKLDialogOpen} onOpenChange={setIsSKLDialogOpen}><DialogContent className="sm:max-w-2xl"><DialogHeader><DialogTitle>Manajemen SKL</DialogTitle><DialogDescription>Kelola Standar Kompetensi Lulusan.</DialogDescription></DialogHeader><div className="py-4 space-y-4"><Button onClick={() => openSKLForm()}><PlusCircle className="mr-2 h-4 w-4" /> Tambah SKL</Button>{isLoadingSkl ? (<div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>) : sklList.length > 0 ? (<ScrollArea className="max-h-96 border rounded-md"><Table><TableHeader className="bg-muted/50 sticky top-0"><tr><TableHead>Kode</TableHead><TableHead>Deskripsi</TableHead><TableHead>Kategori</TableHead><TableHead className="text-right">Tindakan</TableHead></tr></TableHeader><TableBody>{sklList.map(skl => (<TableRow key={skl.id}><TableCell className="font-medium">{skl.kode}</TableCell><TableCell className="max-w-md whitespace-pre-wrap">{skl.deskripsi}</TableCell><TableCell>{skl.kategori}</TableCell><TableCell className="text-right"><Button variant="ghost" size="sm" onClick={() => openSKLForm(skl)} className="mr-1"><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="sm" onClick={() => openDeleteSKLDialog(skl)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button></TableCell></TableRow>))}</TableBody></Table></ScrollArea>) : (<p className="text-muted-foreground text-center">Belum ada SKL.</p>)}</div><DialogFooter><Button variant="outline" onClick={() => setIsSKLDialogOpen(false)}>Tutup</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={isSKLFormOpen} onOpenChange={(open) => { setIsSKLFormOpen(open); if (!open) setEditingSKL(null); }}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>{editingSKL ? "Edit SKL" : "Tambah SKL Baru"}</DialogTitle></DialogHeader><Form {...sklForm}><form onSubmit={sklForm.handleSubmit(handleSKLFormSubmit)} className="space-y-4 py-2"><FormField control={sklForm.control} name="kode" render={({ field }) => (<FormItem><FormLabel>Kode SKL</FormLabel><FormControl><Input placeholder="S-01" {...field} disabled={!!editingSKL} /></FormControl>{editingSKL && <FormDescription>Kode tidak dapat diubah.</FormDescription>}<FormMessage /></FormItem>)} /><FormField control={sklForm.control} name="deskripsi" render={({ field }) => (<FormItem><FormLabel>Deskripsi SKL</FormLabel><FormControl><Textarea placeholder="Deskripsi standar..." {...field} rows={4} /></FormControl><FormMessage /></FormItem>)} /><FormField control={sklForm.control} name="kategori" render={({ field }) => (<FormItem><FormLabel>Kategori SKL</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger></FormControl><SelectContent>{(["Sikap", "Pengetahuan", "Keterampilan"] as KategoriSklType[]).map(kat => <SelectItem key={kat} value={kat}>{kat}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} /><DialogFooter className="pt-2"><Button type="button" variant="outline" onClick={() => {setIsSKLFormOpen(false); setEditingSKL(null);}} disabled={isSKLSubmitting}>Batal</Button><Button type="submit" disabled={isSKLSubmitting}>{isSKLSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editingSKL ? "Simpan" : "Tambah"}</Button></DialogFooter></form></Form></DialogContent></Dialog>
      <AlertDialog open={!!sklToDelete} onOpenChange={(open) => !open && setSklToDelete(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Konfirmasi Hapus SKL</AlertDialogTitle><AlertDialogDescription>Yakin ingin hapus SKL "{sklToDelete?.kode}"?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel onClick={() => setSklToDelete(null)} disabled={isSKLSubmitting}>Batal</AlertDialogCancel><AlertDialogAction onClick={handleDeleteSKLConfirm} className="bg-destructive hover:bg-destructive/90" disabled={isSKLSubmitting}>{isSKLSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Hapus</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
      
      {/* Dialog Manajemen CP */}
      <Dialog open={isCPDialogOpen} onOpenChange={setIsCPDialogOpen}><DialogContent className="sm:max-w-2xl"><DialogHeader><DialogTitle>Manajemen CP</DialogTitle><DialogDescription>Kelola Capaian Pembelajaran.</DialogDescription></DialogHeader><div className="py-4 space-y-4"><Button onClick={() => openCPForm()}><PlusCircle className="mr-2 h-4 w-4" /> Tambah CP</Button>{isLoadingCp ? (<div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>) : cpList.length > 0 ? (<ScrollArea className="max-h-96 border rounded-md"><Table><TableHeader className="bg-muted/50 sticky top-0"><tr><TableHead>Kode</TableHead><TableHead>Deskripsi</TableHead><TableHead>Fase</TableHead><TableHead>Elemen</TableHead><TableHead className="text-right">Tindakan</TableHead></tr></TableHeader><TableBody>{cpList.map(cp => (<TableRow key={cp.id}><TableCell className="font-medium">{cp.kode}</TableCell><TableCell className="max-w-md whitespace-pre-wrap">{cp.deskripsi}</TableCell><TableCell>{cp.fase}</TableCell><TableCell>{cp.elemen}</TableCell><TableCell className="text-right"><Button variant="ghost" size="sm" onClick={() => openCPForm(cp)} className="mr-1"><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="sm" onClick={() => openDeleteCPDialog(cp)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button></TableCell></TableRow>))}</TableBody></Table></ScrollArea>) : (<p className="text-muted-foreground text-center">Belum ada CP.</p>)}</div><DialogFooter><Button variant="outline" onClick={() => setIsCPDialogOpen(false)}>Tutup</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={isCPFormOpen} onOpenChange={(open) => { setIsCPFormOpen(open); if (!open) setEditingCP(null); }}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>{editingCP ? "Edit CP" : "Tambah CP Baru"}</DialogTitle></DialogHeader><Form {...cpForm}><form onSubmit={cpForm.handleSubmit(handleCPFormSubmit)} className="space-y-4 py-2"><FormField control={cpForm.control} name="kode" render={({ field }) => (<FormItem><FormLabel>Kode CP</FormLabel><FormControl><Input placeholder="MTK.F.ALG.1" {...field} disabled={!!editingCP} /></FormControl>{editingCP && <FormDescription>Kode tidak dapat diubah.</FormDescription>}<FormMessage /></FormItem>)} /><FormField control={cpForm.control} name="deskripsi" render={({ field }) => (<FormItem><FormLabel>Deskripsi CP</FormLabel><FormControl><Textarea placeholder="Deskripsi capaian..." {...field} rows={4} /></FormControl><FormMessage /></FormItem>)} /><FormField control={cpForm.control} name="fase" render={({ field }) => (<FormItem><FormLabel>Fase</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih fase" /></SelectTrigger></FormControl><SelectContent>{(["A", "B", "C", "D", "E", "F", "Lainnya"] as FaseCpType[]).map(f => <SelectItem key={f} value={f}>Fase {f}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} /><FormField control={cpForm.control} name="elemen" render={({ field }) => (<FormItem><FormLabel>Elemen/Domain</FormLabel><FormControl><Input placeholder="Bilangan" {...field} /></FormControl><FormMessage /></FormItem>)} /><DialogFooter className="pt-2"><Button type="button" variant="outline" onClick={() => {setIsCPFormOpen(false); setEditingCP(null);}} disabled={isCPSubmitting}>Batal</Button><Button type="submit" disabled={isCPSubmitting}>{isCPSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editingCP ? "Simpan" : "Tambah"}</Button></DialogFooter></form></Form></DialogContent></Dialog>
      <AlertDialog open={!!cpToDelete} onOpenChange={(open) => !open && setCpToDelete(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Konfirmasi Hapus CP</AlertDialogTitle><AlertDialogDescription>Yakin ingin hapus CP "{cpToDelete?.kode}"?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel onClick={() => setCpToDelete(null)} disabled={isCPSubmitting}>Batal</AlertDialogCancel><AlertDialogAction onClick={handleDeleteCPConfirm} className="bg-destructive hover:bg-destructive/90" disabled={isCPSubmitting}>{isCPSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Hapus</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>

      {/* Dialog Pemetaan SKL-CP */}
      <Dialog open={isPemetaanDialogOpen} onOpenChange={setIsPemetaanDialogOpen}><DialogContent className="sm:max-w-3xl"><DialogHeader><DialogTitle>Pemetaan SKL dan CP</DialogTitle><DialogDescription>Analisis keselarasan antara Standar Kompetensi Lulusan dan Capaian Pembelajaran (Simulasi).</DialogDescription></DialogHeader><div className="py-4 grid grid-cols-2 gap-6 max-h-[60vh]"><ScrollArea className="h-[50vh]"><Card><CardHeader><CardTitle className="text-base">Daftar SKL</CardTitle></CardHeader><CardContent className="space-y-2">{isLoadingSkl ? <Loader2 className="mx-auto my-4 h-6 w-6 animate-spin"/> : sklList.map(skl => (<div key={skl.id} className="p-2 border rounded text-xs"><p className="font-semibold">{skl.kode}: {skl.kategori}</p><p className="text-muted-foreground truncate" title={skl.deskripsi}>{skl.deskripsi}</p></div>))}</CardContent></Card></ScrollArea><ScrollArea className="h-[50vh]"><Card><CardHeader><CardTitle className="text-base">Daftar CP</CardTitle></CardHeader><CardContent className="space-y-2">{isLoadingCp ? <Loader2 className="mx-auto my-4 h-6 w-6 animate-spin"/> : cpList.map(cp => (<div key={cp.id} className="p-2 border rounded text-xs"><p className="font-semibold">{cp.kode} (Fase {cp.fase} - {cp.elemen})</p><p className="text-muted-foreground truncate" title={cp.deskripsi}>{cp.deskripsi}</p></div>))}</CardContent></Card></ScrollArea></div><Separator className="my-4" /><div className="flex justify-center gap-4"><Button onClick={() => toast({title: "Pemetaan SKL-CP (Simulasi)", description: "Proses pemetaan simulasi telah dijalankan."})}><ArrowRightLeft className="mr-2 h-4 w-4"/> Lakukan Pemetaan</Button><Button variant="outline" onClick={() => toast({title: "Analisis Keselarasan (Simulasi)", description: "Hasil analisis keselarasan: 85% SKL terdukung oleh CP yang ada."})}><BarChartHorizontalBig className="mr-2 h-4 w-4"/> Analisis Keselarasan</Button></div><DialogFooter className="mt-4"><Button variant="outline" onClick={() => setIsPemetaanDialogOpen(false)}>Tutup</Button></DialogFooter></DialogContent></Dialog>
    
      {/* Dialog Kategori Materi */}
      <Dialog open={isKategoriMateriDialogOpen} onOpenChange={setIsKategoriMateriDialogOpen}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Kelola Kategori Materi</DialogTitle><DialogDescription>Tambah atau lihat kategori untuk bank materi.</DialogDescription></DialogHeader><div className="py-4 space-y-4"><Form {...kategoriMateriForm}><form onSubmit={kategoriMateriForm.handleSubmit(handleKategoriMateriSubmit)} className="flex gap-2 items-start"><FormField control={kategoriMateriForm.control} name="nama" render={({ field }) => (<FormItem className="flex-grow"><FormLabel className="sr-only">Nama Kategori</FormLabel><FormControl><Input placeholder="Nama kategori baru" {...field} /></FormControl><FormMessage /></FormItem>)} /><Button type="submit" disabled={isKategoriMateriSubmitting}>{isKategoriMateriSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4"/>}</Button></form></Form>{isLoadingKategoriMateri ? (<div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>) : kategoriMateriList.length > 0 ? (<ScrollArea className="h-60 border rounded-md p-2"><div className="space-y-2">{kategoriMateriList.map(kat => (<div key={kat.id} className="p-2 bg-muted/50 rounded text-sm flex justify-between items-center"><span>{kat.nama}</span><Button variant="ghost" size="xs" className="text-destructive" onClick={() => openDeleteKategoriMateriDialog(kat)}><Trash2 className="h-3 w-3"/></Button></div>))}</div></ScrollArea>) : (<p className="text-sm text-muted-foreground text-center">Belum ada kategori.</p>)}</div><DialogFooter><Button variant="outline" onClick={() => setIsKategoriMateriDialogOpen(false)}>Tutup</Button></DialogFooter></DialogContent></Dialog>
      <AlertDialog open={!!kategoriMateriToDelete} onOpenChange={(open) => !open && setKategoriMateriToDelete(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Konfirmasi Hapus Kategori Materi</AlertDialogTitle><AlertDialogDescription>Yakin ingin hapus kategori "{kategoriMateriToDelete?.nama}"?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel onClick={() => setKategoriMateriToDelete(null)} disabled={isKategoriMateriSubmitting}>Batal</AlertDialogCancel><AlertDialogAction onClick={handleDeleteKategoriMateriConfirm} className="bg-destructive hover:bg-destructive/90" disabled={isKategoriMateriSubmitting}>{isKategoriMateriSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Hapus</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>


      {/* Dialog Struktur Kurikulum */}
      <Dialog open={isStrukturKurikulumDialogOpen} onOpenChange={setIsStrukturKurikulumDialogOpen}><DialogContent className="sm:max-w-2xl"><DialogHeader><DialogTitle>Struktur Kurikulum</DialogTitle><DialogDescription>Atur mata pelajaran dan alokasi jam per tingkat/jurusan.</DialogDescription></DialogHeader><div className="py-4 space-y-4"><div className="grid grid-cols-3 gap-4 items-end"><Select value={selectedTingkat} onValueChange={setSelectedTingkat}><SelectTrigger><SelectValue placeholder="Pilih Tingkat" /></SelectTrigger><SelectContent>{SCHOOL_GRADE_LEVELS.map(g => <SelectItem key={g} value={g}>Tingkat {g}</SelectItem>)}</SelectContent></Select><Select value={selectedJurusan} onValueChange={setSelectedJurusan}><SelectTrigger><SelectValue placeholder="Pilih Jurusan" /></SelectTrigger><SelectContent>{SCHOOL_MAJORS.map(m => <SelectItem key={m} value={m}>Jurusan {m}</SelectItem>)}</SelectContent></Select><Button onClick={() => setIsStrukturKurikulumFormOpen(true)}><PlusCircle className="mr-2 h-4 w-4" /> Tambah Mapel</Button></div>{strukturKurikulumData[`${selectedTingkat}-${selectedJurusan}`]?.length > 0 ? (<ScrollArea className="h-72 border rounded-md"><Table><TableHeader className="bg-muted/50 sticky top-0"><tr><TableHead>Mapel</TableHead><TableHead className="text-center">Alokasi Jam</TableHead><TableHead>Guru (Mock)</TableHead><TableHead className="text-right"></TableHead></tr></TableHeader><TableBody>{strukturKurikulumData[`${selectedTingkat}-${selectedJurusan}`].map(item => (<TableRow key={item.id}><TableCell className="font-medium">{item.namaMapel}</TableCell><TableCell className="text-center">{item.alokasiJam}</TableCell><TableCell>{item.guruPengampu || "-"}</TableCell><TableCell className="text-right"><Button variant="ghost" size="xs" className="text-destructive" onClick={() => {/* Mock delete */}}><Trash2 className="h-3 w-3"/></Button></TableCell></TableRow>))}</TableBody></Table></ScrollArea>) : (<p className="text-muted-foreground text-center py-4">Belum ada struktur untuk {selectedTingkat} {selectedJurusan}.</p>)}</div><DialogFooter><Button variant="outline" onClick={() => setIsStrukturKurikulumDialogOpen(false)}>Tutup</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={isStrukturKurikulumFormOpen} onOpenChange={setIsStrukturKurikulumFormOpen}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Tambah Mapel ke Struktur {selectedTingkat} {selectedJurusan}</DialogTitle></DialogHeader><Form {...strukturKurikulumForm}><form onSubmit={strukturKurikulumForm.handleSubmit(handleStrukturKurikulumSubmit)} className="space-y-4 py-2"><FormField control={strukturKurikulumForm.control} name="idMapel" render={({ field }) => (<FormItem><FormLabel>Mata Pelajaran</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih Mapel" /></SelectTrigger></FormControl><SelectContent>{MOCK_SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} /><FormField control={strukturKurikulumForm.control} name="alokasiJam" render={({ field }) => (<FormItem><FormLabel>Alokasi Jam per Minggu</FormLabel><FormControl><Input type="number" placeholder="Contoh: 4" {...field} /></FormControl><FormMessage /></FormItem>)} /><DialogFooter><Button type="button" variant="outline" onClick={() => setIsStrukturKurikulumFormOpen(false)} disabled={isStrukturSubmitting}>Batal</Button><Button type="submit" disabled={isStrukturSubmitting}>{isStrukturSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Simpan</Button></DialogFooter></form></Form></DialogContent></Dialog>

      {/* Dialog Manajemen Silabus */}
      <Dialog open={isSilabusDialogOpen} onOpenChange={setIsSilabusDialogOpen}><DialogContent className="sm:max-w-3xl"><DialogHeader><DialogTitle>Pengembangan Silabus</DialogTitle><DialogDescription>Kelola daftar silabus per mata pelajaran.</DialogDescription></DialogHeader><div className="py-4 space-y-4"><Button onClick={() => openSilabusForm()}><PlusCircle className="mr-2 h-4 w-4" /> Tambah Silabus</Button>{silabusList.length > 0 ? (<ScrollArea className="h-80 border rounded-md"><Table><TableHeader className="bg-muted/50 sticky top-0"><tr><TableHead>Judul</TableHead><TableHead>Mapel</TableHead><TableHead>Kelas</TableHead><TableHead>File</TableHead><TableHead className="text-right">Tindakan</TableHead></tr></TableHeader><TableBody>{silabusList.map(s => (<TableRow key={s.id}><TableCell className="font-medium max-w-xs truncate">{s.judul}</TableCell><TableCell>{s.namaMapel}</TableCell><TableCell>{s.kelas}</TableCell><TableCell>{s.namaFile || "-"}</TableCell><TableCell className="text-right"><Button variant="ghost" size="xs" onClick={() => openSilabusForm(s)} className="mr-1"><Edit className="h-3 w-3"/></Button><Button variant="ghost" size="xs" onClick={() => openDeleteSilabusDialog(s)} className="text-destructive"><Trash2 className="h-3 w-3"/></Button></TableCell></TableRow>))}</TableBody></Table></ScrollArea>) : (<p className="text-center text-muted-foreground py-4">Belum ada silabus.</p>)}</div><DialogFooter><Button variant="outline" onClick={() => setIsSilabusDialogOpen(false)}>Tutup</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={isSilabusFormOpen} onOpenChange={(open) => { setIsSilabusFormOpen(open); if(!open) setCurrentEditingSilabus(null);}}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>{currentEditingSilabus ? "Edit Silabus" : "Tambah Silabus Baru"}</DialogTitle></DialogHeader><Form {...silabusForm}><form onSubmit={silabusForm.handleSubmit(handleSilabusSubmit)} className="space-y-4 py-2"><FormField control={silabusForm.control} name="judul" render={({ field }) => (<FormItem><FormLabel>Judul Silabus</FormLabel><FormControl><Input placeholder="Silabus Matematika Semester Ganjil" {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={silabusForm.control} name="idMapel" render={({ field }) => (<FormItem><FormLabel>Mata Pelajaran</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih Mapel" /></SelectTrigger></FormControl><SelectContent>{MOCK_SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} /><FormField control={silabusForm.control} name="kelas" render={({ field }) => (<FormItem><FormLabel>Kelas</FormLabel><FormControl><Input placeholder="Contoh: X IPA 1, XI IPS Semua" {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={silabusForm.control} name="deskripsiSingkat" render={({ field }) => (<FormItem><FormLabel>Deskripsi Singkat (Opsional)</FormLabel><FormControl><Textarea placeholder="Ringkasan isi silabus..." {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={silabusForm.control} name="file" render={({ field }) => (<FormItem><FormLabel>File Silabus {currentEditingSilabus ? "(Kosongkan jika tidak diubah)" : ""}</FormLabel><FormControl><Input type="file" /></FormControl><FormDescription>Unggah file PDF/DOCX.</FormDescription><FormMessage /></FormItem>)} /><DialogFooter><Button type="button" variant="outline" onClick={() => {setIsSilabusFormOpen(false);setCurrentEditingSilabus(null);}} disabled={isSilabusSubmitting}>Batal</Button><Button type="submit" disabled={isSilabusSubmitting}>{isSilabusSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{currentEditingSilabus ? "Simpan" : "Tambah"}</Button></DialogFooter></form></Form></DialogContent></Dialog>
      <AlertDialog open={!!silabusToDelete} onOpenChange={(open) => !open && setSilabusToDelete(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Konfirmasi Hapus Silabus</AlertDialogTitle><AlertDialogDescription>Yakin ingin hapus silabus "{silabusToDelete?.judul}"?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel onClick={() => setSilabusToDelete(null)} disabled={isSilabusSubmitting}>Batal</AlertDialogCancel><AlertDialogAction onClick={handleDeleteSilabusConfirm} className="bg-destructive hover:bg-destructive/90" disabled={isSilabusSubmitting}>{isSilabusSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Hapus</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>

      {/* Dialog Manajemen RPP */}
      <Dialog open={isRPPDialogOpen} onOpenChange={setIsRPPDialogOpen}><DialogContent className="sm:max-w-3xl"><DialogHeader><DialogTitle>Penyusunan RPP</DialogTitle><DialogDescription>Kelola Rencana Pelaksanaan Pembelajaran.</DialogDescription></DialogHeader><div className="py-4 space-y-4"><Button onClick={() => openRPPForm()}><PlusCircle className="mr-2 h-4 w-4" /> Tambah RPP</Button>{rppList.length > 0 ? (<ScrollArea className="h-80 border rounded-md"><Table><TableHeader className="bg-muted/50 sticky top-0"><tr><TableHead>Judul</TableHead><TableHead>Mapel</TableHead><TableHead>Kelas</TableHead><TableHead className="text-center">Pertemuan</TableHead><TableHead className="text-right">Tindakan</TableHead></tr></TableHeader><TableBody>{rppList.map(r => (<TableRow key={r.id}><TableCell className="font-medium max-w-xs truncate">{r.judul}</TableCell><TableCell>{r.namaMapel}</TableCell><TableCell>{r.kelas}</TableCell><TableCell className="text-center">{r.pertemuanKe}</TableCell><TableCell className="text-right"><Button variant="ghost" size="xs" onClick={() => openRPPForm(r)} className="mr-1"><Edit className="h-3 w-3"/></Button><Button variant="ghost" size="xs" onClick={() => openDeleteRPPDialog(r)} className="text-destructive"><Trash2 className="h-3 w-3"/></Button></TableCell></TableRow>))}</TableBody></Table></ScrollArea>) : (<p className="text-center text-muted-foreground py-4">Belum ada RPP.</p>)}</div><DialogFooter><Button variant="outline" onClick={() => setIsRPPDialogOpen(false)}>Tutup</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={isRPPFormOpen} onOpenChange={(open) => { setIsRPPFormOpen(open); if(!open) setCurrentEditingRPP(null);}}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>{currentEditingRPP ? "Edit RPP" : "Tambah RPP Baru"}</DialogTitle></DialogHeader><Form {...rppForm}><form onSubmit={rppForm.handleSubmit(handleRPPSubmit)} className="space-y-4 py-2"><FormField control={rppForm.control} name="judul" render={({ field }) => (<FormItem><FormLabel>Judul RPP</FormLabel><FormControl><Input placeholder="RPP Fungsi Kuadrat Pertemuan 1" {...field} /></FormControl><FormMessage /></FormItem>)} /><div className="grid grid-cols-2 gap-4"><FormField control={rppForm.control} name="idMapel" render={({ field }) => (<FormItem><FormLabel>Mata Pelajaran</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih Mapel" /></SelectTrigger></FormControl><SelectContent>{MOCK_SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} /><FormField control={rppForm.control} name="kelas" render={({ field }) => (<FormItem><FormLabel>Kelas</FormLabel><FormControl><Input placeholder="X IPA 1" {...field} /></FormControl><FormMessage /></FormItem>)} /></div><FormField control={rppForm.control} name="pertemuanKe" render={({ field }) => (<FormItem><FormLabel>Pertemuan Ke-</FormLabel><FormControl><Input type="number" placeholder="1" {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={rppForm.control} name="materiPokok" render={({ field }) => (<FormItem><FormLabel>Materi Pokok (Opsional)</FormLabel><FormControl><Textarea placeholder="Materi utama yang dibahas..." {...field} rows={2}/></FormControl><FormMessage /></FormItem>)} /><FormField control={rppForm.control} name="kegiatanPembelajaran" render={({ field }) => (<FormItem><FormLabel>Kegiatan Pembelajaran (Opsional)</FormLabel><FormControl><Textarea placeholder="Langkah-langkah kegiatan..." {...field} rows={3}/></FormControl><FormMessage /></FormItem>)} /><FormField control={rppForm.control} name="penilaian" render={({ field }) => (<FormItem><FormLabel>Penilaian (Opsional)</FormLabel><FormControl><Textarea placeholder="Teknik dan instrumen penilaian..." {...field} rows={2}/></FormControl><FormMessage /></FormItem>)} /><FormField control={rppForm.control} name="file" render={({ field }) => (<FormItem><FormLabel>File RPP {currentEditingRPP ? "(Kosongkan jika tidak diubah)" : ""}</FormLabel><FormControl><Input type="file" /></FormControl><FormDescription>Unggah file PDF/DOCX.</FormDescription><FormMessage /></FormItem>)} /><DialogFooter><Button type="button" variant="outline" onClick={() => {setIsRPPFormOpen(false);setCurrentEditingRPP(null);}} disabled={isRPPSubmitting}>Batal</Button><Button type="submit" disabled={isRPPSubmitting}>{isRPPSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{currentEditingRPP ? "Simpan" : "Tambah"}</Button></DialogFooter></form></Form></DialogContent></Dialog>
      <AlertDialog open={!!rppToDelete} onOpenChange={(open) => !open && setRppToDelete(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Konfirmasi Hapus RPP</AlertDialogTitle><AlertDialogDescription>Yakin ingin hapus RPP "{rppToDelete?.judul}"?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel onClick={() => setRppToDelete(null)} disabled={isRPPSubmitting}>Batal</AlertDialogCancel><AlertDialogAction onClick={handleDeleteRPPConfirm} className="bg-destructive hover:bg-destructive/90" disabled={isRPPSubmitting}>{isRPPSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Hapus</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>

    </div>
  );
}

    