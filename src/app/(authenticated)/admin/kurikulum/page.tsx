
"use client";

import React, { useState, useEffect, useCallback } from "react";
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
import { BookOpenCheck, Target, BookCopy, BookUp, Layers, FileText, FolderKanban, PlusCircle, Edit, Loader2, UploadCloud, Link2, Trash2, Book, Library, List, GitMerge, Search } from "lucide-react";
import Link from "next/link";
import { ROUTES, SCHOOL_GRADE_LEVELS, SCHOOL_MAJORS, KATEGORI_SKL_CONST, FASE_CP_CONST, JENIS_MATERI_AJAR as JENIS_MATERI_AJAR_CONST } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import type { SKL, CapaianPembelajaran, MateriKategori, StrukturKurikulumItem, Silabus, RPP, KategoriSklType, FaseCpType, MateriAjar, JenisMateriAjarType, MataPelajaran, User } from "@/types";
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
import { Table, TableHead, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table";
import { format, parseISO } from "date-fns";


const materiAjarClientSchema = z.object({
  judul: z.string().min(3, { message: "Judul materi minimal 3 karakter." }).max(255),
  deskripsi: z.string().optional(),
  mapelNama: z.string({ required_error: "Mata pelajaran wajib dipilih." }),
  jenisMateri: z.enum(JENIS_MATERI_AJAR_CONST, { required_error: "Jenis materi wajib dipilih." }),
  fileInput: z.any().optional(), 
  externalUrl: z.string().url({ message: "URL tidak valid." }).optional().or(z.literal('')),
}).refine(data => {
  if (data.jenisMateri === "Link" && !data.externalUrl) return false;
  return true;
}, {
  message: "Jika jenis 'Link', URL wajib diisi.",
  path: ["externalUrl"], 
});
type MateriAjarClientFormValues = z.infer<typeof materiAjarClientSchema>;


const sklSchema = z.object({
  kode: z.string().min(2, { message: "Kode SKL minimal 2 karakter." }).max(50),
  deskripsi: z.string().min(10, { message: "Deskripsi SKL minimal 10 karakter." }),
  kategori: z.enum(KATEGORI_SKL_CONST as [string, ...string[]], { required_error: "Kategori SKL wajib dipilih." }),
});
type SKLFormValues = z.infer<typeof sklSchema>;

const cpSchema = z.object({
  kode: z.string().min(2, { message: "Kode CP minimal 2 karakter." }).max(100),
  deskripsi: z.string().min(10, { message: "Deskripsi CP minimal 10 karakter." }),
  fase: z.enum(FASE_CP_CONST as [string, ...string[]], { required_error: "Fase wajib dipilih."}),
  elemen: z.string().min(3, {message: "Elemen minimal 3 karakter."}).max(255),
});
type CPFormValues = z.infer<typeof cpSchema>;

const kategoriMateriSchema = z.object({
  nama: z.string().min(3, { message: "Nama kategori minimal 3 karakter." }).max(255),
});
type KategoriMateriFormValues = z.infer<typeof kategoriMateriSchema>;

const strukturKurikulumClientSchema = z.object({
  mapelId: z.string({ required_error: "Mata pelajaran wajib dipilih."}).uuid({ message: "ID Mata Pelajaran tidak valid."}),
  alokasiJam: z.coerce.number().min(1, { message: "Alokasi jam minimal 1."}),
  guruPengampuId: z.string().uuid({ message: "ID Guru tidak valid."}).optional().nullable(),
});
type StrukturKurikulumClientFormValues = z.infer<typeof strukturKurikulumClientSchema>;


const silabusSchema = z.object({
  judul: z.string().min(5, { message: "Judul silabus minimal 5 karakter." }),
  mapelId: z.string({ required_error: "Mata pelajaran wajib dipilih."}).uuid({ message: "Mata pelajaran tidak valid."}),
  kelas: z.string().min(1, {message: "Kelas minimal 1 karakter."}),
  deskripsiSingkat: z.string().optional(),
  file: z.any().optional(),
});
type SilabusFormValues = z.infer<typeof silabusSchema>;

const rppSchema = z.object({
  judul: z.string().min(5, { message: "Judul RPP minimal 5 karakter." }),
  mapelId: z.string({ required_error: "Mata pelajaran wajib dipilih."}).uuid({ message: "Mata pelajaran tidak valid."}),
  kelas: z.string().min(1, {message: "Kelas minimal 1 karakter."}),
  pertemuanKe: z.coerce.number().min(1, { message: "Pertemuan minimal 1."}),
  materiPokok: z.string().optional(),
  kegiatanPembelajaran: z.string().optional(),
  penilaian: z.string().optional(),
  file: z.any().optional(),
});
type RPPFormValues = z.infer<typeof rppSchema>;


export default function AdminKurikulumPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isMateriFormOpen, setIsMateriFormOpen] = useState(false);
  const [currentEditingMateri, setCurrentEditingMateri] = useState<MateriAjar | null>(null);
  const [materiList, setMateriList] = useState<MateriAjar[]>([]);
  const [isLoadingMateriList, setIsLoadingMateriList] = useState(true);
  const [isMateriSubmitting, setIsMateriSubmitting] = useState(false);
  const [materiToDelete, setMateriToDelete] = useState<MateriAjar | null>(null);
  const materiAjarForm = useForm<MateriAjarClientFormValues>({ resolver: zodResolver(materiAjarClientSchema), defaultValues: { judul: "", deskripsi: "", mapelNama: undefined, jenisMateri: undefined, fileInput: undefined, externalUrl: "" } });
  const [isSKLDialogOpen, setIsSKLDialogOpen] = useState(false);
  const [isSKLFormOpen, setIsSKLFormOpen] = useState(false);
  const [editingSKL, setEditingSKL] = useState<SKL | null>(null);
  const [sklToDelete, setSklToDelete] = useState<SKL | null>(null);
  const [sklList, setSklList] = useState<SKL[]>([]);
  const [isLoadingSkl, setIsLoadingSkl] = useState(true);
  const [isSKLSubmitting, setIsSKLSubmitting] = useState(false);
  const sklForm = useForm<SKLFormValues>({ resolver: zodResolver(sklSchema), defaultValues: { kode: "", deskripsi: "", kategori: undefined } });
  const [isCPDialogOpen, setIsCPDialogOpen] = useState(false);
  const [isCPFormOpen, setIsCPFormOpen] = useState(false);
  const [editingCP, setEditingCP] = useState<CapaianPembelajaran | null>(null);
  const [cpToDelete, setCpToDelete] = useState<CapaianPembelajaran | null>(null);
  const [cpList, setCpList] = useState<CapaianPembelajaran[]>([]);
  const [isLoadingCp, setIsLoadingCp] = useState(true);
  const [isCPSubmitting, setIsCPSubmitting] = useState(false);
  const cpForm = useForm<CPFormValues>({ resolver: zodResolver(cpSchema), defaultValues: { kode: "", deskripsi: "", fase: undefined, elemen: "" } });
  const [isKategoriMateriDialogOpen, setIsKategoriMateriDialogOpen] = useState(false);
  const [kategoriMateriList, setKategoriMateriList] = useState<MateriKategori[]>([]);
  const [isLoadingKategoriMateri, setIsLoadingKategoriMateri] = useState(true);
  const [isKategoriMateriSubmitting, setIsKategoriMateriSubmitting] = useState(false);
  const [kategoriMateriToDelete, setKategoriMateriToDelete] = useState<MateriKategori | null>(null);
  const kategoriMateriForm = useForm<KategoriMateriFormValues>({ resolver: zodResolver(kategoriMateriSchema), defaultValues: { nama: "" }});
  const [isStrukturKurikulumDialogOpen, setIsStrukturKurikulumDialogOpen] = useState(false);
  const [isStrukturKurikulumFormOpen, setIsStrukturKurikulumFormOpen] = useState(false);
  const [strukturKurikulumData, setStrukturKurikulumData] = useState<Record<string, StrukturKurikulumItem[]>>({});
  const [selectedTingkat, setSelectedTingkat] = useState<string>(SCHOOL_GRADE_LEVELS[0]);
  const [selectedJurusan, setSelectedJurusan] = useState<string>(SCHOOL_MAJORS[0]);
  const [isLoadingStruktur, setIsLoadingStruktur] = useState(false);
  const [isStrukturSubmitting, setIsStrukturSubmitting] = useState(false);
  const [strukturItemToDelete, setStrukturItemToDelete] = useState<StrukturKurikulumItem | null>(null);
  const [mataPelajaranOptions, setMataPelajaranOptions] = useState<MataPelajaran[]>([]);
  const [guruOptions, setGuruOptions] = useState<User[]>([]);
  const strukturKurikulumForm = useForm<StrukturKurikulumClientFormValues>({resolver: zodResolver(strukturKurikulumClientSchema), defaultValues: {mapelId: undefined, alokasiJam: 0, guruPengampuId: undefined}});
  const [isSilabusDialogOpen, setIsSilabusDialogOpen] = useState(false);
  const [isSilabusFormOpen, setIsSilabusFormOpen] = useState(false);
  const [currentEditingSilabus, setCurrentEditingSilabus] = useState<Silabus | null>(null);
  const [silabusToDelete, setSilabusToDelete] = useState<Silabus | null>(null);
  const [silabusList, setSilabusList] = useState<Silabus[]>([]);
  const [isLoadingSilabus, setIsLoadingSilabus] = useState(true);
  const [isSilabusSubmitting, setIsSilabusSubmitting] = useState(false);
  const silabusForm = useForm<SilabusFormValues>({ resolver: zodResolver(silabusSchema), defaultValues: { judul: "", mapelId: undefined, kelas: "", deskripsiSingkat: "", file: undefined }});
  const [isRPPDialogOpen, setIsRPPDialogOpen] = useState(false);
  const [isRPPFormOpen, setIsRPPFormOpen] = useState(false);
  const [currentEditingRPP, setCurrentEditingRPP] = useState<RPP | null>(null);
  const [rppToDelete, setRppToDelete] = useState<RPP | null>(null);
  const [rppList, setRppList] = useState<RPP[]>([]);
  const [isLoadingRpp, setIsLoadingRpp] = useState(true);
  const [isRPPSubmitting, setIsRPPSubmitting] = useState(false);
  const rppForm = useForm<RPPFormValues>({ resolver: zodResolver(rppSchema), defaultValues: { judul: "", mapelId: undefined, kelas: "", pertemuanKe: 1, materiPokok: "", kegiatanPembelajaran: "", penilaian: "", file: undefined }});

  const fetchSklData = useCallback(async () => { setIsLoadingSkl(true); try { const res = await fetch('/api/kurikulum/skl'); if (!res.ok) throw new Error('Gagal mengambil data SKL'); setSklList(await res.json()); } catch (e: any) { toast({ title: "Error SKL", description: e.message || "Tidak dapat memuat SKL.", variant: "destructive" }); } finally { setIsLoadingSkl(false); } }, [toast]);
  const fetchCpData = useCallback(async () => { setIsLoadingCp(true); try { const res = await fetch('/api/kurikulum/cp'); if (!res.ok) throw new Error('Gagal mengambil data CP'); setCpList(await res.json()); } catch (e: any) { toast({ title: "Error CP", description: e.message || "Tidak dapat memuat CP.", variant: "destructive" }); } finally { setIsLoadingCp(false); } }, [toast]);
  const fetchKategoriMateriData = useCallback(async () => { setIsLoadingKategoriMateri(true); try { const res = await fetch('/api/kurikulum/materi-kategori'); if (!res.ok) throw new Error('Gagal mengambil kategori'); setKategoriMateriList(await res.json()); } catch (e: any) { toast({ title: "Error Kategori", description: e.message, variant: "destructive" }); } finally { setIsLoadingKategoriMateri(false); } }, [toast]);
  const fetchMateriAjarData = useCallback(async () => { setIsLoadingMateriList(true); try { const res = await fetch('/api/kurikulum/materi-ajar'); if (!res.ok) throw new Error('Gagal mengambil materi'); setMateriList(await res.json()); } catch (e: any) { toast({ title: "Error Materi Ajar", description: e.message, variant: "destructive" }); } finally { setIsLoadingMateriList(false); } }, [toast]);
  const fetchMataPelajaranOptions = useCallback(async () => { try { const res = await fetch('/api/mapel'); if (!res.ok) throw new Error('Gagal mengambil mapel'); setMataPelajaranOptions(await res.json()); } catch (e: any) { toast({ title: "Error Mapel", description: e.message, variant: "destructive" }); }}, [toast]);
  const fetchGuruOptions = useCallback(async () => { try { const res = await fetch('/api/users?role=guru'); if (!res.ok) throw new Error('Gagal mengambil guru'); setGuruOptions(await res.json()); } catch (e: any) { toast({ title: "Error Guru", description: e.message, variant: "destructive" }); }}, [toast]);
  const fetchStrukturKurikulumData = useCallback(async (tingkat: string, jurusan: string) => { setIsLoadingStruktur(true); try { const res = await fetch(`/api/kurikulum/struktur?tingkat=${encodeURIComponent(tingkat)}&jurusan=${encodeURIComponent(jurusan)}`); if (!res.ok) throw new Error(`Gagal mengambil struktur kurikulum`); setStrukturKurikulumData(prev => ({ ...prev, [`${tingkat}-${jurusan}`]: await res.json() })); } catch (e: any) { toast({ title: "Error Struktur Kurikulum", description: e.message, variant: "destructive" }); setStrukturKurikulumData(prev => ({ ...prev, [`${tingkat}-${jurusan}`]: [] })); } finally { setIsLoadingStruktur(false); } }, [toast]);
  const fetchSilabusData = useCallback(async () => { setIsLoadingSilabus(true); try { const res = await fetch('/api/kurikulum/silabus'); if (!res.ok) throw new Error('Gagal mengambil silabus'); setSilabusList(await res.json()); } catch (e: any) { toast({ title: "Error Silabus", description: e.message, variant: "destructive" }); } finally { setIsLoadingSilabus(false); } }, [toast]);
  const fetchRppData = useCallback(async () => { setIsLoadingRpp(true); try { const res = await fetch('/api/kurikulum/rpp'); if (!res.ok) throw new Error('Gagal mengambil RPP'); setRppList(await res.json()); } catch (e: any) { toast({ title: "Error RPP", description: e.message, variant: "destructive" }); } finally { setIsLoadingRpp(false); } }, [toast]);
  
  useEffect(() => { if (user && (user.role === 'admin' || user.role === 'superadmin')) { fetchSklData(); fetchCpData(); fetchKategoriMateriData(); fetchMateriAjarData(); fetchMataPelajaranOptions(); fetchGuruOptions(); fetchSilabusData(); fetchRppData(); } }, [user, fetchSklData, fetchCpData, fetchKategoriMateriData, fetchMateriAjarData, fetchMataPelajaranOptions, fetchGuruOptions, fetchSilabusData, fetchRppData]);
  useEffect(() => { if (selectedTingkat && selectedJurusan && (user?.role === 'admin' || user?.role === 'superadmin')) { if (!strukturKurikulumData[`${selectedTingkat}-${selectedJurusan}`]) { fetchStrukturKurikulumData(selectedTingkat, selectedJurusan); } } }, [selectedTingkat, selectedJurusan, user, strukturKurikulumData, fetchStrukturKurikulumData]);
  useEffect(() => { if (editingSKL) sklForm.reset(editingSKL); else sklForm.reset({ kode: "", deskripsi: "", kategori: undefined }); }, [editingSKL, sklForm, isSKLFormOpen]);
  useEffect(() => { if (editingCP) cpForm.reset(editingCP); else cpForm.reset({ kode: "", deskripsi: "", fase: undefined, elemen: "" }); }, [editingCP, cpForm, isCPFormOpen]);
  useEffect(() => { if (currentEditingMateri) materiAjarForm.reset({ judul: currentEditingMateri.judul, deskripsi: currentEditingMateri.deskripsi || "", mapelNama: currentEditingMateri.mapelNama, jenisMateri: currentEditingMateri.jenisMateri, externalUrl: currentEditingMateri.jenisMateri === "Link" ? currentEditingMateri.fileUrl || "" : "", fileInput: undefined }); else materiAjarForm.reset({ judul: "", deskripsi: "", mapelNama: undefined, jenisMateri: undefined, fileInput: undefined, externalUrl: "" }); }, [currentEditingMateri, materiAjarForm, isMateriFormOpen]);
  useEffect(() => { if (currentEditingSilabus) silabusForm.reset({ judul: currentEditingSilabus.judul, mapelId: currentEditingSilabus.mapelId, kelas: currentEditingSilabus.kelas, deskripsiSingkat: currentEditingSilabus.deskripsiSingkat || "", file: undefined }); else silabusForm.reset({ judul: "", mapelId: undefined, kelas: "", deskripsiSingkat: "", file: undefined }); }, [currentEditingSilabus, silabusForm, isSilabusFormOpen]);
  useEffect(() => { if (currentEditingRPP) rppForm.reset({ judul: currentEditingRPP.judul, mapelId: currentEditingRPP.mapelId, kelas: currentEditingRPP.kelas, pertemuanKe: currentEditingRPP.pertemuanKe, materiPokok: currentEditingRPP.materiPokok || "", kegiatanPembelajaran: currentEditingRPP.kegiatanPembelajaran || "", penilaian: currentEditingRPP.penilaian || "", file: undefined }); else rppForm.reset({ judul: "", mapelId: undefined, kelas: "", pertemuanKe: 1, materiPokok: "", kegiatanPembelajaran: "", penilaian: "", file: undefined }); }, [currentEditingRPP, rppForm, isRPPFormOpen]);

  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) { return <p>Akses Ditolak.</p>; }
  
  const handleMateriSubmit = async (values: MateriAjarClientFormValues) => {
    setIsMateriSubmitting(true);
    try {
      const payload: Partial<MateriAjar> = {
        judul: values.judul,
        deskripsi: values.deskripsi,
        mapelNama: values.mapelNama,
        jenisMateri: values.jenisMateri,
      };
      if (values.jenisMateri === "File") {
        if (values.fileInput && values.fileInput.name) {
          payload.namaFileOriginal = values.fileInput.name;
        }
      } else if (values.jenisMateri === "Link") {
        payload.fileUrl = values.externalUrl;
        payload.namaFileOriginal = null;
      }
      const url = currentEditingMateri ? `/api/kurikulum/materi-ajar/${currentEditingMateri.id}` : '/api/kurikulum/materi-ajar';
      const method = currentEditingMateri ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.message || 'Gagal menyimpan materi ajar');
      }
      toast({
        title: "Berhasil!",
        description: `Materi "${values.judul}" ${currentEditingMateri ? 'diperbarui' : 'ditambahkan'}.`
      });
      setIsMateriFormOpen(false);
      fetchMateriAjarData();
    } catch (e: any) {
      toast({
        title: "Error Materi",
        description: e.message,
        variant: "destructive"
      });
    } finally {
      setIsMateriSubmitting(false);
    }
  };

  const handleDeleteMateriConfirm = async () => {
    if (!materiToDelete) return;
    setIsMateriSubmitting(true);
    try {
      const res = await fetch(`/api/kurikulum/materi-ajar/${materiToDelete.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.message || 'Gagal menghapus materi ajar');
      }
      toast({ title: "Dihapus!", description: `Materi "${materiToDelete.judul}" dihapus.` });
      fetchMateriAjarData();
    } catch (e: any) {
      toast({ title: "Error Materi", description: e.message, variant: "destructive" });
    } finally {
      setIsMateriSubmitting(false);
      setMateriToDelete(null);
    }
  };

  const handleSKLSubmit = async (values: SKLFormValues) => {
    setIsSKLSubmitting(true);
    try {
      const url = editingSKL ? `/api/kurikulum/skl/${editingSKL.id}` : '/api/kurikulum/skl';
      const method = editingSKL ? 'PUT' : 'POST';
      const payload = editingSKL ? { deskripsi: values.deskripsi, kategori: values.kategori } : values;
      const res = await fetch(url, { method: method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.message || 'Gagal menyimpan SKL');
      }
      toast({ title: "Berhasil!", description: `SKL ${values.kode || editingSKL?.kode} ${editingSKL ? 'diperbarui' : 'ditambahkan'}.` });
      setIsSKLFormOpen(false);
      fetchSklData();
    } catch (e: any) {
      toast({ title: "Error SKL", description: e.message, variant: "destructive" });
    } finally {
      setIsSKLSubmitting(false);
    }
  };

  const handleDeleteSKLConfirm = async () => {
    if (!sklToDelete) return;
    setIsSKLSubmitting(true);
    try {
      const res = await fetch(`/api/kurikulum/skl/${sklToDelete.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.message || 'Gagal menghapus SKL');
      }
      toast({ title: "Dihapus!", description: `SKL ${sklToDelete.kode} dihapus.` });
      fetchSklData();
    } catch (e: any) {
      toast({ title: "Error SKL", description: e.message, variant: "destructive" });
    } finally {
      setIsSKLSubmitting(false);
      setSklToDelete(null);
    }
  };

  const handleCPSubmit = async (values: CPFormValues) => {
    setIsCPSubmitting(true);
    try {
      const url = editingCP ? `/api/kurikulum/cp/${editingCP.id}` : '/api/kurikulum/cp';
      const method = editingCP ? 'PUT' : 'POST';
      const payload = editingCP ? { deskripsi: values.deskripsi, fase: values.fase, elemen: values.elemen } : values;
      const res = await fetch(url, { method: method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.message || 'Gagal menyimpan CP');
      }
      toast({ title: "Berhasil!", description: `CP ${values.kode || editingCP?.kode} ${editingCP ? 'diperbarui' : 'ditambahkan'}.` });
      setIsCPFormOpen(false);
      fetchCpData();
    } catch (e: any) {
      toast({ title: "Error CP", description: e.message, variant: "destructive" });
    } finally {
      setIsCPSubmitting(false);
    }
  };

  const handleDeleteCPConfirm = async () => {
    if (!cpToDelete) return;
    setIsCPSubmitting(true);
    try {
      const res = await fetch(`/api/kurikulum/cp/${cpToDelete.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.message || 'Gagal menghapus CP');
      }
      toast({ title: "Dihapus!", description: `CP ${cpToDelete.kode} dihapus.` });
      fetchCpData();
    } catch (e: any) {
      toast({ title: "Error CP", description: e.message, variant: "destructive" });
    } finally {
      setIsCPSubmitting(false);
      setCpToDelete(null);
    }
  };

  const handleKategoriMateriSubmit = async (values: KategoriMateriFormValues) => {
    setIsKategoriMateriSubmitting(true);
    try {
      const res = await fetch('/api/kurikulum/materi-kategori', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values), });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.message || 'Gagal menyimpan kategori');
      }
      toast({ title: "Berhasil!", description: `Kategori "${values.nama}" ditambahkan.` });
      kategoriMateriForm.reset();
      fetchKategoriMateriData();
    } catch (e: any) {
      toast({ title: "Error Kategori", description: e.message, variant: "destructive" });
    } finally {
      setIsKategoriMateriSubmitting(false);
    }
  };

  const handleDeleteKategoriMateriConfirm = async () => {
    if (!kategoriMateriToDelete) return;
    setIsKategoriMateriSubmitting(true);
    try {
      const res = await fetch(`/api/kurikulum/materi-kategori/${kategoriMateriToDelete.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.message || 'Gagal menghapus kategori');
      }
      toast({ title: "Dihapus!", description: `Kategori "${kategoriMateriToDelete.nama}" dihapus.` });
      fetchKategoriMateriData();
    } catch (e: any) {
      toast({ title: "Error Kategori", description: e.message, variant: "destructive" });
    } finally {
      setIsKategoriMateriSubmitting(false);
      setKategoriMateriToDelete(null);
    }
  };

  const handleStrukturSubmit = async (values: StrukturKurikulumClientFormValues) => {
    setIsStrukturSubmitting(true);
    try {
      const payload = { ...values, tingkat: selectedTingkat, jurusan: selectedJurusan };
      const res = await fetch('/api/kurikulum/struktur', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.message || 'Gagal menambahkan mapel.');
      }
      toast({ title: "Berhasil!", description: `Mata pelajaran ditambahkan ke struktur.` });
      fetchStrukturKurikulumData(selectedTingkat, selectedJurusan);
      setIsStrukturKurikulumFormOpen(false);
      strukturKurikulumForm.reset({mapelId: undefined, alokasiJam: 0, guruPengampuId: undefined});
    } catch (e: any) {
      toast({ title: "Error Struktur", description: e.message, variant: "destructive" });
    } finally {
      setIsStrukturSubmitting(false);
    }
  };

  const handleDeleteStrukturItemConfirm = async () => {
    if (!strukturItemToDelete) return;
    setIsStrukturSubmitting(true);
    try {
      const res = await fetch(`/api/kurikulum/struktur/${strukturItemToDelete.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.message || 'Gagal menghapus item.');
      }
      toast({ title: "Dihapus!", description: `Item "${strukturItemToDelete.namaMapel}" dihapus.` });
      fetchStrukturKurikulumData(selectedTingkat, selectedJurusan);
    } catch (e: any) {
      toast({ title: "Error Hapus", description: e.message, variant: "destructive" });
    } finally {
      setIsStrukturSubmitting(false);
      setStrukturItemToDelete(null);
    }
  };

  const handleSilabusSubmit = async (values: SilabusFormValues) => {
    setIsSilabusSubmitting(true);
    try {
      const payload: Partial<Silabus> = { ...values, namaFileOriginal: values.file ? (values.file as File).name : undefined };
      const url = currentEditingSilabus ? `/api/kurikulum/silabus/${currentEditingSilabus.id}` : '/api/kurikulum/silabus';
      const method = currentEditingSilabus ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.message || 'Gagal menyimpan silabus');
      }
      toast({title: "Berhasil!", description: `Silabus "${values.judul}" ${currentEditingSilabus ? 'diperbarui' : 'ditambahkan'}.`});
      setIsSilabusFormOpen(false);
      silabusForm.reset();
      fetchSilabusData();
    } catch (e: any) {
      toast({ title: "Error Silabus", description: e.message, variant: "destructive" });
    } finally {
      setIsSilabusSubmitting(false);
    }
  };

  const handleDeleteSilabusConfirm = async () => {
    if (!silabusToDelete) return;
    setIsSilabusSubmitting(true);
    try {
      const res = await fetch(`/api/kurikulum/silabus/${silabusToDelete.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.message || 'Gagal menghapus silabus');
      }
      toast({ title: "Dihapus!", description: `Silabus "${silabusToDelete.judul}" dihapus.` });
      fetchSilabusData();
    } catch (e: any) {
      toast({ title: "Error Silabus", description: e.message, variant: "destructive" });
    } finally {
      setIsSilabusSubmitting(false);
      setSilabusToDelete(null);
    }
  };

  const handleRPPSubmit = async (values: RPPFormValues) => {
    setIsRPPSubmitting(true);
    try {
      const payload: Partial<RPP> = { ...values, namaFileOriginal: values.file ? (values.file as File).name : undefined };
      const url = currentEditingRPP ? `/api/kurikulum/rpp/${currentEditingRPP.id}` : '/api/kurikulum/rpp';
      const method = currentEditingRPP ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.message || 'Gagal menyimpan RPP');
      }
      toast({title: "Berhasil!", description: `RPP "${values.judul}" ${currentEditingRPP ? 'diperbarui' : 'ditambahkan'}.`});
      setIsRPPFormOpen(false);
      rppForm.reset();
      fetchRppData();
    } catch (e: any) {
      toast({ title: "Error RPP", description: e.message, variant: "destructive" });
    } finally {
      setIsRPPSubmitting(false);
    }
  };

  const handleDeleteRPPConfirm = async () => {
    if (!rppToDelete) return;
    setIsRPPSubmitting(true);
    try {
      const res = await fetch(`/api/kurikulum/rpp/${rppToDelete.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.message || 'Gagal menghapus RPP');
      }
      toast({ title: "Dihapus!", description: `RPP "${rppToDelete.judul}" dihapus.` });
      fetchRppData();
    } catch (e: any) {
      toast({ title: "Error RPP", description: e.message, variant: "destructive" });
    } finally {
      setIsRPPSubmitting(false);
      setRppToDelete(null);
    }
  };

  const openPlaceholderToast = () => toast({ title: "Fitur Dalam Pengembangan", description: "Fitur ini akan segera tersedia." });
  const openSKLForm = (skl?: SKL) => { setEditingSKL(skl || null); setIsSKLFormOpen(true); };
  const openDeleteSKLDialog = (skl: SKL) => setSklToDelete(skl);
  const openCPForm = (cp?: CapaianPembelajaran) => { setEditingCP(cp || null); setIsCPFormOpen(true); };
  const openDeleteCPDialog = (cp: CapaianPembelajaran) => setCpToDelete(cp);
  const openDeleteKategoriMateriDialog = (kategori: MateriKategori) => setKategoriMateriToDelete(kategori);
  const openDeleteStrukturItemDialog = (item: StrukturKurikulumItem) => setStrukturItemToDelete(item);
  const openSilabusForm = (silabus?: Silabus) => { setCurrentEditingSilabus(silabus || null); setIsSilabusFormOpen(true); };
  const openDeleteSilabusDialog = (silabus: Silabus) => setSilabusToDelete(silabus);
  const openRPPForm = (rpp?: RPP) => { setCurrentEditingRPP(rpp || null); setIsRPPFormOpen(true); };
  const openDeleteRPPDialog = (rpp: RPP) => setRppToDelete(rpp);
  const openMateriForm = (materi?: MateriAjar) => { setCurrentEditingMateri(materi || null); setIsMateriFormOpen(true); };
  const openDeleteMateriDialog = (materi: MateriAjar) => setMateriToDelete(materi);

  const currentStrukturList = strukturKurikulumData[`${selectedTingkat}-${selectedJurusan}`] || [];

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-semibold">Manajemen Kurikulum</h1>
          <p className="text-muted-foreground mt-1">Rancang standar, struktur, silabus, RPP, dan materi ajar.</p>
        </div>
        <Button onClick={openPlaceholderToast} disabled>
          <PlusCircle className="mr-2 h-4 w-4" /> Buat Kurikulum Baru (Holistik)
        </Button>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader><CardTitle className="flex items-center"><BookOpenCheck className="mr-2 h-6 w-6 text-primary" />Pengembangan Kurikulum</CardTitle><CardDescription>Rancang standar, struktur, silabus, RPP, dan materi ajar.</CardDescription></CardHeader>
        <CardContent className="space-y-8">
          <Card>
            <CardHeader><CardTitle className="flex items-center text-xl"><Target className="mr-3 h-5 w-5 text-primary" />Standar Kompetensi & Capaian</CardTitle><CardDescription>Kelola SKL dan CP sebagai acuan utama.</CardDescription></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Button variant="outline" onClick={() => setIsSKLDialogOpen(true)} className="justify-start text-left h-auto py-3"><Layers className="mr-3 h-5 w-5" /><div><p className="font-semibold">Standar Kompetensi Lulusan (SKL)</p><p className="text-xs text-muted-foreground">Definisikan profil lulusan.</p></div></Button>
              <Button variant="outline" onClick={() => setIsCPDialogOpen(true)} className="justify-start text-left h-auto py-3"><FileText className="mr-3 h-5 w-5" /><div><p className="font-semibold">Capaian Pembelajaran (CP)</p><p className="text-xs text-muted-foreground">Tetapkan target per fase/tingkat.</p></div></Button>
              <Button variant="outline" onClick={openPlaceholderToast} className="justify-start text-left h-auto py-3"><GitMerge className="mr-3 h-5 w-5" /><div><p className="font-semibold">Pemetaan & Analisis SKL-CP</p><p className="text-xs text-muted-foreground">Hubungkan & analisis keselarasan.</p></div></Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center text-xl"><BookCopy className="mr-3 h-5 w-5 text-primary" />Struktur Kurikulum, Silabus & RPP</CardTitle><CardDescription>Susun kerangka, materi pokok, hingga rencana pembelajaran. Pastikan merujuk pada <Link href={ROUTES.ADMIN_MATA_PELAJARAN} className="text-primary hover:underline">daftar mata pelajaran</Link>.</CardDescription></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Button variant="outline" onClick={() => setIsStrukturKurikulumDialogOpen(true)} className="justify-start text-left h-auto py-3"><Library className="mr-3 h-5 w-5" /><div><p className="font-semibold">Struktur Kurikulum</p><p className="text-xs text-muted-foreground">Atur mapel & alokasi jam.</p></div></Button>
              <Button variant="outline" onClick={() => setIsSilabusDialogOpen(true)} className="justify-start text-left h-auto py-3"><Book className="mr-3 h-5 w-5" /><div><p className="font-semibold">Pengembangan Silabus</p><p className="text-xs text-muted-foreground">Rancang silabus per mapel.</p></div></Button>
              <Button variant="outline" onClick={() => setIsRPPDialogOpen(true)} className="justify-start text-left h-auto py-3"><BookUp className="mr-3 h-5 w-5" /><div><p className="font-semibold">Penyusunan RPP</p><p className="text-xs text-muted-foreground">Buat rencana detail per pertemuan.</p></div></Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center text-xl"><FolderKanban className="mr-3 h-5 w-5 text-primary" />Bank Materi & Sumber Pembelajaran</CardTitle><CardDescription>Kelola materi ajar, modul, video, dll.{materiList.length > 0 && ` (Total: ${materiList.length} materi)`}</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Button variant="default" onClick={() => openMateriForm()} className="justify-start text-left h-auto py-3"><PlusCircle className="mr-3 h-5 w-5" /><div><p className="font-semibold">Tambah Materi Baru</p><p className="text-xs text-muted-foreground">Unggah file atau tautan.</p></div></Button>
                <Button variant="outline" onClick={() => setIsKategoriMateriDialogOpen(true)} className="justify-start text-left h-auto py-3"><List className="mr-3 h-5 w-5" /><div><p className="font-semibold">Kategorisasi Materi</p><p className="text-xs text-muted-foreground">Kelola kategori sumber belajar.</p></div></Button>
                <Button variant="outline" onClick={openPlaceholderToast} className="justify-start text-left h-auto py-3"><Search className="mr-3 h-5 w-5" /><div><p className="font-semibold">Pencarian Materi</p><p className="text-xs text-muted-foreground">Temukan sumber belajar.</p></div></Button>
              </div>
              {isLoadingMateriList ? (<div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>) : materiList.length > 0 ? (<div className="pt-4"><h4 className="text-md font-semibold mb-2">Daftar Materi Tersedia:</h4><ScrollArea className="max-h-96 border rounded-md"><Table><TableHeader className="bg-muted/50 sticky top-0"><TableRow><TableHead>Judul</TableHead><TableHead>Mapel</TableHead><TableHead>Jenis</TableHead><TableHead>Tgl Upload</TableHead><TableHead>Uploader</TableHead><TableHead className="text-right">Tindakan</TableHead></TableRow></TableHeader><TableBody>{materiList.map(m => (<TableRow key={m.id}><TableCell className="font-medium max-w-xs truncate" title={m.judul}>{m.judul}</TableCell><TableCell>{m.mapelNama}</TableCell><TableCell>{m.jenisMateri}</TableCell><TableCell>{m.tanggalUpload ? format(parseISO(m.tanggalUpload), "dd/MM/yyyy") : "-"}</TableCell><TableCell className="text-xs truncate" title={m.uploader?.email}>{m.uploader?.fullName || m.uploader?.name || m.uploader?.email || "-"}</TableCell><TableCell className="text-right"><Button variant="ghost" size="sm" onClick={() => openMateriForm(m)} className="mr-1"><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="sm" onClick={() => openDeleteMateriDialog(m)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button></TableCell></TableRow>))}</TableBody></Table></ScrollArea></div>) : (<p className="text-muted-foreground text-center pt-4">Belum ada materi ajar.</p>)}
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <Dialog open={isMateriFormOpen} onOpenChange={(open) => { setIsMateriFormOpen(open); if (!open) setCurrentEditingMateri(null); }}>
        <DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>{currentEditingMateri ? "Edit Materi" : "Tambah Materi Baru"}</DialogTitle></DialogHeader>
          <Form {...materiAjarForm}>
            <form onSubmit={materiAjarForm.handleSubmit(handleMateriSubmit)} className="space-y-4 py-4">
              <FormField control={materiAjarForm.control} name="judul" render={({ field }) => (<FormItem><FormLabel>Judul Materi</FormLabel><FormControl><Input placeholder="Modul Bab 1" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={materiAjarForm.control} name="mapelNama" render={({ field }) => (<FormItem><FormLabel>Mata Pelajaran</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih mata pelajaran" /></SelectTrigger></FormControl><SelectContent>{mataPelajaranOptions.length > 0 ? mataPelajaranOptions.map(subject => (<SelectItem key={subject.id} value={subject.nama}>{subject.nama} ({subject.kode})</SelectItem>)) : <SelectItem value="" disabled>Tidak ada mapel</SelectItem>}</SelectContent></Select><FormMessage /></FormItem>)} />
              <FormField control={materiAjarForm.control} name="deskripsi" render={({ field }) => (<FormItem><FormLabel>Deskripsi (Opsional)</FormLabel><FormControl><Textarea placeholder="Deskripsi singkat materi..." {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={materiAjarForm.control} name="jenisMateri" render={({ field }) => (<FormItem><FormLabel>Jenis Materi</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih jenis materi" /></SelectTrigger></FormControl><SelectContent>{JENIS_MATERI_AJAR_CONST.map(jenis => <SelectItem key={jenis} value={jenis}>{jenis === "File" ? <><UploadCloud className="inline-block mr-2 h-4 w-4" />Unggah File</> : <><Link2 className="inline-block mr-2 h-4 w-4" />Tautan Eksternal</>}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
              {materiAjarForm.watch("jenisMateri") === "File" && (<FormField control={materiAjarForm.control} name="fileInput" render={({ field: { onChange, value, ...restField } }) => (<FormItem><FormLabel>Unggah File {currentEditingMateri?.namaFileOriginal ? `(Kosongkan jika tidak ubah: ${currentEditingMateri.namaFileOriginal})` : ""}</FormLabel><FormControl><Input type="file" onChange={(e) => onChange(e.target.files ? e.target.files[0] : null)} {...restField} /></FormControl><FormDescription>PDF, DOCX, dll.</FormDescription><FormMessage /></FormItem>)} />)}
              {materiAjarForm.watch("jenisMateri") === "Link" && (<FormField control={materiAjarForm.control} name="externalUrl" render={({ field }) => (<FormItem><FormLabel>URL Materi</FormLabel><FormControl><Input placeholder="https://contoh.com/materi" {...field} /></FormControl><FormDescription>URL lengkap sumber materi.</FormDescription><FormMessage /></FormItem>)} />)}
              <DialogFooter><Button type="button" variant="outline" onClick={() => { setIsMateriFormOpen(false); setCurrentEditingMateri(null); }} disabled={isMateriSubmitting}>Batal</Button><Button type="submit" disabled={isMateriSubmitting || mataPelajaranOptions.length === 0}>{isMateriSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{currentEditingMateri ? "Simpan" : "Simpan"}</Button></DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!materiToDelete} onOpenChange={(open) => !open && setMateriToDelete(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Hapus Materi</AlertDialogTitle><AlertDialogDescription>Yakin hapus materi "{materiToDelete?.judul}"?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel onClick={() => setMateriToDelete(null)} disabled={isMateriSubmitting}>Batal</AlertDialogCancel><AlertDialogAction onClick={handleDeleteMateriConfirm} className="bg-destructive hover:bg-destructive/90" disabled={isMateriSubmitting}>{isMateriSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Hapus</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
      <Dialog open={isSKLDialogOpen} onOpenChange={setIsSKLDialogOpen}><DialogContent className="sm:max-w-2xl"><DialogHeader><DialogTitle>Manajemen SKL</DialogTitle><DialogDescription>Kelola Standar Kompetensi Lulusan.</DialogDescription></DialogHeader><div className="py-4 space-y-4"><Button onClick={() => openSKLForm()}><PlusCircle className="mr-2 h-4 w-4" /> Tambah SKL</Button>{isLoadingSkl ? (<div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>) : sklList.length > 0 ? (<ScrollArea className="max-h-96 border rounded-md"><Table><TableHeader className="bg-muted/50 sticky top-0"><TableRow><TableHead>Kode</TableHead><TableHead>Deskripsi</TableHead><TableHead>Kategori</TableHead><TableHead className="text-right">Tindakan</TableHead></TableRow></TableHeader><TableBody>{sklList.map(skl => (<TableRow key={skl.id}><TableCell className="font-medium">{skl.kode}</TableCell><TableCell className="max-w-md whitespace-pre-wrap">{skl.deskripsi}</TableCell><TableCell>{skl.kategori}</TableCell><TableCell className="text-right"><Button variant="ghost" size="sm" onClick={() => openSKLForm(skl)} className="mr-1"><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="sm" onClick={() => openDeleteSKLDialog(skl)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button></TableCell></TableRow>))}</TableBody></Table></ScrollArea>) : (<p className="text-muted-foreground text-center">Belum ada SKL.</p>)}</div><DialogFooter><Button variant="outline" onClick={() => setIsSKLDialogOpen(false)}>Tutup</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={isSKLFormOpen} onOpenChange={(open) => { setIsSKLFormOpen(open); if (!open) setEditingSKL(null); }}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>{editingSKL ? "Edit SKL" : "Tambah SKL"}</DialogTitle></DialogHeader><Form {...sklForm}><form onSubmit={sklForm.handleSubmit(handleSKLSubmit)} className="space-y-4 py-2"><FormField control={sklForm.control} name="kode" render={({ field }) => (<FormItem><FormLabel>Kode SKL</FormLabel><FormControl><Input placeholder="S-01" {...field} disabled={!!editingSKL} /></FormControl>{editingSKL && <FormDescription>Kode tidak dapat diubah.</FormDescription>}<FormMessage /></FormItem>)} /><FormField control={sklForm.control} name="deskripsi" render={({ field }) => (<FormItem><FormLabel>Deskripsi SKL</FormLabel><FormControl><Textarea placeholder="Deskripsi standar..." {...field} rows={4} /></FormControl><FormMessage /></FormItem>)} /><FormField control={sklForm.control} name="kategori" render={({ field }) => (<FormItem><FormLabel>Kategori SKL</FormLabel><Select onValueChange={field.onChange} value={field.value as KategoriSklType}><FormControl><SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger></FormControl><SelectContent>{(KATEGORI_SKL_CONST).map(kat => <SelectItem key={kat} value={kat}>{kat}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} /><DialogFooter className="pt-2"><Button type="button" variant="outline" onClick={() => {setIsSKLFormOpen(false); setEditingSKL(null);}} disabled={isSKLSubmitting}>Batal</Button><Button type="submit" disabled={isSKLSubmitting}>{isSKLSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editingSKL ? "Simpan" : "Tambah"}</Button></DialogFooter></form></Form></DialogContent></Dialog>
      <AlertDialog open={!!sklToDelete} onOpenChange={(open) => !open && setSklToDelete(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Hapus SKL</AlertDialogTitle><AlertDialogDescription>Yakin hapus SKL "{sklToDelete?.kode}"?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel onClick={() => setSklToDelete(null)} disabled={isSKLSubmitting}>Batal</AlertDialogCancel><AlertDialogAction onClick={handleDeleteSKLConfirm} className="bg-destructive hover:bg-destructive/90" disabled={isSKLSubmitting}>{isSKLSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Hapus</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
      <Dialog open={isCPDialogOpen} onOpenChange={setIsCPDialogOpen}><DialogContent className="sm:max-w-2xl"><DialogHeader><DialogTitle>Manajemen CP</DialogTitle><DialogDescription>Kelola Capaian Pembelajaran.</DialogDescription></DialogHeader><div className="py-4 space-y-4"><Button onClick={() => openCPForm()}><PlusCircle className="mr-2 h-4 w-4" /> Tambah CP</Button>{isLoadingCp ? (<div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>) : cpList.length > 0 ? (<ScrollArea className="max-h-96 border rounded-md"><Table><TableHeader className="bg-muted/50 sticky top-0"><TableRow><TableHead>Kode</TableHead><TableHead>Deskripsi</TableHead><TableHead>Fase</TableHead><TableHead>Elemen</TableHead><TableHead className="text-right">Tindakan</TableHead></TableRow></TableHeader><TableBody>{cpList.map(cp => (<TableRow key={cp.id}><TableCell className="font-medium">{cp.kode}</TableCell><TableCell className="max-w-md whitespace-pre-wrap">{cp.deskripsi}</TableCell><TableCell>{cp.fase}</TableCell><TableCell>{cp.elemen}</TableCell><TableCell className="text-right"><Button variant="ghost" size="sm" onClick={() => openCPForm(cp)} className="mr-1"><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="sm" onClick={() => openDeleteCPDialog(cp)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button></TableCell></TableRow>))}</TableBody></Table></ScrollArea>) : (<p className="text-muted-foreground text-center">Belum ada CP.</p>)}</div><DialogFooter><Button variant="outline" onClick={() => setIsCPDialogOpen(false)}>Tutup</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={isCPFormOpen} onOpenChange={(open) => { setIsCPFormOpen(open); if (!open) setEditingCP(null); }}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>{editingCP ? "Edit CP" : "Tambah CP"}</DialogTitle></DialogHeader><Form {...cpForm}><form onSubmit={cpForm.handleSubmit(handleCPSubmit)} className="space-y-4 py-2"><FormField control={cpForm.control} name="kode" render={({ field }) => (<FormItem><FormLabel>Kode CP</FormLabel><FormControl><Input placeholder="MTK.F.ALG.1" {...field} disabled={!!editingCP} /></FormControl>{editingCP && <FormDescription>Kode tidak dapat diubah.</FormDescription>}<FormMessage /></FormItem>)} /><FormField control={cpForm.control} name="deskripsi" render={({ field }) => (<FormItem><FormLabel>Deskripsi CP</FormLabel><FormControl><Textarea placeholder="Deskripsi capaian..." {...field} rows={4} /></FormControl><FormMessage /></FormItem>)} /><FormField control={cpForm.control} name="fase" render={({ field }) => (<FormItem><FormLabel>Fase</FormLabel><Select onValueChange={field.onChange} value={field.value as FaseCpType}><FormControl><SelectTrigger><SelectValue placeholder="Pilih fase" /></SelectTrigger></FormControl><SelectContent>{(FASE_CP_CONST).map(f => <SelectItem key={f} value={f}>Fase {f}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} /><FormField control={cpForm.control} name="elemen" render={({ field }) => (<FormItem><FormLabel>Elemen/Domain</FormLabel><FormControl><Input placeholder="Bilangan" {...field} /></FormControl><FormMessage /></FormItem>)} /><DialogFooter className="pt-2"><Button type="button" variant="outline" onClick={() => {setIsCPFormOpen(false); setEditingCP(null);}} disabled={isCPSubmitting}>Batal</Button><Button type="submit" disabled={isCPSubmitting}>{isCPSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editingCP ? "Simpan" : "Tambah"}</Button></DialogFooter></form></Form></DialogContent></Dialog>
      <AlertDialog open={!!cpToDelete} onOpenChange={(open) => !open && setCpToDelete(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Hapus CP</AlertDialogTitle><AlertDialogDescription>Yakin hapus CP "{cpToDelete?.kode}"?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel onClick={() => setCpToDelete(null)} disabled={isCPSubmitting}>Batal</AlertDialogCancel><AlertDialogAction onClick={handleDeleteCPConfirm} className="bg-destructive hover:bg-destructive/90" disabled={isCPSubmitting}>{isCPSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Hapus</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
      <Dialog open={isKategoriMateriDialogOpen} onOpenChange={setIsKategoriMateriDialogOpen}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Kelola Kategori Materi</DialogTitle><DialogDescription>Tambah atau lihat kategori untuk bank materi.</DialogDescription></DialogHeader><div className="py-4 space-y-4"><Form {...kategoriMateriForm}><form onSubmit={kategoriMateriForm.handleSubmit(handleKategoriMateriSubmit)} className="flex gap-2 items-start"><FormField control={kategoriMateriForm.control} name="nama" render={({ field }) => (<FormItem className="flex-grow"><FormLabel className="sr-only">Nama Kategori</FormLabel><FormControl><Input placeholder="Nama kategori baru" {...field} /></FormControl><FormMessage /></FormItem>)} /><Button type="submit" disabled={isKategoriMateriSubmitting}>{isKategoriMateriSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4"/>}</Button></form></Form>{isLoadingKategoriMateri ? (<div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>) : kategoriMateriList.length > 0 ? (<ScrollArea className="h-60 border rounded-md p-2"><div className="space-y-2">{kategoriMateriList.map(kat => (<div key={kat.id} className="p-2 bg-muted/50 rounded text-sm flex justify-between items-center"><span>{kat.nama}</span><Button variant="ghost" size="xs" className="text-destructive" onClick={() => openDeleteKategoriMateriDialog(kat)}><Trash2 className="h-3 w-3"/></Button></div>))}</div></ScrollArea>) : (<p className="text-sm text-muted-foreground text-center">Belum ada kategori.</p>)}</div><DialogFooter><Button variant="outline" onClick={() => setIsKategoriMateriDialogOpen(false)}>Tutup</Button></DialogFooter></DialogContent></Dialog>
      <AlertDialog open={!!kategoriMateriToDelete} onOpenChange={(open) => !open && setKategoriMateriToDelete(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Hapus Kategori</AlertDialogTitle><AlertDialogDescription>Yakin hapus kategori "{kategoriMateriToDelete?.nama}"?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel onClick={() => setKategoriMateriToDelete(null)} disabled={isKategoriMateriSubmitting}>Batal</AlertDialogCancel><AlertDialogAction onClick={handleDeleteKategoriMateriConfirm} className="bg-destructive hover:bg-destructive/90" disabled={isKategoriMateriSubmitting}>{isKategoriMateriSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Hapus</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
      <Dialog open={isStrukturKurikulumDialogOpen} onOpenChange={setIsStrukturKurikulumDialogOpen}><DialogContent className="sm:max-w-2xl"><DialogHeader><DialogTitle>Struktur Kurikulum</DialogTitle><DialogDescription>Atur mapel dan alokasi jam per tingkat/jurusan.</DialogDescription></DialogHeader><div className="py-4 space-y-4"><div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end"><Select value={selectedTingkat} onValueChange={setSelectedTingkat}><SelectTrigger><SelectValue placeholder="Pilih Tingkat" /></SelectTrigger><SelectContent>{SCHOOL_GRADE_LEVELS.map(g => <SelectItem key={g} value={g}>Tingkat {g}</SelectItem>)}</SelectContent></Select><Select value={selectedJurusan} onValueChange={setSelectedJurusan}><SelectTrigger><SelectValue placeholder="Pilih Jurusan" /></SelectTrigger><SelectContent>{SCHOOL_MAJORS.map(m => <SelectItem key={m} value={m}>Jurusan {m}</SelectItem>)}</SelectContent></Select><Button onClick={() => setIsStrukturKurikulumFormOpen(true)}><PlusCircle className="mr-2 h-4 w-4" /> Tambah Mapel</Button></div>{isLoadingStruktur ? (<div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>) : currentStrukturList.length > 0 ? (<ScrollArea className="h-72 border rounded-md"><Table><TableHeader className="bg-muted/50 sticky top-0"><TableRow><TableHead>Mata Pelajaran</TableHead><TableHead className="text-center">Alokasi Jam</TableHead><TableHead>Guru Pengampu</TableHead><TableHead className="text-right">Tindakan</TableHead></TableRow></TableHeader><TableBody>{currentStrukturList.map(item => (<TableRow key={item.id}><TableCell className="font-medium">{item.namaMapel}</TableCell><TableCell className="text-center">{item.alokasiJam}</TableCell><TableCell>{item.guruPengampuNama || "-"}</TableCell><TableCell className="text-right"><Button variant="ghost" size="sm" className="text-destructive" onClick={() => openDeleteStrukturItemDialog(item)}><Trash2 className="h-4 w-4"/></Button></TableCell></TableRow>))}</TableBody></Table></ScrollArea>) : (<p className="text-muted-foreground text-center py-4">Belum ada struktur untuk {selectedTingkat} {selectedJurusan}.</p>)}</div><DialogFooter><Button variant="outline" onClick={() => setIsStrukturKurikulumDialogOpen(false)}>Tutup</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={isStrukturKurikulumFormOpen} onOpenChange={setIsStrukturKurikulumFormOpen}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Tambah Mapel ke Struktur {selectedTingkat} {selectedJurusan}</DialogTitle></DialogHeader><Form {...strukturKurikulumForm}><form onSubmit={strukturKurikulumForm.handleSubmit(handleStrukturSubmit)} className="space-y-4 py-2"><FormField control={strukturKurikulumForm.control} name="mapelId" render={({ field }) => (<FormItem><FormLabel>Mata Pelajaran</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih Mapel" /></SelectTrigger></FormControl><SelectContent>{mataPelajaranOptions.length > 0 ? mataPelajaranOptions.map(s => <SelectItem key={s.id} value={s.id}>{s.nama} ({s.kode})</SelectItem>) : <SelectItem value="" disabled>Tidak ada mapel</SelectItem>}</SelectContent></Select><FormMessage /></FormItem>)} /><FormField control={strukturKurikulumForm.control} name="alokasiJam" render={({ field }) => (<FormItem><FormLabel>Alokasi Jam per Minggu</FormLabel><FormControl><Input type="number" placeholder="Contoh: 4" {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={strukturKurikulumForm.control} name="guruPengampuId" render={({ field }) => (<FormItem><FormLabel>Guru Pengampu (Opsional)</FormLabel><Select onValueChange={field.onChange} value={field.value || ""}><FormControl><SelectTrigger><SelectValue placeholder="Pilih Guru Pengampu" /></SelectTrigger></FormControl><SelectContent>{guruOptions.length > 0 ? guruOptions.map(g => <SelectItem key={g.id} value={g.id}>{g.fullName || g.name} ({g.nip || g.email})</SelectItem>) : <SelectItem value="" disabled>Tidak ada guru</SelectItem>}<SelectItem value="">Tidak Ditentukan</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} /><DialogFooter><Button type="button" variant="outline" onClick={() => setIsStrukturKurikulumFormOpen(false)} disabled={isStrukturSubmitting}>Batal</Button><Button type="submit" disabled={isStrukturSubmitting || mataPelajaranOptions.length === 0}>{isStrukturSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Simpan</Button></DialogFooter></form></Form></DialogContent></Dialog>
      <AlertDialog open={!!strukturItemToDelete} onOpenChange={(open) => !open && setStrukturItemToDelete(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Hapus Item Struktur</AlertDialogTitle><AlertDialogDescription>Yakin hapus "{strukturItemToDelete?.namaMapel}" dari struktur?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel onClick={() => setStrukturItemToDelete(null)} disabled={isStrukturSubmitting}>Batal</AlertDialogCancel><AlertDialogAction onClick={handleDeleteStrukturItemConfirm} className="bg-destructive hover:bg-destructive/90" disabled={isStrukturSubmitting}>{isStrukturSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Hapus</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
      <Dialog open={isSilabusDialogOpen} onOpenChange={setIsSilabusDialogOpen}><DialogContent className="sm:max-w-3xl"><DialogHeader><DialogTitle>Pengembangan Silabus</DialogTitle><DialogDescription>Kelola daftar silabus per mata pelajaran.</DialogDescription></DialogHeader><div className="py-4 space-y-4"><Button onClick={() => openSilabusForm()}><PlusCircle className="mr-2 h-4 w-4" /> Tambah Silabus</Button>{isLoadingSilabus ? (<div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>) : silabusList.length > 0 ? (<ScrollArea className="h-80 border rounded-md"><Table><TableHeader className="bg-muted/50 sticky top-0"><TableRow><TableHead>Judul</TableHead><TableHead>Mapel</TableHead><TableHead>Kelas</TableHead><TableHead>File</TableHead><TableHead className="text-right">Tindakan</TableHead></TableRow></TableHeader><TableBody>{silabusList.map(s => (<TableRow key={s.id}><TableCell className="font-medium max-w-xs truncate">{s.judul}</TableCell><TableCell>{s.mapel?.nama || "-"}</TableCell><TableCell>{s.kelas}</TableCell><TableCell>{s.namaFileOriginal || "-"}</TableCell><TableCell className="text-right"><Button variant="ghost" size="xs" onClick={() => openSilabusForm(s)} className="mr-1"><Edit className="h-3 w-3"/></Button><Button variant="ghost" size="xs" onClick={() => openDeleteSilabusDialog(s)} className="text-destructive"><Trash2 className="h-3 w-3"/></Button></TableCell></TableRow>))}</TableBody></Table></ScrollArea>) : (<p className="text-center text-muted-foreground py-4">Belum ada silabus.</p>)}</div><DialogFooter><Button variant="outline" onClick={() => setIsSilabusDialogOpen(false)}>Tutup</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={isSilabusFormOpen} onOpenChange={(open) => { setIsSilabusFormOpen(open); if(!open) setCurrentEditingSilabus(null);}}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>{currentEditingSilabus ? "Edit Silabus" : "Tambah Silabus"}</DialogTitle></DialogHeader><Form {...silabusForm}><form onSubmit={silabusForm.handleSubmit(handleSilabusSubmit)} className="space-y-4 py-2"><FormField control={silabusForm.control} name="judul" render={({ field }) => (<FormItem><FormLabel>Judul Silabus</FormLabel><FormControl><Input placeholder="Silabus Matematika Semester Ganjil" {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={silabusForm.control} name="mapelId" render={({ field }) => (<FormItem><FormLabel>Mata Pelajaran</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih Mapel" /></SelectTrigger></FormControl><SelectContent>{mataPelajaranOptions.length > 0 ? mataPelajaranOptions.map(s => <SelectItem key={s.id} value={s.id}>{s.nama} ({s.kode})</SelectItem>) : <SelectItem value="" disabled>Tidak ada mapel</SelectItem>}</SelectContent></Select><FormMessage /></FormItem>)} /><FormField control={silabusForm.control} name="kelas" render={({ field }) => (<FormItem><FormLabel>Kelas</FormLabel><FormControl><Input placeholder="Contoh: X IPA 1" {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={silabusForm.control} name="deskripsiSingkat" render={({ field }) => (<FormItem><FormLabel>Deskripsi (Opsional)</FormLabel><FormControl><Textarea placeholder="Ringkasan isi silabus..." {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>)} /><FormField control={silabusForm.control} name="file" render={({ field: { onChange, value, ...restField } }) => (<FormItem><FormLabel>File Silabus {currentEditingSilabus?.namaFileOriginal ? `(Kosongkan jika tidak ubah: ${currentEditingSilabus.namaFileOriginal})` : ""}</FormLabel><FormControl><Input type="file" onChange={(e) => onChange(e.target.files ? e.target.files[0] : null)} {...restField} /></FormControl><FormDescription>Unggah file PDF/DOCX.</FormDescription><FormMessage /></FormItem>)} /><DialogFooter><Button type="button" variant="outline" onClick={() => {setIsSilabusFormOpen(false);setCurrentEditingSilabus(null);}} disabled={isSilabusSubmitting}>Batal</Button><Button type="submit" disabled={isSilabusSubmitting || mataPelajaranOptions.length === 0}>{isSilabusSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{currentEditingSilabus ? "Simpan" : "Tambah"}</Button></DialogFooter></form></Form></DialogContent></Dialog>
      <AlertDialog open={!!silabusToDelete} onOpenChange={(open) => !open && setSilabusToDelete(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Hapus Silabus</AlertDialogTitle><AlertDialogDescription>Yakin hapus silabus "{silabusToDelete?.judul}"?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel onClick={() => setSilabusToDelete(null)} disabled={isSilabusSubmitting}>Batal</AlertDialogCancel><AlertDialogAction onClick={handleDeleteSilabusConfirm} className="bg-destructive hover:bg-destructive/90" disabled={isSilabusSubmitting}>{isSilabusSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Hapus</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
      <Dialog open={isRPPDialogOpen} onOpenChange={setIsRPPDialogOpen}><DialogContent className="sm:max-w-3xl"><DialogHeader><DialogTitle>Penyusunan RPP</DialogTitle><DialogDescription>Kelola Rencana Pelaksanaan Pembelajaran.</DialogDescription></DialogHeader><div className="py-4 space-y-4"><Button onClick={() => openRPPForm()}><PlusCircle className="mr-2 h-4 w-4" /> Tambah RPP</Button>{isLoadingRpp ? (<div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>) :rppList.length > 0 ? (<ScrollArea className="h-80 border rounded-md"><Table><TableHeader className="bg-muted/50 sticky top-0"><TableRow><TableHead>Judul</TableHead><TableHead>Mapel</TableHead><TableHead>Kelas</TableHead><TableHead className="text-center">Pertemuan</TableHead><TableHead className="text-right">Tindakan</TableHead></TableRow></TableHeader><TableBody>{rppList.map(r => (<TableRow key={r.id}><TableCell className="font-medium max-w-xs truncate">{r.judul}</TableCell><TableCell>{r.mapel?.nama || "-"}</TableCell><TableCell>{r.kelas}</TableCell><TableCell className="text-center">{r.pertemuanKe}</TableCell><TableCell className="text-right"><Button variant="ghost" size="xs" onClick={() => openRPPForm(r)} className="mr-1"><Edit className="h-3 w-3"/></Button><Button variant="ghost" size="xs" onClick={() => openDeleteRPPDialog(r)} className="text-destructive"><Trash2 className="h-3 w-3"/></Button></TableCell></TableRow>))}</TableBody></Table></ScrollArea>) : (<p className="text-center text-muted-foreground py-4">Belum ada RPP.</p>)}</div><DialogFooter><Button variant="outline" onClick={() => setIsRPPDialogOpen(false)}>Tutup</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={isRPPFormOpen} onOpenChange={(open) => { setIsRPPFormOpen(open); if(!open) setCurrentEditingRPP(null);}}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>{currentEditingRPP ? "Edit RPP" : "Tambah RPP"}</DialogTitle></DialogHeader><Form {...rppForm}><form onSubmit={rppForm.handleSubmit(handleRPPSubmit)} className="space-y-4 py-2"><FormField control={rppForm.control} name="judul" render={({ field }) => (<FormItem><FormLabel>Judul RPP</FormLabel><FormControl><Input placeholder="RPP Fungsi Kuadrat Pertemuan 1" {...field} /></FormControl><FormMessage /></FormItem>)} /><div className="grid grid-cols-2 gap-4"><FormField control={rppForm.control} name="mapelId" render={({ field }) => (<FormItem><FormLabel>Mata Pelajaran</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih Mapel" /></SelectTrigger></FormControl><SelectContent>{mataPelajaranOptions.length > 0 ? mataPelajaranOptions.map(s => <SelectItem key={s.id} value={s.id}>{s.nama} ({s.kode})</SelectItem>) : <SelectItem value="" disabled>Tidak ada mapel</SelectItem>}</SelectContent></Select><FormMessage /></FormItem>)} /><FormField control={rppForm.control} name="kelas" render={({ field }) => (<FormItem><FormLabel>Kelas</FormLabel><FormControl><Input placeholder="X IPA 1" {...field} /></FormControl><FormMessage /></FormItem>)} /></div><FormField control={rppForm.control} name="pertemuanKe" render={({ field }) => (<FormItem><FormLabel>Pertemuan Ke-</FormLabel><FormControl><Input type="number" placeholder="1" {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={rppForm.control} name="materiPokok" render={({ field }) => (<FormItem><FormLabel>Materi Pokok (Opsional)</FormLabel><FormControl><Textarea placeholder="Materi utama..." {...field} rows={2} value={field.value || ""}/></FormControl><FormMessage /></FormItem>)} /><FormField control={rppForm.control} name="kegiatanPembelajaran" render={({ field }) => (<FormItem><FormLabel>Kegiatan Pembelajaran (Opsional)</FormLabel><FormControl><Textarea placeholder="Langkah-langkah kegiatan..." {...field} rows={3} value={field.value || ""}/></FormControl><FormMessage /></FormItem>)} /><FormField control={rppForm.control} name="penilaian" render={({ field }) => (<FormItem><FormLabel>Penilaian (Opsional)</FormLabel><FormControl><Textarea placeholder="Teknik penilaian..." {...field} rows={2} value={field.value || ""}/></FormControl><FormMessage /></FormItem>)} /><FormField control={rppForm.control} name="file" render={({ field: { onChange, value, ...restField } }) => (<FormItem><FormLabel>File RPP {currentEditingRPP?.namaFileOriginal ? `(Kosongkan jika tidak diubah)` : ""}</FormLabel><FormControl><Input type="file" onChange={(e) => onChange(e.target.files ? e.target.files[0] : null)} {...restField} /></FormControl><FormDescription>Unggah file PDF/DOCX.</FormDescription><FormMessage /></FormItem>)} /><DialogFooter><Button type="button" variant="outline" onClick={() => {setIsRPPFormOpen(false);setCurrentEditingRPP(null);}} disabled={isRPPSubmitting}>Batal</Button><Button type="submit" disabled={isRPPSubmitting || mataPelajaranOptions.length === 0}>{isRPPSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{currentEditingRPP ? "Simpan" : "Tambah"}</Button></DialogFooter></form></Form></DialogContent></Dialog>
      <AlertDialog open={!!rppToDelete} onOpenChange={(open) => !open && setRppToDelete(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Hapus RPP</AlertDialogTitle><AlertDialogDescription>Yakin hapus RPP "{rppToDelete?.judul}"?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel onClick={() => setRppToDelete(null)} disabled={isRPPSubmitting}>Batal</AlertDialogCancel><AlertDialogAction onClick={handleDeleteRPPConfirm} className="bg-destructive hover:bg-destructive/90" disabled={isRPPSubmitting}>{isRPPSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Hapus</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  );
}
