
import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { UserEntity } from "@/entities/user.entity";
import { generateSecureToken, getTokenFromRequest, verifyToken } from "@/lib/auth-utils";

export async function POST(request: NextRequest) {
  const authToken = getTokenFromRequest(request);
  if (!authToken) {
    return NextResponse.json({ message: "Tidak terautentikasi. Tidak dapat mengirim ulang verifikasi." }, { status: 401 });
  }

  const decodedAuthToken = verifyToken(authToken);
  if (!decodedAuthToken) {
    return NextResponse.json({ message: "Token autentikasi tidak valid." }, { status: 401 });
  }
  
  const userId = decodedAuthToken.id;

  try {
    const dataSource = await getInitializedDataSource();
    const userRepo = dataSource.getRepository(UserEntity);
    const user = await userRepo.findOneBy({ id: userId });

    if (!user) {
      return NextResponse.json({ message: "Pengguna tidak ditemukan." }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json({ message: "Email sudah terverifikasi." }, { status: 400 });
    }

    const newVerificationToken = generateSecureToken();
    const newVerificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    user.emailVerificationToken = newVerificationToken;
    user.emailVerificationTokenExpires = newVerificationTokenExpires;
    await userRepo.save(user);

    // SIMULATE EMAIL SENDING
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${newVerificationToken}`;
    console.log("=====================================");
    console.log("SIMULASI PENGIRIMAN ULANG EMAIL VERIFIKASI:");
    console.log(`Untuk: ${user.email}`);
    console.log(`Subjek: Verifikasi Ulang Email Anda untuk ${process.env.APP_NAME || 'Aplikasi Anda'}`);
    console.log(`Isi Email: Klik tautan berikut untuk memverifikasi email Anda: ${verificationLink}`);
    console.log("(Dalam aplikasi nyata, email ini akan dikirim menggunakan layanan email.)");
    console.log("=====================================");
    
    return NextResponse.json({ message: "Email verifikasi baru telah (disimulasikan) dikirim. Cek konsol server." });

  } catch (error) {
    console.error("Resend verification email error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}
