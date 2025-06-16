
import "reflect-metadata"; // Ensure this is the very first import
// KATEGORI_SKL_CONST, FASE_CP_CONST, JENIS_MATERI_AJAR moved to constants.ts
import { KATEGORI_SKL_CONST, FASE_CP_CONST, JENIS_MATERI_AJAR as JENIS_MATERI_AJAR_CONST_FROM_LIB } from "@/lib/constants";

export type Role = 'admin' | 'guru' | 'siswa' | 'pimpinan' | 'superadmin';

export interface User {
  id: string;
  email: string;
  name?: string | null; 
  role: Role;
  isVerified: boolean;
  avatarUrl?: string | null; 

  fullName?: string | null; 
  phone?: string | null;
  address?: string | null;
  birthDate?: string | null; 
  bio?: string | null;
  nis?: string | null; 
  nip?: string | null; 
  joinDate?: string | null; 
  kelas?: string | null; 
  mataPelajaran?: string | null; 
}

export interface NavItem { // This might be used internally by AppSidebarContent
  href: string;
  label: string;
  icon: React.ElementType;
  roles: Role[];
  subItems?: NavItem[];
}

export type KategoriSklType = typeof KATEGORI_SKL_CONST[number];

export interface SKL {
  id: string;
  kode: string;
  deskripsi: string;
  kategori: KategoriSklType;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type FaseCpType = typeof FASE_CP_CONST[number];

export interface CapaianPembelajaran {
  id: string;
  kode: string;
  deskripsi: string;
  fase: FaseCpType;
  elemen: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface Ruangan {
  id: string;
  nama: string;
  kode: string;
  kapasitas: number;
  fasilitas?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface SlotWaktu {
  id: string;
  namaSlot: string;
  waktuMulai: string; // HH:MM
  waktuSelesai: string; // HH:MM
  urutan?: number | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface StrukturKurikulumItem {
  id: string; 
  tingkat: string;
  jurusan: string;
  mapelId: string; 
  namaMapel: string; 
  alokasiJam: number;
  guruPengampuId?: string | null; 
  guruPengampuNama?: string | null; 
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface Silabus {
  id: string;
  judul: string;
  mapelId: string;
  mapel?: Pick<MataPelajaran, 'id' | 'nama' | 'kode'>;
  kelas: string;
  deskripsiSingkat?: string | null;
  namaFileOriginal?: string | null;
  fileUrl?: string | null;
  uploaderId: string;
  uploader?: Pick<User, 'id' | 'name' | 'fullName' | 'email'>;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface RPP {
  id: string;
  judul: string;
  mapelId: string;
  mapel?: Pick<MataPelajaran, 'id' | 'nama' | 'kode'>;
  kelas: string;
  pertemuanKe: number;
  materiPokok?: string | null;
  kegiatanPembelajaran?: string | null;
  penilaian?: string | null;
  namaFileOriginal?: string | null;
  fileUrl?: string | null;
  uploaderId: string;
  uploader?: Pick<User, 'id' | 'name' | 'fullName' | 'email'>;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface MateriKategori {
  id: string;
  nama: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface MataPelajaran {
  id: string;
  kode: string;
  nama: string;
  deskripsi?: string | null;
  kategori: "Wajib Umum" | "Wajib Peminatan IPA" | "Wajib Peminatan IPS" | "Pilihan Lintas Minat" | "Muatan Lokal";
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type JenisMateriAjarType = typeof JENIS_MATERI_AJAR_CONST_FROM_LIB[number];

export interface MateriAjar {
  id: string;
  judul: string;
  deskripsi?: string | null;
  mapelNama: string; 
  jenisMateri: JenisMateriAjarType;
  namaFileOriginal?: string | null; 
  fileUrl?: string | null; 
  tanggalUpload: string; // YYYY-MM-DD
  uploaderId: string; 
  uploader?: Pick<User, 'id' | 'name' | 'fullName' | 'email'>; 
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// Re-exporting constants from constants.ts for convenience if some files were importing them from types/index.ts
export { 
    KATEGORI_SKL_CONST as KATEGORI_SKL, 
    FASE_CP_CONST as FASE_CP,
    JENIS_MATERI_AJAR_CONST_FROM_LIB as JENIS_MATERI_AJAR // Re-exporting JENIS_MATERI_AJAR
};
