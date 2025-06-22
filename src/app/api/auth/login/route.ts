
import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { UserEntity } from "@/entities/user.entity";
import bcrypt from "bcryptjs";
import * as z from "zod";
import { generateToken, setTokenCookie } from "@/lib/auth-utils-node";

const loginSchema = z.object({
  email: z.string().email({ message: "Alamat email tidak valid." }),
  password: z.string().min(6, { message: "Kata sandi minimal 6 karakter." }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Input tidak valid.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { email, password } = validation.data;

    const dataSource = await getInitializedDataSource();
    const userRepo = dataSource.getRepository(UserEntity);
    const user = await userRepo.findOne({ where: { email } });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ message: "Email atau kata sandi salah." }, { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json({ message: "Email atau kata sandi salah." }, { status: 401 });
    }

    // If user is siswa and not verified, prevent login (or handle as per your flow)
    // For this simple auth, we'll allow login but frontend should handle redirection based on isVerified.
    // if (user.role === 'siswa' && !user.isVerified) {
    //   return NextResponse.json({ message: "Akun belum diverifikasi." }, { status: 403 });
    // }

    const token = generateToken(user);
    
    const response = NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isVerified: user.isVerified,
      fullName: user.fullName,
      avatarUrl: user.image,
      // Add other fields as needed for the client session, but avoid sensitive ones
    });
    
    setTokenCookie(response, token);

    return response;

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}
