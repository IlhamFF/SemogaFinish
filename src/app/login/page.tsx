
"use client";
import { AuthForm } from "@/components/auth/auth-form";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ROUTES } from "@/lib/constants";
import { Loader2 } from "lucide-react";

// Hapus AuthProvider dari sini karena sudah ada di RootLayout
// function LoginPageContent() { ... }
// export default function LoginPage() { <AuthProvider><LoginPageContent /></AuthProvider> }

export default function LoginPage() { // Langsung export default component
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      switch (user.role) {
        case 'admin': router.push(ROUTES.ADMIN_DASHBOARD); break;
        case 'guru': router.push(ROUTES.GURU_DASHBOARD); break;
        case 'siswa': 
          if (user.isVerified) router.push(ROUTES.SISWA_DASHBOARD);
          else router.push(ROUTES.VERIFY_EMAIL);
          break;
        case 'pimpinan': router.push(ROUTES.PIMPINAN_DASHBOARD); break;
        case 'superadmin': router.push(ROUTES.ADMIN_DASHBOARD); break;
        default: router.push(ROUTES.HOME);
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || (!isLoading && user)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  return <AuthForm mode="login" />;
}
