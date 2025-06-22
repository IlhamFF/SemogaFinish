
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { ROUTES } from '@/lib/constants';
import { AuthContext, type RegisterData } from '@/hooks/use-auth';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const fetchUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData: User = await response.json();
        setUser(userData);
      } else {
        setUser(null);
        if (response.status !== 401) {
            const errorData = await response.json().catch(() => ({ message: "Gagal mengambil data pengguna." }));
            console.error("Fetch user failed:", errorData.message);
        }
      }
    } catch (error) {
      console.error("Fetch user error:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = useCallback(async (email: string, passwordAttempt: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: passwordAttempt }),
      });
      const data = await response.json();

      if (!response.ok) {
        toast({ title: "Login Gagal", description: data.message || "Email atau kata sandi salah.", variant: "destructive" });
        return false;
      }
      
      setUser(data as User);
      toast({ title: "Login Berhasil", description: `Selamat datang kembali, ${data.fullName || data.name || data.email}!` });
      return true;
    } catch (error) {
      console.error("Login fetch error:", error);
      toast({ title: "Login Gagal", description: "Tidak dapat terhubung ke server.", variant: "destructive" });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const register = useCallback(async (registerData: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      });
      const data = await response.json();

      if (!response.ok) {
        toast({ title: "Pendaftaran Gagal", description: data.message || "Terjadi kesalahan.", variant: "destructive" });
        return false;
      }
      
      toast({ title: "Pendaftaran Berhasil", description: "Akun Anda telah dibuat. Silakan periksa email Anda untuk verifikasi." });
      router.push(ROUTES.LOGIN); 
      return true;
    } catch (error) {
      console.error("Registration fetch error:", error);
      toast({ title: "Pendaftaran Gagal", description: "Tidak dapat terhubung ke server.", variant: "destructive" });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [router, toast]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
        console.error("Logout error:", error);
    } finally {
        setUser(null);
        router.push(ROUTES.LOGIN);
        toast({ title: "Berhasil Keluar", description: "Anda telah berhasil keluar." });
        setIsLoading(false);
    }
  }, [router, toast]);

  const updateUserProfile = useCallback(async (userId: string, profileData: Partial<User>): Promise<boolean> => {
    const endpoint = userId === user?.id ? '/api/users/me/profile' : `/api/users/${userId}`;
    if (endpoint === `/api/users/${userId}`) {
        console.warn("useAuth.updateUserProfile is for self-updates only. Admin updates should use a different flow.");
        return false;
    }

    try {
        const response = await fetch(endpoint, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profileData),
        });
        const data = await response.json();
        if (!response.ok) {
            toast({ title: "Update Profil Gagal", description: data.message || "Terjadi kesalahan.", variant: "destructive" });
            return false;
        }
        toast({ title: "Profil Diperbarui", description: "Informasi profil Anda telah berhasil disimpan." });
        setUser(data as User);
        return true;
    } catch (e) {
        toast({ title: "Update Profil Gagal", description: "Tidak dapat terhubung ke server.", variant: "destructive" });
        return false;
    }
  }, [toast, user?.id]);

  const changePassword = useCallback(async (userId: string, currentPassword: string, newPassword: string): Promise<boolean> => {
      try {
        const response = await fetch('/api/auth/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword, newPassword }),
        });
        const data = await response.json();
        if (!response.ok) {
            toast({ title: "Ubah Kata Sandi Gagal", description: data.message, variant: "destructive" });
            return false;
        }
        toast({ title: "Berhasil!", description: "Kata sandi Anda telah berhasil diubah." });
        return true;
      } catch (e) {
          toast({ title: "Ubah Kata Sandi Gagal", description: "Tidak dapat terhubung ke server.", variant: "destructive" });
          return false;
      }
  }, [toast]);

  const contextValue = useMemo(() => ({
    user,
    isLoading,
    login,
    register,
    logout,
    fetchUser,
    updateUserProfile,
    changePassword,
  }), [user, isLoading, login, register, logout, fetchUser, updateUserProfile, changePassword]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
