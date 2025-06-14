
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth'; // Tidak perlu AuthProvider lagi
import { ROUTES } from '@/lib/constants';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        if (user.role === 'siswa' && !user.isVerified) {
          router.replace(ROUTES.VERIFY_EMAIL);
        } else {
           switch (user.role) {
            case 'admin': router.replace(ROUTES.ADMIN_DASHBOARD); break;
            case 'guru': router.replace(ROUTES.GURU_DASHBOARD); break;
            case 'siswa': router.replace(ROUTES.SISWA_DASHBOARD); break;
            case 'pimpinan': router.replace(ROUTES.PIMPINAN_DASHBOARD); break;
            case 'superadmin': router.replace(ROUTES.ADMIN_DASHBOARD); break;
            default: router.replace(ROUTES.LOGIN);
          }
        }
      } else {
        router.replace(ROUTES.LOGIN);
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
    </div>
  );
}
