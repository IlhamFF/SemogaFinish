
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import type { User, Role } from "@/types";
import { ROLES } from "@/lib/constants";
import { Loader2, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO, isValid } from 'date-fns';
import { id as localeID } from 'date-fns/locale';

const userFormSchema = z.object({
  email: z.string().email({ message: "Alamat email tidak valid." }),
  password: z.string().min(6, { message: "Kata sandi minimal 6 karakter." }).optional().or(z.literal('')),
  role: z.enum(['admin', 'guru', 'siswa', 'pimpinan'], { required_error: "Peran wajib diisi." }),
  name: z.string().min(2, { message: "Nama panggilan minimal 2 karakter."}).optional(),
  fullName: z.string().min(2, { message: "Nama lengkap minimal 2 karakter."}),
  phone: z.string().optional(),
  address: z.string().optional(),
  birthDate: z.date().optional(),
  bio: z.string().optional(),
  nis: z.string().optional(),
  nip: z.string().optional(),
  joinDate: z.date().optional(),
  avatarUrl: z.string().url({ message: "URL Avatar tidak valid." }).optional().or(z.literal('')),
  kelas: z.string().optional(),
  mataPelajaran: z.string().optional(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

type UserFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormValues, editingUser: User | null) => Promise<void>;
  editingUser: User | null;
  isLoading?: boolean;
};

export function UserForm({ isOpen, onClose, onSubmit, editingUser, isLoading }: UserFormProps) {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "siswa",
      name: "",
      fullName: "",
      phone: "",
      address: "",
      birthDate: undefined,
      bio: "",
      nis: "",
      nip: "",
      joinDate: new Date(), 
      avatarUrl: "",
      kelas: "",
      mataPelajaran: "",
    },
  });

  const selectedRole = form.watch("role");

  React.useEffect(() => {
    if (editingUser) {
      let parsedBirthDate: Date | undefined = undefined;
      if (editingUser.birthDate) {
        const bdCandidate = parseISO(editingUser.birthDate);
        if (isValid(bdCandidate)) parsedBirthDate = bdCandidate;
      }
      let parsedJoinDate: Date | undefined = undefined;
      if (editingUser.joinDate) {
        const jdCandidate = parseISO(editingUser.joinDate);
        if (isValid(jdCandidate)) parsedJoinDate = jdCandidate;
      }

      form.reset({
        email: editingUser.email,
        role: editingUser.role as 'admin' | 'guru' | 'siswa' | 'pimpinan', 
        password: "", 
        name: editingUser.name || "",
        fullName: editingUser.fullName || "",
        phone: editingUser.phone || "",
        address: editingUser.address || "",
        birthDate: parsedBirthDate,
        bio: editingUser.bio || "",
        nis: editingUser.nis || "",
        nip: editingUser.nip || "",
        joinDate: parsedJoinDate,
        avatarUrl: editingUser.avatarUrl || "",
        kelas: editingUser.kelas || "",
        mataPelajaran: editingUser.mataPelajaran || "",
      });
    } else {
      form.reset({ 
        email: "", password: "", role: "siswa", name: "", fullName: "",
        phone: "", address: "", birthDate: undefined, bio: "",
        nis: "", nip: "", joinDate: new Date(), avatarUrl: "",
        kelas: "", mataPelajaran: "",
      });
    }
  }, [editingUser, form, isOpen]);

  const handleSubmit = async (values: UserFormValues) => {
    const submitValues = { 
      ...values,
      birthDate: values.birthDate ? format(values.birthDate, 'yyyy-MM-dd') : undefined,
      joinDate: values.joinDate ? format(values.joinDate, 'yyyy-MM-dd') : undefined,
    } as any; 

    if (editingUser && !values.password) {
      delete submitValues.password;
    }
    await onSubmit(submitValues, editingUser);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle>{editingUser ? "Edit Pengguna" : "Buat Pengguna Baru"}</DialogTitle>
          <DialogDescription>
            {editingUser ? "Perbarui detail pengguna." : "Isi detail untuk membuat akun pengguna baru."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 pt-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input placeholder="Nama Lengkap Pengguna" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="pengguna@contoh.com" {...field} disabled={!!editingUser} />
                    </FormControl>
                    {editingUser && <FormDescription>Email tidak dapat diubah.</FormDescription>}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{editingUser ? "Kata Sandi Baru (Opsional)" : "Kata Sandi"}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    {editingUser && <FormDescription>Biarkan kosong jika tidak ingin mengubah kata sandi.</FormDescription>}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peran</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Reset role-specific fields when role changes
                        if (value !== 'siswa') form.setValue('nis', '');
                        if (value !== 'siswa') form.setValue('kelas', '');
                        if (value !== 'guru') form.setValue('mataPelajaran', '');
                        if (value === 'siswa' || value === 'pimpinan') form.setValue('nip', '');

                      }} 
                      defaultValue={field.value} 
                      value={field.value} 
                      disabled={!!editingUser && editingUser.role === 'superadmin'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih peran" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(ROLES)
                          .filter(([roleKey]) => roleKey !== 'superadmin') 
                          .map(([roleKey, roleName]) => (
                          <SelectItem key={roleKey} value={roleKey}>
                            {roleName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {editingUser && editingUser.role === 'superadmin' && <FormDescription>Peran Superadmin tidak dapat diubah.</FormDescription>}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Panggilan (Opsional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Nama Panggilan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor Telepon</FormLabel>
                    <FormControl>
                      <Input placeholder="08123xxxx" {...field} />
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
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? format(field.value, "PPP", { locale: localeID }) : <span>Pilih tanggal</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} 
                                  disabled={(date) => date > new Date() || date < new Date("1900-01-01")} 
                                  initialFocus
                                  captionLayout="dropdown-buttons" fromYear={1900} toYear={new Date().getFullYear()}
                                  />
                      </PopoverContent>
                    </Popover>
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
                    <Textarea placeholder="Alamat lengkap" {...field} />
                  </FormControl>
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
                    <Textarea placeholder="Tentang pengguna..." {...field} />
                  </FormControl>
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
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormDescription>Biarkan kosong untuk menggunakan placeholder default.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedRole === 'siswa' && (
                  <>
                    <FormField
                        control={form.control}
                        name="nis"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>NIS (Nomor Induk Siswa)</FormLabel>
                            <FormControl>
                            <Input placeholder="Nomor Induk Siswa" {...field} />
                            </FormControl>
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
                            <FormControl>
                            <Input placeholder="Contoh: Kelas X-A" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                  </>
                )}
                {selectedRole && (selectedRole === 'guru' || selectedRole === 'admin' || selectedRole === 'pimpinan') && (
                  <FormField
                      control={form.control}
                      name="nip"
                      render={({ field }) => (
                      <FormItem>
                          <FormLabel>NIP (Nomor Induk Pegawai)</FormLabel>
                          <FormControl>
                          <Input placeholder="Nomor Induk Pegawai" {...field} />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                      )}
                  />
                )}
                 {selectedRole === 'guru' && (
                    <FormField
                        control={form.control}
                        name="mataPelajaran"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Mata Pelajaran yang Diampu</FormLabel>
                            <FormControl>
                            <Input placeholder="Contoh: Matematika" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                )}
                 <FormField
                    control={form.control}
                    name="joinDate"
                    render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Tanggal Bergabung</FormLabel>
                        <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                            <Button
                                variant={"outline"}
                                className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                                )}
                            >
                                {field.value ? format(field.value, "PPP", { locale: localeID }) : <span>Pilih tanggal</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus 
                                      captionLayout="dropdown-buttons" fromYear={2000} toYear={new Date().getFullYear()}
                            />
                        </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Batal</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingUser ? "Simpan Perubahan" : "Buat Pengguna"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
