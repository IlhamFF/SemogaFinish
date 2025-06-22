
import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { UserEntity } from "@/entities/user.entity";
import bcrypt from "bcryptjs";
import * as z from "zod";
import { generateSecureToken } from "@/lib/auth-utils-node";
import { sendVerificationEmail } from "@/lib/email-service";
import type { Role } from "@/types";

const registerSchema = z.object({
  fullName: z.string().min(2, { message: "Nama lengkap minimal 2 karakter." }),
  email: z.string().email({ message: "Alamat email tidak valid." }),
  password: z.string().min(6, { message: "Kata sandi minimal 6 karakter." }),
  nis: z.string().min(4, { message: "NIS minimal 4 karakter." }).optional().nullable(),
  kelas: z.string().min(1, { message: "Kelas wajib diisi." }).optional().nullable(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      console.error("Register API validation failed:", validation.error.flatten().fieldErrors);
      return NextResponse.json({ message: "Input tidak valid.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { email, password, fullName, nis, kelas } = validation.data;

    const dataSource = await getInitializedDataSource();
    const userRepo = dataSource.getRepository(UserEntity);

    const existingUser = await userRepo.findOne({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: "Email sudah terdaftar." }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = generateSecureToken();
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const newUser = userRepo.create({
      email,
      passwordHash: hashedPassword,
      role: 'siswa' as Role,
      isVerified: false, 
      name: fullName.split(' ')[0], // Use first name as default 'name'
      fullName: fullName,
      nis: nis,
      kelasId: kelas,
      joinDate: new Date().toISOString().split('T')[0],
      emailVerificationToken: verificationToken,
      emailVerificationTokenExpires: verificationTokenExpires,
    });

    await userRepo.save(newUser);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
        console.error("Register API: Environment variable NEXT_PUBLIC_APP_URL is not set! Verification link may be incomplete.");
    }
    const verificationLink = `${appUrl || 'http://localhost:3000'}/api/auth/verify-email?token=${verificationToken}`;
    
    try {
      await sendVerificationEmail(newUser.email, newUser.fullName, verificationLink);
    } catch (emailError: any) {
      // Non-fatal error. Log it but don't fail the entire registration process.
      // The user can use the "resend verification" feature later.
      console.error(`Register API: Non-fatal error. Failed to send verification email to ${newUser.email}. Error: ${emailError.message}`);
    }
    
    return NextResponse.json({ 
      message: "Pendaftaran berhasil. Silakan cek email Anda untuk verifikasi.", 
      userId: newUser.id 
    }, { status: 201 });

  } catch (error: any) {
    console.error("Unhandled error in POST /api/auth/register:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}
