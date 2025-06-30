
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth"; 
import { ROUTES, APP_NAME } from "@/lib/constants";
import { MailCheck, Loader2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import Link from "next/link";

export default function VerifyEmailPage() {
  const { user, isLoading, logout, fetchUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace(ROUTES.LOGIN);
      } else if (user.isVerified) {
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
    toast({ title: "Cek Verifikasi", description: "Memeriksa status verifikasi terbaru..." });
    await fetchUser(); 
    if (user && user.isVerified) {
        toast({ title: "Akun Terverifikasi!", description: "Anda akan diarahkan ke dasbor." });
    } else if (user && !user.isVerified) {
        toast({ title: "Belum Terverifikasi", description: "Akun Anda masih menunggu verifikasi.", variant: "default" });
    }
  };

  const handleResendVerification = async () => {
    if (!user) return;
    setIsResending(true);
    try {
      const response = await fetch('/api/auth/resend-verification', { method: 'POST' });
      const data = await response.json();
      if (!response.ok) {
        toast({ title: "Gagal Mengirim Ulang", description: data.message || "Terjadi kesalahan.", variant: "destructive" });
      } else {
        toast({ title: "Email Verifikasi Terkirim", description: data.message + " (Cek konsol server untuk link simulasi)." });
      }
    } catch (error) {
      toast({ title: "Gagal Mengirim Ulang", description: "Tidak dapat terhubung ke server.", variant: "destructive" });
    }
    setIsResending(false);
  };

  if (isLoading || !user || (user && user.isVerified)) {
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
           <Link href={ROUTES.HOME} className="mx-auto mb-4">
             <Image 
              src="/logo.png"
              alt={`${APP_NAME} Logo`}
              width={160}
              height={160}
              className="object-contain"
              data-ai-hint="logo"
            />
          </Link>
          <CardTitle className="text-2xl font-headline">Verifikasi Akun Email Anda</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p>
            Terima kasih telah mendaftar, {user.email}! 
            Sebuah email verifikasi (disimulasikan) telah dikirim ke alamat email Anda.
          </p>
          <p>
            Silakan periksa kotak masuk Anda (atau konsol server untuk link simulasi) dan klik tautan verifikasi untuk mengaktifkan akun Anda.
          </p>
          
          <div className="space-y-2">
            <Button onClick={handleCheckVerification} className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Saya Sudah Verifikasi / Cek Status"}
            </Button>
            <Button onClick={handleResendVerification} variant="outline" className="w-full" disabled={isResending || isLoading}>
              {isResending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Kirim Ulang Email Verifikasi
            </Button>
          </div>
          <Button variant="link" onClick={logout} className="text-sm text-muted-foreground">
            Keluar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
