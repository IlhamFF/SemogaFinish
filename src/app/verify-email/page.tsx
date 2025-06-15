
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth"; 
import { ROUTES, APP_NAME } from "@/lib/constants";
import { MailCheck, Loader2 } from "lucide-react";

export default function VerifyEmailPage() {
  const { user, verifyUserEmail, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace(ROUTES.LOGIN);
      } else if (user.isVerified) {
        switch (user.role) {
          case 'admin': router.replace(ROUTES.ADMIN_DASHBOARD); break;
          case 'guru': router.replace(ROUTES.GURU_DASHBOARD); break;
          case 'siswa': router.replace(ROUTES.SISWA_DASHBOARD); break;
          case 'pimpinan': router.replace(ROUTES.PIMPINAN_DASHBOARD); break;
          case 'superadmin': router.replace(ROUTES.ADMIN_DASHBOARD); break;
          default: router.replace(ROUTES.HOME);
        }
      }
    }
  }, [user, isLoading, router]);

  const handleVerify = async () => {
    if (user && !user.isVerified) {
      // The verifyUserEmail function in useAuth now just provides a message for demo.
      // Real verification would involve a backend call if it's a token-based system.
      // For admin-initiated verification, it's done through the admin panel.
      // For self-verification simulation:
      await verifyUserEmail(user.id); 
      // Since verifyUserEmail in the new useAuth doesn't auto-redirect based on session updates for self-verification,
      // we might need to manually prompt or re-check session status.
      // For demo, let's assume it tells user to re-login or refreshes.
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // Redirecting or already verified
  if (!user || (user && user.isVerified)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
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
            Terima kasih telah mendaftar, {user.email}! Akun Anda belum terverifikasi.
          </p>
          <p>
            Untuk sistem demo ini, verifikasi email akan disimulasikan.
            Di aplikasi nyata, Anda akan menerima email dengan tautan verifikasi.
            Setelah diverifikasi oleh Admin atau melalui tautan email, status Anda akan diperbarui.
          </p>
          <p className="text-sm text-muted-foreground">
            (Tombol di bawah ini hanya untuk tujuan demonstrasi dan tidak melakukan verifikasi email sesungguhnya di backend tanpa token. Verifikasi aktual dilakukan oleh admin atau melalui link email yang valid.)
          </p>
          
          <Button onClick={handleVerify} className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Simulasikan Cek Verifikasi"}
          </Button>
          <Button variant="link" onClick={logout} className="text-sm text-muted-foreground">
            Keluar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

    