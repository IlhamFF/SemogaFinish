
import { NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { UserEntity } from "@/entities/user.entity";
import bcrypt from "bcryptjs";
import * as z from "zod";

const registerSchema = z.object({
  email: z.string().email({ message: "Alamat email tidak valid." }),
  password: z.string().min(6, { message: "Kata sandi minimal 6 karakter." }),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Input tidak valid.", errors: validation.error.formErrors.fieldErrors }, { status: 400 });
    }

    const { email, password } = validation.data;

    const dataSource = await getInitializedDataSource();
    const userRepo = dataSource.getRepository(UserEntity);

    const existingUser = await userRepo.findOne({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: "Email sudah terdaftar." }, { status: 409 }); // 409 Conflict
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds = 10

    const newUser = userRepo.create({
      email,
      passwordHash: hashedPassword,
      role: 'siswa', // Default role for new registrations
      isVerified: false, // Users start as unverified
      name: email.split('@')[0], // Default name
      fullName: email.split('@')[0], // Default full name
      joinDate: new Date().toISOString().split('T')[0], // Set join date
      // avatarUrl can be set to a default placeholder if desired
    });

    await userRepo.save(newUser);

    // Do not sign in the user here directly. Let them go through the verification flow.
    // The UserForm on the frontend will likely redirect to /verify-email or show a message.
    return NextResponse.json({ message: "Pendaftaran berhasil. Silakan verifikasi email Anda.", userId: newUser.id }, { status: 201 });

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}
