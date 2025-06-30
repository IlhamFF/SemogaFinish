import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { UserEntity } from "@/entities/user.entity";
import bcrypt from "bcryptjs";
import * as z from "zod";
import { getAuthenticatedUser } from "@/lib/auth-utils-node";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: "Kata sandi saat ini wajib diisi." }),
  newPassword: z.string().min(6, { message: "Kata sandi baru minimal 6 karakter." }),
});

export async function POST(request: NextRequest) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: "Akses ditolak. Tidak terautentikasi." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = changePasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Input tidak valid.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { currentPassword, newPassword } = validation.data;
    const userId = authenticatedUser.id;

    const dataSource = await getInitializedDataSource();
    const userRepo = dataSource.getRepository(UserEntity);
    const user = await userRepo.findOne({ where: { id: userId } });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ message: "Pengguna tidak ditemukan atau tidak memiliki kata sandi." }, { status: 404 });
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ message: "Kata sandi saat ini salah." }, { status: 400 });
    }

    if (currentPassword === newPassword) {
        return NextResponse.json({ message: "Kata sandi baru tidak boleh sama dengan kata sandi saat ini." }, { status: 400 });
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    user.passwordHash = newHashedPassword;
    await userRepo.save(user);

    return NextResponse.json({ message: "Kata sandi berhasil diubah." }, { status: 200 });

  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}
