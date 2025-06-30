import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { TestSubmissionEntity } from "@/entities/test-submission.entity";
import { TestEntity } from "@/entities/test.entity";
import * as z from "zod";
import { getAuthenticatedUser } from "@/lib/auth-utils-node";

export async function POST(
  request: NextRequest,
  { params }: { params: { testId: string } }
) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
  }
  if (authenticatedUser.role !== 'siswa' && authenticatedUser.role !== 'superadmin') {
      return NextResponse.json({ message: "Hanya siswa yang dapat memulai test." }, { status: 403 });
  }

  const { testId } = params;
  if (!testId) {
    return NextResponse.json({ message: "ID test tidak valid." }, { status: 400 });
  }

  try {
    const dataSource = await getInitializedDataSource();
    const testRepo = dataSource.getRepository(TestEntity);
    const submissionRepo = dataSource.getRepository(TestSubmissionEntity);

    const test = await testRepo.findOneBy({ id: testId });
    if (!test) {
      return NextResponse.json({ message: "Test tidak ditemukan." }, { status: 404 });
    }

    if (test.status !== "Terjadwal" && test.status !== "Berlangsung") {
        return NextResponse.json({ message: `Test "${test.judul}" tidak dapat dimulai karena statusnya: ${test.status}.` }, { status: 400 });
    }
    
    if (authenticatedUser.role === 'siswa') {
        const siswaKelas = authenticatedUser.kelasId;
        if (!siswaKelas) {
            return NextResponse.json({ message: "Informasi kelas siswa tidak ditemukan." }, { status: 403 });
        }
        const gradeLevel = siswaKelas.split(' ')[0];
        const generalClass = `Semua Kelas ${gradeLevel}`;
        const isAllowed = test.kelas === siswaKelas || test.kelas.trim() === generalClass.trim();
        if (!isAllowed) {
            return NextResponse.json({ message: "Anda tidak terdaftar untuk test di kelas ini." }, { status: 403 });
        }
    }

    let existingSubmission = await submissionRepo.findOne({
      where: { siswaId: authenticatedUser.id, testId: testId },
      relations: ["siswa", "test"],
    });

    if (existingSubmission) {
      if (existingSubmission.status === "Selesai" || existingSubmission.status === "Dinilai") {
        return NextResponse.json({ message: "Anda sudah menyelesaikan test ini.", submission: existingSubmission }, { status: 409 });
      }
      return NextResponse.json(existingSubmission);
    }
    
    try {
        const newSubmission = submissionRepo.create({
            siswaId: authenticatedUser.id,
            testId: testId,
            waktuMulai: new Date(),
            status: "Berlangsung",
        });
        await submissionRepo.save(newSubmission);
        
        const savedSubmissionWithRelations = await submissionRepo.findOne({
            where: { id: newSubmission.id },
            relations: ["siswa", "test"],
        });

        return NextResponse.json(savedSubmissionWithRelations, { status: 201 });
    } catch (error: any) {
        if (error.code === '23505') { // Handle race condition
            const submissionAfterRace = await submissionRepo.findOne({
                where: { siswaId: authenticatedUser.id, testId: testId },
                relations: ["siswa", "test"],
            });
            return NextResponse.json(submissionAfterRace);
        }
        throw error;
    }

  } catch (error: any) {
    console.error("Error starting test:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server.", details: error.message }, { status: 500 });
  }
}
