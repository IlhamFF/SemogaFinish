
"use client";
import React, { useEffect, useState }  from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth"; 
import { ROUTES, APP_NAME } from "@/lib/constants";
import { Loader2, ShieldCheck } from "lucide-react";

const resetPasswordSchema = z.object({
  password: z.string().min(6, { message: "Kata sandi minimal 6 karakter." }),
  confirmPassword: z.string().min(6, { message: "Konfirmasi kata sandi minimal 6 karakter." }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Kata sandi dan konfirmasi kata sandi tidak cocok.",
  path: ["confirmPassword"], 
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const { resetPassword, isLoading } = useAuth(); // isLoading from useAuth (derived from useSession)
  const searchParams = useSearchParams();
  const router = useRouter(); // Keep router for potential future use, though useAuth handles redirect
  const [formError, setFormError] = React.useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null); // Placeholder for token if backend used one

  useEffect(() => {
    const emailFromQuery = searchParams.get('email');
    const tokenFromQuery = searchParams.get('token'); // For future if token is used
    
    if (emailFromQuery) {
      setEmail(decodeURIComponent(emailFromQuery));
    } else {
      setFormError("Tautan reset tidak valid atau telah kedaluwarsa (email tidak ditemukan).");
    }
    // For simulation, token is not strictly checked here but can be passed if your backend generates it
    if (tokenFromQuery) setToken(tokenFromQuery);

  }, [searchParams]);


  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onSubmit(values: ResetPasswordFormValues) {
    if (!email) { // Token check would also go here in a real app
        setFormError("Email tidak ditemukan atau token tidak valid untuk reset kata sandi.");
        return;
    }
    setFormError(null);
    // resetPassword is now a placeholder, will show toast and simulate redirection
    const success = await resetPassword(email, values.password); 
    if (!success) {
      // This path might not be hit if resetPassword always returns true for simulation
      setFormError("Gagal mereset kata sandi. Silakan coba lagi.");
    }
  }

  // Show loader if email is being validated or if form is submitting
  if (isLoading || (!email && !formError)) {
      return (
        <div className="flex min-h-screen items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            {!email && !formError && <p className="ml-4">Memvalidasi tautan...</p>}
        </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <CardTitle className="text-3xl font-headline text-primary">{APP_NAME}</CardTitle>
          <CardDescription className="text-muted-foreground">
            Reset Kata Sandi Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          {formError && !email && <p className="mb-4 text-center text-sm font-medium text-destructive">{formError}</p>}
          {email && (
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
                        <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
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
                        <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                {formError && email && <p className="text-sm font-medium text-destructive">{formError}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
