
import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getInitializedDataSource } from "@/lib/data-source";
import { UserEntity } from "@/entities/user.entity";
import bcrypt from "bcryptjs";
import * as z from "zod";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: "Kata sandi saat ini wajib diisi." }),
  newPassword: z.string().min(6, { message: "Kata sandi baru minimal 6 karakter." }),
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: "Akses ditolak. Anda harus login." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = changePasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Input tidak valid.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { currentPassword, newPassword } = validation.data;
    const userId = session.user.id;

    const dataSource = await getInitializedDataSource();
    const userRepo = dataSource.getRepository(UserEntity);

    const user = await userRepo.findOne({ where: { id: userId } });

    if (!user || !user.passwordHash) {
      // User not found or somehow has no password hash (should not happen for credential users)
      return NextResponse.json({ message: "Pengguna tidak ditemukan atau tidak dapat mengubah kata sandi." }, { status: 404 });
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
