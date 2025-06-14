
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, parseISO, isValid } from 'date-fns';
import { id as localeID } from 'date-fns/locale';
import Image from "next/image";
import { ROLES } from "@/lib/constants";

const profileFormSchema = z.object({
  fullName: z.string().min(2, { message: "Nama lengkap minimal 2 karakter." }).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  birthDate: z.date().optional(),
  bio: z.string().max(300, { message: "Bio maksimal 300 karakter." }).optional(),
  avatarUrl: z.string().url({ message: "URL Avatar tidak valid." }).optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const changePasswordFormSchema = z.object({
  currentPassword: z.string().min(1, { message: "Kata sandi saat ini wajib diisi." }),
  newPassword: z.string().min(6, { message: "Kata sandi baru minimal 6 karakter." }),
  confirmNewPassword: z.string().min(6, { message: "Konfirmasi kata sandi baru minimal 6 karakter." }),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Kata sandi baru dan konfirmasi tidak cocok.",
  path: ["confirmNewPassword"],
});

type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>;

export default function SettingsPage() {
  const { user, updateUserProfile, changePassword, isLoading: authLoading } = useAuth();
  const [isProfileSubmitting, setIsProfileSubmitting] = React.useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = React.useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
  });

  const passwordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    }
  });

  React.useEffect(() => {
    if (user) {
      let parsedBirthDate: Date | undefined = undefined;
      if (user.birthDate) {
        const dateCandidate = parseISO(user.birthDate);
        if (isValid(dateCandidate)) {
          parsedBirthDate = dateCandidate;
        }
      }
      
      profileForm.reset({
        fullName: user.fullName || user.name || "",
        phone: user.phone || "",
        address: user.address || "",
        birthDate: parsedBirthDate,
        bio: user.bio || "",
        avatarUrl: user.avatarUrl || "",
      });
    }
  }, [user, profileForm]);

  async function onProfileSubmit(data: ProfileFormValues) {
    if (!user) return;
    setIsProfileSubmitting(true);

    const profileDataToUpdate = {
      ...data,
      birthDate: data.birthDate ? format(data.birthDate, 'yyyy-MM-dd') : undefined,
    };

    await updateUserProfile(user.id, profileDataToUpdate);
    setIsProfileSubmitting(false);
  }

  async function onPasswordSubmit(data: ChangePasswordFormValues) {
    if (!user) return;
    setIsPasswordSubmitting(true);
    
    const success = await changePassword(user.id, data.currentPassword, data.newPassword);
    if (success) {
      passwordForm.reset(); // Reset form on success
    }
    setIsPasswordSubmitting(false);
  }
  
  const getInitials = (name?: string, email?: string) => {
    if (name) {
      const parts = name.split(' ');
      if (parts.length > 1) {
        return `${parts[0][0]}${parts[parts.length-1][0]}`.toUpperCase();
      }
      return name.substring(0,2).toUpperCase();
    }
    if (email) {
      return email.substring(0,2).toUpperCase();
    }
    return '??';
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
      <h1 className="text-3xl font-headline font-semibold">Pengaturan</h1>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Informasi Akun</CardTitle>
          <CardDescription>Detail akun Anda saat ini.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Image 
              src={user.avatarUrl || `https://placehold.co/100x100.png?text=${getInitials(user.fullName || user.name, user.email)}`} 
              alt={user.fullName || user.name || "Avatar Pengguna"}
              width={100}
              height={100}
              className="rounded-full object-cover border-2 border-primary"
              data-ai-hint="user avatar"
            />
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-semibold">{user.fullName || user.name || "Nama Tidak Ada"}</h2>
              <p className="text-muted-foreground">{user.email}</p>
              <p className="text-sm text-primary font-medium">{ROLES[user.role]}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 pt-4 text-sm">
            {user.nis && user.role === 'siswa' && <p><span className="font-semibold">NIS:</span> {user.nis}</p>}
            {user.nip && user.role !== 'siswa' && <p><span className="font-semibold">NIP:</span> {user.nip}</p>}
            {user.joinDate && <p><span className="font-semibold">Tanggal Bergabung:</span> {format(parseISO(user.joinDate), 'dd MMMM yyyy', { locale: localeID })}</p>}
            {user.phone && <p><span className="font-semibold">Telepon:</span> {user.phone}</p>}
            {user.address && <p className="md:col-span-2"><span className="font-semibold">Alamat:</span> {user.address}</p>}
            {user.birthDate && isValid(parseISO(user.birthDate)) && <p><span className="font-semibold">Tanggal Lahir:</span> {format(parseISO(user.birthDate), 'dd MMMM yyyy', { locale: localeID })}</p>}
            {user.bio && <p className="md:col-span-2"><span className="font-semibold">Bio:</span> {user.bio}</p>}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Edit Profil</CardTitle>
          <CardDescription>Perbarui detail pribadi Anda di bawah ini.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={profileForm.control}
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
                  control={profileForm.control}
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
                control={profileForm.control}
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
                control={profileForm.control}
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
                              "w-full md:w-[240px] pl-3 text-left font-normal",
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
                          captionLayout="dropdown-buttons"
                          fromYear={1900}
                          toYear={new Date().getFullYear()}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={profileForm.control}
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
                control={profileForm.control}
                name="avatarUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Avatar</FormLabel>
                    <FormControl>
                      <Input placeholder="https://contoh.com/avatar.png" {...field} />
                    </FormControl>
                     <FormDescription>Tempelkan URL ke gambar profil Anda. Biarkan kosong untuk menggunakan placeholder.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isProfileSubmitting || authLoading} className="w-full md:w-auto">
                {(isProfileSubmitting || authLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Perubahan Profil
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Ubah Kata Sandi</CardTitle>
          <CardDescription>Perbarui kata sandi akun Anda.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kata Sandi Saat Ini</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="newPassword"
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
                control={passwordForm.control}
                name="confirmNewPassword"
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
              <Button type="submit" disabled={isPasswordSubmitting || authLoading} className="w-full md:w-auto">
                {(isPasswordSubmitting || authLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Ubah Kata Sandi
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
