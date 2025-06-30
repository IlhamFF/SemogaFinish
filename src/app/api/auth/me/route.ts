import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { UserEntity } from "@/entities/user.entity";
import { getAuthenticatedUser } from "@/lib/auth-utils-node";

export async function GET(request: NextRequest) {
  try {
    const decodedToken = getAuthenticatedUser(request);
    if (!decodedToken) {
      return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
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
    
    const { image, ...rest } = user;
    const userResponse = {
      ...rest,
      avatarUrl: image,
    };

    return NextResponse.json(userResponse);

  } catch (error) {
    console.error("Fetch current user error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}
