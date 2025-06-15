
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
  changePassword: (currentPasswordAttempt: string, newPassword: string) => Promise<boolean>; 
  isLoading: boolean; 
  updateSession: () => Promise<void>; 
  users: User[]; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const { toast } = useToast();

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
    kelas: session.user.kelasId, 
    mataPelajaran: session.user.mataPelajaran?.[0], 
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
    await update();
  };

  const verifyUserEmail = async (userIdToVerify?: string) => { 
    const targetUserId = userIdToVerify || appUser?.id;
    if (!targetUserId) return;

    if (appUser && appUser.id === targetUserId && !appUser.isVerified) {
        console.log("Simulating email verification for current user via session update.");
        await update({ ...session, user: { ...session?.user, isVerified: true } });
        toast({ title: "Email Terverifikasi", description: "Email Anda telah diverifikasi." });
    }
  };
  
  const updateUserProfile = async (userId: string, profileData: Partial<User>): Promise<boolean> => { 
    if (appUser && appUser.id === userId) {
        console.log("Simulating profile update for current user:", profileData);
        const newSessionUser = {
            ...session?.user,
            name: profileData.name ?? session?.user?.name,
            fullName: profileData.fullName ?? session?.user?.fullName,
            image: profileData.avatarUrl ?? session?.user?.image,
            phone: profileData.phone,
            address: profileData.address,
            birthDate: profileData.birthDate, 
            bio: profileData.bio,
        };
        await update(newSessionUser); 
        toast({ title: "Profil Diperbarui", description: "Informasi profil Anda berhasil disimpan (simulasi)." });
        return true;
    }
    toast({ title: "Pembaruan Gagal", description: "Tidak dapat memperbarui profil pengguna lain (simulasi).", variant: "destructive" });
    return false;
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
      // For DEMO, return the token so frontend can construct the link
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

  const changePassword = async (currentPasswordAttempt: string, newPassword: string): Promise<boolean> => { 
     // TODO: Implement backend for change password: POST /api/auth/change-password
     // For now, simulate
     if (!appUser) {
        toast({ title: "Aksi Gagal", description: "Anda harus login untuk mengubah kata sandi.", variant: "destructive" });
        return false;
     }
     console.log("Simulating change password for user:", appUser.email, {currentPasswordAttempt: "******", newPassword: "******"});
     // Assume currentPasswordAttempt is validated against user's actual current password on backend
     // For demo, we'll just mock a success if current password is 'oldpasswordmock'
     if (currentPasswordAttempt === "oldpasswordmock") { // Replace with actual check
        toast({ title: "Kata Sandi Diubah", description: "Kata sandi berhasil diperbarui (simulasi)." });
        return true;
     }
     toast({ title: "Gagal Mengubah Kata Sandi", description: "Kata sandi saat ini salah (simulasi).", variant: "destructive" });
     return false;
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
      users: [], 
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
