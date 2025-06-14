export type Role = 'admin' | 'guru' | 'siswa' | 'pimpinan' | 'superadmin';

export interface User {
  id: string;
  email: string;
  name?: string; // Optional: derived from email or set later
  role: Role;
  isVerified: boolean;
  // Add other user-specific fields if needed
}

export interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: Role[];
  subItems?: NavItem[];
}
