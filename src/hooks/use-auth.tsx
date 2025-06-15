
"use client";

import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn, signOut } from "next-auth/react";
import type { User, Role } from '@/types'; // Your application's User type
import { useToast } from '@/hooks/use-toast';
import { 
    ROUTES, 
    ROLES
} from '@/lib/constants';

interface AuthContextType {
  user: User | null; 
  login: (email: string, passwordAttempt: string) => Promise<boolean>;
  register: (email: string, passwordAttempt: string) => Promise<boolean>;
  logout: () => Promise<void>;
  verifyUserEmail: (userIdToVerify?: string) => Promise<void>; 
  updateUserProfile: (userId: string, profileData: Partial<User>) => Promise<boolean>; 
  requestPasswordReset: (email: string) => Promise<string | null>; 
  resetPassword: (email: string, token: string, newPassword: string) => Promise<boolean>; 
  changePassword: (userId: string, currentPassword: string, newPassword: string) => Promise<boolean>; 
  isLoading: boolean; 
  updateSession: () => Promise<void>; 
  users: User[]; // Mock for Admin Users Page, admin user management should be via API
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users data for admin page, will be replaced by API call in admin page itself
const mockInitialUsersForAdminPage: User[] = [
  { id: '1', email: 'admin@example.com', role: 'admin', isVerified: true, name: 'Admin User', fullName: 'Admin Sekolah Satu', joinDate: '2023-01-15', nip: 'ADM001' },
  { id: '2', email: 'guru@example.com', role: 'guru', isVerified: true, name: 'Guru Contoh', fullName: 'Dr. Guru Hebat', joinDate: '2023-02-20', nip: 'GRU001', mataPelajaran: 'Fisika' },
  { id: '3', email: 'siswa@example.com', role: 'siswa', isVerified: false, name: 'Siswa Baru', fullName: 'Siswa Calon Juara', joinDate: '2024-07-01', nis: 'S001', kelas: 'X IPA 1' },
  { id: '4', email: 'pimpinan@example.com', role: 'pimpinan', isVerified: true, name: 'Pimpinan Sekolah', fullName: 'Kepala Sekolah Bijak', joinDate: '2022-08-10', nip: 'PMP001' },
  { id: '5', email: 'super@example.com', role: 'superadmin', isVerified: true, name: 'Super Admin', fullName: 'Administrator Utama', joinDate: '2022-01-01', nip: 'SUP001' },
];


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>(mockInitialUsersForAdminPage); // Kept for Admin Users Page example

  const appUser = session?.user ? {
    id: session.user.id,
    email: session.user.email!, 
    name: session.user.name,
    role: session.user.role,
    isVerified: session.user.isVerified,
    avatarUrl: session.user.image, 
    fullName: session.user.fullName,
    phone: session.user.phone,
    address: session.user.address,
    birthDate: session.user.birthDate,
    bio: session.user.bio,
    nis: session.user.nis,
    nip: session.user.nip,
    joinDate: session.user.joinDate,
    kelas: session.user.kelasId || undefined, 
    mataPelajaran: Array.isArray(session.user.mataPelajaran) ? session.user.mataPelajaran.join(', ') : session.user.mataPelajaran || undefined,
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
      toast({ title: "Login Gagal", description: result.error === "CredentialsSignin" ? "Email atau kata sandi salah." : "Terjadi kesalahan saat login." , variant: "destructive" });
      return false;
    }
    
    if (result?.ok && !result.error) {
      // Session will be updated by NextAuth, and appUser will react.
      // Redirection logic is handled by pages based on appUser state.
      toast({ title: "Login Berhasil", description: "Selamat datang!" });
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
      
      toast({ title: "Pendaftaran Berhasil", description: "Akun Anda telah dibuat. Silakan login." });
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
    await update(); // Refreshes the session from the server
  };

  // Verification is now primarily an admin action or via email link (not fully implemented here)
  const verifyUserEmail = async (userIdToVerify?: string) => { 
    const targetUserId = userIdToVerify || appUser?.id;
    if (!targetUserId) return;
    
    if ((appUser?.role === 'admin' || appUser?.role === 'superadmin') && userIdToVerify) {
        // Admin verifying a user
        try {
            const response = await fetch(`/api/users/${userIdToVerify}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isVerified: true }),
            });
            const data = await response.json();
            if (!response.ok) {
                toast({ title: "Verifikasi Gagal", description: data.message || "Gagal memverifikasi pengguna.", variant: "destructive" });
            } else {
                toast({ title: "Pengguna Diverifikasi", description: `Email pengguna ${data.email} telah diverifikasi.` });
                // If admin is verifying current user (unlikely scenario, but possible)
                if (appUser?.id === userIdToVerify) await updateSession();
            }
        } catch (error) {
            toast({ title: "Verifikasi Gagal", description: "Tidak dapat terhubung ke server.", variant: "destructive" });
        }
    } else if (appUser && appUser.id === targetUserId && !appUser.isVerified) {
        // User self-verifying (mock for demo)
        // In real app, this would involve a token from an email link.
        // For this demo, clicking a button on /verify-email page will simulate this.
        console.log("Simulating self-verification for user:", appUser.email);
        toast({ title: "Verifikasi Disimulasikan", description: "Proses verifikasi email disimulasikan. Silakan coba login kembali atau muat ulang halaman jika diperlukan." });
        // To reflect change, admin would actually verify, or a proper token system would be in place.
        // For demo, a user might need to "re-login" for session to pick up external verification.
        // Or admin performs the action. The `updateSession` might not reflect backend changes immediately
        // if the backend verification for self is not implemented.
        // For now, we'll assume an admin has to perform the actual verification in the database.
        // If we want to simulate client-side verification for demo:
        // await update({ ...session, user: { ...session?.user, isVerified: true } });
        // This is tricky as `update` is for client-side optimistic updates or server data refetch.
        // Let's rely on backend for actual verification state.
        router.push(ROUTES.LOGIN); // Prompt re-login to get fresh session if verification was external
    }
  };
  
  const updateUserProfile = async (userId: string, profileData: Partial<User>): Promise<boolean> => { 
     if (!appUser || appUser.id !== userId) {
        toast({ title: "Aksi Gagal", description: "Tidak diizinkan.", variant: "destructive" });
        return false;
     }
     try {
        const response = await fetch('/api/users/me/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profileData),
        });
        const data = await response.json();

        if (!response.ok) {
            toast({ title: "Gagal Memperbarui Profil", description: data.message || "Terjadi kesalahan.", variant: "destructive" });
            return false;
        }
        
        toast({ title: "Profil Diperbarui", description: "Informasi profil Anda berhasil disimpan." });
        await updateSession(); 
        return true;
     } catch (error) {
        console.error("Update profile fetch error:", error);
        toast({ title: "Gagal Memperbarui Profil", description: "Tidak dapat terhubung ke server.", variant: "destructive" });
        return false;
     }
  };

  const requestPasswordReset = async (email: string): Promise<string | null> => { 
    try {
      const response = await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (!response.ok) {
        toast({ title: "Gagal Meminta Reset", description: data.message || "Terjadi kesalahan.", variant: "destructive" });
        return null;
      }
      
      toast({ title: "Permintaan Terkirim", description: data.message });
      return data.demoResetToken || null; 
    } catch (error) {
      console.error("Request password reset fetch error:", error);
      toast({ title: "Gagal Meminta Reset", description: "Tidak dapat terhubung ke server.", variant: "destructive" });
      return null;
    }
  };

  const resetPassword = async (email: string, token: string, newPassword: string): Promise<boolean> => { 
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword }),
      });
      const data = await response.json();

      if (!response.ok) {
        toast({ title: "Gagal Reset Kata Sandi", description: data.message || "Terjadi kesalahan.", variant: "destructive" });
        return false;
      }
      
      toast({ title: "Kata Sandi Direset", description: data.message });
      router.push(ROUTES.LOGIN);
      return true;
    } catch (error) {
      console.error("Reset password fetch error:", error);
      toast({ title: "Gagal Reset Kata Sandi", description: "Tidak dapat terhubung ke server.", variant: "destructive" });
      return false;
    }
  };

  const changePassword = async (userId: string, currentPassword: string, newPassword: string): Promise<boolean> => { 
     if (!appUser || appUser.id !== userId) {
        toast({ title: "Aksi Gagal", description: "Tidak diizinkan.", variant: "destructive" });
        return false;
     }
     try {
        const response = await fetch('/api/auth/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword, newPassword }),
        });
        const data = await response.json();

        if (!response.ok) {
            toast({ title: "Gagal Mengubah Kata Sandi", description: data.message || "Terjadi kesalahan.", variant: "destructive" });
            return false;
        }
        
        toast({ title: "Kata Sandi Diubah", description: data.message });
        return true;
     } catch (error) {
        console.error("Change password fetch error:", error);
        toast({ title: "Gagal Mengubah Kata Sandi", description: "Tidak dapat terhubung ke server.", variant: "destructive" });
        return false;
     }
  };

  return (
    <AuthContext.Provider value={{ 
      user: appUser, 
      login, 
      register, 
      logout, 
      verifyUserEmail,
      updateUserProfile,
      requestPasswordReset,
      resetPassword,
      changePassword,
      isLoading,
      updateSession,
      users, // This 'users' state is now primarily for the Admin Users page mock data.
             // Actual user management (create, update role, delete) for admin will call APIs directly.
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

    