
"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit3, Trash2, CheckCircle, ShieldAlert } from "lucide-react";
import type { User, Role } from "@/types";
import { ROLES } from "@/lib/constants";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import React from "react";

interface UserTableActionsProps {
  user: User;
  currentUser: User | null;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onVerify: (userId: string) => void;
  onChangeRole: (user: User, newRole: Role) => void;
}

export function UserTableActions({ user, currentUser, onEdit, onDelete, onVerify, onChangeRole }: UserTableActionsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isRoleChangeDialogOpen, setIsRoleChangeDialogOpen] = React.useState(false);
  const [selectedRole, setSelectedRole] = React.useState<Role>(user.role);

  const handleDelete = () => {
    onDelete(user.id);
    setIsDeleteDialogOpen(false);
  };
  
  const handleRoleChangeConfirm = () => {
    onChangeRole(user, selectedRole);
    setIsRoleChangeDialogOpen(false);
  }

  const canPerformActions = currentUser?.id !== user.id; 

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Buka menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Tindakan</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onEdit(user)} disabled={!canPerformActions}>
            <Edit3 className="mr-2 h-4 w-4" />
            Edit Pengguna
          </DropdownMenuItem>
          
          {user.role === 'siswa' && !user.isVerified && (
            <DropdownMenuItem onClick={() => onVerify(user.id)}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Verifikasi Siswa
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuLabel>Ubah Peran</DropdownMenuLabel>
          {Object.keys(ROLES).filter(r => r !== 'superadmin').map((roleKey) => (
            <DropdownMenuItem 
              key={roleKey} 
              onClick={() => { setSelectedRole(roleKey as Role); setIsRoleChangeDialogOpen(true); }}
              disabled={!canPerformActions || user.role === (roleKey as Role)}
            >
              {user.role === (roleKey as Role) ? <CheckCircle className="mr-2 h-4 w-4 text-primary" /> : <ShieldAlert className="mr-2 h-4 w-4" />}
              Atur sebagai {ROLES[roleKey as Role]}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-destructive focus:text-destructive focus:bg-destructive/10"
            disabled={!canPerformActions}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Hapus Pengguna
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda benar-benar yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus akun pengguna untuk <span className="font-semibold">{user.email}</span> secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              Ya, hapus pengguna
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isRoleChangeDialogOpen} onOpenChange={setIsRoleChangeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Perubahan Peran</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin mengubah peran <span className="font-semibold">{user.email}</span> menjadi <span className="font-semibold">{ROLES[selectedRole]}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleRoleChangeConfirm}>
              Konfirmasi Perubahan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
