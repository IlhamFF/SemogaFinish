
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth"; // Tidak perlu AuthProvider lagi di sini
import { ROUTES, APP_NAME } from "@/lib/constants";
import { MailCheck, Loader2 } from "lucide-react";

export default function VerifyEmailPage() {
  const { user, verifyUserEmail, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(ROUTES.LOGIN);
    } else if (!isLoading && user && user.isVerified) {
      switch (user.role) {
        case 'admin': router.push(ROUTES.ADMIN_DASHBOARD); break;
        case 'guru': router.push(ROUTES.GURU_DASHBOARD); break;
        case 'siswa': router.push(ROUTES.SISWA_DASHBOARD); break;
        case 'pimpinan': router.push(ROUTES.PIMPINAN_DASHBOARD); break;
        case 'superadmin': router.push(ROUTES.ADMIN_DASHBOARD); break;
        default: router.push(ROUTES.LOGIN);
      }
    }
  }, [user, isLoading, router]);

  const handleVerify = () => {
    if (user) {
      verifyUserEmail(user.id); // Untuk mock, kita panggil verifyUserEmail dengan id user
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
           <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
            <MailCheck className="h-8 w-8" />
          </div>
          <CardTitle className="text-3xl font-headline text-primary">{APP_NAME}</CardTitle>
          <CardDescription className="text-muted-foreground">
            Verifikasi Alamat Email Anda
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p>
            Terima kasih telah mendaftar! Untuk sistem demo ini, email Anda ({user.email}) akan diverifikasi secara otomatis.
          </p>
          <p>Silakan klik tombol di bawah untuk mensimulasikan verifikasi email.</p>
          
          <Button onClick={handleVerify} className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verifikasi Email Saya"}
          </Button>
          <Button variant="link" onClick={logout} className="text-sm text-muted-foreground">
            Keluar dan coba akun lain
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
