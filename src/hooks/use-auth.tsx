
"use client";

import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User, Role } from '@/types'; 
import { useToast } from '@/hooks/use-toast';
import { ROUTES, ROLES } from '@/lib/constants';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, passwordAttempt: string) => Promise<boolean>;
  register: (email: string, passwordAttempt: string) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>; 
  // Placeholder functions that would require specific backend implementations for custom token auth
  updateUserProfile: (userId: string, profileData: Partial<User>) => Promise<boolean>; 
  changePassword: (userId: string, currentPassword: string, newPassword: string) => Promise<boolean>; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

  const login = async (email: string, passwordAttempt: string): Promise<boolean> => {
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
        setIsLoading(false);
        return false;
      }
      
      setUser(data as User); // Assuming data is the user object
      toast({ title: "Login Berhasil", description: `Selamat datang kembali, ${data.name || data.email}!` });
      setIsLoading(false);
      // Redirection should be handled by pages observing the user state change
      return true;
    } catch (error) {
      console.error("Login fetch error:", error);
      toast({ title: "Login Gagal", description: "Tidak dapat terhubung ke server.", variant: "destructive" });
      setIsLoading(false);
      return false;
    }
  };

  const register = async (email: string, passwordAttempt: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: passwordAttempt, role: 'siswa' }), // Default role to 'siswa'
      });
      const data = await response.json();

      if (!response.ok) {
        toast({ title: "Pendaftaran Gagal", description: data.message || "Terjadi kesalahan.", variant: "destructive" });
        setIsLoading(false);
        return false;
      }
      
      toast({ title: "Pendaftaran Berhasil", description: "Akun Anda telah dibuat. Silakan login." });
      router.push(ROUTES.LOGIN); 
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Registration fetch error:", error);
      toast({ title: "Pendaftaran Gagal", description: "Tidak dapat terhubung ke server.", variant: "destructive" });
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
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
  };
  
  const updateUserProfile = async (userId: string, profileData: Partial<User>): Promise<boolean> => { 
     if (!user || user.id !== userId) {
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
        await fetchUser(); // Re-fetch user to update state
        return true;
     } catch (error) {
        console.error("Update profile fetch error:", error);
        toast({ title: "Gagal Memperbarui Profil", description: "Tidak dapat terhubung ke server.", variant: "destructive" });
        return false;
     }
  };

  const changePassword = async (userId: string, currentPassword: string, newPassword: string): Promise<boolean> => { 
     if (!user || user.id !== userId) {
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
      user, 
      isLoading,
      login, 
      register, 
      logout, 
      fetchUser,
      updateUserProfile,
      changePassword
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

    