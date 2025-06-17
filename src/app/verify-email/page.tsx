
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth"; 
import { ROUTES, APP_NAME } from "@/lib/constants";
import { MailCheck, Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function VerifyEmailPage() {
  const { user, isLoading, logout, fetchUser } = useAuth(); // Using custom token auth
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace(ROUTES.LOGIN);
      } else if (user.isVerified) {
        // Redirect verified user to their dashboard
        let dashboardUrl = ROUTES.HOME;
        switch (user.role) {
            case 'admin': dashboardUrl = ROUTES.ADMIN_DASHBOARD; break;
            case 'guru': dashboardUrl = ROUTES.GURU_DASHBOARD; break;
            case 'siswa': dashboardUrl = ROUTES.SISWA_DASHBOARD; break;
            case 'pimpinan': dashboardUrl = ROUTES.PIMPINAN_DASHBOARD; break;
            case 'superadmin': dashboardUrl = ROUTES.ADMIN_DASHBOARD; break;
        }
        router.replace(dashboardUrl);
      }
    }
  }, [user, isLoading, router]);

  const handleCheckVerification = async () => {
    // In a custom token system, email verification status is managed by your backend.
    // This button would typically re-fetch user data to check if an admin has verified them.
    // Or, if you had an email token flow, that token would be sent to a backend endpoint to verify.
    toast({ title: "Cek Verifikasi", description: "Memeriksa status verifikasi terbaru..." });
    await fetchUser(); // Re-fetch user data which might have been updated by an admin
    if (user && user.isVerified) {
        toast({ title: "Akun Terverifikasi!", description: "Anda akan diarahkan ke dasbor." });
    } else if (user && !user.isVerified) {
        toast({ title: "Belum Terverifikasi", description: "Akun Anda masih menunggu verifikasi oleh admin.", variant: "default" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user || (user && user.isVerified)) { // Redirecting or already verified
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
            Verifikasi Akun Anda
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p>
            Terima kasih telah mendaftar, {user.email}! Akun Anda belum terverifikasi.
          </p>
          <p>
            Untuk sistem ini, akun siswa baru perlu diverifikasi oleh administrator sekolah. 
            Silakan hubungi admin untuk mengaktifkan akun Anda.
          </p>
          
          <Button onClick={handleCheckVerification} className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Cek Status Verifikasi Saya"}
          </Button>
          <Button variant="link" onClick={logout} className="text-sm text-muted-foreground">
            Keluar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
