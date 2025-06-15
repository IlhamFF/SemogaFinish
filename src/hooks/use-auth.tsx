
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
  verifyUserEmail: (userIdToVerify?: string) => void; 
  updateUserProfile: (userId: string, profileData: Partial<User>) => Promise<boolean>; 
  requestPasswordReset: (email: string) => Promise<string | null>; 
  resetPassword: (email: string, token: string, newPassword: string) => Promise<boolean>; 
  changePassword: (userId: string, currentPassword: string, newPassword: string) => Promise<boolean>; 
  isLoading: boolean; 
  updateSession: () => Promise<void>; 
  users: User[]; // Kept for Admin Users Page, admin user management is now via API
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]); // For Admin Users page data source

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
      toast({ title: "Login Gagal", description: result.error === "CredentialsSignin" ? "Email atau kata sandi salah." : result.error , variant: "destructive" });
      return false;
    }
    
    if (result?.ok && !result.error) {
      toast({ title: "Login Berhasil", description: "Selamat datang!" });
      // Redirection will be handled by the page itself using useEffect and useAuth's user state
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
      
      toast({ title: "Pendaftaran Berhasil", description: "Akun Anda telah dibuat. Silakan login untuk melanjutkan verifikasi email (jika siswa)." });
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
    await update();
  };

  const verifyUserEmail = async (userIdToVerify?: string) => { 
    const targetUserId = userIdToVerify || appUser?.id;
    if (!targetUserId) return;
    
    // This function is now primarily for client-side simulation if needed,
    // as actual verification is an admin action or a backend token process.
    // For admin verifying a user, the PUT /api/users/[id] endpoint is used.
    if (appUser && appUser.id === targetUserId && !appUser.isVerified) {
        console.log("Simulating email verification for current user via session update.");
        await update({ ...session, user: { ...session?.user, isVerified: true } });
        toast({ title: "Email Terverifikasi (Simulasi)", description: "Email Anda telah ditandai terverifikasi di sesi ini." });
    } else if (appUser?.role === 'admin' || appUser?.role === 'superadmin') {
        // Admin action will call API directly from User Management page
        // This function is less relevant for admin initiated verification.
        // toast({ title: "Info", description: "Admin memverifikasi pengguna melalui halaman Manajemen Pengguna."});
    }
  };
  
  const updateUserProfile = async (userId: string, profileData: Partial<User>): Promise<boolean> => { 
     if (!appUser || appUser.id !== userId) { // Ensure user is updating their own profile
        toast({ title: "Aksi Gagal", description: "Tidak diizinkan.", variant: "destructive" });
        return false;
     }
     try {
        const response = await fetch('/api/users/me/profile', { // Use /me/profile for self-update
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
        await update(); // This fetches the latest session data from the server
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
      return data.demoResetToken || null; // For demo: API returns token
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
            body: JSON.stringify({ currentPassword, newPassword }), // userId is implicit from session
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
      users, // Keep for admin users page, though data is fetched via API
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
