
import "reflect-metadata"; // Ensure this is the very first import
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
  kelas?: string | null; // Untuk siswa, ID kelas atau nama kelas. Di session akan jadi kelasId
  mataPelajaran?: string | null; // Untuk guru, bisa string nama mapel atau array jika > 1
}

export interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: Role[];
  subItems?: NavItem[];
}

export const KATEGORI_SKL = ["Sikap", "Pengetahuan", "Keterampilan"] as const;
export type KategoriSklType = typeof KATEGORI_SKL[number];

export interface SKL {
  id: string;
  kode: string;
  deskripsi: string;
  kategori: KategoriSklType;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export const FASE_CP = ["A", "B", "C", "D", "E", "F", "Lainnya"] as const;
export type FaseCpType = typeof FASE_CP[number];

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

export const JENIS_MATERI_AJAR = ["File", "Link"] as const;
export type JenisMateriAjarType = typeof JENIS_MATERI_AJAR[number];

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

    