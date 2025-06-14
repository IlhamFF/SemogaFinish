
import type { Role } from '@/types';
import { LayoutDashboard, Users, BarChart3, Settings, LogOut, BookOpenText, BookOpenCheck, CalendarDays } from 'lucide-react';

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
  ADMIN_JADWAL: '/admin/jadwal',
  GURU_DASHBOARD: '/guru/dashboard',
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
  
  { href: ROUTES.ADMIN_USERS, label: 'Manajemen Pengguna', icon: Users, roles: ['admin', 'superadmin'] as Role[] },
  { href: ROUTES.ADMIN_KURIKULUM, label: 'Manajemen Kurikulum', icon: BookOpenCheck, roles: ['admin', 'superadmin'] as Role[] },
  { href: ROUTES.ADMIN_JADWAL, label: 'Manajemen Jadwal', icon: CalendarDays, roles: ['admin', 'superadmin'] as Role[] },
  
  { href: ROUTES.DATA_VISUALIZATION, label: 'Visualisasi Data', icon: BarChart3, roles: ['admin', 'guru', 'siswa', 'pimpinan', 'superadmin'] as Role[] },
];

export const USER_NAV_ITEMS = [
    { href: ROUTES.SETTINGS, label: 'Pengaturan Profil', icon: Settings },
    { href: ROUTES.LOGIN, label: 'Keluar', icon: LogOut, action: 'logout' },
];

export const DEFAULT_USERS_STORAGE_KEY = 'educentral_users_mock';
export const AUTH_USER_STORAGE_KEY = 'educentral_auth_user_mock';
