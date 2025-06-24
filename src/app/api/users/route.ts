
import "reflect-metadata"; 
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { UserEntity } from "@/entities/user.entity";
import * as z from "zod";
import type { Role } from "@/types";
import { getAuthenticatedUser } from "@/lib/auth-utils-node";

const userCreateSchema = z.object({
  email: z.string().email({ message: "Alamat email tidak valid." }),
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
  mataPelajaran: z.string().optional().nullable(), 
  isVerified: z.boolean().optional().default(false),
  firebaseUid: z.string().optional().nullable(), 
});

export async function GET(request: NextRequest) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
  }
  if (!['admin', 'superadmin'].includes(authenticatedUser.role)) {
    return NextResponse.json({ message: "Akses ditolak. Hanya admin yang dapat melihat daftar pengguna." }, { status: 403 });
  }

  try {
    const dataSource = await getInitializedDataSource();
    const userRepo = dataSource.getRepository(UserEntity);
    const users = await userRepo.find({
      select: [ 
        "id", "name", "email", "emailVerified", "image", "role", "isVerified", 
        "fullName", "phone", "address", "birthDate", "bio", "nis", "nip", 
        "joinDate", "kelasId", "mataPelajaran", "firebaseUid", "createdAt", "updatedAt"
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
  const authenticatedUser = getAuthenticatedUser(request);
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

    const { email, role, fullName, name, firebaseUid, ...profileData } = validation.data;

    const dataSource = await getInitializedDataSource();
    const userRepo = dataSource.getRepository(UserEntity);

    const existingUserByEmail = await userRepo.findOne({ where: { email } });
    if (existingUserByEmail) {
      return NextResponse.json({ message: "Email sudah terdaftar di database lokal." }, { status: 409 });
    }
    if (firebaseUid) {
      const existingUserByFirebaseUid = await userRepo.findOne({ where: { firebaseUid }});
      if (existingUserByFirebaseUid) {
        return NextResponse.json({ message: "Firebase UID sudah terdaftar di database lokal." }, { status: 409 });
      }
    }

    const newUserEntity = userRepo.create({
      email,
      firebaseUid: firebaseUid, 
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
      mataPelajaran: profileData.mataPelajaran ? [profileData.mataPelajaran] : undefined,
    });

    const savedUser = await userRepo.save(newUserEntity);
    
    const { passwordHash, image, ...userResponse } = savedUser;
    return NextResponse.json({ ...userResponse, avatarUrl: image }, { status: 201 });

  } catch (error: any) {
    console.error("Error creating user profile:", error);
     if (error.code === '23505') { 
        let field = "Email atau Firebase UID";
        if (error.detail?.includes("email")) field = "Email";
        else if (error.detail?.includes("firebaseUid")) field = "Firebase UID";
        return NextResponse.json({ message: `${field} sudah ada.` }, { status: 409 });
    }
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}
