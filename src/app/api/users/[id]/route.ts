
import "reflect-metadata"; // Ensure this is the very first import
import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth/next"; // Removed
// import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Removed
import { getInitializedDataSource } from "@/lib/data-source";
import { UserEntity } from "@/entities/user.entity";
import * as z from "zod";
import type { Role } from "@/types";

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
  avatarUrl: z.string().url({ message: "URL Avatar tidak valid." }).optional().nullable().or(z.literal('')),
  kelas: z.string().optional().nullable(), // Maps to kelasId
  mataPelajaran: z.string().optional().nullable(),
  // firebaseUid should not be updated by admin frequently, only if linking an existing local profile
  // firebaseUid: z.string().optional().nullable(),
});

// GET /api/users/[id] - Mendapatkan satu pengguna
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // TODO: Implement server-side Firebase token verification for admin
  // const session = await getServerSession(authOptions); // Removed
  // if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) { // Removed
  //   return NextResponse.json({ message: "Akses ditolak." }, { status: 403 }); // Removed
  // } // Removed

  const { id } = params;

  try {
    const dataSource = await getInitializedDataSource();
    const userRepo = dataSource.getRepository(UserEntity);
    const user = await userRepo.findOne({ 
        where: { id },
        select: [ 
            "id", "name", "email", "emailVerified", "image", "role", "isVerified", 
            "fullName", "phone", "address", "birthDate", "bio", "nis", "nip", 
            "joinDate", "kelasId", "mataPelajaran", "firebaseUid", "createdAt", "updatedAt" // Added firebaseUid
        ]
    });

    if (!user) {
      return NextResponse.json({ message: "Pengguna tidak ditemukan." }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}

// PUT /api/users/[id] - Memperbarui profil pengguna lokal (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // TODO: Implement server-side Firebase token verification for admin
  // const session = await getServerSession(authOptions); // Removed
  // if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) { // Removed
  //   return NextResponse.json({ message: "Akses ditolak." }, { status: 403 }); // Removed
  // } // Removed

  // // Additional check: Admin cannot change their own role unless they are superadmin (or prevent self-role change entirely from this endpoint)
  // if (params.id === session.user.id && session.user.role !== 'superadmin') { // Removed
  //     const bodyAttempt = await request.json(); // Removed
  //     if (bodyAttempt.role && bodyAttempt.role !== session.user.role) { // Removed
  //       return NextResponse.json({ message: "Admin tidak dapat mengubah peran diri sendiri." }, { status: 403 }); // Removed
  //     } // Removed
  // } // Removed


  try {
    const body = await request.json();
    const validation = userUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Input tidak valid.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const updateData: Partial<UserEntity> = {};
    const validatedData = validation.data;

    if (validatedData.role) updateData.role = validatedData.role as Role;
    if (validatedData.isVerified !== undefined) {
        updateData.isVerified = validatedData.isVerified;
        if (validatedData.isVerified) updateData.emailVerified = new Date();
        else updateData.emailVerified = null; // Explicitly nullify if un-verifying
    }
    if (validatedData.fullName) updateData.fullName = validatedData.fullName;
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
    if (validatedData.mataPelajaran !== undefined) updateData.mataPelajaran = [validatedData.mataPelajaran];
    // firebaseUid is not updated here by admin directly, handled at creation or by a specific linking process

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: "Tidak ada data untuk diperbarui." }, { status: 400 });
    }

    const dataSource = await getInitializedDataSource();
    const userRepo = dataSource.getRepository(UserEntity);

    const updateResult = await userRepo.update(params.id, updateData);

    if (updateResult.affected === 0) {
      return NextResponse.json({ message: "Pengguna tidak ditemukan untuk diperbarui." }, { status: 404 });
    }

    const updatedUser = await userRepo.findOne({
        where: { id: params.id },
        select: [
            "id", "name", "email", "emailVerified", "image", "role", "isVerified", 
            "fullName", "phone", "address", "birthDate", "bio", "nis", "nip", 
            "joinDate", "kelasId", "mataPelajaran", "firebaseUid", "createdAt", "updatedAt" // Added firebaseUid
        ]
    });
    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}

// DELETE /api/users/[id] - Menghapus pengguna (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // TODO: Implement server-side Firebase token verification for admin
  // const session = await getServerSession(authOptions); // Removed
  // if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) { // Removed
  //   return NextResponse.json({ message: "Akses ditolak." }, { status: 403 }); // Removed
  // } // Removed

  // // Prevent self-deletion and admin deleting other admins (unless superadmin)
  // if (params.id === session.user.id) { // Removed
  //   return NextResponse.json({ message: "Tidak dapat menghapus akun diri sendiri." }, { status: 400 }); // Removed
  // } // Removed

  try {
    const dataSource = await getInitializedDataSource();
    const userRepo = dataSource.getRepository(UserEntity);
    
    const userToDelete = await userRepo.findOneBy({ id: params.id });
    if (!userToDelete) {
      return NextResponse.json({ message: "Pengguna tidak ditemukan." }, { status: 404 });
    }
    // // Add refined role deletion logic here if session is available
    // if (session) { // Check if session exists before using session.user
    //     if (userToDelete.role === 'admin' && session.user.role !== 'superadmin') {
    //         return NextResponse.json({ message: "Admin tidak dapat menghapus admin lain." }, { status: 403 });
    //     }
    //     if (userToDelete.role === 'superadmin') {
    //         return NextResponse.json({ message: "Superadmin tidak dapat dihapus." }, { status: 403 });
    //     }
    // }


    const deleteResult = await userRepo.delete(params.id);

    if (deleteResult.affected === 0) {
      return NextResponse.json({ message: "Pengguna tidak ditemukan untuk dihapus." }, { status: 404 });
    }
    
    // TODO: Delete user from Firebase Authentication as well using Firebase Admin SDK
    // if (userToDelete.firebaseUid) {
    //   // admin.auth().deleteUser(userToDelete.firebaseUid)...
    // }

    return NextResponse.json({ message: "Profil pengguna lokal berhasil dihapus. Akun Firebase mungkin perlu dihapus secara manual." });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}
