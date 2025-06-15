
import "reflect-metadata";
import { NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { UserEntity } from "@/entities/user.entity";
import crypto from 'crypto';
import bcrypt from "bcryptjs";
import * as z from "zod";

const requestResetSchema = z.object({
  email: z.string().email({ message: "Alamat email tidak valid." }),
});

// Fungsi untuk menghasilkan token yang lebih aman
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = requestResetSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Input tidak valid.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { email } = validation.data;

    const dataSource = await getInitializedDataSource();
    const userRepo = dataSource.getRepository(UserEntity);

    const user = await userRepo.findOne({ where: { email } });

    if (!user) {
      // Jangan beri tahu jika email ada atau tidak untuk keamanan, tapi untuk demo kita bisa beri tahu
      return NextResponse.json({ message: "Jika email terdaftar, instruksi reset akan dikirim (simulasi)." }, { status: 200 });
    }

    const resetToken = generateToken();
    const hashedToken = await bcrypt.hash(resetToken, 10); // Hash the token before storing
    const expires = new Date(Date.now() + 3600000); // Token valid for 1 hour

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = expires;
    await userRepo.save(user);

    // SIMULASI PENGIRIMAN EMAIL
    // Di aplikasi nyata, Anda akan mengirim email berisi link dengan `resetToken` (bukan hashedToken)
    console.log(`Password Reset Token for ${email}: ${resetToken}`); // Log token untuk testing
    // Untuk DEMO, kita akan mengembalikan token (TIDAK AMAN UNTUK PRODUKSI)
    // agar frontend bisa langsung menggunakannya untuk membuat URL reset.
    
    // TODO: Di aplikasi produksi, jangan kembalikan token di respons.
    // Kirim email di sini.
    
    return NextResponse.json({ 
      message: "Jika email terdaftar, instruksi reset akan dikirim (simulasi). Cek console server untuk token.",
      // HANYA UNTUK DEMO: mengembalikan token asli. JANGAN LAKUKAN INI DI PRODUKSI.
      // Di produksi, frontend akan mendapatkan token dari link email.
      demoResetToken: resetToken 
    }, { status: 200 });

  } catch (error) {
    console.error("Request password reset error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}
