"use client";

import { createContext, useContext } from 'react';
import type { User } from '@/types';

// This interface defines the shape of the context's value.
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, passwordAttempt: string) => Promise<boolean>;
  register: (email: string, passwordAttempt: string) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  updateUserProfile: (userId: string, profileData: Partial<User>) => Promise<boolean>;
  changePassword: (userId: string, currentPassword: string, newPassword: string) => Promise<boolean>;
}

// Create the context with an initial undefined value.
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// The custom hook that components will use to access the auth context.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
};
