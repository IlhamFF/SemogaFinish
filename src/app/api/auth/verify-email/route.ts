
import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { UserEntity } from "@/entities/user.entity";
import { ROUTES } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL(`${ROUTES.LOGIN}?error=verification_failed_no_token`, request.url));
  }

  try {
    const dataSource = await getInitializedDataSource();
    const userRepo = dataSource.getRepository(UserEntity);

    const user = await userRepo.findOne({ 
      where: { 
        emailVerificationToken: token,
      } 
    });

    if (!user) {
      return NextResponse.redirect(new URL(`${ROUTES.LOGIN}?error=verification_failed_invalid_token`, request.url));
    }

    if (user.isVerified) {
      // Already verified, redirect to login with a success message (or dashboard if already logged in)
      return NextResponse.redirect(new URL(`${ROUTES.LOGIN}?message=email_already_verified`, request.url));
    }

    if (!user.emailVerificationTokenExpires || user.emailVerificationTokenExpires < new Date()) {
      // Token expired
      // Optionally, allow resend verification email from a page
      return NextResponse.redirect(new URL(`${ROUTES.LOGIN}?error=verification_failed_token_expired`, request.url));
    }

    user.isVerified = true;
    user.emailVerified = new Date();
    user.emailVerificationToken = null;
    user.emailVerificationTokenExpires = null;
    await userRepo.save(user);

    // Redirect to login page with success message, user can now login
    return NextResponse.redirect(new URL(`${ROUTES.LOGIN}?message=email_verified_success`, request.url));

  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.redirect(new URL(`${ROUTES.LOGIN}?error=verification_server_error`, request.url));
  }
}
