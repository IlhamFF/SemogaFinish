
import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { TestSubmissionEntity } from "@/entities/test-submission.entity";
import { TestEntity } from "@/entities/test.entity"; // Import TestEntity
import * as z from "zod";
import { getAuthenticatedUser } from "@/lib/auth-utils-node";

const finishTestSchema = z.object({
  jawabanSiswa: z.record(z.string(), z.any()).optional().nullable(), // Allow any structure for answers
});

export async function POST(
  request: NextRequest,
  { params }: { params: { submissionId: string } }
) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
  }

  const { submissionId } = params;
  if (!submissionId) {
    return NextResponse.json({ message: "ID submission test tidak valid." }, { status: 400 });
  }

  try {
    const body = await request.json();
    const validation = finishTestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Input tidak valid.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    const { jawabanSiswa } = validation.data;

    const dataSource = await getInitializedDataSource();
    const submissionRepo = dataSource.getRepository(TestSubmissionEntity);
    const testSubmission = await submissionRepo.findOne({
        where: { id: submissionId, siswaId: authenticatedUser.id }, // Pastikan siswa yang benar
        relations: ["test"]
    });

    if (!testSubmission) {
      return NextResponse.json({ message: "Data pengerjaan test tidak ditemukan atau Anda tidak berhak mengaksesnya." }, { status: 404 });
    }
    
    if (testSubmission.status !== "Berlangsung") {
        return NextResponse.json({ message: "Test ini tidak sedang berlangsung atau sudah selesai." }, { status: 400 });
    }

    testSubmission.waktuSelesai = new Date();
    testSubmission.status = "Selesai"; // Bisa "Menunggu Penilaian" atau "Selesai" tergantung alur
    if (jawabanSiswa) {
      testSubmission.jawabanSiswa = jawabanSiswa;
    }

    await submissionRepo.save(testSubmission);
    
    // Ambil data yang sudah diperbarui dengan relasi siswa untuk respons
    const updatedSubmissionWithRelations = await submissionRepo.findOne({
        where: { id: testSubmission.id },
        relations: ["siswa", "test"],
    });

    return NextResponse.json({
        ...updatedSubmissionWithRelations,
        siswa: updatedSubmissionWithRelations?.siswa ? {
            id: updatedSubmissionWithRelations.siswa.id,
            fullName: updatedSubmissionWithRelations.siswa.fullName,
            name: updatedSubmissionWithRelations.siswa.name,
        } : undefined,
        test: updatedSubmissionWithRelations?.test ? {
            id: updatedSubmissionWithRelations.test.id,
            judul: updatedSubmissionWithRelations.test.judul,
            mapel: updatedSubmissionWithRelations.test.mapel,
        } : undefined,
    }, { status: 200 });

  } catch (error: any) {
    console.error("Error finishing test submission:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server.", details: error.message }, { status: 500 });
  }
}
