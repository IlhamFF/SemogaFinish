
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth";
import { CalendarIcon, Eye, EyeOff, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, parseISO, isValid } from 'date-fns';
import { id as localeID } from 'date-fns/locale';
import Image from "next/image";
import { ROLES } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

const profileFormSchema = z.object({
  fullName: z.string().min(2, { message: "Nama lengkap minimal 2 karakter." }).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  birthDate: z.date().optional(),
  bio: z.string().max(300, { message: "Bio maksimal 300 karakter." }).optional(),
  avatarFile: z.any().optional(),
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
  const { toast } = useToast();
  const [isProfileSubmitting, setIsProfileSubmitting] = React.useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = React.useState(false);
  const [showPasswords, setShowPasswords] = React.useState({
    current: false,
    new: false,
    confirm: false,
  });

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
        avatarFile: undefined,
      });
    }
  }, [user, profileForm]);

  async function onProfileSubmit(data: ProfileFormValues) {
    if (!user) return;
    setIsProfileSubmitting(true);
    let finalAvatarUrl = user.avatarUrl;
    
    try {
      if (data.avatarFile && data.avatarFile.name) {
        const formData = new FormData();
        formData.append('file', data.avatarFile);
        formData.append('category', 'avatars');

        const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });

        const uploadResult = await uploadResponse.json();
        if (!uploadResponse.ok) {
            throw new Error(uploadResult.message || 'Gagal mengunggah avatar.');
        }
        finalAvatarUrl = uploadResult.url;
      }
      
      const profileDataToUpdate = {
        fullName: data.fullName,
        phone: data.phone,
        address: data.address,
        bio: data.bio,
        birthDate: data.birthDate ? format(data.birthDate, 'yyyy-MM-dd') : undefined,
        avatarUrl: finalAvatarUrl,
      };

      await updateUserProfile(profileDataToUpdate);
    } catch(error: any) {
      toast({ title: "Gagal Memperbarui Profil", description: error.message, variant: "destructive" });
    } finally {
      setIsProfileSubmitting(false);
    }
  }

  async function onPasswordSubmit(data: ChangePasswordFormValues) {
    if (!user) return;
    setIsPasswordSubmitting(true);
    
    const success = await changePassword(user.id, data.currentPassword, data.newPassword);
    if (success) {
      passwordForm.reset();
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
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-headline font-semibold">Pengaturan Akun</h1>
        <p className="text-muted-foreground mt-1">Kelola informasi profil dan keamanan akun Anda.</p>
      </div>

      <Card className="shadow-lg animate-fade-in-up" style={{animationDelay: '200ms'}}>
        <CardHeader>
          <CardTitle>Informasi Profil</CardTitle>
          <CardDescription>Detail pribadi Anda. Email tidak dapat diubah.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-8">
               <div className="flex items-center gap-6">
                <div className="relative">
                    <Image 
                      src={user.avatarUrl || `https://placehold.co/120x120.png?text=${getInitials(user.fullName || user.name, user.email)}`} 
                      alt={user.fullName || user.name || "Avatar Pengguna"}
                      width={120}
                      height={120}
                      className="rounded-full object-cover border-4 border-primary/20 shadow-md"
                      data-ai-hint="user avatar"
                    />
                 </div>
                 <div className="flex-grow">
                    <FormField
                      control={profileForm.control}
                      name="avatarFile"
                      render={({ field: { onChange, value, ...restField }}) => (
                        <FormItem>
                          <FormLabel>Ganti Foto Profil</FormLabel>
                          <FormControl>
                            <Input type="file" accept="image/*" onChange={(e) => onChange(e.target.files ? e.target.files[0] : null)} {...restField} />
                          </FormControl>
                          <FormDescription>Kosongkan jika tidak ingin mengubah foto profil.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                 </div>
               </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={profileForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Lengkap</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan nama lengkap Anda" {...field} value={field.value ?? ""} />
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
                        <Input placeholder="Contoh: 081234567890" {...field} value={field.value ?? ""} />
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
                      <Textarea placeholder="Masukkan alamat lengkap Anda" {...field} value={field.value ?? ""} />
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
                      <Textarea placeholder="Ceritakan sedikit tentang diri Anda..." {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormDescription>Maksimal 300 karakter.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isProfileSubmitting || authLoading} className="w-full md:w-auto hover:scale-105 active:scale-95 transition-transform duration-200">
                {(isProfileSubmitting || authLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Perubahan Profil
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="shadow-lg animate-fade-in-up" style={{animationDelay: '400ms'}}>
        <CardHeader>
          <CardTitle>Keamanan Akun</CardTitle>
          <CardDescription>Perbarui kata sandi akun Anda secara berkala.</CardDescription>
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
                    <div className="relative">
                        <FormControl>
                        <Input type={showPasswords.current ? "text" : "password"} placeholder="••••••••" {...field} />
                        </FormControl>
                        <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground" onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}>
                            {showPasswords.current ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                        </Button>
                    </div>
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
                    <div className="relative">
                        <FormControl>
                        <Input type={showPasswords.new ? "text" : "password"} placeholder="••••••••" {...field} />
                        </FormControl>
                         <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground" onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}>
                            {showPasswords.new ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                        </Button>
                    </div>
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
                     <div className="relative">
                        <FormControl>
                        <Input type={showPasswords.confirm ? "text" : "password"} placeholder="••••••••" {...field} />
                        </FormControl>
                        <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground" onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}>
                            {showPasswords.confirm ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                        </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isPasswordSubmitting || authLoading} className="w-full md:w-auto hover:scale-105 active:scale-95 transition-transform duration-200">
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
