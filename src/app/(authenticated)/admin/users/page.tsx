
"use client";

import React, { useState, useEffect, useMemo } from "react";
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

type UserRoleTab = "semua" | Role;

export default function AdminUsersPage() {
  const { user: currentUser, isLoading: authIsLoading, updateSession } = useAuth(); // isLoading from useAuth is session loading
  const { toast } = useToast();

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportUserDialogOpen, setIsImportUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [pageLoading, setPageLoading] = useState(true); // For data fetching and submissions
  
  const [activeTab, setActiveTab] = useState<UserRoleTab>("semua");
  const [searchTerm, setSearchTerm] = useState("");
  const [kelasFilter, setKelasFilter] = useState<string>("semua");
  const [mataPelajaranFilter, setMataPelajaranFilter] = useState<string>("semua");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchUsers = async () => {
    setPageLoading(true);
    try {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error("Gagal mengambil data pengguna.");
      const data = await response.json();
      setAllUsers(data);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Tidak dapat memuat pengguna.", variant: "destructive" });
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'superadmin')) {
      fetchUsers();
    }
  }, [currentUser]);

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
      fetchUsers(); // Refresh list
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setPageLoading(false);
    }
  };
  
  const handleVerifySiswa = async (userId: string) => {
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
      toast({ title: "Pengguna Diverifikasi", description: "Email pengguna telah diverifikasi." });
      fetchUsers(); // Refresh list
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
      fetchUsers(); // Refresh list
      if (currentUser?.id === userToUpdate.id) {
          await updateSession(); // Update current user's session if their own role changed
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setPageLoading(false);
    }
  }

  const handleFormSubmit = async (data: Partial<User> & { email: string; role: Role; password?: string; }, currentlyEditingUser: User | null) => {
    setPageLoading(true);
    const url = currentlyEditingUser ? `/api/users/${currentlyEditingUser.id}` : '/api/users';
    const method = currentlyEditingUser ? 'PUT' : 'POST';
    
    // For PUT, only send changed fields. For POST, send all.
    let payload: any = data;
    if (method === 'PUT') {
      // Ensure email is not sent for update if it's not allowed to change
      const { email, ...updatePayload } = data;
      payload = updatePayload;
      if (!payload.password) delete payload.password; // Don't send empty password for update
    }


    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Gagal ${currentlyEditingUser ? 'memperbarui' : 'membuat'} pengguna.`);
      }
      toast({ title: "Berhasil!", description: `Pengguna telah ${currentlyEditingUser ? 'diperbarui' : 'dibuat'}.` });
      setIsFormOpen(false);
      fetchUsers(); // Refresh list
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

  const handleImportSubmit = () => { // Placeholder simulation
    if (!selectedFile) {
      toast({ title: "Tidak Ada File", description: "Silakan pilih file untuk diimpor.", variant: "destructive" });
      return;
    }
    setPageLoading(true);
    setTimeout(() => {
      setPageLoading(false);
      toast({ title: "Simulasi Impor Berhasil", description: `File "${selectedFile.name}" telah (disimulasikan) diimpor. Pengguna baru akan ditambahkan.` });
      setIsImportUserDialogOpen(false);
      setSelectedFile(null); 
      fetchUsers(); // Simulate refresh
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


  if (authIsLoading && !currentUser) { // Show loader if session is initially loading and no current user yet
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
        <div className="flex gap-2">
          <Button onClick={() => setIsImportUserDialogOpen(true)} variant="outline" disabled={pageLoading}>
            <UploadCloud className="mr-2 h-4 w-4" /> Impor Pengguna
          </Button>
          <Button onClick={handleCreateUser} disabled={pageLoading}>
            <UserPlus className="mr-2 h-4 w-4" /> Buat Pengguna
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
            {pageLoading && <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
            <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Nama Lengkap</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Peran</TableHead>
                    {activeTab === 'siswa' && <TableHead>Kelas</TableHead>}
                    {activeTab === 'guru' && <TableHead>Mapel</TableHead>}
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
            {filteredUsers.length === 0 && !pageLoading && (
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
        isLoading={pageLoading}
      />

      <Dialog open={isImportUserDialogOpen} onOpenChange={setIsImportUserDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Impor Pengguna Massal</DialogTitle>
            <DialogDescription>
              Unggah file CSV atau Excel untuk menambahkan beberapa pengguna sekaligus.
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
              Pastikan format file sesuai. <a href="/contoh_template_impor.csv" download className="text-primary hover:underline">Unduh contoh template CSV</a>.
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
