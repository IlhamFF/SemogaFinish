
import type { Role } from '@/types';
import { LayoutDashboard, Users, BarChart3, Settings, LogOut, BookOpenText, BookOpenCheck, CalendarDays, ClipboardList, Presentation, FilePlus2, UserCheck, UploadCloud, ScrollText, GraduationCap } from 'lucide-react';

export const APP_NAME = 'EduCentral';

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
  
  // Common Links
  { href: ROUTES.DATA_VISUALIZATION, label: 'Visualisasi Data', icon: BarChart3, roles: ['admin', 'guru', 'siswa', 'pimpinan', 'superadmin'] as Role[] },
];

export const USER_NAV_ITEMS = [
    { href: ROUTES.SETTINGS, label: 'Pengaturan Profil', icon: Settings },
    { href: ROUTES.LOGIN, label: 'Keluar', icon: LogOut, action: 'logout' },
];

export const DEFAULT_USERS_STORAGE_KEY = 'educentral_users_mock';
export const AUTH_USER_STORAGE_KEY = 'educentral_auth_user_mock';
