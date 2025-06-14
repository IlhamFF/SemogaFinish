
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { User, Role } from "@/types";
import { ROLES } from "@/lib/constants";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  email: z.string().email({ message: "Alamat email tidak valid." }),
  password: z.string().min(6, { message: "Kata sandi minimal 6 karakter." }).optional(),
  role: z.enum(['admin', 'guru', 'siswa', 'pimpinan'], { required_error: "Peran wajib diisi." }),
  name: z.string().min(2, { message: "Nama minimal 2 karakter."}).optional(),
});

type UserFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: z.infer<typeof formSchema>, editingUser: User | null) => Promise<void>;
  editingUser: User | null;
  isLoading?: boolean;
};

export function UserForm({ isOpen, onClose, onSubmit, editingUser, isLoading }: UserFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "siswa",
      name: "",
    },
  });

  React.useEffect(() => {
    if (editingUser) {
      form.reset({
        email: editingUser.email,
        role: editingUser.role as 'admin' | 'guru' | 'siswa' | 'pimpinan', 
        password: "", 
        name: editingUser.name || "",
      });
    } else {
      form.reset({ email: "", password: "", role: "siswa", name: "" });
    }
  }, [editingUser, form, isOpen]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    const submitValues = { ...values };
    if (editingUser && !values.password) {
      delete submitValues.password;
    }
    await onSubmit(submitValues, editingUser);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingUser ? "Edit Pengguna" : "Buat Pengguna Baru"}</DialogTitle>
          <DialogDescription>
            {editingUser ? "Perbarui detail pengguna." : "Isi detail untuk membuat akun pengguna baru."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input placeholder="Nama Pengguna" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="pengguna@contoh.com" {...field} disabled={!!editingUser} />
                  </FormControl>
                  {editingUser && <p className="text-xs text-muted-foreground">Email tidak dapat diubah untuk pengguna yang sudah ada.</p>}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{editingUser ? "Kata Sandi Baru (opsional)" : "Kata Sandi"}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Peran</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={!!editingUser && editingUser.role === 'superadmin'}>
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
                  {editingUser && editingUser.role === 'superadmin' && <p className="text-xs text-muted-foreground">Peran Superadmin tidak dapat diubah.</p>}
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
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
