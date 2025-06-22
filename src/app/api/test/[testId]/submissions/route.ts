
import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { TestSubmissionEntity } from "@/entities/test-submission.entity";
import { TestEntity } from "@/entities/test.entity";
import { getAuthenticatedUser } from "@/lib/auth-utils-node";
import { FindOptionsWhere } from "typeorm";

export async function GET(
  request: NextRequest,
  { params }: { params: { testId: string } }
) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
  }

  const { testId } = params;
  if (!testId) {
    return NextResponse.json({ message: "ID test tidak valid." }, { status: 400 });
  }

  try {
    const dataSource = await getInitializedDataSource();
    const testRepo = dataSource.getRepository(TestEntity);
    const submissionRepo = dataSource.getRepository(TestSubmissionEntity);

    // Validasi bahwa test ada dan pengguna yang meminta adalah pengunggah test atau admin
    const test = await testRepo.findOneBy({ id: testId });
    if (!test) {
      return NextResponse.json({ message: "Test tidak ditemukan." }, { status: 404 });
    }
    if (authenticatedUser.role !== 'admin' && authenticatedUser.role !== 'superadmin' && test.uploaderId !== authenticatedUser.id) {
      return NextResponse.json({ message: "Akses ditolak. Anda bukan pemilik test ini." }, { status: 403 });
    }

    const submissions = await submissionRepo.find({
      where: { testId: testId },
      relations: ["siswa", "test"], // sertakan relasi test untuk info test
      order: { waktuMulai: "DESC" },
    });
    
    // Format data siswa agar tidak mengirim semua field
    const formattedSubmissions = submissions.map(sub => ({
        ...sub,
        siswa: sub.siswa ? {
            id: sub.siswa.id,
            fullName: sub.siswa.fullName,
            name: sub.siswa.name,
            email: sub.siswa.email,
            nis: sub.siswa.nis, // jika diperlukan
            kelasId: sub.siswa.kelasId // jika diperlukan
        } : undefined,
        test: sub.test ? { // Minimal info test, bisa ditambah jika perlu
            id: sub.test.id,
            judul: sub.test.judul,
            mapel: sub.test.mapel
        } : undefined
    }));

    return NextResponse.json(formattedSubmissions);
  } catch (error: any) {
    console.error("Error fetching test submissions:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server.", details: error.message }, { status: 500 });
  }
}

