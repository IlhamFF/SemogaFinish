
"use client";

import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User, Role } from '@/types'; 
import { useToast } from '@/hooks/use-toast';
import { ROUTES } from '@/lib/constants';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, passwordAttempt: string) => Promise<boolean>;
  register: (email: string, passwordAttempt: string) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
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
        // Do not show an error toast for 401 on initial page load as it's expected for unauthenticated users.
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
        return false;
      }
      
      setUser(data as User);
      toast({ title: "Login Berhasil", description: `Selamat datang kembali, ${data.fullName || data.name || data.email}!` });
      // Page redirection is handled by the login page component based on the new user state.
      return true;
    } catch (error) {
      console.error("Login fetch error:", error);
      toast({ title: "Login Gagal", description: "Tidak dapat terhubung ke server.", variant: "destructive" });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, passwordAttempt: string): Promise<boolean> => {
    setIsLoading(true);
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
    // This function is for users updating their own profile from the settings page.
    const endpoint = userId === user?.id ? '/api/users/me/profile' : `/api/users/${userId}`;
    // Admin updates go through the user management page, not this hook directly.
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
        setUser(data as User); // Update user state with new data
        return true;
    } catch (e) {
        toast({ title: "Update Profil Gagal", description: "Tidak dapat terhubung ke server.", variant: "destructive" });
        return false;
    }
  };

  const changePassword = async (userId: string, currentPassword: string, newPassword: string): Promise<boolean> => {
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
