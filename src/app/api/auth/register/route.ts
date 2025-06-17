
import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { UserEntity } from "@/entities/user.entity";
import bcrypt from "bcryptjs";
import * as z from "zod";

const registerSchema = z.object({
  email: z.string().email({ message: "Alamat email tidak valid." }),
  password: z.string().min(6, { message: "Kata sandi minimal 6 karakter." }),
  // Add fullName if you want to capture it during registration
  // fullName: z.string().min(2, { message: "Nama lengkap minimal 2 karakter." }).optional(),
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

    const newUser = userRepo.create({
      email,
      passwordHash: hashedPassword,
      role: 'siswa', // Default role for new registrations
      isVerified: false, // Users start as unverified by default for this system
      name: email.split('@')[0], 
      fullName: email.split('@')[0], // Or capture from form
      joinDate: new Date().toISOString().split('T')[0],
    });

    await userRepo.save(newUser);
    
    // For this simple token auth, we won't auto-login or send verification emails from here.
    // User will need to login separately. Verification flow is removed for simplicity.
    return NextResponse.json({ message: "Pendaftaran berhasil. Silakan login.", userId: newUser.id }, { status: 201 });

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}
