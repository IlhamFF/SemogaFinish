
import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { UserEntity } from "@/entities/user.entity";
import bcrypt from "bcryptjs";
import * as z from "zod";
import { generateSecureToken } from "@/lib/auth-utils";

const registerSchema = z.object({
  email: z.string().email({ message: "Alamat email tidak valid." }),
  password: z.string().min(6, { message: "Kata sandi minimal 6 karakter." }),
  // fullName: z.string().min(2, { message: "Nama lengkap minimal 2 karakter." }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Input tidak valid.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { email, password } = validation.data;

    const dataSource = await getInitializedDataSource();
    const userRepo = dataSource.getRepository(UserEntity);

    const existingUser = await userRepo.findOne({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: "Email sudah terdaftar." }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = generateSecureToken();
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // Token valid for 24 hours

    const newUser = userRepo.create({
      email,
      passwordHash: hashedPassword,
      role: 'siswa', 
      isVerified: false, 
      name: email.split('@')[0], 
      fullName: email.split('@')[0], 
      joinDate: new Date().toISOString().split('T')[0],
      emailVerificationToken: verificationToken,
      emailVerificationTokenExpires: verificationTokenExpires,
    });

    await userRepo.save(newUser);
    
    // SIMULATE EMAIL SENDING
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${verificationToken}`;
    console.log("=====================================");
    console.log("SIMULASI PENGIRIMAN EMAIL VERIFIKASI:");
    console.log(`Untuk: ${email}`);
    console.log(`Subjek: Verifikasi Email Anda untuk ${process.env.APP_NAME || 'Aplikasi Anda'}`);
    console.log(`Isi Email: Klik tautan berikut untuk memverifikasi email Anda: ${verificationLink}`);
    console.log("(Dalam aplikasi nyata, email ini akan dikirim menggunakan layanan email.)");
    console.log("=====================================");

    return NextResponse.json({ 
      message: "Pendaftaran berhasil. Silakan cek email Anda untuk verifikasi (atau konsol server untuk link simulasi).", 
      userId: newUser.id 
    }, { status: 201 });

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}
