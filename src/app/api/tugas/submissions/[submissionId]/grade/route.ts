
import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { TugasSubmissionEntity } from "@/entities/tugas-submission.entity";
import { TugasEntity } from "@/entities/tugas.entity";
import * as z from "zod";
import { getAuthenticatedUser } from "@/lib/auth-utils-node";

const gradeSubmissionSchema = z.object({
  nilai: z.coerce.number().min(0).max(100).nullable(),
  feedbackGuru: z.string().optional().nullable(),
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
    return NextResponse.json({ message: "ID submission tidak valid." }, { status: 400 });
  }

  try {
    const body = await request.json();
    const validation = gradeSubmissionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Input tidak valid.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { nilai, feedbackGuru } = validation.data;

    const dataSource = await getInitializedDataSource();
    const submissionRepo = dataSource.getRepository(TugasSubmissionEntity);
    
    const submission = await submissionRepo.findOne({ 
      where: { id: submissionId },
      relations: ["tugas"] // Untuk mendapatkan uploaderId dari TugasEntity
    });

    if (!submission) {
      return NextResponse.json({ message: "Data pengumpulan tugas tidak ditemukan." }, { status: 404 });
    }
    if (!submission.tugas) {
      return NextResponse.json({ message: "Tugas terkait tidak ditemukan." }, { status: 404 });
    }

    // Verifikasi bahwa pengguna yang melakukan aksi adalah uploader tugas atau admin/superadmin
    if (submission.tugas.uploaderId !== authenticatedUser.id && !['admin', 'superadmin'].includes(authenticatedUser.role)) {
      return NextResponse.json({ message: "Akses ditolak. Anda bukan pengajar tugas ini." }, { status: 403 });
    }

    submission.nilai = nilai;
    submission.feedbackGuru = feedbackGuru;
    submission.status = "Dinilai"; // Set status menjadi Dinilai

    await submissionRepo.save(submission);
    
    // Ambil data yang sudah diperbarui dengan relasi siswa untuk respons
    const updatedSubmissionWithSiswa = await submissionRepo.findOne({
        where: { id: submission.id },
        relations: ["siswa", "tugas"], // Tambahkan relasi yang diperlukan
    });
    
    if (!updatedSubmissionWithSiswa) {
        return NextResponse.json({ message: "Gagal mengambil data submission setelah update." }, { status: 500 });
    }

    return NextResponse.json({
        ...updatedSubmissionWithSiswa,
        siswa: updatedSubmissionWithSiswa.siswa ? {
            id: updatedSubmissionWithSiswa.siswa.id,
            fullName: updatedSubmissionWithSiswa.siswa.fullName,
            name: updatedSubmissionWithSiswa.siswa.name,
            email: updatedSubmissionWithSiswa.siswa.email,
            kelasId: updatedSubmissionWithSiswa.siswa.kelasId
        } : undefined,
        tugas: updatedSubmissionWithSiswa.tugas ? {
            id: updatedSubmissionWithSiswa.tugas.id,
            judul: updatedSubmissionWithSiswa.tugas.judul,
            mapel: updatedSubmissionWithSiswa.tugas.mapel,
        } : undefined,
    }, { status: 200 });

  } catch (error: any) {
    console.error("Error grading submission:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server.", details: error.message }, { status: 500 });
  }
}
