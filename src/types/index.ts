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
}

export interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: Role[];
  subItems?: NavItem[];
}
