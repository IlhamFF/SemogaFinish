
import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { TestEntity } from "@/entities/test.entity";
import { SoalEntity } from "@/entities/soal.entity";
import { BankSoalTestEntity } from "@/entities/bank-soal-test.entity";
import { TestSubmissionEntity } from "@/entities/test-submission.entity";
import { getAuthenticatedUser } from "@/lib/auth-utils-node";
import * as z from "zod";
import { In } from "typeorm";

// GET: Mendapatkan soal untuk sebuah test
export async function GET(request: NextRequest, { params }: { params: { testId: string } }) {
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
    const bankSoalTestRepo = dataSource.getRepository(BankSoalTestEntity);
    const soalRepo = dataSource.getRepository(SoalEntity);

    // Security Check: If user is a student, they must have an "in-progress" submission
    if (authenticatedUser.role === 'siswa') {
        const submission = await submissionRepo.findOne({
            where: { testId, siswaId: authenticatedUser.id, status: 'Berlangsung' }
        });
        if (!submission) {
            return NextResponse.json({ message: "Anda harus memulai test terlebih dahulu untuk dapat melihat soal." }, { status: 403 });
        }
    } else if (!['guru', 'admin', 'superadmin'].includes(authenticatedUser.role)) {
        return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
    }

    const testSoalLinks = await bankSoalTestRepo.find({ where: { testId } });
    if (testSoalLinks.length === 0) {
      return NextResponse.json([]);
    }

    const soalIds = testSoalLinks.map(link => link.soalId);
    const soalList = await soalRepo.find({ where: { id: In(soalIds) }, relations: ["mapel"] });

    // For students, we should not send the `kunciJawaban`
    if (authenticatedUser.role === 'siswa') {
        return NextResponse.json(soalList.map(({ kunciJawaban, ...soal }) => soal));
    }

    return NextResponse.json(soalList);
  } catch (error: any) {
    console.error(`Error fetching soal for test ${testId}:`, error);
    return NextResponse.json({ message: "Gagal mengambil daftar soal.", error: error.message }, { status: 500 });
  }
}

const updateSoalSchema = z.object({
  soalIds: z.array(z.string().uuid()),
});

// POST: Mengatur/memperbarui daftar soal untuk sebuah test
export async function POST(request: NextRequest, { params }: { params: { testId: string } }) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser || !['guru', 'admin', 'superadmin'].includes(authenticatedUser.role)) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }

  const { testId } = params;
  if (!testId) {
    return NextResponse.json({ message: "ID test tidak valid." }, { status: 400 });
  }

  try {
    const body = await request.json();
    const validation = updateSoalSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: "Input tidak valid.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    const { soalIds } = validation.data;

    const dataSource = await getInitializedDataSource();
    const testRepo = dataSource.getRepository(TestEntity);
    const test = await testRepo.findOneBy({ id: testId });
    if (!test) {
      return NextResponse.json({ message: "Test tidak ditemukan." }, { status: 404 });
    }
    if (authenticatedUser.role === 'guru' && test.uploaderId !== authenticatedUser.id) {
      return NextResponse.json({ message: "Anda tidak berhak mengubah test ini." }, { status: 403 });
    }

    const bankSoalTestRepo = dataSource.getRepository(BankSoalTestEntity);
    
    await dataSource.transaction(async transactionalEntityManager => {
      // Hapus semua link soal yang ada untuk test ini
      await transactionalEntityManager.delete(BankSoalTestEntity, { testId });
      
      // Buat link baru
      if (soalIds.length > 0) {
        const newLinks = soalIds.map(soalId => ({ testId, soalId }));
        await transactionalEntityManager.insert(BankSoalTestEntity, newLinks);
      }
      // Update soalCount on the test entity
      await transactionalEntityManager.update(TestEntity, testId, { soalCount: soalIds.length });
    });

    return NextResponse.json({ message: `${soalIds.length} soal berhasil diatur untuk test ini.` });
  } catch (error: any) {
    console.error(`Error setting soal for test ${testId}:`, error);
    return NextResponse.json({ message: "Gagal mengatur daftar soal.", error: error.message }, { status: 500 });
  }
}
