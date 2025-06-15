
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
        // No user session, redirect to login
        router.replace(ROUTES.LOGIN);
      } else if (user.isVerified) {
        // User is already verified, redirect to their dashboard
        switch (user.role) {
          case 'admin': router.replace(ROUTES.ADMIN_DASHBOARD); break;
          case 'guru': router.replace(ROUTES.GURU_DASHBOARD); break;
          case 'siswa': router.replace(ROUTES.SISWA_DASHBOARD); break;
          case 'pimpinan': router.replace(ROUTES.PIMPINAN_DASHBOARD); break;
          case 'superadmin': router.replace(ROUTES.ADMIN_DASHBOARD); break;
          default: router.replace(ROUTES.HOME);
        }
      }
      // If user exists but is not verified, they stay on this page.
    }
  }, [user, isLoading, router]);

  const handleVerify = () => {
    if (user) {
      // For the mock, this directly calls the verifyUserEmail in useAuth
      // In a real app, this might resend a verification email or check a token
      verifyUserEmail(user.id); 
      // The verifyUserEmail in useAuth (mock) will now update the session
      // and the useEffect above will handle redirection.
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user || user.isVerified) {
    // If no user (redirecting) or already verified (redirecting), show loader or null
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
            Terima kasih telah mendaftar, {user.email}! Untuk sistem demo ini, akun Anda belum terverifikasi.
          </p>
          <p>Silakan klik tombol di bawah untuk mensimulasikan verifikasi email.</p>
          
          <Button onClick={handleVerify} className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verifikasi Email Saya (Simulasi)"}
          </Button>
          <Button variant="link" onClick={logout} className="text-sm text-muted-foreground">
            Keluar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
