
import "reflect-metadata"; // Ensure this is the very first import
export type Role = 'admin' | 'guru' | 'siswa' | 'pimpinan' | 'superadmin';

export interface User {
  id: string;
  email: string;
  name?: string; // Nama panggilan/pendek, bisa dari email
  role: Role;
  isVerified: boolean;
  avatarUrl?: string; // URL untuk avatar

  // Detail profil tambahan
  fullName?: string; // Nama lengkap
  phone?: string;
  address?: string;
  birthDate?: string; // Simpan sebagai string "YYYY-MM-DD" untuk mock
  bio?: string;
  nis?: string; // Nomor Induk Siswa
  nip?: string; // Nomor Induk Pegawai/Pengajar
  joinDate?: string; // Tanggal bergabung, simpan sebagai string "YYYY-MM-DD"
  kelas?: string; // Untuk siswa
  mataPelajaran?: string; // Untuk guru
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
  fasilitas?: string;
}

export interface SlotWaktu {
  id: string;
  namaSlot: string; 
  waktuMulai: string; 
  waktuSelesai: string; 
}

export interface StrukturKurikulumItem {
  id: string;
  idMapel: string; 
  namaMapel: string;
  alokasiJam: number;
  guruPengampu?: string; 
}

export interface Silabus {
  id: string;
  judul: string;
  idMapel: string;
  namaMapel: string;
  kelas: string; 
  deskripsiSingkat?: string;
  namaFile?: string; 
}

export interface RPP {
  id: string;
  judul: string;
  idMapel: string;
  namaMapel: string;
  kelas: string;
  pertemuanKe: number;
  materiPokok?: string;
  kegiatanPembelajaran?: string;
  penilaian?: string;
  namaFile?: string; 
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
