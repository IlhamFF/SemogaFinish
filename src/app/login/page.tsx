
"use client";
import { AuthForm } from "@/components/auth/auth-form";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ROUTES } from "@/lib/constants";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const { user, isLoading } = useAuth(); // isLoading now reflects useSession status
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      // User is authenticated
      if (user.role === 'siswa' && !user.isVerified) {
        router.replace(ROUTES.VERIFY_EMAIL);
      } else {
        switch (user.role) {
          case 'admin': router.replace(ROUTES.ADMIN_DASHBOARD); break;
          case 'guru': router.replace(ROUTES.GURU_DASHBOARD); break;
          case 'siswa': router.replace(ROUTES.SISWA_DASHBOARD); break;
          case 'pimpinan': router.replace(ROUTES.PIMPINAN_DASHBOARD); break;
          case 'superadmin': router.replace(ROUTES.ADMIN_DASHBOARD); break;
          default: router.replace(ROUTES.HOME); // Fallback
        }
      }
    }
    // If !isLoading && !user, they stay on the login page, which is correct.
  }, [user, isLoading, router]);

  // Show loader while session is loading or if user is authenticated and redirecting
  if (isLoading || (!isLoading && user)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // If not loading and no user, show the login form
  return <AuthForm mode="login" />;
}
