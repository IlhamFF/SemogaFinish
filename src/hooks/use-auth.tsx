
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
  updateUserProfile: (profileData: Partial<User>) => Promise<boolean>; 
  requestPasswordReset: (email: string) => Promise<string | null>; 
  resetPassword: (email: string, token: string, newPassword: string) => Promise<boolean>; 
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>; 
  isLoading: boolean; 
  updateSession: () => Promise<void>; 
  users: User[]; // Kept for potential use by components that haven't been fully refactored yet, but should ideally be removed later.
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
    // Convert kelasId from session to 'kelas' if needed by frontend components:
    kelas: session.user.kelasId || undefined, 
    // Convert mataPelajaran array from session to single string if needed, or adjust frontend:
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

    // This is a mock/simulation for client-side perception. 
    // Real verification happens via backend (e.g., token link).
    // If an admin verifies a user, it's through the PUT /api/users/[id] endpoint.
    // This function is mainly for the /verify-email page simulation.
    if (appUser && appUser.id === targetUserId && !appUser.isVerified) {
        console.log("Simulating email verification for current user via session update.");
        // We update the session to reflect the change immediately for demo purposes.
        // In a real app, the backend would confirm verification, and a new session fetch/login would show it.
        await update({ ...session, user: { ...session?.user, isVerified: true } });
        toast({ title: "Email Terverifikasi", description: "Email Anda telah diverifikasi." });
    }
  };
  
  const updateUserProfile = async (profileData: Partial<User>): Promise<boolean> => { 
     if (!appUser) {
        toast({ title: "Aksi Gagal", description: "Anda harus login untuk memperbarui profil.", variant: "destructive" });
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

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => { 
     if (!appUser) {
        toast({ title: "Aksi Gagal", description: "Anda harus login untuk mengubah kata sandi.", variant: "destructive" });
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
      users: [], // Placeholder, admin user management is now via API
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

