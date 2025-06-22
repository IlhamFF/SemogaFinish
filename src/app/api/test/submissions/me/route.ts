import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { TestSubmissionEntity } from "@/entities/test-submission.entity";
import { getAuthenticatedUser } from "@/lib/auth-utils-node";
import { FindOptionsWhere } from "typeorm";

export async function GET(request: NextRequest) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
  }
  if (authenticatedUser.role !== 'siswa' && authenticatedUser.role !== 'superadmin') {
      return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const testId = searchParams.get("testId");


  try {
    const dataSource = await getInitializedDataSource();
    const submissionRepo = dataSource.getRepository(TestSubmissionEntity);
    
    const whereConditions: FindOptionsWhere<TestSubmissionEntity> = {
        siswaId: authenticatedUser.id,
    };

    if (testId) {
        whereConditions.testId = testId;
    }

    const submissions = await submissionRepo.find({
      where: whereConditions,
      relations: ["test"], // Include test details
      order: { waktuMulai: "DESC" },
    });
    
    return NextResponse.json(submissions.map(sub => ({
        ...sub,
        test: sub.test ? {
            id: sub.test.id,
            judul: sub.test.judul,
            mapel: sub.test.mapel,
            tipe: sub.test.tipe,
            status: sub.test.status // Status dari TestEntity, bukan TestSubmissionEntity
        } : undefined
    })));
  } catch (error: any) {
    console.error("Error fetching user's test submissions:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server.", details: error.message }, { status: 500 });
  }
}
