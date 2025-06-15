
import type { Role } from '@/types';
import { LayoutDashboard, Users, BarChart3, Settings, LogOut, BookOpenText, BookOpenCheck, CalendarDays, ClipboardList, Presentation, FilePlus2, UserCheck, UploadCloud, ScrollText, GraduationCap, ClipboardCheck, BookOpen, FileText, Award, CalendarClock, CheckSquare } from 'lucide-react';

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

export const NAV_LINKS_CONFIG = [
  { href: ROUTES.ADMIN_DASHBOARD, label: 'Dasbor', icon: LayoutDashboard, roles: ['admin', 'superadmin'] as Role[] },
  { href: ROUTES.GURU_DASHBOARD, label: 'Dasbor', icon: LayoutDashboard, roles: ['guru'] as Role[] },
  { href: ROUTES.SISWA_DASHBOARD, label: 'Dasbor', icon: LayoutDashboard, roles: ['siswa'] as Role[] },
  { href: ROUTES.PIMPINAN_DASHBOARD, label: 'Dasbor', icon: LayoutDashboard, roles: ['pimpinan'] as Role[] },
  
  // Admin Links
  { href: ROUTES.ADMIN_USERS, label: 'Manajemen Pengguna', icon: Users, roles: ['admin', 'superadmin'] as Role[] },
  { href: ROUTES.ADMIN_KURIKULUM, label: 'Manajemen Kurikulum', icon: BookOpenCheck, roles: ['admin', 'superadmin'] as Role[] },
  { href: ROUTES.ADMIN_MATA_PELAJARAN, label: 'Manajemen Mapel', icon: ClipboardList, roles: ['admin', 'superadmin'] as Role[] },
  { href: ROUTES.ADMIN_JADWAL, label: 'Manajemen Jadwal', icon: CalendarDays, roles: ['admin', 'superadmin'] as Role[] },

  // Guru Links
  { href: ROUTES.GURU_PENGAJARAN, label: 'Pengajaran', icon: Presentation, roles: ['guru', 'superadmin'] as Role[] },
  { href: ROUTES.GURU_TUGAS, label: 'Manajemen Tugas', icon: FilePlus2, roles: ['guru', 'superadmin'] as Role[] },
  { href: ROUTES.GURU_ABSENSI, label: 'Absensi Siswa', icon: UserCheck, roles: ['guru', 'superadmin'] as Role[] },
  { href: ROUTES.GURU_MATERI, label: 'Upload Materi', icon: UploadCloud, roles: ['guru', 'superadmin'] as Role[] },
  { href: ROUTES.GURU_TEST, label: 'Manajemen Test', icon: ScrollText, roles: ['guru', 'superadmin'] as Role[] },
  { href: ROUTES.GURU_PENILAIAN, label: 'Penilaian Siswa', icon: GraduationCap, roles: ['guru', 'superadmin'] as Role[] },

  // Siswa Links
  { href: ROUTES.SISWA_JADWAL, label: 'Jadwal Pelajaran', icon: CalendarDays, roles: ['siswa', 'superadmin'] as Role[] },
  { href: ROUTES.SISWA_TUGAS, label: 'Tugas Saya', icon: ClipboardCheck, roles: ['siswa', 'superadmin'] as Role[] },
  { href: ROUTES.SISWA_MATERI, label: 'Materi Pelajaran', icon: BookOpen, roles: ['siswa', 'superadmin'] as Role[] },
  { href: ROUTES.SISWA_TEST, label: 'Test & Ujian', icon: FileText, roles: ['siswa', 'superadmin'] as Role[] },
  { href: ROUTES.SISWA_NILAI, label: 'Nilai & Rapor', icon: Award, roles: ['siswa', 'superadmin'] as Role[] },
  
  // Common Links
  { href: ROUTES.DATA_VISUALIZATION, label: 'Visualisasi Data', icon: BarChart3, roles: ['admin', 'guru', 'siswa', 'pimpinan', 'superadmin'] as Role[] },
];

export const USER_NAV_ITEMS = [
    { href: ROUTES.SETTINGS, label: 'Pengaturan Profil', icon: Settings },
    { href: ROUTES.LOGIN, label: 'Keluar', icon: LogOut, action: 'logout' },
];

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
] as const; // `as const` makes it a tuple of string literals, good for enum-like usage
