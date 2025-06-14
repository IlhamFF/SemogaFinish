
"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, parseISO } from 'date-fns';
import { id as localeID } from 'date-fns/locale'; // Import locale Indonesia
import Image from "next/image";
import { ROLES } from "@/lib/constants";

// Skema validasi disesuaikan untuk mock data
const profileFormSchema = z.object({
  fullName: z.string().min(2, { message: "Nama lengkap minimal 2 karakter." }).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  birthDate: z.date().optional(), // Tetap sebagai date untuk Calendar
  bio: z.string().max(300, { message: "Bio maksimal 300 karakter." }).optional(),
  avatarUrl: z.string().url({ message: "URL Avatar tidak valid." }).optional().or(z.literal('')),
  // Field read-only atau yang tidak diupdate melalui form ini:
  // email: z.string().email(),
  // role: z.string(),
  // nis: z.string().optional(),
  // nip: z.string().optional(),
  // joinDate: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function SettingsPage() {
  const { user, updateUserProfile, isLoading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: user?.fullName || user?.name || "",
      phone: user?.phone || "",
      address: user?.address || "",
      birthDate: user?.birthDate ? parseISO(user.birthDate) : undefined,
      bio: user?.bio || "",
      avatarUrl: user?.avatarUrl || "",
    },
  });

  React.useEffect(() => {
    if (user) {
      form.reset({
        fullName: user.fullName || user.name || "",
        phone: user.phone || "",
        address: user.address || "",
        birthDate: user.birthDate ? parseISO(user.birthDate) : undefined,
        bio: user.bio || "",
        avatarUrl: user.avatarUrl || "",
      });
    }
  }, [user, form]);

  async function onSubmit(data: ProfileFormValues) {
    if (!user) return;
    setIsSubmitting(true);

    const profileDataToUpdate = {
      ...data,
      birthDate: data.birthDate ? format(data.birthDate, 'yyyy-MM-dd') : undefined,
    };

    const success = await updateUserProfile(user.id, profileDataToUpdate);
    if (success) {
      // useAuth hook already shows a toast
    } else {
      // useAuth hook shows error toast
    }
    setIsSubmitting(false);
  }
  
  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  }

  if (authLoading || !user) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold">Pengaturan Profil</h1>
      <p className="text-muted-foreground">
        Kelola informasi profil Anda. Perubahan akan disimpan secara lokal untuk sesi ini.
      </p>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Informasi Akun</CardTitle>
          <CardDescription>Detail akun Anda saat ini.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Image 
              src={user.avatarUrl || `https://placehold.co/100x100.png?text=${getInitials(user.fullName || user.name, user.email)}`} 
              alt={user.fullName || user.name || "Avatar Pengguna"}
              width={100}
              height={100}
              className="rounded-full object-cover"
              data-ai-hint="user avatar"
            />
            <div>
              <h2 className="text-2xl font-semibold">{user.fullName || user.name || "Nama Tidak Ada"}</h2>
              <p className="text-muted-foreground">{user.email}</p>
              <p className="text-sm text-primary">{ROLES[user.role]}</p>
            </div>
          </div>
           {user.nis && <p><span className="font-semibold">NIS:</span> {user.nis}</p>}
           {user.nip && <p><span className="font-semibold">NIP:</span> {user.nip}</p>}
           {user.joinDate && <p><span className="font-semibold">Tanggal Bergabung:</span> {format(parseISO(user.joinDate), 'dd MMMM yyyy', { locale: localeID })}</p>}
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Edit Profil</CardTitle>
          <CardDescription>Perbarui detail pribadi Anda di bawah ini.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Lengkap</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan nama lengkap Anda" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor Telepon</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: 081234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alamat</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Masukkan alamat lengkap Anda" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Tanggal Lahir</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: localeID })
                            ) : (
                              <span>Pilih tanggal</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio Singkat</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Ceritakan sedikit tentang diri Anda..." {...field} />
                    </FormControl>
                    <FormDescription>Maksimal 300 karakter.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="avatarUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Avatar</FormLabel>
                    <FormControl>
                      <Input placeholder="https://contoh.com/avatar.png" {...field} />
                    </FormControl>
                     <FormDescription>Tempelkan URL ke gambar profil Anda. Biarkan kosong untuk menggunakan default.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isSubmitting || authLoading} className="w-full md:w-auto">
                {(isSubmitting || authLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Perubahan
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
