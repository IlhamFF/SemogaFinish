
import "reflect-metadata"; 
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { UserEntity } from "@/entities/user.entity";
import * as z from "zod";
import type { Role } from "@/types";
import { getAuthenticatedUser } from "@/lib/auth-utils-node";

const userUpdateSchema = z.object({
  role: z.enum(['admin', 'guru', 'siswa', 'pimpinan']).optional(),
  isVerified: z.boolean().optional(),
  fullName: z.string().min(2, { message: "Nama lengkap minimal 2 karakter."}).optional(),
  name: z.string().min(2, { message: "Nama panggilan minimal 2 karakter."}).optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Format tanggal lahir YYYY-MM-DD" }).optional().nullable(),
  bio: z.string().optional().nullable(),
  nis: z.string().optional().nullable(),
  nip: z.string().optional().nullable(),
  joinDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Format tanggal bergabung YYYY-MM-DD" }).optional().nullable(),
  avatarUrl: z.string().optional().nullable().or(z.literal('')),
  kelas: z.string().optional().nullable(),
  mataPelajaran: z.array(z.string()).optional().nullable(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
  }
  
  const userIdToView = params.id;

  if (!['admin', 'superadmin'].includes(authenticatedUser.role) && userIdToView !== authenticatedUser.id) {
    return NextResponse.json({ message: "Akses ditolak untuk melihat profil pengguna lain." }, { status: 403 });
  }

  try {
    const dataSource = await getInitializedDataSource();
    const userRepo = dataSource.getRepository(UserEntity);
    const user = await userRepo.findOne({ 
        where: { id: userIdToView },
        select: [ 
            "id", "name", "email", "emailVerified", "image", "role", "isVerified", 
            "fullName", "phone", "address", "birthDate", "bio", "nis", "nip", 
            "joinDate", "kelasId", "mataPelajaran", "firebaseUid", "createdAt", "updatedAt"
        ]
    });

    if (!user) {
      return NextResponse.json({ message: "Pengguna tidak ditemukan." }, { status: 404 });
    }
    const { image, ...rest } = user;
    return NextResponse.json({ ...rest, avatarUrl: image });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
  }
  
  if (!['admin', 'superadmin'].includes(authenticatedUser.role)) {
    return NextResponse.json({ message: "Akses ditolak. Operasi ini hanya untuk admin." }, { status: 403 });
  }

  const userIdToUpdate = params.id;

  try {
    const body = await request.json();
    const validation = userUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Input tidak valid.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const dataSource = await getInitializedDataSource();
    const userRepo = dataSource.getRepository(UserEntity);
    const targetUser = await userRepo.findOneBy({ id: userIdToUpdate });

    if (!targetUser) {
      return NextResponse.json({ message: "Pengguna yang akan diupdate tidak ditemukan." }, { status: 404 });
    }
    
    const updateData: Partial<UserEntity> = {};
    const validatedData = validation.data;

    if (validatedData.role) {
      if (targetUser.role === 'superadmin' && validatedData.role !== 'superadmin') {
        return NextResponse.json({ message: "Peran Superadmin tidak dapat diubah." }, { status: 403 });
      }
      if (targetUser.role === 'admin' && authenticatedUser.role !== 'superadmin' && validatedData.role !== 'admin') {
        return NextResponse.json({ message: "Admin hanya dapat diubah perannya oleh Superadmin." }, { status: 403 });
      }
      if (userIdToUpdate === authenticatedUser.id && authenticatedUser.role !== 'superadmin' && validatedData.role !== authenticatedUser.role) {
          return NextResponse.json({ message: "Admin tidak dapat mengubah peran diri sendiri." }, { status: 403 });
      }
      updateData.role = validatedData.role as Role;
    }

    if (validatedData.isVerified !== undefined) {
      updateData.isVerified = validatedData.isVerified;
      if (validatedData.isVerified) updateData.emailVerified = new Date();
      else updateData.emailVerified = null;
    }

    if (validatedData.fullName !== undefined) updateData.fullName = validatedData.fullName;
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.phone !== undefined) updateData.phone = validatedData.phone;
    if (validatedData.address !== undefined) updateData.address = validatedData.address;
    if (validatedData.birthDate !== undefined) updateData.birthDate = validatedData.birthDate;
    if (validatedData.bio !== undefined) updateData.bio = validatedData.bio;
    if (validatedData.nis !== undefined) updateData.nis = validatedData.nis;
    if (validatedData.nip !== undefined) updateData.nip = validatedData.nip;
    if (validatedData.joinDate !== undefined) updateData.joinDate = validatedData.joinDate;
    if (validatedData.avatarUrl !== undefined) updateData.image = validatedData.avatarUrl;
    if (validatedData.kelas !== undefined) updateData.kelasId = validatedData.kelas;
    if (validatedData.mataPelajaran !== undefined) updateData.mataPelajaran = validatedData.mataPelajaran;


    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: "Tidak ada data untuk diperbarui." }, { status: 400 });
    }

    const updateResult = await userRepo.update(userIdToUpdate, updateData);

    if (updateResult.affected === 0) {
      return NextResponse.json({ message: "Pengguna tidak ditemukan untuk diperbarui." }, { status: 404 });
    }

    const updatedUser = await userRepo.findOne({
        where: { id: userIdToUpdate },
        select: [
            "id", "name", "email", "emailVerified", "image", "role", "isVerified", 
            "fullName", "phone", "address", "birthDate", "bio", "nis", "nip", 
            "joinDate", "kelasId", "mataPelajaran", "firebaseUid", "createdAt", "updatedAt"
        ]
    });

    const { image, ...rest } = updatedUser!;
    return NextResponse.json({ ...rest, avatarUrl: image });

  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
  }
  if (!['admin', 'superadmin'].includes(authenticatedUser.role)) {
    return NextResponse.json({ message: "Akses ditolak. Hanya admin yang dapat menghapus pengguna." }, { status: 403 });
  }

  const userIdToDelete = params.id;

  if (userIdToDelete === authenticatedUser.id) {
    return NextResponse.json({ message: "Tidak dapat menghapus akun diri sendiri." }, { status: 400 });
  }

  try {
    const dataSource = await getInitializedDataSource();
    const userRepo = dataSource.getRepository(UserEntity);
    
    const userToDelete = await userRepo.findOneBy({ id: userIdToDelete });
    if (!userToDelete) {
      return NextResponse.json({ message: "Pengguna tidak ditemukan." }, { status: 404 });
    }
    
    if (userToDelete.role === 'superadmin') {
        return NextResponse.json({ message: "Superadmin tidak dapat dihapus." }, { status: 403 });
    }
    if (userToDelete.role === 'admin' && authenticatedUser.role !== 'superadmin') {
        return NextResponse.json({ message: "Admin hanya bisa dihapus oleh Superadmin." }, { status: 403 });
    }

    const deleteResult = await userRepo.delete(userIdToDelete);

    if (deleteResult.affected === 0) {
      return NextResponse.json({ message: "Pengguna tidak ditemukan untuk dihapus." }, { status: 404 });
    }
    
    return NextResponse.json({ message: "Profil pengguna lokal berhasil dihapus." });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}
