
import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { UserEntity } from "@/entities/user.entity";
import { verifyToken, getTokenFromRequest } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
    }

    const decodedToken = verifyToken(token);
    if (!decodedToken) {
      return NextResponse.json({ message: "Token tidak valid atau kedaluwarsa" }, { status: 401 });
    }

    const dataSource = await getInitializedDataSource();
    const userRepo = dataSource.getRepository(UserEntity);
    const user = await userRepo.findOne({
      where: { id: decodedToken.id },
      select: [
        "id", "name", "email", "emailVerified", "image", "role", "isVerified", 
        "fullName", "phone", "address", "birthDate", "bio", "nis", "nip", 
        "joinDate", "kelasId", "mataPelajaran", "createdAt", "updatedAt"
      ]
    });

    if (!user) {
      return NextResponse.json({ message: "Pengguna tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(user);

  } catch (error) {
    console.error("Fetch current user error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}
