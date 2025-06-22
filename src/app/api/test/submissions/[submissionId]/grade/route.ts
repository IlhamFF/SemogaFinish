
import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { TestSubmissionEntity } from "@/entities/test-submission.entity";
import { TestEntity } from "@/entities/test.entity";
import * as z from "zod";
import { getAuthenticatedUser } from "@/lib/auth-utils-node";

const gradeTestSubmissionSchema = z.object({
  nilai: z.coerce.number().min(0).max(100).nullable(),
  catatanGuru: z.string().optional().nullable(),
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
    const validation = gradeTestSubmissionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Input tidak valid.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { nilai, catatanGuru } = validation.data;

    const dataSource = await getInitializedDataSource();
    const submissionRepo = dataSource.getRepository(TestSubmissionEntity);
    
    const submission = await submissionRepo.findOne({ 
      where: { id: submissionId },
      relations: ["test", "siswa"] // Pastikan relasi test dan siswa dimuat
    });

    if (!submission) {
      return NextResponse.json({ message: "Data pengerjaan test tidak ditemukan." }, { status: 404 });
    }
    if (!submission.test) {
      return NextResponse.json({ message: "Test terkait tidak ditemukan." }, { status: 404 });
    }

    if (submission.test.uploaderId !== authenticatedUser.id && !['admin', 'superadmin'].includes(authenticatedUser.role)) {
      return NextResponse.json({ message: "Akses ditolak. Anda bukan pengajar test ini." }, { status: 403 });
    }

    submission.nilai = nilai;
    submission.catatanGuru = catatanGuru;
    submission.status = "Dinilai"; 

    await submissionRepo.save(submission);
    
    // Return the updated submission with necessary relations for the frontend
    return NextResponse.json({
        ...submission, // Ini sudah termasuk id, testId, siswaId, waktuMulai, dll.
        // Pastikan field yang penting untuk UI dikembalikan
        siswa: submission.siswa ? { // Hanya kirim data siswa yang relevan
            id: submission.siswa.id,
            fullName: submission.siswa.fullName,
            name: submission.siswa.name,
        } : undefined,
        test: submission.test ? { // Hanya kirim data test yang relevan
            id: submission.test.id,
            judul: submission.test.judul,
        } : undefined,
    }, { status: 200 });

  } catch (error: any) {
    console.error("Error grading test submission:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server.", details: error.message }, { status: 500 });
  }
}

    