
import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { TugasSubmissionEntity } from "@/entities/tugas-submission.entity";
import { TugasEntity } from "@/entities/tugas.entity";
import * as z from "zod";
import { getAuthenticatedUser } from "@/lib/auth-utils-node";
import { FindOptionsWhere } from "typeorm";
import { isPast, parseISO } from "date-fns";

const submissionCreateSchema = z.object({
  tugasId: z.string().uuid("ID tugas tidak valid."),
  namaFileJawaban: z.string().optional().nullable(),
  catatanSiswa: z.string().optional().nullable(),
});

// GET /api/tugas/submissions/me - Get all submissions for the currently logged-in user (siswa)
export async function GET(request: NextRequest) {
    const authenticatedUser = getAuthenticatedUser(request);
    if (!authenticatedUser) {
        return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
    }
    if (authenticatedUser.role !== 'siswa' && authenticatedUser.role !== 'superadmin') {
        return NextResponse.json({ message: "Akses ditolak. Hanya siswa yang dapat melihat submissions mereka." }, { status: 403 });
    }
    
    try {
        const dataSource = await getInitializedDataSource();
        const submissionRepo = dataSource.getRepository(TugasSubmissionEntity);
        const submissions = await submissionRepo.find({
            where: { siswaId: authenticatedUser.id },
            relations: ["tugas", "siswa"], // Include task details
            order: { createdAt: "DESC" }
        });

        // Filter sensitive data before sending
        const safeSubmissions = submissions.map(sub => ({
            ...sub,
            siswa: undefined, // Don't need to send siswa data back to the siswa itself
            tugas: sub.tugas ? { id: sub.tugas.id, judul: sub.tugas.judul } : undefined, // Send only necessary task info
        }));

        return NextResponse.json(safeSubmissions);
    } catch (error: any) {
        console.error("Error fetching user's submissions:", error);
        return NextResponse.json({ message: "Terjadi kesalahan internal server.", details: error.message }, { status: 500 });
    }
}


// POST /api/tugas/submissions - Create a new submission for a tugas
export async function POST(request: NextRequest) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
  }
  if (authenticatedUser.role !== 'siswa' && authenticatedUser.role !== 'superadmin') {
      return NextResponse.json({ message: "Hanya siswa yang dapat mengumpulkan tugas." }, { status: 403 });
  }
  const siswaId = authenticatedUser.id;

  try {
    const body = await request.json();
    const validation = submissionCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Input tidak valid.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    const { tugasId, namaFileJawaban, catatanSiswa } = validation.data;

    const dataSource = await getInitializedDataSource();
    const submissionRepo = dataSource.getRepository(TugasSubmissionEntity);
    const tugasRepo = dataSource.getRepository(TugasEntity);

    // Validasi tugas
    const tugas = await tugasRepo.findOneBy({ id: tugasId });
    if (!tugas) {
      return NextResponse.json({ message: "Tugas tidak ditemukan." }, { status: 404 });
    }
    // Cek apakah siswa ada di kelas tugas tersebut
    if (tugas.kelas !== (authenticatedUser as any).kelasId) {
        return NextResponse.json({ message: "Anda tidak terdaftar untuk tugas di kelas ini." }, { status: 403 });
    }

    // Cek apakah sudah pernah submit
    const existingSubmission = await submissionRepo.findOne({ where: { siswaId, tugasId } });
    if (existingSubmission) {
      return NextResponse.json({ message: "Anda sudah pernah mengumpulkan tugas ini." }, { status: 409 });
    }

    const dikumpulkanPada = new Date();
    const tenggat = parseISO(tugas.tenggat.toString()); // Convert string from DB to Date
    const status = isPast(tenggat) ? "Terlambat" : "Menunggu Penilaian";

    const newSubmission = submissionRepo.create({
      siswaId,
      tugasId,
      namaFileJawaban,
      fileUrlJawaban: namaFileJawaban ? `/uploads/jawaban/${Date.now()}-${namaFileJawaban.replace(/\s+/g, '_')}` : undefined,
      catatanSiswa,
      dikumpulkanPada,
      status,
    });

    await submissionRepo.save(newSubmission);
    
    return NextResponse.json(newSubmission, { status: 201 });

  } catch (error: any) {
    console.error("Error creating submission:", error);
    if (error.code === '23505') { 
        return NextResponse.json({ message: "Anda sudah pernah mengumpulkan tugas ini (dari DB)." }, { status: 409 });
    }
    return NextResponse.json({ message: "Terjadi kesalahan internal server.", details: error.message }, { status: 500 });
  }
}
