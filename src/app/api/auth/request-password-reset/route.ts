
import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { UserEntity } from "@/entities/user.entity";
import { generateSecureToken } from "@/lib/auth-utils-node";
import { sendPasswordResetEmail } from "@/lib/email-service";
import * as z from "zod";

const requestResetSchema = z.object({
  email: z.string().email({ message: "Alamat email tidak valid." }),
});

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

    const resetToken = generateSecureToken();
    const expires = new Date(Date.now() + 3600000); // Token valid for 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = expires;
    await userRepo.save(user);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetLink = `${appUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
    
    try {
        await sendPasswordResetEmail(email, resetLink);
        console.log(`Password reset email sent (or simulated) to ${email}. Link: ${resetLink}`);
    } catch (emailError: any) {
        console.error(`Failed to send password reset email to ${email}: ${emailError.message}`);
        // Do not expose email sending failure to the user for security reasons.
    }
    
    // The token is NOT sent in the response anymore for security reasons.
    // The user MUST get it from their email.
    return NextResponse.json({ 
      message: "Jika email terdaftar, instruksi reset akan dikirim.",
    }, { status: 200 });

  } catch (error) {
    console.error("Request password reset error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}
