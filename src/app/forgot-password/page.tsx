
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth"; 
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ROUTES, APP_NAME } from "@/lib/constants";
import { Loader2, KeyRound } from "lucide-react";
import React from "react";

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Alamat email tidak valid." }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { requestPasswordReset, isLoading } = useAuth(); 
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    setIsSubmitting(true);
    const demoToken = await requestPasswordReset(values.email); 
    if (demoToken) {
      // For DEMO: redirect with token. In real app, user gets email.
      router.push(`${ROUTES.RESET_PASSWORD}?email=${encodeURIComponent(values.email)}&token=${demoToken}`);
    }
    // If demoToken is null, toast already shown by useAuth
    setIsSubmitting(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
            <KeyRound className="h-8 w-8" />
          </div>
          <CardTitle className="text-3xl font-headline text-primary">{APP_NAME}</CardTitle>
          <CardDescription className="text-muted-foreground">
            Lupa Kata Sandi Anda?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-center text-sm text-muted-foreground">
            Masukkan alamat email Anda. Jika akun ada, kami akan (mensimulasikan) pengiriman tautan untuk mereset kata sandi Anda.
          </p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="anda@contoh.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading || isSubmitting}>
                {(isLoading || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Kirim Instruksi Reset
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm">
            Ingat kata sandi Anda?{" "}
            <Link href={ROUTES.LOGIN} className="font-medium text-primary hover:underline">
              Masuk
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
