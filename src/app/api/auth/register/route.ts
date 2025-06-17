
import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { UserEntity } from "@/entities/user.entity";
import bcrypt from "bcryptjs";
import * as z from "zod";
import { generateSecureToken } from "@/lib/auth-utils";
import { sendVerificationEmail } from "@/lib/email-service"; // Import layanan email

const registerSchema = z.object({
  email: z.string().email({ message: "Alamat email tidak valid." }),
  password: z.string().min(6, { message: "Kata sandi minimal 6 karakter." }),
  // fullName: z.string().min(2, { message: "Nama lengkap minimal 2 karakter." }).optional(), // Dihapus, akan diambil dari email jika tidak ada
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
    
    // Kirim email verifikasi
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${verificationToken}`;
    try {
      await sendVerificationEmail(newUser.email, newUser.fullName, verificationLink);
      console.log(`Email verifikasi dikirim (atau disimulasikan) ke ${newUser.email}`);
    } catch (emailError) {
      console.error("Gagal mengirim email verifikasi:", emailError);
      // Pertimbangkan apa yang harus dilakukan jika email gagal terkirim
      // Mungkin log error, atau kirim respons yang berbeda,
      // tapi pendaftaran pengguna tetap berhasil.
    }
    
    // Jangan lagi menampilkan token di konsol jika email dikirim
    // console.log("=====================================");
    // console.log("SIMULASI PENGIRIMAN EMAIL VERIFIKASI:");
    // console.log(`Untuk: ${email}`);
    // console.log(`Subjek: Verifikasi Email Anda untuk ${process.env.APP_NAME || 'Aplikasi Anda'}`);
    // console.log(`Isi Email: Klik tautan berikut untuk memverifikasi email Anda: ${verificationLink}`);
    // console.log("(Dalam aplikasi nyata, email ini akan dikirim menggunakan layanan email.)");
    // console.log("=====================================");

    return NextResponse.json({ 
      message: "Pendaftaran berhasil. Silakan cek email Anda untuk verifikasi.", 
      userId: newUser.id 
    }, { status: 201 });

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}
