
import type { Role } from '@/types';
// Lucide-react icons are removed from this file

export const APP_NAME = 'EduCentral SMA Az-Bail';

export const ROLES: Record<Role, string> = {
  admin: 'Admin',
  guru: 'Guru',
  siswa: 'Siswa',
  pimpinan: 'Pimpinan',
  superadmin: 'Super Admin',
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_EMAIL: '/verify-email',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_KURIKULUM: '/admin/kurikulum',
  ADMIN_MATA_PELAJARAN: '/admin/mata-pelajaran',
  ADMIN_JADWAL: '/admin/jadwal',
  ADMIN_KELAS: '/admin/kelas',
  
  GURU_DASHBOARD: '/guru/dashboard',
  GURU_PENGAJARAN: '/guru/pengajaran',
  GURU_TUGAS: '/guru/tugas',
  GURU_ABSENSI: '/guru/absensi',
  GURU_MATERI: '/guru/materi',
  GURU_TEST: '/guru/test',
  GURU_PENILAIAN: '/guru/penilaian',

  SISWA_DASHBOARD: '/siswa/dashboard',
  SISWA_JADWAL: '/siswa/jadwal',
  SISWA_TUGAS: '/siswa/tugas',
  SISWA_MATERI: '/siswa/materi',
  SISWA_TEST: '/siswa/test',
  SISWA_NILAI: '/siswa/nilai',

  PIMPINAN_DASHBOARD: '/pimpinan/dashboard',
  
  DATA_VISUALIZATION: '/data-visualization',
  NOTIFICATIONS: '/notifications', 
  SETTINGS: '/settings', 
};

export const DEFAULT_USERS_STORAGE_KEY = 'sma_azbail_users_mock';
export const AUTH_USER_STORAGE_KEY = 'sma_azbail_auth_user_mock';

export const SCHOOL_MAJORS = ["IPA", "IPS"];
export const SCHOOL_GRADE_LEVELS = ["X", "XI", "XII"];
export const SCHOOL_CLASSES_PER_MAJOR_GRADE = 5;

export const MOCK_SUBJECTS = [
  "Matematika Wajib", "Bahasa Indonesia", "Bahasa Inggris", "Pendidikan Agama", "PPKn", "Sejarah Indonesia",
  "Fisika", "Kimia", "Biologi", "Matematika Peminatan", // IPA
  "Geografi", "Sosiologi", "Ekonomi", "Sejarah Peminatan" // IPS
];

export const KATEGORI_MAPEL = [
  "Wajib Umum",
  "Wajib Peminatan IPA",
  "Wajib Peminatan IPS",
  "Pilihan Lintas Minat",
  "Muatan Lokal",
] as const;

// Constants moved from types/index.ts as they don't depend on other types and are used broadly
export const KATEGORI_SKL_CONST = ["Sikap", "Pengetahuan", "Keterampilan"] as const;
export const FASE_CP_CONST = ["A", "B", "C", "D", "E", "F", "Lainnya"] as const;
export const JENIS_MATERI_AJAR = ["File", "Link"] as const;
