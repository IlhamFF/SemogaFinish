
"use client";

import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User, Role } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { DEFAULT_USERS_STORAGE_KEY, AUTH_USER_STORAGE_KEY, ROUTES, ROLES } from '@/lib/constants';

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (email: string, passwordAttempt: string) => Promise<boolean>;
  register: (email: string, passwordAttempt: string) => Promise<boolean>;
  logout: () => void;
  verifyUserEmail: (userId: string) => void;
  createUser: (userData: Omit<User, 'id' | 'isVerified' | 'name'> & { password?: string }) => User | null;
  updateUserRole: (userId: string, newRole: Role) => void;
  deleteUser: (userId: string) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialUsers: User[] = [
  { id: '1', email: 'admin@example.com', role: 'admin', isVerified: true, name: 'Admin User' },
  { id: '2', email: 'guru@example.com', role: 'guru', isVerified: true, name: 'Guru Contoh' },
  { id: '3', email: 'siswa@example.com', role: 'siswa', isVerified: false, name: 'Siswa Baru' },
  { id: '4', email: 'pimpinan@example.com', role: 'pimpinan', isVerified: true, name: 'Pimpinan Sekolah' },
  { id: '5', email: 'super@example.com', role: 'superadmin', isVerified: true, name: 'Super Admin' },
];

// Mock password store (in real app, this would be handled by backend)
const mockPasswords: Record<string, string> = {
  'admin@example.com': 'password',
  'guru@example.com': 'password',
  'siswa@example.com': 'password',
  'pimpinan@example.com': 'password',
  'super@example.com': 'password',
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Load users from localStorage or use initialUsers
    const storedUsers = localStorage.getItem(DEFAULT_USERS_STORAGE_KEY);
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      setUsers(initialUsers);
      localStorage.setItem(DEFAULT_USERS_STORAGE_KEY, JSON.stringify(initialUsers));
    }

    // Load authenticated user from localStorage
    const storedAuthUser = localStorage.getItem(AUTH_USER_STORAGE_KEY);
    if (storedAuthUser) {
      setUser(JSON.parse(storedAuthUser));
    }
    setIsLoading(false);
  }, []);

  const persistUsers = useCallback((updatedUsers: User[]) => {
    setUsers(updatedUsers);
    localStorage.setItem(DEFAULT_USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
  }, []);

  const persistAuthUser = useCallback((authUser: User | null) => {
    setUser(authUser);
    if (authUser) {
      localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(authUser));
    } else {
      localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    }
  }, []);

  const login = async (email: string, passwordAttempt: string): Promise<boolean> => {
    setIsLoading(true);
    const existingUser = users.find(u => u.email === email);
    if (existingUser && mockPasswords[email] === passwordAttempt) {
      if (!existingUser.isVerified && existingUser.role === 'siswa') {
        persistAuthUser(existingUser); // Set user so they can be redirected to verify
        router.push(ROUTES.VERIFY_EMAIL);
        toast({ title: "Verifikasi Diperlukan", description: "Silakan verifikasi email Anda untuk melanjutkan." });
        setIsLoading(false);
        return true; // Login successful, but needs verification
      }
      persistAuthUser(existingUser);
      toast({ title: "Login Berhasil", description: `Selamat datang kembali, ${existingUser.name || existingUser.email}!` });
      // Redirect based on role
      switch (existingUser.role) {
        case 'admin': router.push(ROUTES.ADMIN_DASHBOARD); break;
        case 'guru': router.push(ROUTES.GURU_DASHBOARD); break;
        case 'siswa': router.push(ROUTES.SISWA_DASHBOARD); break;
        case 'pimpinan': router.push(ROUTES.PIMPINAN_DASHBOARD); break;
        case 'superadmin': router.push(ROUTES.ADMIN_DASHBOARD); break; // Superadmin can go to admin dash
        default: router.push(ROUTES.HOME);
      }
      setIsLoading(false);
      return true;
    }
    toast({ title: "Login Gagal", description: "Email atau kata sandi salah.", variant: "destructive" });
    setIsLoading(false);
    return false;
  };

  const register = async (email: string, passwordAttempt: string): Promise<boolean> => {
    setIsLoading(true);
    if (users.some(u => u.email === email)) {
      toast({ title: "Pendaftaran Gagal", description: "Email sudah ada.", variant: "destructive" });
      setIsLoading(false);
      return false;
    }
    const newUser: User = {
      id: String(Date.now()),
      email,
      role: 'siswa',
      isVerified: false,
      name: email.split('@')[0], // Default name
    };
    mockPasswords[email] = passwordAttempt; // Store password (mock)
    const updatedUsers = [...users, newUser];
    persistUsers(updatedUsers);
    persistAuthUser(newUser); // Log in the new user to redirect to verification
    toast({ title: "Pendaftaran Berhasil", description: "Silakan verifikasi email Anda." });
    router.push(ROUTES.VERIFY_EMAIL);
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    persistAuthUser(null);
    router.push(ROUTES.LOGIN);
    toast({ title: "Berhasil Keluar", description: "Anda telah berhasil keluar." });
  };

  const verifyUserEmail = (userIdToVerify?: string) => {
    const targetUserId = userIdToVerify || user?.id;
    if (!targetUserId) return;

    const updatedUsers = users.map(u => 
      u.id === targetUserId ? { ...u, isVerified: true } : u
    );
    persistUsers(updatedUsers);

    if (user && user.id === targetUserId) {
      const updatedCurrentUser = { ...user, isVerified: true };
      persistAuthUser(updatedCurrentUser);
      toast({ title: "Email Terverifikasi", description: "Email Anda telah diverifikasi. Anda sekarang dapat masuk." });
       // Redirect based on role after verification
      switch (updatedCurrentUser.role) {
        case 'admin': router.push(ROUTES.ADMIN_DASHBOARD); break;
        case 'guru': router.push(ROUTES.GURU_DASHBOARD); break;
        case 'siswa': router.push(ROUTES.SISWA_DASHBOARD); break;
        case 'pimpinan': router.push(ROUTES.PIMPINAN_DASHBOARD); break;
        case 'superadmin': router.push(ROUTES.ADMIN_DASHBOARD); break;
        default: router.push(ROUTES.LOGIN); // Fallback to login if role dashboard not clear
      }
    } else if (userIdToVerify) { // Verification done by admin
        toast({ title: "Pengguna Diverifikasi", description: `Email pengguna telah diverifikasi.` });
    }
  };
  
  const createUser = (userData: Omit<User, 'id' | 'isVerified' | 'name'> & { password?: string }): User | null => {
    if (users.some(u => u.email === userData.email)) {
      toast({ title: "Pembuatan Gagal", description: "Email sudah ada.", variant: "destructive" });
      return null;
    }
    const newUser: User = {
      id: String(Date.now()),
      email: userData.email,
      role: userData.role,
      isVerified: true, // Admin-created users are auto-verified
      name: userData.email.split('@')[0],
    };
    if (userData.password) {
      mockPasswords[userData.email] = userData.password;
    } else {
      mockPasswords[userData.email] = 'password'; // Default password
    }
    const updatedUsers = [...users, newUser];
    persistUsers(updatedUsers);
    toast({ title: "Pengguna Dibuat", description: `${ROLES[newUser.role]} ${newUser.email} telah dibuat.` });
    return newUser;
  };

  const updateUserRole = (userId: string, newRole: Role) => {
    const updatedUsers = users.map(u =>
      u.id === userId ? { ...u, role: newRole } : u
    );
    persistUsers(updatedUsers);
    if (user && user.id === userId) {
      persistAuthUser({ ...user, role: newRole });
    }
    toast({ title: "Pengguna Diperbarui", description: `Peran pengguna diperbarui menjadi ${ROLES[newRole]}.` });
  };

  const deleteUser = (userId: string) => {
    if (user && user.id === userId) {
        toast({ title: "Tindakan Ditolak", description: "Tidak dapat menghapus pengguna yang sedang login.", variant: "destructive" });
        return;
    }
    const updatedUsers = users.filter(u => u.id !== userId);
    persistUsers(updatedUsers);
    toast({ title: "Pengguna Dihapus", description: "Pengguna telah berhasil dihapus." });
  };

  const authContextValue = { 
    user, 
    users, 
    login, 
    register, 
    logout, 
    verifyUserEmail, 
    createUser, 
    updateUserRole, 
    deleteUser, 
    isLoading 
  };

  return React.createElement(AuthContext.Provider, { value: authContextValue }, children);
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
};
