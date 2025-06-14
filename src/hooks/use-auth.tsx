
"use client";

import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User, Role } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { DEFAULT_USERS_STORAGE_KEY, AUTH_USER_STORAGE_KEY, ROUTES, ROLES, APP_NAME } from '@/lib/constants';

// Kata sandi mock (dalam aplikasi nyata, ini akan ditangani oleh backend)
const mockPasswords: Record<string, string> = {
  'admin@example.com': 'password',
  'guru@example.com': 'password',
  'siswa@example.com': 'password',
  'pimpinan@example.com': 'password',
  'super@example.com': 'password',
  'verified.siswa@example.com': 'password',
};

const initialUsers: User[] = [
  { 
    id: '1', email: 'admin@example.com', role: 'admin', isVerified: true, name: 'Admin Edu', fullName: 'Administrator EduCentral',
    phone: '081234567890', address: 'Jl. Merdeka No. 1, Jakarta', birthDate: '1980-01-01', bio: 'Pengelola sistem EduCentral.', nip: 'P.ADM.001', joinDate: '2020-01-15'
  },
  { 
    id: '2', email: 'guru@example.com', role: 'guru', isVerified: true, name: 'Bu Guru Ani', fullName: 'Ani Suryani, S.Pd.',
    phone: '081234567891', address: 'Jl. Pendidikan No. 10, Bandung', birthDate: '1985-05-10', bio: 'Guru Matematika berpengalaman.', nip: 'G.MTK.001', joinDate: '2018-07-20'
  },
  { 
    id: '3', email: 'siswa@example.com', role: 'siswa', isVerified: false, name: 'Siswa Budi', fullName: 'Budi Hartono',
    phone: '081234567892', address: 'Jl. Pelajar No. 5, Surabaya', birthDate: '2005-08-17', bio: 'Siswa kelas X, minat pada sains.', nis: 'S.10.001', joinDate: '2023-07-10'
  },
  { 
    id: '4', email: 'pimpinan@example.com', role: 'pimpinan', isVerified: true, name: 'Pak Kepsek', fullName: 'Dr. H. Bambang Susetyo, M.Pd.',
    phone: '081234567893', address: 'Jl. Kepemimpinan No. 1, Yogyakarta', birthDate: '1975-03-20', bio: 'Kepala Sekolah dengan visi memajukan pendidikan.', nip: 'P.KPS.001', joinDate: '2015-03-01'
  },
  { 
    id: '5', email: 'super@example.com', role: 'superadmin', isVerified: true, name: 'Super Admin', fullName: 'Super Administrator Sistem',
    phone: '081200000000', address: 'Pusat Data EduCentral', birthDate: '1970-01-01', bio: 'Pemegang kunci akses tertinggi.', nip: 'P.SUP.001', joinDate: '2010-01-01'
  },
   { 
    id: '6', email: 'verified.siswa@example.com', role: 'siswa', isVerified: true, name: 'Siti Terverifikasi', fullName: 'Siti Aminah',
    phone: '081234567899', address: 'Jl. Cendekia No. 7, Medan', birthDate: '2006-02-14', bio: 'Siswa rajin dan aktif.', nis: 'S.11.002', joinDate: '2023-07-10'
  },
];


interface AuthContextType {
  user: User | null;
  users: User[];
  login: (email: string, passwordAttempt: string) => Promise<boolean>;
  register: (email: string, passwordAttempt: string) => Promise<boolean>;
  logout: () => void;
  verifyUserEmail: (userIdToVerify?: string) => void;
  createUser: (userData: Omit<User, 'id' | 'isVerified'> & { password?: string }) => User | null;
  updateUserRole: (userId: string, newRole: Role) => void;
  deleteUser: (userId: string) => void;
  updateUserProfile: (userId: string, profileData: Partial<User>) => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  resetPassword: (email: string, newPassword: string) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsersState] = useState<User[]>([]); // Renamed to avoid conflict
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const getStoredUsers = useCallback((): User[] => {
    if (typeof window !== 'undefined') {
      const storedUsers = localStorage.getItem(DEFAULT_USERS_STORAGE_KEY);
      return storedUsers ? JSON.parse(storedUsers) : initialUsers;
    }
    return initialUsers;
  }, []);

  const persistUsers = useCallback((updatedUsers: User[]) => {
    setUsersState(updatedUsers); // Update local state
    if (typeof window !== 'undefined') {
      localStorage.setItem(DEFAULT_USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
    }
  }, []);

  const persistAuthUser = useCallback((authUser: User | null) => {
    setUser(authUser);
    if (typeof window !== 'undefined') {
      if (authUser) {
        localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(authUser));
      } else {
        localStorage.removeItem(AUTH_USER_STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    setUsersState(getStoredUsers()); // Load users into state
    if (typeof window !== 'undefined') {
      const storedAuthUser = localStorage.getItem(AUTH_USER_STORAGE_KEY);
      if (storedAuthUser) {
        persistAuthUser(JSON.parse(storedAuthUser));
      }
    }
    setIsLoading(false);
  }, [persistAuthUser, getStoredUsers]);

  const login = async (email: string, passwordAttempt: string): Promise<boolean> => {
    setIsLoading(true);
    const currentUsers = getStoredUsers();
    const existingUser = currentUsers.find(u => u.email === email);

    if (existingUser && mockPasswords[email] === passwordAttempt) {
      if (!existingUser.isVerified && existingUser.role === 'siswa') {
        persistAuthUser(existingUser);
        router.push(ROUTES.VERIFY_EMAIL);
        toast({ title: "Verifikasi Diperlukan", description: "Silakan verifikasi email Anda untuk melanjutkan." });
        setIsLoading(false);
        return true;
      }
      persistAuthUser(existingUser);
      toast({ title: "Login Berhasil", description: `Selamat datang kembali, ${existingUser.fullName || existingUser.name || existingUser.email}!` });
      switch (existingUser.role) {
        case 'admin': router.push(ROUTES.ADMIN_DASHBOARD); break;
        case 'guru': router.push(ROUTES.GURU_DASHBOARD); break;
        case 'siswa': router.push(ROUTES.SISWA_DASHBOARD); break;
        case 'pimpinan': router.push(ROUTES.PIMPINAN_DASHBOARD); break;
        case 'superadmin': router.push(ROUTES.ADMIN_DASHBOARD); break;
        default: router.push(ROUTES.HOME);
      }
      setIsLoading(false);
      return true;
    }
    toast({ title: "Login Gagal", description: "Email atau kata sandi salah.", variant: "destructive" });
    setIsLoading(false);
    return false;
  };

  const register = async (email: string, passwordAttempt: string): Promise<boolean> => {
    setIsLoading(true);
    const currentUsers = getStoredUsers();
    if (currentUsers.some(u => u.email === email)) {
      toast({ title: "Pendaftaran Gagal", description: "Email sudah ada.", variant: "destructive" });
      setIsLoading(false);
      return false;
    }
    const newUser: User = {
      id: String(Date.now()),
      email,
      role: 'siswa',
      isVerified: false,
      name: email.split('@')[0],
      fullName: email.split('@')[0], // Default full name
    };
    mockPasswords[email] = passwordAttempt;
    const updatedUsers = [...currentUsers, newUser];
    persistUsers(updatedUsers);
    persistAuthUser(newUser);
    toast({ title: "Pendaftaran Berhasil", description: "Silakan verifikasi email Anda." });
    router.push(ROUTES.VERIFY_EMAIL);
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    persistAuthUser(null);
    router.push(ROUTES.LOGIN);
    toast({ title: "Berhasil Keluar", description: "Anda telah berhasil keluar." });
  };

  const verifyUserEmail = (userIdToVerify?: string) => {
    const currentUsers = getStoredUsers();
    const targetUserId = userIdToVerify || user?.id;
    if (!targetUserId) return;

    const updatedUsers = currentUsers.map(u => 
      u.id === targetUserId ? { ...u, isVerified: true } : u
    );
    persistUsers(updatedUsers);

    const currentUser = user; // capture current user state
    if (currentUser && currentUser.id === targetUserId) {
      const updatedCurrentUser = { ...currentUser, isVerified: true };
      persistAuthUser(updatedCurrentUser);
      toast({ title: "Email Terverifikasi", description: "Email Anda telah diverifikasi." });
      switch (updatedCurrentUser.role) {
        case 'admin': router.push(ROUTES.ADMIN_DASHBOARD); break;
        case 'guru': router.push(ROUTES.GURU_DASHBOARD); break;
        case 'siswa': router.push(ROUTES.SISWA_DASHBOARD); break;
        case 'pimpinan': router.push(ROUTES.PIMPINAN_DASHBOARD); break;
        case 'superadmin': router.push(ROUTES.ADMIN_DASHBOARD); break;
        default: router.push(ROUTES.LOGIN);
      }
    } else if (userIdToVerify) {
        toast({ title: "Pengguna Diverifikasi", description: `Email pengguna telah diverifikasi.` });
    }
  };
  
  const createUser = (userData: Omit<User, 'id' | 'isVerified'> & { password?: string }): User | null => {
    const currentUsers = getStoredUsers();
    if (currentUsers.some(u => u.email === userData.email)) {
      toast({ title: "Pembuatan Gagal", description: "Email sudah ada.", variant: "destructive" });
      return null;
    }
    const newUser: User = {
      id: String(Date.now()),
      email: userData.email,
      role: userData.role,
      isVerified: true, 
      name: userData.name || userData.email.split('@')[0],
      fullName: userData.fullName || userData.name || userData.email.split('@')[0],
      phone: userData.phone,
      address: userData.address,
      birthDate: userData.birthDate,
      bio: userData.bio,
      nis: userData.nis,
      nip: userData.nip,
      joinDate: userData.joinDate,
      avatarUrl: userData.avatarUrl,
    };
    mockPasswords[userData.email] = userData.password || 'password'; // Default password if not provided
    
    const updatedUsers = [...currentUsers, newUser];
    persistUsers(updatedUsers);
    toast({ title: "Pengguna Dibuat", description: `${ROLES[newUser.role]} ${newUser.email} telah dibuat.` });
    return newUser;
  };

  const updateUserRole = (userId: string, newRole: Role) => {
    const currentUsers = getStoredUsers();
    const updatedUsers = currentUsers.map(u =>
      u.id === userId ? { ...u, role: newRole } : u
    );
    persistUsers(updatedUsers);
    const currentUser = user; // capture current user state
    if (currentUser && currentUser.id === userId) {
      persistAuthUser({ ...currentUser, role: newRole });
    }
    toast({ title: "Peran Diperbarui", description: `Peran pengguna telah diperbarui menjadi ${ROLES[newRole]}.` });
  };

  const deleteUser = (userId: string) => {
    const currentUser = user; // capture current user state
    if (currentUser && currentUser.id === userId) {
        toast({ title: "Tindakan Ditolak", description: "Tidak dapat menghapus pengguna yang sedang login.", variant: "destructive" });
        return;
    }
    const currentUsers = getStoredUsers();
    const updatedUsers = currentUsers.filter(u => u.id !== userId);
    persistUsers(updatedUsers);
    toast({ title: "Pengguna Dihapus", description: "Pengguna telah berhasil dihapus." });
  };

  const updateUserProfile = async (userId: string, profileData: Partial<User>): Promise<boolean> => {
    setIsLoading(true);
    const currentUsers = getStoredUsers();
    let userUpdated = false;
    const updatedUsers = currentUsers.map(u => {
      if (u.id === userId) {
        userUpdated = true;
        return { ...u, ...profileData };
      }
      return u;
    });

    if (userUpdated) {
      persistUsers(updatedUsers);
      const currentUser = user; // capture
      if (currentUser && currentUser.id === userId) {
        persistAuthUser({ ...currentUser, ...profileData });
      }
      toast({ title: "Profil Diperbarui", description: "Informasi profil Anda telah berhasil disimpan." });
      setIsLoading(false);
      return true;
    }
    
    toast({ title: "Pembaruan Gagal", description: "Pengguna tidak ditemukan.", variant: "destructive" });
    setIsLoading(false);
    return false;
  };

  const requestPasswordReset = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    const currentUsers = getStoredUsers();
    const existingUser = currentUsers.find(u => u.email === email);
    if (existingUser) {
      // Simulasi pengiriman email reset
      toast({ title: "Permintaan Reset Terkirim", description: `Jika email ${email} terdaftar, instruksi reset akan dikirim (disimulasikan).` });
      // Untuk mock, kita langsung redirect dengan token/email
      router.push(`${ROUTES.RESET_KATA_SANDI}?email=${encodeURIComponent(email)}`);
      setIsLoading(false);
      return true;
    }
    toast({ title: "Permintaan Gagal", description: "Email tidak terdaftar.", variant: "destructive" });
    setIsLoading(false);
    return false;
  };

  const resetPassword = async (email: string, newPassword: string): Promise<boolean> => {
    setIsLoading(true);
    const currentUsers = getStoredUsers();
    const userToReset = currentUsers.find(u => u.email === email);

    if (userToReset) {
      mockPasswords[email] = newPassword; // Perbarui kata sandi di mock store
      // Tidak perlu persistUsers karena mockPasswords terpisah
      toast({ title: "Kata Sandi Direset", description: "Kata sandi Anda telah berhasil diubah. Silakan login." });
      router.push(ROUTES.LOGIN);
      setIsLoading(false);
      return true;
    }
    toast({ title: "Reset Gagal", description: "Gagal mereset kata sandi. Token mungkin tidak valid atau email tidak ditemukan.", variant: "destructive" });
    setIsLoading(false);
    return false;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      users: users, // Use the state variable 'usersState' here
      login, 
      register, 
      logout, 
      verifyUserEmail, 
      createUser, 
      updateUserRole, 
      deleteUser, 
      updateUserProfile,
      requestPasswordReset,
      resetPassword,
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
};
