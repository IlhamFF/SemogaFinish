
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import type { User, Role } from "@/types";
import { ROLES } from "@/lib/constants";
import { UserPlus, CheckCircle, ShieldAlert, Loader2, Search } from "lucide-react";
import { UserForm } from "@/components/admin/user-form";
import { UserTableActions } from "@/components/admin/user-table-actions";
import { useToast } from "@/hooks/use-toast";

type UserRoleTab = "semua" | Role;

export default function AdminUsersPage() {
  const { 
    user: currentUser, 
    users: allUsers, 
    createUser, 
    verifyUserEmail, 
    updateUserRole, 
    deleteUser, 
    updateUserProfile,
    isLoading: authLoading 
  } = useAuth();
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [pageLoading, setPageLoading] = useState(false);
  
  const [activeTab, setActiveTab] = useState<UserRoleTab>("semua");
  const [searchTerm, setSearchTerm] = useState("");
  const [kelasFilter, setKelasFilter] = useState<string>("semua");
  const [mataPelajaranFilter, setMataPelajaranFilter] = useState<string>("semua");

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
    await deleteUser(userId); 
    setPageLoading(false);
  };
  
  const handleVerifySiswa = (userId: string) => {
    setPageLoading(true);
    verifyUserEmail(userId);
    setPageLoading(false);
  };

  const handleChangeRole = (userToUpdate: User, newRole: Role) => {
    setPageLoading(true);
    updateUserRole(userToUpdate.id, newRole);
    setPageLoading(false);
  }

  const handleFormSubmit = async (data: Partial<User> & { email: string; role: Role; password?: string; kelas?: string; mataPelajaran?: string; }, currentlyEditingUser: User | null) => {
    setPageLoading(true);
    try {
      if (currentlyEditingUser) {
        const { email, password, ...profileData } = data; 
        const success = await updateUserProfile(currentlyEditingUser.id, profileData);
        if (success) {
             toast({ title: "Pengguna Diperbarui", description: "Detail pengguna telah diperbarui." });
             if (data.role && data.role !== currentlyEditingUser.role) {
                updateUserRole(currentlyEditingUser.id, data.role); 
             }
             setIsFormOpen(false);
        } else {
            toast({ title: "Gagal Memperbarui", description: "Tidak dapat menyimpan perubahan pengguna.", variant: "destructive" });
        }
      } else {
        const newUser = await createUser({ 
            email: data.email!, 
            password: data.password, 
            role: data.role!, 
            name: data.name,
            fullName: data.fullName,
            phone: data.phone,
            address: data.address,
            birthDate: data.birthDate as unknown as string, // Already formatted in UserForm
            bio: data.bio,
            nis: data.nis,
            nip: data.nip,
            joinDate: data.joinDate as unknown as string, // Already formatted in UserForm
            avatarUrl: data.avatarUrl,
            kelas: data.kelas,
            mataPelajaran: data.mataPelajaran,
         });
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
  
  const uniqueKelas = useMemo(() => {
    const kls = new Set(allUsers.filter(u => u.role === 'siswa' && u.kelas).map(u => u.kelas!));
    return ["semua", ...Array.from(kls)];
  }, [allUsers]);

  const uniqueMataPelajaran = useMemo(() => {
    const mp = new Set(allUsers.filter(u => u.role === 'guru' && u.mataPelajaran).map(u => u.mataPelajaran!));
    return ["semua", ...Array.from(mp)];
  }, [allUsers]);

  const filteredUsers = useMemo(() => {
    return allUsers.filter(user => {
      const roleMatch = activeTab === "semua" || user.role === activeTab;
      const searchTermMatch = !searchTerm || 
                              user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                              (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()));
      const kelasMatch = activeTab !== 'siswa' || kelasFilter === "semua" || user.kelas === kelasFilter;
      const mataPelajaranMatch = activeTab !== 'guru' || mataPelajaranFilter === "semua" || user.mataPelajaran === mataPelajaranFilter;
      
      return roleMatch && searchTermMatch && kelasMatch && mataPelajaranMatch;
    });
  }, [allUsers, activeTab, searchTerm, kelasFilter, mataPelajaranFilter]);

  if (authLoading && !allUsers.length) {
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

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as UserRoleTab)}>
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
            <TabsList>
                <TabsTrigger value="semua">Semua ({allUsers.length})</TabsTrigger>
                <TabsTrigger value="admin">Admin ({allUsers.filter(u => u.role === 'admin').length})</TabsTrigger>
                <TabsTrigger value="guru">Guru ({allUsers.filter(u => u.role === 'guru').length})</TabsTrigger>
                <TabsTrigger value="siswa">Siswa ({allUsers.filter(u => u.role === 'siswa').length})</TabsTrigger>
                <TabsTrigger value="pimpinan">Pimpinan ({allUsers.filter(u => u.role === 'pimpinan').length})</TabsTrigger>
            </TabsList>
            <div className="relative sm:ml-auto flex-1 md:grow-0">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Cari pengguna..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                />
            </div>
        </div>
        
        <Card className="shadow-lg relative">
            <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                    <CardTitle>
                        {activeTab === "semua" ? "Semua Pengguna" : `Pengguna ${ROLES[activeTab as Role]}`}
                    </CardTitle>
                    <CardDescription>
                        Daftar pengguna yang cocok. Jumlah: {filteredUsers.length}.
                    </CardDescription>
                </div>
                {activeTab === 'siswa' && uniqueKelas.length > 1 && (
                    <Select value={kelasFilter} onValueChange={setKelasFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter Kelas" />
                        </SelectTrigger>
                        <SelectContent>
                        {uniqueKelas.map(kls => (
                            <SelectItem key={kls} value={kls}>{kls === "semua" ? "Semua Kelas" : kls}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                )}
                {activeTab === 'guru' && uniqueMataPelajaran.length > 1 && (
                    <Select value={mataPelajaranFilter} onValueChange={setMataPelajaranFilter}>
                        <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="Filter Mata Pelajaran" />
                        </SelectTrigger>
                        <SelectContent>
                        {uniqueMataPelajaran.map(mp => (
                            <SelectItem key={mp} value={mp}>{mp === "semua" ? "Semua Mapel" : mp}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                )}
            </div>
            </CardHeader>
            <CardContent>
            {(pageLoading || authLoading) && <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
            <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Nama Lengkap</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Peran</TableHead>
                    {activeTab === 'siswa' && <TableHead>Kelas</TableHead>}
                    {activeTab === 'guru' && <TableHead>Mata Pelajaran</TableHead>}
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Tindakan</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.fullName || user.name || user.email.split('@')[0]}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                        <Badge variant={user.role === 'admin' || user.role === 'superadmin' ? "default" : "secondary"}>
                            {ROLES[user.role]}
                        </Badge>
                        </TableCell>
                        {activeTab === 'siswa' && <TableCell>{user.kelas || '-'}</TableCell>}
                        {activeTab === 'guru' && <TableCell>{user.mataPelajaran || '-'}</TableCell>}
                        <TableCell>
                        {user.isVerified ? (
                            <Badge variant="default" className="bg-green-500 hover:bg-green-600">
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
            </div>
            {filteredUsers.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                    Tidak ada pengguna yang cocok dengan filter saat ini.
                </div>
            )}
            </CardContent>
        </Card>
      </Tabs>

      <UserForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSubmit={handleFormSubmit}
        editingUser={editingUser}
        isLoading={pageLoading || authLoading}
      />
    </div>
  );
}
