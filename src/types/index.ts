
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
