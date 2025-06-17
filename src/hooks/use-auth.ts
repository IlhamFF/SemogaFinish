
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
  fetchUser: () => Promise<void>; // To re-fetch user state if needed
  // The following are placeholders and would need backend APIs if kept for custom auth
  // verifyUserEmail: (userIdToVerify?: string) => Promise<void>; 
  // updateUserProfile: (userId: string, profileData: Partial<User>) => Promise<boolean>; 
  // requestPasswordReset: (email: string) => Promise<string | null>; 
  // resetPassword: (email: string, token: string, newPassword: string) => Promise<boolean>; 
  // changePassword: (userId: string, currentPassword: string, newPassword: string) => Promise<boolean>; 
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
        // Don't show error toast for 401 on initial load
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
      
      setUser(data as User);
      toast({ title: "Login Berhasil", description: `Selamat datang kembali, ${data.name || data.email}!` });
      // Redirection logic will be handled by pages based on new user state
      // Example: if (data.role === 'siswa' && !data.isVerified) router.push(ROUTES.VERIFY_EMAIL_PLACEHOLDER);
      // else router.push(appropriateDashboard);
      setIsLoading(false);
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
        body: JSON.stringify({ email, password: passwordAttempt }),
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

  // Placeholder/Removed functions for simplicity with custom token auth
  // const verifyUserEmail = async (userIdToVerify?: string) => { console.warn("verifyUserEmail not implemented for custom auth"); };
  // const updateUserProfile = async (userId: string, profileData: Partial<User>) => { console.warn("updateUserProfile not implemented for custom auth"); return false; };
  // const requestPasswordReset = async (email: string) => { console.warn("requestPasswordReset not implemented for custom auth"); return null; };
  // const resetPassword = async (email: string, token: string, newPassword: string) => { console.warn("resetPassword not implemented for custom auth"); return false; };
  // const changePassword = async (userId: string, currentPassword: string, newPassword: string) => { console.warn("changePassword not implemented for custom auth"); return false; };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading,
      login, 
      register, 
      logout, 
      fetchUser,
      // verifyUserEmail,
      // updateUserProfile,
      // requestPasswordReset,
      // resetPassword,
      // changePassword
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
