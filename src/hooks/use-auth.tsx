
"use client";

import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { useRouter }
from 'next/navigation';
import { useSession, signIn, signOut } from "next-auth/react";
import type { User, Role } from '@/types'; // Your application's User type
import { useToast } from '@/hooks/use-toast';
import { 
    ROUTES, 
    ROLES
} from '@/lib/constants';

// Mock data for current user profile updates only, not for admin management.
// Admin user list management will now be done via API calls in the admin pages.

interface AuthContextType {
  user: User | null; // This will be derived from useSession
  login: (email: string, passwordAttempt: string) => Promise<boolean>;
  register: (email: string, passwordAttempt: string) => Promise<boolean>;
  logout: () => Promise<void>;
  verifyUserEmail: (userIdToVerify?: string) => void; // For current user's verification primarily
  updateUserProfile: (userId: string, profileData: Partial<User>) => Promise<boolean>; // For current user's own profile
  requestPasswordReset: (email: string) => Promise<boolean>; 
  resetPassword: (email: string, newPassword: string) => Promise<boolean>; 
  changePassword: (userId: string, currentPasswordAttempt: string, newPassword: string) => Promise<boolean>; 
  isLoading: boolean; 
  updateSession: () => Promise<void>; 
  users: User[]; // TEMPORARY: Will return empty array, admin pages fetch their own user list.
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
    // Fetch other fields from DB if needed, or ensure they are in session token
    phone: session.user.phone,
    address: session.user.address,
    birthDate: session.user.birthDate,
    bio: session.user.bio,
    nis: session.user.nis,
    nip: session.user.nip,
    joinDate: session.user.joinDate,
    kelas: session.user.kelasId, // map kelasId to kelas for User type
    mataPelajaran: session.user.mataPelajaran?.[0], // Assuming single string from array for User type
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
      // Check if the error indicates an unverified user (this depends on your `authorize` logic)
      // For now, we'll assume authorize either succeeds or gives generic error.
      // If backend returns specific error for unverified user, handle it here.
      // Example: if (result.error.includes("unverified")) router.push(ROUTES.VERIFY_EMAIL);
      return false;
    }
    
    if (result?.ok && !result.error) {
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
      
      toast({ title: "Pendaftaran Berhasil", description: "Akun Anda telah dibuat. Silakan login. Verifikasi email mungkin diperlukan." });
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

  // --- Functions for current user's own actions ---
  const verifyUserEmail = async (userIdToVerify?: string) => { 
    // This function is now primarily for the current user verifying their *own* email on the /verify-email page.
    // Admin verification will be an update through /api/users/[id]
    const targetUserId = userIdToVerify || appUser?.id;
    if (!targetUserId) return;

    if (appUser && appUser.id === targetUserId && !appUser.isVerified) {
        // Simulate verification for demo on /verify-email page
        // In a real app, this would involve a backend call that sets the user's email as verified
        // For this demo, we'll just update the session if it's the current user
        console.log("Simulating email verification for current user via session update.");
        await update({ ...session, user: { ...session?.user, isVerified: true } });
        toast({ title: "Email Terverifikasi", description: "Email Anda telah diverifikasi." });
        // Redirection will be handled by the /verify-email page's useEffect
    } else if (userIdToVerify && appUser?.id !== userIdToVerify) {
        // This case should ideally not be hit from useAuth directly for admin actions.
        // Admin verification is done via PUT /api/users/[id]
        toast({ title: "Info", description: "Verifikasi pengguna oleh admin dilakukan melalui panel manajemen pengguna."});
    }
  };
  
  const updateUserProfile = async (userId: string, profileData: Partial<User>): Promise<boolean> => { 
    // This function is intended for the logged-in user updating their OWN profile.
    // For now, it's a placeholder. In a real app, it would call `PUT /api/users/me/profile` or similar.
    if (appUser && appUser.id === userId) {
        console.log("Simulating profile update for current user:", profileData);
        // To make it reflect in the UI, we'd need to update the session.
        // The `update` function from `useSession` can accept new session data.
        // We'd need to construct what the new `session.user` object should look like.
        const newSessionUser = {
            ...session?.user,
            name: profileData.name ?? session?.user?.name,
            fullName: profileData.fullName ?? session?.user?.fullName,
            image: profileData.avatarUrl ?? session?.user?.image,
            // Map other profileData fields to session?.user fields
            phone: profileData.phone,
            address: profileData.address,
            birthDate: profileData.birthDate, // Assuming profileData.birthDate is already string
            bio: profileData.bio,
        };
        await update(newSessionUser); // This updates the session on the client-side

        toast({ title: "Profil Diperbarui", description: "Informasi profil Anda berhasil disimpan (simulasi)." });
        return true;
    }
    toast({ title: "Pembaruan Gagal", description: "Tidak dapat memperbarui profil pengguna lain (simulasi).", variant: "destructive" });
    return false;
  };

  const requestPasswordReset = async (email: string): Promise<boolean> => { 
    toast({ title: "Simulasi Reset Password", description: `Instruksi reset (simulasi) akan dikirim ke ${email} jika terdaftar.` });
    router.push(`${ROUTES.RESET_PASSWORD}?email=${encodeURIComponent(email)}&token=mockresettoken`); // Simulate flow with a token
    return true;
  };

  const resetPassword = async (email: string, newPassword: string): Promise<boolean> => { 
    // In a real app, this would call `POST /api/auth/reset-password` with email, token, newPassword
    toast({ title: "Simulasi Reset Berhasil", description: `Kata sandi untuk ${email} telah direset (simulasi). Silakan login.` });
    router.push(ROUTES.LOGIN);
    return true;
  };

  const changePassword = async (userId: string, currentPasswordAttempt: string, newPassword: string): Promise<boolean> => { 
     // In a real app, this would call `POST /api/auth/change-password`
     if (currentPasswordAttempt === "oldpasswordmock") { // Mock current password check
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
      users: [], // Admin user list now fetched by admin pages directly
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

