
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import type { User, Role } from "@/types";
import { ROLES } from "@/lib/constants";
import { UserPlus, CheckCircle, ShieldAlert, Loader2 } from "lucide-react";
import { UserForm } from "@/components/admin/user-form";
import { UserTableActions } from "@/components/admin/user-table-actions";
import { useToast } from "@/hooks/use-toast";

export default function AdminUsersPage() {
  const { user: currentUser, users, createUser, verifyUserEmail, updateUserRole, deleteUser, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [pageLoading, setPageLoading] = useState(false);

  const handleCreateUser = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleEditUser = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setIsFormOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    setPageLoading(true);
    try {
        deleteUser(userId); 
    } catch (error) {
        toast({ title: "Kesalahan", description: "Gagal menghapus pengguna.", variant: "destructive" });
    } finally {
        setPageLoading(false);
    }
  };
  
  const handleVerifySiswa = (userId: string) => {
    setPageLoading(true);
    try {
        verifyUserEmail(userId);
    } catch (error) {
        toast({ title: "Kesalahan", description: "Gagal memverifikasi pengguna.", variant: "destructive" });
    } finally {
        setPageLoading(false);
    }
  };

  const handleChangeRole = (userToUpdate: User, newRole: Role) => {
    setPageLoading(true);
    try {
        updateUserRole(userToUpdate.id, newRole);
    } catch (error) {
        toast({ title: "Kesalahan", description: "Gagal memperbarui peran pengguna.", variant: "destructive" });
    } finally {
        setPageLoading(false);
    }
  }

  const handleFormSubmit = async (data: any, currentlyEditingUser: User | null) => {
    setPageLoading(true);
    try {
      if (currentlyEditingUser) {
        toast({ title: "Edit Pengguna", description: "Fungsionalitas edit pengguna (mis. nama, kata sandi) dapat diimplementasikan lebih lanjut di sini." });
      } else {
        const newUser = await createUser({ email: data.email, password: data.password, role: data.role, name: data.name });
        if (newUser) {
          setIsFormOpen(false);
        }
      }
    } catch (error) {
      toast({ title: "Operasi Gagal", description: "Tidak dapat menyimpan data pengguna.", variant: "destructive"});
    } finally {
      setPageLoading(false);
    }
  };
  
  if (authLoading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'superadmin')) {
    return <p>Akses Ditolak. Anda harus menjadi admin untuk melihat halaman ini.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-semibold">Manajemen Pengguna</h1>
          <p className="text-muted-foreground">Lihat, buat, dan kelola akun pengguna di sistem.</p>
        </div>
        <Button onClick={handleCreateUser} disabled={pageLoading}>
          <UserPlus className="mr-2 h-4 w-4" /> Buat Pengguna
        </Button>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Semua Pengguna</CardTitle>
          <CardDescription>Daftar semua pengguna di sistem. Jumlah pengguna saat ini: {users.length}.</CardDescription>
        </CardHeader>
        <CardContent>
          {pageLoading && <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Peran</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Tindakan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name || user.email.split('@')[0]}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' || user.role === 'superadmin' ? "default" : "secondary"}>
                      {ROLES[user.role]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.isVerified ? (
                      <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white">
                        <CheckCircle className="mr-1 h-3 w-3" /> Terverifikasi
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <ShieldAlert className="mr-1 h-3 w-3" /> Belum Terverifikasi
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <UserTableActions 
                      user={user} 
                      currentUser={currentUser}
                      onEdit={handleEditUser} 
                      onDelete={handleDeleteUser}
                      onVerify={handleVerifySiswa}
                      onChangeRole={handleChangeRole}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <UserForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSubmit={handleFormSubmit}
        editingUser={editingUser}
        isLoading={pageLoading}
      />
    </div>
  );
}
