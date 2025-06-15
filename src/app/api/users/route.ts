
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getInitializedDataSource } from "@/lib/data-source";
import { UserEntity } from "@/entities/user.entity";
import bcrypt from "bcryptjs";
import * as z from "zod";
import type { Role } from "@/types";
import { ROLES } from "@/lib/constants";

const userCreateSchema = z.object({
  email: z.string().email({ message: "Alamat email tidak valid." }),
  password: z.string().min(6, { message: "Kata sandi minimal 6 karakter." }),
  role: z.enum(['admin', 'guru', 'siswa', 'pimpinan'], { required_error: "Peran wajib diisi." }),
  fullName: z.string().min(2, { message: "Nama lengkap minimal 2 karakter."}),
  name: z.string().min(2, { message: "Nama panggilan minimal 2 karakter."}).optional(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Format tanggal lahir YYYY-MM-DD" }).optional().nullable(),
  bio: z.string().optional().nullable(),
  nis: z.string().optional().nullable(),
  nip: z.string().optional().nullable(),
  joinDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Format tanggal bergabung YYYY-MM-DD" }).optional().nullable(),
  avatarUrl: z.string().url({ message: "URL Avatar tidak valid." }).optional().nullable().or(z.literal('')),
  kelas: z.string().optional().nullable(),
  mataPelajaran: z.string().optional().nullable(), // Can be an array of strings if multiple subjects
});

// GET /api/users - Mendapatkan semua pengguna (admin only)
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }

  try {
    const dataSource = await getInitializedDataSource();
    const userRepo = dataSource.getRepository(UserEntity);
    const users = await userRepo.find({
      select: [ // Explicitly select fields to exclude passwordHash
        "id", "name", "email", "emailVerified", "image", "role", "isVerified", 
        "fullName", "phone", "address", "birthDate", "bio", "nis", "nip", 
        "joinDate", "kelasId", "mataPelajaran", "createdAt", "updatedAt"
      ],
      order: { createdAt: "DESC" }
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}

// POST /api/users - Membuat pengguna baru (admin only)
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validation = userCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Input tidak valid.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { email, password, role, fullName, name, ...profileData } = validation.data;

    const dataSource = await getInitializedDataSource();
    const userRepo = dataSource.getRepository(UserEntity);

    const existingUser = await userRepo.findOne({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: "Email sudah terdaftar." }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUserEntity = userRepo.create({
      email,
      passwordHash: hashedPassword,
      role: role as Role,
      fullName: fullName,
      name: name || email.split('@')[0],
      isVerified: true, // Admin created users are auto-verified
      emailVerified: new Date(),
      image: profileData.avatarUrl || undefined,
      phone: profileData.phone,
      address: profileData.address,
      birthDate: profileData.birthDate,
      bio: profileData.bio,
      nis: profileData.nis,
      nip: profileData.nip,
      joinDate: profileData.joinDate || new Date().toISOString().split('T')[0],
      kelasId: profileData.kelas, // Assuming 'kelas' from form becomes 'kelasId'
      mataPelajaran: profileData.mataPelajaran ? [profileData.mataPelajaran] : undefined, // Example if single string to array
    });

    const savedUser = await userRepo.save(newUserEntity);
    
    const { passwordHash, ...userResponse } = savedUser; // Exclude passwordHash from response
    return NextResponse.json(userResponse, { status: 201 });

  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}
