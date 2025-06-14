
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { ROUTES, APP_NAME } from "@/lib/constants";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  email: z.string().email({ message: "Alamat email tidak valid." }),
  password: z.string().min(6, { message: "Kata sandi minimal 6 karakter." }),
});

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const { login, register, isLoading } = useAuth();
  const [formError, setFormError] = React.useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setFormError(null);
    let success = false;
    if (mode === "login") {
      success = await login(values.email, values.password);
    } else {
      success = await register(values.email, values.password);
    }
    if (!success && mode === "login") {
      setFormError("Kredensial tidak valid atau pengguna belum diverifikasi.");
    } else if (!success && mode === "register") {
      setFormError("Pendaftaran gagal. Email mungkin sudah digunakan.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline text-primary">{APP_NAME}</CardTitle>
          <CardDescription className="text-muted-foreground">
            {mode === "login" ? "Masuk ke akun Anda" : "Buat akun baru"}
          </CardDescription>
        </CardHeader>
        <CardContent>
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
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kata Sandi</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {formError && <p className="text-sm font-medium text-destructive">{formError}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "login" ? "Masuk" : "Buat Akun"}
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm">
            {mode === "login" ? (
              <>
                Belum punya akun?{" "}
                <Link href={ROUTES.REGISTER} className="font-medium text-primary hover:underline">
                  Daftar
                </Link>
              </>
            ) : (
              <>
                Sudah punya akun?{" "}
                <Link href={ROUTES.LOGIN} className="font-medium text-primary hover:underline">
                  Masuk
                </Link>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
