
"use client";
import React, { useEffect, useState, Suspense }  from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { ROUTES, APP_NAME } from "@/lib/constants";
import { Loader2, ShieldCheck, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const resetPasswordSchema = z.object({
  password: z.string().min(6, { message: "Kata sandi minimal 6 karakter." }),
  confirmPassword: z.string().min(6, { message: "Konfirmasi kata sandi minimal 6 karakter." }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Kata sandi dan konfirmasi kata sandi tidak cocok.",
  path: ["confirmPassword"], 
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formError, setFormError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null); 
  const [pageLoading, setPageLoading] = useState(true);
  const [showPassword, setShowPassword] = React.useState(false);

  useEffect(() => {
    const emailFromQuery = searchParams.get('email');
    const tokenFromQuery = searchParams.get('token'); 
    
    if (emailFromQuery && tokenFromQuery) {
      setEmail(decodeURIComponent(emailFromQuery));
      setToken(tokenFromQuery);
    } else {
      setFormError("Tautan reset tidak valid atau telah kedaluwarsa.");
      toast({title: "Error", description: "Tautan reset tidak valid atau parameter hilang.", variant: "destructive"})
    }
    setPageLoading(false);
  }, [searchParams, toast]);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onSubmit(values: ResetPasswordFormValues) {
    if (!email || !token) { 
        setFormError("Email atau token tidak valid untuk reset kata sandi.");
        toast({title: "Error", description: "Email atau token tidak ditemukan.", variant: "destructive"});
        return;
    }
    setFormError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword: values.password }),
      });
      const data = await response.json();

      if (!response.ok) {
        toast({ title: "Gagal Reset Kata Sandi", description: data.message || "Terjadi kesalahan.", variant: "destructive" });
        setFormError(data.message || "Gagal mereset kata sandi.");
      } else {
        toast({ title: "Kata Sandi Direset", description: data.message });
        router.push(ROUTES.LOGIN);
      }
    } catch (error) {
      toast({ title: "Gagal Reset Kata Sandi", description: "Tidak dapat terhubung ke server.", variant: "destructive" });
      setFormError("Tidak dapat terhubung ke server.");
    }
    setIsSubmitting(false);
  }

  if (pageLoading) {
      return (
        <div className="flex min-h-screen items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4">Memvalidasi tautan...</p>
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
              width={60}
              height={60}
              className="object-contain"
              data-ai-hint="logo"
            />
          </Link>
          <CardTitle className="text-2xl font-headline">Reset Kata Sandi Anda</CardTitle>
        </CardHeader>
        <CardContent>
          {formError && (!email || !token) ? (
              <p className="mb-4 text-center text-sm font-medium text-destructive">{formError}</p>
            ) : null
          }
          {email && token && (
            <>
            <p className="mb-4 text-center text-sm">
                Anda mereset kata sandi untuk: <strong>{email}</strong>
            </p>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Kata Sandi Baru</FormLabel>
                        <div className="relative">
                            <FormControl>
                            <Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} />
                            </FormControl>
                            <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff /> : <Eye />}
                            </Button>
                        </div>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Konfirmasi Kata Sandi Baru</FormLabel>
                        <div className="relative">
                            <FormControl>
                            <Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} />
                            </FormControl>
                             <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff /> : <Eye />}
                            </Button>
                        </div>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                {formError && email && token && <p className="text-sm font-medium text-destructive">{formError}</p>}
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Simpan Kata Sandi Baru
                </Button>
                </form>
            </Form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}
