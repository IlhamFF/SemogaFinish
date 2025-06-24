
import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { UserEntity } from "@/entities/user.entity";
import * as z from "zod";
import { getAuthenticatedUser } from "@/lib/auth-utils-node"; // Use getAuthenticatedUser

const profileUpdateSchema = z.object({
  fullName: z.string().min(2, { message: "Nama lengkap minimal 2 karakter."}).optional(),
  phone: z.string().max(20, { message: "Nomor telepon maksimal 20 karakter."}).optional().nullable(),
  address: z.string().max(500, { message: "Alamat maksimal 500 karakter."}).optional().nullable(),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Format tanggal lahir YYYY-MM-DD" }).optional().nullable(),
  bio: z.string().max(300, { message: "Bio maksimal 300 karakter." }).optional().nullable(),
  avatarUrl: z.string().optional().nullable(),
});

export async function PUT(request: NextRequest) {
  const authenticatedUser = getAuthenticatedUser(request); // Get authenticated user
  if (!authenticatedUser) {
    return NextResponse.json({ message: "Akses ditolak. Tidak terautentikasi." }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const validation = profileUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Input tidak valid.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const userId = authenticatedUser.id; // Use ID from token
    const updateData: Partial<UserEntity> = {};
    const validatedData = validation.data;

    if (validatedData.fullName !== undefined) updateData.fullName = validatedData.fullName;
    if (validatedData.phone !== undefined) updateData.phone = validatedData.phone;
    if (validatedData.address !== undefined) updateData.address = validatedData.address;
    if (validatedData.birthDate !== undefined) updateData.birthDate = validatedData.birthDate;
    if (validatedData.bio !== undefined) updateData.bio = validatedData.bio;
    if (validatedData.avatarUrl !== undefined) updateData.image = validatedData.avatarUrl;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: "Tidak ada data untuk diperbarui." }, { status: 400 });
    }

    const dataSource = await getInitializedDataSource();
    const userRepo = dataSource.getRepository(UserEntity);
    const updateResult = await userRepo.update(userId, updateData);

    if (updateResult.affected === 0) {
      return NextResponse.json({ message: "Pengguna tidak ditemukan untuk diperbarui." }, { status: 404 });
    }

    const updatedUser = await userRepo.findOne({
        where: { id: userId },
        select: [
            "id", "name", "email", "emailVerified", "image", "role", "isVerified", 
            "fullName", "phone", "address", "birthDate", "bio", "nis", "nip", 
            "joinDate", "kelasId", "mataPelajaran", "firebaseUid", "createdAt", "updatedAt"
        ]
    });

    return NextResponse.json(updatedUser, { status: 200 });

  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}
