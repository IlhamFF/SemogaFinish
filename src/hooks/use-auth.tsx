
"use client";

import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { useRouter }
from 'next/navigation';
import { useSession, signIn, signOut } from "next-auth/react";
import type { User, Role } from '@/types'; // Your application's User type
import { useToast } from '@/hooks/use-toast';
import { 
    DEFAULT_USERS_STORAGE_KEY, // Keep for mock admin user management for now
    ROUTES, 
    ROLES
} from '@/lib/constants';

// This initialUsers and mockPasswords are now only for the *temporary* mock admin user management.
// Real user data and passwords will be handled by NextAuth and your database.
const initialMockUsers: User[] = [
  { id: '1', email: 'admin@example.com', role: 'admin', isVerified: true, name: 'Admin User', fullName: 'Admin Utama', joinDate: '2023-01-01', avatarUrl: 'https://placehold.co/100x100.png?text=AU' },
  { id: '2', email: 'guru@example.com', role: 'guru', isVerified: true, name: 'Guru Contoh', fullName: 'Guru Teladan', joinDate: '2023-01-01', avatarUrl: 'https://placehold.co/100x100.png?text=GC' },
  { id: '3', email: 'siswa@example.com', role: 'siswa', isVerified: false, name: 'Siswa Baru', fullName: 'Siswa Belajar', joinDate: '2023-01-01', avatarUrl: 'https://placehold.co/100x100.png?text=SB' },
  { id: '4', email: 'pimpinan@example.com', role: 'pimpinan', isVerified: true, name: 'Pimpinan Sekolah', fullName: 'Kepala Institusi', joinDate: '2023-01-01', avatarUrl: 'https://placehold.co/100x100.png?text=PS' },
  { id: '5', email: 'super@example.com', role: 'superadmin', isVerified: true, name: 'Super Admin', fullName: 'Super Administrator', joinDate: '2023-01-01', avatarUrl: 'https://placehold.co/100x100.png?text=SA' },
];
const mockAdminPasswords: Record<string, string> = { // Only for mock admin functions
  'admin@example.com': 'password',
  'guru@example.com': 'password',
  'siswa@example.com': 'password',
  'pimpinan@example.com': 'password',
  'super@example.com': 'password',
};


interface AuthContextType {
  user: User | null; // This will be derived from useSession
  users: User[]; // TEMPORARY: For mock admin user management
  login: (email: string, passwordAttempt: string) => Promise<boolean>;
  register: (email: string, passwordAttempt: string) => Promise<boolean>;
  logout: () => Promise<void>;
  verifyUserEmail: (userIdToVerify?: string) => void; // TEMPORARY MOCK
  createUser: (userData: Omit<User, 'id' | 'isVerified'> & { password?: string }) => User | null; // TEMPORARY MOCK
  updateUserRole: (userId: string, newRole: Role) => void; // TEMPORARY MOCK
  deleteUser: (userId: string) => void; // TEMPORARY MOCK
  updateUserProfile: (userId: string, profileData: Partial<User>) => Promise<boolean>; // TEMPORARY MOCK
  requestPasswordReset: (email: string) => Promise<boolean>; // To be implemented with backend
  resetPassword: (email: string, newPassword: string) => Promise<boolean>; // To be implemented with backend
  changePassword: (userId: string, currentPasswordAttempt: string, newPassword: string) => Promise<boolean>; // To be implemented with backend
  isLoading: boolean; // This will be session.status === 'loading'
  updateSession: () => Promise<void>; // For manually refreshing session
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  // TEMPORARY: For mock admin user management
  const [mockManagedUsers, setMockManagedUsers] = useState<User[]>([]);
  useEffect(() => {
    const storedUsers = localStorage.getItem(DEFAULT_USERS_STORAGE_KEY);
    if (storedUsers) {
      setMockManagedUsers(JSON.parse(storedUsers));
    } else {
      setMockManagedUsers(initialMockUsers);
      localStorage.setItem(DEFAULT_USERS_STORAGE_KEY, JSON.stringify(initialMockUsers));
    }
  }, []);
  const persistMockManagedUsers = useCallback((updatedUsers: User[]) => {
    setMockManagedUsers(updatedUsers);
    localStorage.setItem(DEFAULT_USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
  }, []);
  // END TEMPORARY

  const appUser = session?.user ? {
    id: session.user.id,
    email: session.user.email!, // email is guaranteed by NextAuth User type
    name: session.user.name,
    role: session.user.role,
    isVerified: session.user.isVerified,
    avatarUrl: session.user.image, // map image to avatarUrl
    fullName: session.user.fullName,
    // Other fields from your User type might not be in session by default unless added in callbacks
  } as User : null;

  const isLoading = status === 'loading';

  const login = async (email: string, passwordAttempt: string): Promise<boolean> => {
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password: passwordAttempt,
    });

    if (result?.error) {
      console.error("Login error:", result.error);
      // Check if the error is due to unverified user (NextAuth doesn't directly give this, depends on authorize logic)
      const userAttemptingLogin = mockManagedUsers.find(u => u.email === email); // Check mock, ideally backend tells us
      if (userAttemptingLogin && !userAttemptingLogin.isVerified && userAttemptingLogin.role === 'siswa') {
         toast({ title: "Login Gagal", description: "Akun belum diverifikasi. Silakan cek email Anda atau hubungi admin.", variant: "destructive" });
         router.push(ROUTES.VERIFY_EMAIL); // Redirect to allow simulated verification
      } else {
        toast({ title: "Login Gagal", description: "Email atau kata sandi salah.", variant: "destructive" });
      }
      return false;
    }
    
    if (result?.ok && !result.error) {
      // The session will update automatically due to useSession, triggering redirects in pages
      toast({ title: "Login Berhasil", description: "Selamat datang!" });
      // Redirection is now handled by useEffect in login/home pages based on session status
      return true;
    }
    return false;
  };

  const register = async (email: string, passwordAttempt: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: passwordAttempt }),
      });
      const data = await response.json();

      if (!response.ok) {
        toast({ title: "Pendaftaran Gagal", description: data.message || "Terjadi kesalahan.", variant: "destructive" });
        return false;
      }
      
      toast({ title: "Pendaftaran Berhasil", description: "Silakan login dengan akun baru Anda. Verifikasi email mungkin diperlukan." });
      // After successful registration, NextAuth doesn't automatically sign in.
      // We direct them to login. If their email isn't verified, login flow will handle it.
      router.push(ROUTES.LOGIN); 
      return true;

    } catch (error) {
      console.error("Registration fetch error:", error);
      toast({ title: "Pendaftaran Gagal", description: "Tidak dapat terhubung ke server.", variant: "destructive" });
      return false;
    }
  };

  const logout = async () => {
    await signOut({ redirect: true, callbackUrl: ROUTES.LOGIN });
    toast({ title: "Berhasil Keluar", description: "Anda telah berhasil keluar." });
  };
  
  const updateSession = async () => {
    await update(); // Manually trigger a session update
  };

  // --- TEMPORARY MOCK FUNCTIONS for Admin User Management ---
  const verifyUserEmail = (userIdToVerify?: string) => { // Mock
    const targetUserId = userIdToVerify || appUser?.id;
    if (!targetUserId) return;

    const updatedUsers = mockManagedUsers.map(u => 
      u.id === targetUserId ? { ...u, isVerified: true } : u
    );
    persistMockManagedUsers(updatedUsers);

    if (appUser && appUser.id === targetUserId) {
      // Manually update session for current user
      update({ ...session, user: { ...session?.user, isVerified: true }});
      toast({ title: "Email Terverifikasi", description: "Email Anda telah diverifikasi." });
      // Redirect in page after verification
    } else if (userIdToVerify) {
        toast({ title: "Pengguna Diverifikasi", description: `Email pengguna telah diverifikasi (mock).` });
    }
  };
  
  const createUser = (userData: Omit<User, 'id' | 'isVerified'> & { password?: string }): User | null => { // Mock
    if (mockManagedUsers.some(u => u.email === userData.email)) {
      toast({ title: "Pembuatan Gagal", description: "Email sudah ada (mock).", variant: "destructive" });
      return null;
    }
    const defaultName = userData.name || userData.email.split('@')[0];
    const defaultFullName = userData.fullName || defaultName;

    const newUser: User = {
      id: String(Date.now()),
      email: userData.email,
      role: userData.role,
      isVerified: true, 
      name: defaultName,
      fullName: defaultFullName,
      phone: userData.phone,
      address: userData.address,
      birthDate: userData.birthDate,
      bio: userData.bio,
      nis: userData.role === 'siswa' ? userData.nis : undefined,
      nip: userData.role !== 'siswa' ? userData.nip : undefined,
      joinDate: userData.joinDate || new Date().toISOString().split('T')[0],
      avatarUrl: userData.avatarUrl || `https://placehold.co/100x100.png?text=${defaultFullName.substring(0,2).toUpperCase()}`,
      kelas: userData.role === 'siswa' ? userData.kelas : undefined,
      mataPelajaran: userData.role === 'guru' ? userData.mataPelajaran : undefined,
    };
    mockAdminPasswords[userData.email] = userData.password || 'password'; // For mock login if needed
    
    const updatedUsers = [...mockManagedUsers, newUser];
    persistMockManagedUsers(updatedUsers);
    toast({ title: "Pengguna Dibuat", description: `${ROLES[newUser.role]} ${newUser.email} telah dibuat (mock).` });
    return newUser;
  };

  const updateUserRole = (userId: string, newRole: Role) => { // Mock
    const updatedUsers = mockManagedUsers.map(u =>
      u.id === userId ? { ...u, role: newRole } : u
    );
    persistMockManagedUsers(updatedUsers);
    if (appUser && appUser.id === userId) {
        update({ ...session, user: { ...session?.user, role: newRole }});
    }
    toast({ title: "Peran Diperbarui", description: `Peran pengguna diperbarui menjadi ${ROLES[newRole]} (mock).` });
  };

  const deleteUser = (userId: string) => { // Mock
    if (appUser && appUser.id === userId) {
        toast({ title: "Tindakan Ditolak", description: "Tidak dapat menghapus pengguna yang sedang login (mock).", variant: "destructive" });
        return;
    }
    const updatedUsers = mockManagedUsers.filter(u => u.id !== userId);
    persistMockManagedUsers(updatedUsers);
    toast({ title: "Pengguna Dihapus", description: "Pengguna telah berhasil dihapus (mock)." });
  };

  const updateUserProfile = async (userId: string, profileData: Partial<User>): Promise<boolean> => { // Mock
    let userUpdated = false;
    const updatedMockUsers = mockManagedUsers.map(u => {
      if (u.id === userId) {
        userUpdated = true;
        return { ...u, ...profileData };
      }
      return u;
    });

    if (userUpdated) {
      persistMockManagedUsers(updatedMockUsers);
      if (appUser && appUser.id === userId) {
        // Trigger session update. NextAuth will refetch and include new data if callbacks are set right.
        await update(); 
      }
      toast({ title: "Profil Diperbarui", description: "Informasi profil berhasil disimpan (mock)." });
      return true;
    }
    toast({ title: "Pembaruan Gagal", description: "Pengguna tidak ditemukan (mock).", variant: "destructive" });
    return false;
  };

  // --- END TEMPORARY MOCK FUNCTIONS ---

  // --- PLACEHOLDER FUNCTIONS for features not yet connected to backend ---
  const requestPasswordReset = async (email: string): Promise<boolean> => { // Placeholder
    toast({ title: "Simulasi Reset Password", description: `Instruksi reset (simulasi) akan dikirim ke ${email} jika terdaftar.` });
    router.push(`${ROUTES.RESET_PASSWORD}?email=${encodeURIComponent(email)}`); // Simulate flow
    return true;
  };

  const resetPassword = async (email: string, newPassword: string): Promise<boolean> => { // Placeholder
    toast({ title: "Simulasi Reset Berhasil", description: `Kata sandi untuk ${email} telah direset (simulasi). Silakan login.` });
    router.push(ROUTES.LOGIN);
    return true;
  };

  const changePassword = async (userId: string, currentPasswordAttempt: string, newPassword: string): Promise<boolean> => { // Placeholder
     if (currentPasswordAttempt === "oldpassword") { // Mock current password check
        toast({ title: "Kata Sandi Diubah", description: "Kata sandi berhasil diperbarui (simulasi)." });
        return true;
     }
     toast({ title: "Gagal Mengubah Kata Sandi", description: "Kata sandi saat ini salah (simulasi).", variant: "destructive" });
     return false;
  };
  // --- END PLACEHOLDER FUNCTIONS ---

  return (
    <AuthContext.Provider value={{ 
      user: appUser, 
      users: mockManagedUsers, // TEMPORARY
      login, 
      register, 
      logout, 
      verifyUserEmail, // TEMPORARY MOCK
      createUser,      // TEMPORARY MOCK
      updateUserRole,  // TEMPORARY MOCK
      deleteUser,      // TEMPORARY MOCK
      updateUserProfile, // TEMPORARY MOCK
      requestPasswordReset, // Placeholder
      resetPassword,        // Placeholder
      changePassword,       // Placeholder
      isLoading,
      updateSession,
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
