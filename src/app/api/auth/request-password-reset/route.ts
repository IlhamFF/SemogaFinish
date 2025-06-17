
import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { UserEntity } from "@/entities/user.entity";
import crypto from 'crypto';
import bcrypt from "bcryptjs";
import * as z from "zod";
import { TOKEN_NAME } from "@/lib/auth-utils"; // Just to use a constant name

const requestResetSchema = z.object({
  email: z.string().email({ message: "Alamat email tidak valid." }),
});

function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

export async function POST(request: NextRequest) {
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
      // To prevent email enumeration, always return a generic success message.
      // Log the attempt or actual token for testing if needed.
      console.log(`Password reset requested for non-existent email: ${email} (Simulating success)`);
      return NextResponse.json({ message: "Jika email terdaftar, instruksi reset akan dikirim (simulasi)." }, { status: 200 });
    }

    const resetToken = generateResetToken();
    const hashedToken = await bcrypt.hash(resetToken, 10); 
    const expires = new Date(Date.now() + 3600000); // Token valid for 1 hour

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = expires;
    await userRepo.save(user);

    // SIMULATE EMAIL SENDING
    console.log(`Password Reset Token for ${email} (SAVE THIS FOR TESTING): ${resetToken}`);
    // In a real app, you would email a link like: yourdomain.com/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}
    
    return NextResponse.json({ 
      message: "Jika email terdaftar, instruksi reset akan dikirim (simulasi). Cek console server untuk token (HANYA UNTUK DEMO).",
      // DO NOT RETURN THE ACTUAL TOKEN IN PRODUCTION. THIS IS FOR DEMO ONLY.
      demoResetToken: resetToken 
    }, { status: 200 });

  } catch (error) {
    console.error("Request password reset error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}
