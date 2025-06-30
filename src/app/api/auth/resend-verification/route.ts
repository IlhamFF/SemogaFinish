import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { UserEntity } from "@/entities/user.entity";
import { generateSecureToken, getAuthenticatedUser } from "@/lib/auth-utils-node";
import { sendVerificationEmail } from "@/lib/email-service"; // Import layanan email

export async function POST(request: NextRequest) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: "Tidak terautentikasi. Tidak dapat mengirim ulang verifikasi." }, { status: 401 });
  }
  
  const userId = authenticatedUser.id;

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

    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${newVerificationToken}`;
    
    try {
      await sendVerificationEmail(user.email, user.fullName, verificationLink);
      console.log(`Email verifikasi ulang dikirim (atau disimulasikan) ke ${user.email}`);
    } catch (emailError) {
      console.error("Gagal mengirim email verifikasi ulang:", emailError);
      return NextResponse.json({ message: "Gagal mengirim email verifikasi. Coba lagi nanti." }, { status: 500 });
    }
    
    return NextResponse.json({ message: "Email verifikasi baru telah dikirim." });

  } catch (error) {
    console.error("Resend verification email error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}
