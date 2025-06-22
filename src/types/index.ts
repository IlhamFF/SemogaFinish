import "reflect-metadata"; // Ensure this is the very first import
import { KATEGORI_SKL_CONST, FASE_CP_CONST, JENIS_MATERI_AJAR } from "@/lib/constants";
// It's generally better to import the specific entity types if they are simple and don't cause circular dependencies
// or if you need to strictly type the shape of related data.
// However, for Pick utility, importing the full entity and picking fields is also common.
import type { SlotWaktuEntity } from "@/entities/slot-waktu.entity";
import type { MataPelajaranEntity } from "@/entities/mata-pelajaran.entity";
import type { UserEntity } from "@/entities/user.entity";
import type { RuanganEntity } from "@/entities/ruangan.entity";
import type { TestTipe as TestEntityType, TestStatus as TestStatusType } from "@/entities/test.entity";
import type { TestSubmissionStatus as TestSubmissionStatusType } from "@/entities/test-submission.entity";
import type { StatusKehadiran as StatusKehadiranTypeEntity } from "@/entities/absensi-siswa.entity";
import type { SemesterTypeEntity } from "@/entities/nilai-semester-siswa.entity"; // Ditambahkan


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
  kelasId?: string | null; 
  kelas?: string | null;
  mataPelajaran?: string | null; 
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
  guru?: Pick<UserEntity, 'id' | 'name' | 'fullName' | 'email' | 'nip'>; 
  ruanganId: string;
  ruangan?: Pick<RuanganEntity, 'id' | 'nama' | 'kode'>;
  catatan?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface Tugas {
  id: string;
  judul: string;
  deskripsi?: string | null;
  mapel: string;
  kelas: string;
  tenggat: string; // ISO string from API (Date object in entity)
  namaFileLampiran?: string | null;
  fileUrlLampiran?: string | null; // Simulated path
  uploaderId: string;
  uploader?: Pick<UserEntity, 'id' | 'name' | 'fullName' | 'email'>;
  createdAt?: string;
  updatedAt?: string;
  // For frontend display, might be mocked or derived
  terkumpul?: number;
  totalSiswa?: number;
  status?: "Aktif" | "Ditutup" | "Draf";
  nilai?: number | null; 
  feedbackGuru?: string | null;
}

export type SubmissionStatus = "Menunggu Penilaian" | "Dinilai" | "Terlambat";

export interface TugasSubmission {
  id: string;
  siswaId: string;
  siswa?: Pick<UserEntity, 'id' | 'name' | 'fullName' | 'email' | 'kelasId'>;
  tugasId: string;
  tugas?: Pick<Tugas, 'id' | 'judul' | 'mapel' | 'kelas' | 'uploaderId'>;
  namaFileJawaban?: string | null;
  fileUrlJawaban?: string | null;
  catatanSiswa?: string | null;
  dikumpulkanPada: string; // ISO String
  status: SubmissionStatus;
  nilai?: number | null;
  feedbackGuru?: string | null;
  createdAt?: string;
  updatedAt?: string;
}


// Re-exporting TestTipe and TestStatus from entity types for use in frontend
export type TestTipe = TestEntityType;
export type TestStatus = TestStatusType;

export interface Test {
  id: string;
  judul: string;
  mapel: string;
  kelas: string;
  tanggal: string; // ISO string from API (Date object in entity)
  durasi: number; // dalam menit
  tipe: TestTipe;
  status: TestStatus;
  deskripsi?: string | null;
  jumlahSoal?: number | null;
  uploaderId: string;
  uploader?: Pick<UserEntity, 'id' | 'name' | 'fullName' | 'email'>;
  createdAt?: string;
  updatedAt?: string;
  // For siswa - a way to know if they've started/finished
  submissionId?: string | null; // ID of their TestSubmission if exists
  statusPengerjaanSiswa?: "Belum Dikerjakan" | "Sedang Dikerjakan" | "Selesai" | "Dinilai";
  nilai?: number | null; // Nilai siswa untuk test ini
}

export type TestSubmissionStatus = TestSubmissionStatusType;

export interface TestSubmission {
  id: string;
  siswaId: string;
  siswa?: Pick<UserEntity, 'id' | 'name' | 'fullName' | 'email' | 'kelasId'>;
  testId: string;
  test?: Pick<Test, 'id' | 'judul' | 'mapel'>;
  waktuMulai: string; // ISO String
  waktuSelesai?: string | null; // ISO String
  jawabanSiswa?: any; // JSONB to store answers, define more strictly if needed
  nilai?: number | null;
  status: TestSubmissionStatus;
  catatanGuru?: string | null; // Added
  createdAt?: string;
  updatedAt?: string;
}

export type StatusKehadiran = StatusKehadiranTypeEntity;

export interface AbsensiSiswa {
  id: string;
  siswaId: string;
  siswa?: Pick<UserEntity, 'id' | 'name' | 'fullName' | 'email' | 'nis'>;
  jadwalPelajaranId: string;
  jadwalPelajaran?: Pick<JadwalPelajaran, 'id' | 'kelas' | 'mapel' | 'guru'>;
  tanggalAbsensi: string; // YYYY-MM-DD
  statusKehadiran: StatusKehadiran;
  catatan?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type SemesterType = SemesterTypeEntity;

export interface NilaiSemesterSiswa {
  id: string;
  siswaId: string;
  siswa?: Pick<UserEntity, 'id' | 'name' | 'fullName' | 'email' | 'nis' | 'kelasId'>;
  mapelId: string;
  mapel?: Pick<MataPelajaranEntity, 'id' | 'nama' | 'kode'>;
  kelasId: string;
  semester: SemesterType;
  tahunAjaran: string;
  nilaiTugas?: number | null;
  nilaiUTS?: number | null;
  nilaiUAS?: number | null;
  nilaiHarian?: number | null;
  nilaiAkhir?: number | null;
  predikat?: string | null;
  catatanGuru?: string | null;
  dicatatOlehGuruId: string;
  dicatatOlehGuru?: Pick<UserEntity, 'id' | 'name' | 'fullName' | 'email'>;
  createdAt?: string;
  updatedAt?: string;
}


export {
    KATEGORI_SKL_CONST as KATEGORI_SKL,
    FASE_CP_CONST as FASE_CP,
    JENIS_MATERI_AJAR // Now correctly re-exporting the imported constant
};
