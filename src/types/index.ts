
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

export interface SKL {
  id: string;
  kode: string;
  deskripsi: string;
  kategori: "Sikap" | "Pengetahuan" | "Keterampilan";
}

export interface CapaianPembelajaran {
  id: string;
  kode: string;
  deskripsi: string;
  fase: "A" | "B" | "C" | "D" | "E" | "F" | "Lainnya"; // Sesuai jenjang
  elemen: string; // Misal: "Bilangan", "Literasi Membaca", dll.
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
  namaSlot: string; // Misal: Jam ke-1, Istirahat 1
  waktuMulai: string; // format HH:mm
  waktuSelesai: string; // format HH:mm
}

// Baru ditambahkan untuk Kurikulum
export interface StrukturKurikulumItem {
  id: string;
  idMapel: string; // Merujuk ke ID mata pelajaran
  namaMapel: string;
  alokasiJam: number;
  guruPengampu?: string; // Nama guru (mock)
}

export interface Silabus {
  id: string;
  judul: string;
  idMapel: string;
  namaMapel: string;
  kelas: string; // Misal X IPA 1, XI IPS 2
  deskripsiSingkat?: string;
  namaFile?: string; // Untuk mock upload
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
  namaFile?: string; // Untuk mock upload
}

export interface MateriKategori {
  id: string;
  nama: string;
}

// Definisi untuk MataPelajaran yang bisa digunakan di frontend
// Selaras dengan MataPelajaranEntity
export interface MataPelajaran {
  id: string;
  kode: string;
  nama: string;
  deskripsi?: string | null;
  kategori: "Wajib Umum" | "Wajib Peminatan IPA" | "Wajib Peminatan IPS" | "Pilihan Lintas Minat" | "Muatan Lokal";
  createdAt?: Date | string; // string jika dari API, Date jika dari state langsung
  updatedAt?: Date | string;
}
