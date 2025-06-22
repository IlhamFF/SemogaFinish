
import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { UserEntity } from "@/entities/user.entity";
import crypto from 'crypto';
import bcrypt from "bcryptjs";
import * as z from "zod";
import { sendPasswordResetEmail } from "@/lib/email-service";

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
      // To prevent email enumeration, we return a generic success message even if the user doesn't exist.
      console.log(`Password reset requested for non-existent email: ${email}`);
      return NextResponse.json({ message: "Jika email terdaftar, instruksi reset akan dikirim." }, { status: 200 });
    }

    const resetToken = generateResetToken();
    const hashedToken = await bcrypt.hash(resetToken, 10); 
    const expires = new Date(Date.now() + 3600000); // Token valid for 1 hour

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = expires;
    await userRepo.save(user);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetLink = `${appUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
    
    // This function call simulates sending an email in a real application.
    await sendPasswordResetEmail(email, resetLink);
    
    // For demonstration purposes, the unhashed token is sent in the response.
    // In a production environment, this should be removed and the user should get the token from their email.
    return NextResponse.json({ 
      message: "Jika email terdaftar, instruksi reset akan dikirim.",
      demoResetToken: resetToken 
    }, { status: 200 });

  } catch (error) {
    console.error("Request password reset error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}
