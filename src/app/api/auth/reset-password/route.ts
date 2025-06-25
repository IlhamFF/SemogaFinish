
import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { UserEntity } from "@/entities/user.entity";
import bcrypt from "bcryptjs";
import * as z from "zod";

const resetPasswordSchema = z.object({
  email: z.string().email({ message: "Alamat email tidak valid." }),
  token: z.string().min(1, { message: "Token wajib diisi." }),
  newPassword: z.string().min(6, { message: "Kata sandi baru minimal 6 karakter." }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = resetPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Input tidak valid.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { email, token, newPassword } = validation.data;

    const dataSource = await getInitializedDataSource();
    const userRepo = dataSource.getRepository(UserEntity);

    const user = await userRepo.findOne({ 
      where: { 
        email,
        resetPasswordToken: token,
      } 
    });
    
    if (!user || !user.resetPasswordExpires) {
      return NextResponse.json({ message: "Token reset tidak valid atau telah kedaluwarsa." }, { status: 400 });
    }

    if (user.resetPasswordExpires < new Date()) {
      return NextResponse.json({ message: "Token reset telah kedaluwarsa." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.passwordHash = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    if (!user.isVerified) {
        user.isVerified = true;
        user.emailVerified = new Date();
    }
    await userRepo.save(user);

    return NextResponse.json({ message: "Kata sandi berhasil direset. Silakan login." }, { status: 200 });

  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}
