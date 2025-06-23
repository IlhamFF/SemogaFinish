import type { Role } from '@/types';
import { 
    LayoutDashboard, Users, BarChart3, Settings, LogOut, BookOpenText, 
    BookOpenCheck, CalendarDays, ClipboardList, Presentation, FilePlus2, UserCheck, 
    UploadCloud, ScrollText, GraduationCap, ClipboardCheck as ClipboardCheckSiswa, 
    BookOpen, FileText as FileTextSiswa, Award, BookCopy 
} from 'lucide-react';
import { ROUTES } from './constants'; 

export interface NavLink {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: Role[];
}

export const NAV_LINKS_CONFIG: NavLink[] = [
  { href: ROUTES.ADMIN_DASHBOARD, label: 'Dasbor', icon: LayoutDashboard, roles: ['admin', 'superadmin'] as Role[] },
  { href: ROUTES.GURU_DASHBOARD, label: 'Dasbor', icon: LayoutDashboard, roles: ['guru'] as Role[] },
  { href: ROUTES.SISWA_DASHBOARD, label: 'Dasbor', icon: LayoutDashboard, roles: ['siswa'] as Role[] },
  { href: ROUTES.PIMPINAN_DASHBOARD, label: 'Dasbor', icon: LayoutDashboard, roles: ['pimpinan'] as Role[] },
  
  // Admin Links
  { href: ROUTES.ADMIN_USERS, label: 'Manajemen Pengguna', icon: Users, roles: ['admin', 'superadmin'] as Role[] },
  { href: ROUTES.ADMIN_KELAS, label: 'Manajemen Kelas', icon: BookCopy, roles: ['admin', 'superadmin'] as Role[] },
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
  { href: ROUTES.SISWA_TUGAS, label: 'Tugas Saya', icon: ClipboardCheckSiswa, roles: ['siswa', 'superadmin'] as Role[] },
  { href: ROUTES.SISWA_MATERI, label: 'Materi Pelajaran', icon: BookOpen, roles: ['siswa', 'superadmin'] as Role[] },
  { href: ROUTES.SISWA_TEST, label: 'Test & Ujian', icon: FileTextSiswa, roles: ['siswa', 'superadmin'] as Role[] },
  { href: ROUTES.SISWA_NILAI, label: 'Nilai & Rapor', icon: Award, roles: ['siswa', 'superadmin'] as Role[] },
  
  // Common Links
  { href: ROUTES.DATA_VISUALIZATION, label: 'Visualisasi Data', icon: BarChart3, roles: ['admin', 'guru', 'siswa', 'pimpinan', 'superadmin'] as Role[] },
];

export const USER_NAV_ITEMS = [
    { href: ROUTES.SETTINGS, label: 'Pengaturan Profil', icon: Settings },
    { href: ROUTES.LOGIN, label: 'Keluar', icon: LogOut, action: 'logout' },
];
