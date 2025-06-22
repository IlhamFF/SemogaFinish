
import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { TugasSubmissionEntity } from "@/entities/tugas-submission.entity";
import { TugasEntity } from "@/entities/tugas.entity";
import { getAuthenticatedUser } from "@/lib/auth-utils-node";

export async function GET(
  request: NextRequest,
  { params }: { params: { tugasId: string } }
) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
  }

  const { tugasId } = params;
  if (!tugasId) {
    return NextResponse.json({ message: "ID tugas tidak valid." }, { status: 400 });
  }

  try {
    const dataSource = await getInitializedDataSource();
    const tugasRepo = dataSource.getRepository(TugasEntity);
    const submissionRepo = dataSource.getRepository(TugasSubmissionEntity);

    // Validasi bahwa tugas ada dan pengguna yang meminta adalah pengunggah tugas atau admin
    const tugas = await tugasRepo.findOneBy({ id: tugasId });
    if (!tugas) {
      return NextResponse.json({ message: "Tugas tidak ditemukan." }, { status: 404 });
    }
    if (authenticatedUser.role !== 'admin' && authenticatedUser.role !== 'superadmin' && tugas.uploaderId !== authenticatedUser.id) {
      return NextResponse.json({ message: "Akses ditolak. Anda bukan pemilik tugas ini." }, { status: 403 });
    }

    const submissions = await submissionRepo.find({
      where: { tugasId: tugasId },
      relations: ["siswa"], // sertakan relasi siswa untuk mendapatkan nama
      order: { dikumpulkanPada: "ASC" },
    });
    
    // Format data siswa agar tidak mengirim semua field
    const formattedSubmissions = submissions.map(sub => ({
        ...sub,
        siswa: sub.siswa ? {
            id: sub.siswa.id,
            fullName: sub.siswa.fullName,
            name: sub.siswa.name,
            email: sub.siswa.email,
        } : undefined
    }));

    return NextResponse.json(formattedSubmissions);
  } catch (error: any) {
    console.error("Error fetching tugas submissions:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server.", details: error.message }, { status: 500 });
  }
}
