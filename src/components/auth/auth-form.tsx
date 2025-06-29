
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { ROUTES, APP_NAME, SCHOOL_GRADE_LEVELS, SCHOOL_MAJORS, SCHOOL_CLASSES_PER_MAJOR_GRADE } from "@/lib/constants";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ScrollArea } from "../ui/scroll-area";

const loginSchema = z.object({
  email: z.string().email({ message: "Alamat email tidak valid." }),
  password: z.string().min(6, { message: "Kata sandi minimal 6 karakter." }),
});

const registerSchema = z.object({
  fullName: z.string().min(3, { message: "Nama lengkap minimal 3 karakter." }),
  email: z.string().email({ message: "Alamat email tidak valid." }),
  password: z.string().min(6, { message: "Kata sandi minimal 6 karakter." }),
  nis: z.string().min(4, { message: "NIS minimal 4 karakter." }),
  kelas: z.string().min(1, { message: "Kelas wajib diisi." }),
});


type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const { login, register, isLoading: authIsLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const currentSchema = mode === 'login' ? loginSchema : registerSchema;

  const form = useForm<z.infer<typeof currentSchema>>({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      email: "",
      password: "",
      ...(mode === 'register' && {
        fullName: "",
        nis: "",
        kelas: "",
      }),
    },
  });

  const mockKelasList = React.useMemo(() => {
    const kls: string[] = [];
    SCHOOL_GRADE_LEVELS.forEach(grade => {
      SCHOOL_MAJORS.forEach(major => {
        for (let i = 1; i <= SCHOOL_CLASSES_PER_MAJOR_GRADE; i++) {
          kls.push(`${grade} ${major} ${i}`);
        }
      });
    });
    return kls.sort();
  }, []);

  async function onSubmit(values: z.infer<typeof currentSchema>) {
    setIsSubmitting(true);
    let finalValues = { ...values };
    if (mode === 'register' && finalValues.nis && /^\d+$/.test(finalValues.nis)) {
        finalValues.nis = `S${finalValues.nis}`;
    }

    if (mode === "login") {
      await login(finalValues.email, finalValues.password);
    } else {
      await register(finalValues as z.infer<typeof registerSchema>);
    }
    setIsSubmitting(false);
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
              {mode === 'register' && (
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Lengkap</FormLabel>
                      <FormControl>
                        <Input placeholder="Nama lengkap Anda" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
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
              {mode === 'register' && (
                <>
                 <FormField
                    control={form.control}
                    name="nis"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>NIS</FormLabel>
                        <div className="flex items-center">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">S</span>
                            <FormControl>
                                <Input type="number" placeholder="Nomor Induk Siswa" className="rounded-l-none" {...field} />
                            </FormControl>
                        </div>
                        <FormDescription className="text-xs">Cukup masukkan angka setelah 'S'.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="kelas"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kelas</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih kelas Anda" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <ScrollArea className="h-60">
                                {mockKelasList.map(kls => (
                                    <SelectItem key={kls} value={kls}>{kls}</SelectItem>
                                ))}
                                </ScrollArea>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              <Button type="submit" className="w-full" disabled={isSubmitting || authIsLoading}>
                {(isSubmitting || authIsLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
                 <span className="mx-1">|</span>
                <Link href={ROUTES.FORGOT_PASSWORD} className="font-medium text-primary hover:underline">
                  Lupa Kata Sandi?
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
