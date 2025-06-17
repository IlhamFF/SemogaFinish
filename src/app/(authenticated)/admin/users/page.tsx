
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import type { User, Role } from "@/types";
import { ROLES } from "@/lib/constants";
import { UserPlus, CheckCircle, ShieldAlert, Loader2, Search, UploadCloud } from "lucide-react";
import { UserForm } from "@/components/admin/user-form";
import { UserTableActions } from "@/components/admin/user-table-actions";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from 'date-fns';

type UserRoleTab = "semua" | Role;
type UserFormValues = Parameters<typeof UserForm>[0]["onSubmit"] extends (data: infer T, ...args: any[]) => any ? T : never;


export default function AdminUsersPage() {
  const { user: currentUserAuth, isLoading: authIsLoading, updateSession } = useAuth();
  const { toast } = useToast();

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportUserDialogOpen, setIsImportUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [pageLoading, setPageLoading] = useState(true); 
  
  const [activeTab, setActiveTab] = useState<UserRoleTab>("semua");
  const [searchTerm, setSearchTerm] = useState("");
  const [kelasFilter, setKelasFilter] = useState<string>("semua");
  const [mataPelajaranFilter, setMataPelajaranFilter] = useState<string>("semua");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchUsers = useCallback(async () => {
    setPageLoading(true);
    try {
      const response = await fetch('/api/users');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal mengambil data pengguna.");
      }
      const data = await response.json();
      setAllUsers(data.map((u: any) => ({
        ...u,
        // Pastikan birthDate dan joinDate adalah string ISO jika dari DB
        birthDate: u.birthDate ? format(parseISO(u.birthDate), 'yyyy-MM-dd') : null,
        joinDate: u.joinDate ? format(parseISO(u.joinDate), 'yyyy-MM-dd') : null,
        mataPelajaran: Array.isArray(u.mataPelajaran) ? u.mataPelajaran.join(', ') : u.mataPelajaran,
        kelas: u.kelasId || u.kelas, // Use kelasId as kelas
      })));
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Tidak dapat memuat pengguna.", variant: "destructive" });
    } finally {
      setPageLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (currentUserAuth && (currentUserAuth.role === 'admin' || currentUserAuth.role === 'superadmin')) {
      fetchUsers();
    }
  }, [currentUserAuth, fetchUsers]);

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
      const response = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal menghapus pengguna.");
      }
      toast({ title: "Pengguna Dihapus", description: "Pengguna telah berhasil dihapus." });
      fetchUsers(); 
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setPageLoading(false);
    }
  };
  
  const handleVerifyUser = async (userId: string) => {
    setPageLoading(true);
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerified: true }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal memverifikasi pengguna.");
      }
      toast({ title: "Pengguna Diverifikasi", description: "Status verifikasi pengguna telah diperbarui." });
      fetchUsers(); 
      if (currentUserAuth?.id === userId) {
        await updateSession();
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setPageLoading(false);
    }
  };


  const handleChangeRole = async (userToUpdate: User, newRole: Role) => {
    setPageLoading(true);
    try {
      const response = await fetch(`/api/users/${userToUpdate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal mengubah peran pengguna.");
      }
      toast({ title: "Peran Diperbarui", description: `Peran untuk ${userToUpdate.email} telah diubah menjadi ${ROLES[newRole]}.` });
      fetchUsers(); 
      if (currentUserAuth?.id === userToUpdate.id) {
          await updateSession(); 
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setPageLoading(false);
    }
  }

  const handleFormSubmit = async (data: UserFormValues, currentlyEditingUser: User | null) => {
    setPageLoading(true);
    const url = currentlyEditingUser ? `/api/users/${currentlyEditingUser.id}` : '/api/users';
    const method = currentlyEditingUser ? 'PUT' : 'POST';
    
    let payload: any = { ...data };
    if (payload.birthDate && payload.birthDate instanceof Date) {
      payload.birthDate = format(payload.birthDate, 'yyyy-MM-dd');
    }
    if (payload.joinDate && payload.joinDate instanceof Date) {
      payload.joinDate = format(payload.joinDate, 'yyyy-MM-dd');
    }

    if (method === 'PUT') {
      const { email, password, ...updatePayload } = payload; // Email and password not sent for PUT via this form. Password changed elsewhere.
      payload = updatePayload;
      if (!payload.password && currentlyEditingUser) delete payload.password;
    } else {
      // For POST, ensure password is included if provided, or handle default if not
      if (!payload.password) {
        // For Firebase, password is required at Firebase user creation.
        // For local profiles, this form doesn't create Firebase users directly.
        // This form is for LOCAL profile management by admin.
        delete payload.password; // Don't send empty password to local user creation API
      }
    }

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Gagal ${currentlyEditingUser ? 'memperbarui' : 'membuat'} profil pengguna lokal.`);
      }
      toast({ title: "Berhasil!", description: `Profil pengguna lokal telah ${currentlyEditingUser ? 'diperbarui' : 'dibuat'}.` });
      setIsFormOpen(false);
      fetchUsers(); 
    } catch (error: any) {
      toast({ title: "Operasi Gagal", description: error.message, variant: "destructive"});
    } finally {
      setPageLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleImportSubmit = () => { 
    if (!selectedFile) {
      toast({ title: "Tidak Ada File", description: "Silakan pilih file untuk diimpor.", variant: "destructive" });
      return;
    }
    setPageLoading(true);
    setTimeout(() => {
      setPageLoading(false);
      toast({ title: "Simulasi Impor Berhasil", description: `File "${selectedFile.name}" telah (disimulasikan) diimpor. Profil pengguna baru akan ditambahkan.` });
      setIsImportUserDialogOpen(false);
      setSelectedFile(null); 
      fetchUsers(); 
    }, 1500);
  };
  
  const uniqueKelas = useMemo(() => {
    const kls = new Set(allUsers.filter(u => u.role === 'siswa' && u.kelas).map(u => u.kelas!));
    return ["semua", ...Array.from(kls).sort()];
  }, [allUsers]);

  const uniqueMataPelajaran = useMemo(() => {
    const mp = new Set(allUsers.filter(u => u.role === 'guru' && u.mataPelajaran).map(u => u.mataPelajaran!));
    return ["semua", ...Array.from(mp).sort()];
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


  if (authIsLoading && !currentUserAuth) { 
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (!currentUserAuth || (currentUserAuth.role !== 'admin' && currentUserAuth.role !== 'superadmin')) {
    return <p>Akses Ditolak. Anda harus menjadi admin untuk melihat halaman ini.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-semibold">Manajemen Profil Pengguna Lokal</h1>
          <p className="text-muted-foreground">Lihat, buat, dan kelola profil pengguna lokal di sistem. Akun autentikasi dibuat terpisah di Firebase.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsImportUserDialogOpen(true)} variant="outline" disabled={pageLoading}>
            <UploadCloud className="mr-2 h-4 w-4" /> Impor Profil Lokal
          </Button>
          <Button onClick={handleCreateUser} disabled={pageLoading}>
            <UserPlus className="mr-2 h-4 w-4" /> Buat Profil Lokal Baru
          </Button>
        </div>
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
                        {activeTab === "semua" ? "Semua Pengguna Lokal" : `Pengguna Lokal ${ROLES[activeTab as Role]}`}
                    </CardTitle>
                    <CardDescription>
                        Daftar profil pengguna lokal yang cocok. Jumlah: {filteredUsers.length}.
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
            {pageLoading && <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
            <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Nama Lengkap</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Peran Lokal</TableHead>
                    {activeTab === 'siswa' && <TableHead>Kelas</TableHead>}
                    {activeTab === 'guru' && <TableHead>Mapel</TableHead>}
                    <TableHead>Status Verifikasi Lokal</TableHead>
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
                            <CheckCircle className="mr-1 h-3 w-3" /> Terverifikasi (Lokal)
                            </Badge>
                        ) : (
                            <Badge variant="destructive">
                            <ShieldAlert className="mr-1 h-3 w-3" /> Belum Terverifikasi (Lokal)
                            </Badge>
                        )}
                        </TableCell>
                        <TableCell className="text-right">
                        <UserTableActions 
                            user={user} 
                            currentUser={currentUserAuth}
                            onEdit={handleEditUser} 
                            onDelete={handleDeleteUser}
                            onVerify={handleVerifyUser}
                            onChangeRole={handleChangeRole}
                        />
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>
            {filteredUsers.length === 0 && !pageLoading && (
                <div className="text-center py-10 text-muted-foreground">
                    Tidak ada profil pengguna lokal yang cocok dengan filter saat ini.
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
        isLoading={pageLoading}
      />

      <Dialog open={isImportUserDialogOpen} onOpenChange={setIsImportUserDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Impor Profil Pengguna Lokal</DialogTitle>
            <DialogDescription>
              Unggah file CSV atau Excel untuk menambahkan beberapa profil pengguna lokal sekaligus.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Input 
              type="file" 
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={handleFileChange}
              disabled={pageLoading}
            />
            {selectedFile && <p className="text-xs text-muted-foreground">File terpilih: {selectedFile.name}</p>}
            <p className="text-xs text-muted-foreground">
              Pastikan format file sesuai. <a href="/contoh_template_impor_profil.csv" download className="text-primary hover:underline">Unduh contoh template CSV</a>.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportUserDialogOpen(false)} disabled={pageLoading}>Batal</Button>
            <Button onClick={handleImportSubmit} disabled={pageLoading || !selectedFile}>
              {pageLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Impor dari File
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
