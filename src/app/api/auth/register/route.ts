
import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { UserEntity } from "@/entities/user.entity";
import bcrypt from "bcryptjs";
import * as z from "zod";
import { generateSecureToken } from "@/lib/auth-utils";
import { sendVerificationEmail } from "@/lib/email-service"; // Import layanan email
import type { Role } from "@/types";

const registerSchema = z.object({
  email: z.string().email({ message: "Alamat email tidak valid." }),
  password: z.string().min(6, { message: "Kata sandi minimal 6 karakter." }),
  // fullName: z.string().min(2, { message: "Nama lengkap minimal 2 karakter." }).optional(), // Dihapus, akan diambil dari email jika tidak ada
});

export async function POST(request: NextRequest) {
  console.log("Register API: Menerima permintaan.");
  try {
    const body = await request.json();
    console.log("Register API: Body permintaan:", body);
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      console.error("Register API: Validasi gagal.", validation.error.flatten().fieldErrors);
      return NextResponse.json({ message: "Input tidak valid.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { email, password } = validation.data;
    console.log(`Register API: Memproses registrasi untuk ${email}`);

    console.log("Register API: Menginisialisasi data source...");
    const dataSource = await getInitializedDataSource();
    console.log("Register API: Data source terinisialisasi.");
    const userRepo = dataSource.getRepository(UserEntity);

    console.log(`Register API: Mengecek apakah pengguna ${email} sudah ada...`);
    const existingUser = await userRepo.findOne({ where: { email } });
    if (existingUser) {
      console.warn(`Register API: Pengguna ${email} sudah terdaftar.`);
      return NextResponse.json({ message: "Email sudah terdaftar." }, { status: 409 });
    }
    console.log(`Register API: Pengguna ${email} belum terdaftar. Melanjutkan.`);

    console.log(`Register API: Melakukan hashing kata sandi untuk ${email}...`);
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(`Register API: Kata sandi untuk ${email} berhasil di-hash.`);
    const verificationToken = generateSecureToken();
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // Token valid for 24 hours

    const newUserPayload = {
      email,
      passwordHash: hashedPassword,
      role: 'siswa' as Role, // Pastikan tipe Role benar
      isVerified: false, 
      name: email.split('@')[0], 
      fullName: email.split('@')[0], 
      joinDate: new Date().toISOString().split('T')[0],
      emailVerificationToken: verificationToken,
      emailVerificationTokenExpires: verificationTokenExpires,
    };
    console.log(`Register API: Membuat entitas pengguna baru untuk ${email} dengan payload:`, newUserPayload);
    const newUser = userRepo.create(newUserPayload);

    console.log(`Register API: Menyimpan pengguna baru ${email} ke database...`);
    await userRepo.save(newUser);
    console.log(`Register API: Pengguna ${email} berhasil disimpan dengan ID ${newUser.id}.`);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
        console.error("Register API: Variabel NEXT_PUBLIC_APP_URL tidak diatur! Link verifikasi mungkin tidak lengkap.");
        // Pertimbangkan untuk melempar error atau mengembalikan pesan spesifik jika ini kritis
    }
    const verificationLink = `${appUrl || 'http://localhost:3000'}/api/auth/verify-email?token=${verificationToken}`;
    
    console.log(`Register API: Mencoba mengirim email verifikasi ke ${newUser.email}...`);
    try {
      await sendVerificationEmail(newUser.email, newUser.fullName, verificationLink);
      console.log(`Register API: Email verifikasi berhasil dikirim ke ${newUser.email}.`);
    } catch (emailError: any) {
      console.error(`Register API: Gagal mengirim email verifikasi ke ${newUser.email}. Error:`, emailError.message, emailError.stack);
      // Jika pengiriman email gagal, seluruh proses registrasi akan gagal karena error ini dilempar
      throw new Error(`Pengiriman email gagal: ${emailError.message}`);
    }
    
    console.log(`Register API: Registrasi untuk ${email} berhasil. Mengembalikan status 201.`);
    return NextResponse.json({ 
      message: "Pendaftaran berhasil. Silakan cek email Anda untuk verifikasi.", 
      userId: newUser.id 
    }, { status: 201 });

  } catch (error: any) {
    console.error("Register API: Error tidak tertangani di POST /api/auth/register:", error.message, error.stack);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}
