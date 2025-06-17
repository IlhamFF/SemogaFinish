
import "reflect-metadata"; // Ensure this is the very first import
import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth/next"; // Removed
// import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Removed
import { getInitializedDataSource } from "@/lib/data-source";
import { UserEntity } from "@/entities/user.entity";
// import bcrypt from "bcryptjs"; // Removed - password handled by Firebase
import * as z from "zod";
import type { Role } from "@/types";
import { ROLES } from "@/lib/constants";

const userCreateSchema = z.object({
  email: z.string().email({ message: "Alamat email tidak valid." }),
  // password: z.string().min(6, { message: "Kata sandi minimal 6 karakter." }), // Password tidak dihandle di sini lagi
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
  avatarUrl: z.string().url({ message: "URL Avatar tidak valid." }).optional().nullable().or(z.literal('')),
  kelas: z.string().optional().nullable(), // This will map to kelasId in entity
  mataPelajaran: z.string().optional().nullable(), 
  isVerified: z.boolean().optional().default(false), // Default to false, can be overridden
  firebaseUid: z.string().optional().nullable(), // Added firebaseUid
});

// GET /api/users - Mendapatkan semua pengguna (admin only)
export async function GET(request: NextRequest) {
  // TODO: Implement server-side Firebase token verification
  // const session = await getServerSession(authOptions); // Removed
  // if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) { // Removed
  //   return NextResponse.json({ message: "Akses ditolak." }, { status: 403 }); // Removed
  // } // Removed

  try {
    const dataSource = await getInitializedDataSource();
    const userRepo = dataSource.getRepository(UserEntity);
    const users = await userRepo.find({
      select: [ 
        "id", "name", "email", "emailVerified", "image", "role", "isVerified", 
        "fullName", "phone", "address", "birthDate", "bio", "nis", "nip", 
        "joinDate", "kelasId", "mataPelajaran", "firebaseUid", "createdAt", "updatedAt" // Added firebaseUid
      ],
      order: { createdAt: "DESC" }
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}

// POST /api/users - Membuat profil pengguna lokal baru (oleh admin atau setelah registrasi Firebase)
export async function POST(request: NextRequest) {
  // TODO: Implement server-side Firebase token verification for admin/system calls
  // const session = await getServerSession(authOptions); // Removed
  // if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) { // Removed
  //   // Allow if coming from register flow (no session yet, but identified by a different mechanism if needed)
  //   // For now, assume if it's a POST, it's either admin or trusted register flow
  //   // return NextResponse.json({ message: "Akses ditolak." }, { status: 403 }); // Removed
  // } // Removed

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

    // Password is no longer handled here, it's managed by Firebase Auth.
    // const hashedPassword = await bcrypt.hash(password, 10); // Removed

    const newUserEntity = userRepo.create({
      email,
      // passwordHash: hashedPassword, // Removed
      firebaseUid: firebaseUid, // Store Firebase UID
      role: role as Role,
      fullName: fullName,
      name: name || email.split('@')[0],
      isVerified: profileData.isVerified, // isVerified now comes from payload (e.g., false from register, true if admin creates)
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
    
    // const { passwordHash, ...userResponse } = savedUser; // passwordHash already removed from entity for response
    return NextResponse.json(savedUser, { status: 201 });

  } catch (error: any) {
    console.error("Error creating user profile:", error);
     if (error.code === '23505') { // Unique constraint violation
        let field = "Email atau Firebase UID";
        if (error.detail?.includes("email")) field = "Email";
        else if (error.detail?.includes("firebaseUid")) field = "Firebase UID";
        return NextResponse.json({ message: `${field} sudah ada.` }, { status: 409 });
    }
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}
