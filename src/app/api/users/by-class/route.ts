
import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { UserEntity } from "@/entities/user.entity";
import { getAuthenticatedUser } from "@/lib/auth-utils-node";
import type { User } from "@/types";

export async function GET(request: NextRequest) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser || !['admin', 'superadmin', 'pimpinan'].includes(authenticatedUser.role)) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }

  try {
    const dataSource = await getInitializedDataSource();
    const userRepo = dataSource.getRepository(UserEntity);

    const students = await userRepo.find({
      where: { role: 'siswa' },
      order: { kelasId: "ASC", fullName: "ASC" },
      select: ["id", "fullName", "nis", "email", "kelasId", "joinDate"]
    });

    const groupedStudents = students.reduce((acc, student) => {
      const className = student.kelasId || "Tidak Terdaftar";
      if (!acc[className]) {
        acc[className] = [];
      }
      acc[className].push(student as User);
      return acc;
    }, {} as Record<string, User[]>);

    return NextResponse.json(groupedStudents);

  } catch (error) {
    console.error("Error fetching users by class:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}
