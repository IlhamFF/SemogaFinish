
import "reflect-metadata"; // Ensure this is the very first import
import { KATEGORI_SKL_CONST, FASE_CP_CONST, JENIS_MATERI_AJAR as JENIS_MATERI_AJAR_CONST_FROM_LIB } from "@/lib/constants";
// It's generally better to import the specific entity types if they are simple and don't cause circular dependencies
// or if you need to strictly type the shape of related data.
// However, for Pick utility, importing the full entity and picking fields is also common.
import type { SlotWaktuEntity } from "@/entities/slot-waktu.entity";
import type { MataPelajaranEntity } from "@/entities/mata-pelajaran.entity";
import type { UserEntity } from "@/entities/user.entity";
import type { RuanganEntity } from "@/entities/ruangan.entity";


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
  kelas?: string | null; // For Siswa, this is their class name. For Admin User Form, it's string input.
  mataPelajaran?: string | null; // For Guru, single string of subject names. For Admin User Form, string input.
}

export interface NavItem { 
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
  mapel?: Pick<MataPelajaranEntity, 'id' | 'nama' | 'kode'>;
  kelas: string;
  deskripsiSingkat?: string | null;
  namaFileOriginal?: string | null;
  fileUrl?: string | null;
  uploaderId: string;
  uploader?: Pick<UserEntity, 'id' | 'name' | 'fullName' | 'email'>;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface RPP {
  id: string;
  judul: string;
  mapelId: string;
  mapel?: Pick<MataPelajaranEntity, 'id' | 'nama' | 'kode'>;
  kelas: string;
  pertemuanKe: number;
  materiPokok?: string | null;
  kegiatanPembelajaran?: string | null;
  penilaian?: string | null;
  namaFileOriginal?: string | null;
  fileUrl?: string | null;
  uploaderId: string;
  uploader?: Pick<UserEntity, 'id' | 'name' | 'fullName' | 'email'>;
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
  uploader?: Pick<UserEntity, 'id' | 'name' | 'fullName' | 'email'>; 
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface JadwalPelajaran {
  id: string;
  hari: string;
  kelas: string;
  slotWaktuId: string;
  slotWaktu?: Pick<SlotWaktuEntity, 'id' | 'namaSlot' | 'waktuMulai' | 'waktuSelesai'>;
  mapelId: string;
  mapel?: Pick<MataPelajaranEntity, 'id' | 'nama' | 'kode'>;
  guruId: string;
  guru?: Pick<UserEntity, 'id' | 'name' | 'fullName' | 'email'>; // Added email for display
  ruanganId: string;
  ruangan?: Pick<RuanganEntity, 'id' | 'nama' | 'kode'>;
  catatan?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}


export { 
    KATEGORI_SKL_CONST as KATEGORI_SKL, 
    FASE_CP_CONST as FASE_CP,
    JENIS_MATERI_AJAR_CONST_FROM_LIB as JENIS_MATERI_AJAR
};

