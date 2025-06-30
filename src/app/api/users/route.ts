import "reflect-metadata"; 
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { UserEntity } from "@/entities/user.entity";
import * as z from "zod";
import type { Role } from "@/types";
import { getAuthenticatedUser } from "@/lib/auth-utils-node";
import bcrypt from "bcryptjs";
import type { FindOptionsWhere } from "typeorm";

const userCreateSchema = z.object({
  email: z.string().email({ message: "Alamat email tidak valid." }),
  password: z.string().min(6, { message: "Kata sandi minimal 6 karakter." }).optional().or(z.literal('')),
  role: z.enum(['admin', 'guru', 'siswa', 'pimpinan'], { required_error: "Peran wajib diisi." }),
  fullName: z.string().min(2, { message: "Nama lengkap minimal 2 karakter."}),
  name: z.string().min(2, { message: "Nama panggilan minimal 2 karakter."}).optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Format tanggal lahir YYYY-MM-DD" }).optional().nullable(),
  bio: z.string().optional().nullable(),
  nis: z.string().optional().nullable(),
  nip: z.string().optional().nullable(),
  joinDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Format tanggal bergabung YYYY-MM-DD" }).optional().nullable(),
  avatarUrl: z.string().optional().nullable().or(z.literal('')),
  kelas: z.string().optional().nullable(), 
  mataPelajaran: z.array(z.string()).optional().nullable(),
  isVerified: z.boolean().optional().default(false)
});

export async function GET(request: NextRequest) {
  const authenticatedUser = getAuthenticatedUser();
  if (!authenticatedUser) {
    return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
  }
  if (!['admin', 'superadmin', 'guru'].includes(authenticatedUser.role)) {
    return NextResponse.json({ message: "Akses ditolak. Anda tidak memiliki izin untuk melihat daftar pengguna." }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    const dataSource = await getInitializedDataSource();
    const userRepo = dataSource.getRepository(UserEntity);

    const where: FindOptionsWhere<UserEntity> = {};
    if (role && ['admin', 'guru', 'siswa', 'pimpinan'].includes(role)) {
        where.role = role as Role;
    }
    
    const users = await userRepo.find({
      where,
      select: [ 
        "id", "name", "email", "emailVerified", "image", "role", "isVerified", 
        "fullName", "phone", "address", "birthDate", "bio", "nis", "nip", 
        "joinDate", "kelasId", "mataPelajaran", "createdAt", "updatedAt"
      ],
      order: { createdAt: "DESC" }
    });

    const userListResponse = users.map(user => {
      const { image, ...rest } = user;
      return { ...rest, avatarUrl: image };
    });

    return NextResponse.json(userListResponse);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authenticatedUser = getAuthenticatedUser();
  if (!authenticatedUser) {
    return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
  }
  if (!['admin', 'superadmin'].includes(authenticatedUser.role)) {
    return NextResponse.json({ message: "Akses ditolak. Hanya admin yang dapat membuat pengguna baru." }, { status: 403 });
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

    const existingUserByEmail = await userRepo.findOne({ where: { email } });
    if (existingUserByEmail) {
      return NextResponse.json({ message: "Email sudah terdaftar di database lokal." }, { status: 409 });
    }

    const newUserEntity = userRepo.create({
      email,
      role: role as Role,
      fullName: fullName,
      name: name || email.split('@')[0],
      isVerified: profileData.isVerified, 
      emailVerified: profileData.isVerified ? new Date() : null,
      image: profileData.avatarUrl || undefined,
      phone: profileData.phone,
      address: profileData.address,
      birthDate: profileData.birthDate,
      bio: profileData.bio,
      nis: profileData.nis,
      nip: profileData.nip,
      joinDate: profileData.joinDate || new Date().toISOString().split('T')[0],
      kelasId: profileData.kelas, 
      mataPelajaran: profileData.mataPelajaran || undefined,
    });
    
    if (password) {
        newUserEntity.passwordHash = await bcrypt.hash(password, 10);
    }

    const savedUser = await userRepo.save(newUserEntity);
    
    const { passwordHash, image, ...userResponse } = savedUser;
    return NextResponse.json({ ...userResponse, avatarUrl: image }, { status: 201 });

  } catch (error: any) {
    console.error("Error creating user profile:", error);
     if (error.code === '23505') { 
        let field = "Email";
        if (error.detail?.includes("email")) field = "Email";
        return NextResponse.json({ message: `${field} sudah ada.` }, { status: 409 });
    }
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}
