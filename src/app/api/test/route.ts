
import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth/next"; // REMOVED
// import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // REMOVED
import { getInitializedDataSource } from "@/lib/data-source";
import { TestEntity, type TestTipe, type TestStatus } from "@/entities/test.entity";
import * as z from "zod";
import { formatISO } from 'date-fns';
import type { FindManyOptions } from "typeorm";
import type { User } from '@/types'; // Import User from your types for session user structure


const testCreateSchema = z.object({
  judul: z.string().min(5, { message: "Judul test minimal 5 karakter." }),
  mapel: z.string({ required_error: "Mata pelajaran wajib dipilih." }),
  kelas: z.string({ required_error: "Kelas wajib dipilih." }),
  tanggal: z.date({ required_error: "Tanggal pelaksanaan wajib diisi." }),
  durasi: z.coerce.number().min(5, { message: "Durasi minimal 5 menit." }),
  tipe: z.enum(["Kuis", "Ulangan Harian", "UTS", "UAS", "Lainnya"], { required_error: "Tipe test wajib dipilih."}),
  jumlahSoal: z.coerce.number().min(1, { message: "Jumlah soal minimal 1."}).optional().nullable(),
  deskripsi: z.string().optional().nullable(),
  status: z.enum(["Draf", "Terjadwal", "Berlangsung", "Selesai", "Dinilai"]).optional().default("Draf"),
  uploaderId: z.string().uuid().optional(), // Will be taken from session/token
});

// GET /api/test - Mendapatkan daftar test
export async function GET(request: NextRequest) {
  // TODO: Implement server-side Firebase token verification
  // const session = await getServerSession(authOptions); // REMOVED
  // if (!session || !session.user || !['guru', 'superadmin', 'siswa', 'admin'].includes(session.user.role)) { // REMOVED
  //   return NextResponse.json({ message: "Akses ditolak." }, { status: 403 }); // REMOVED
  // } // REMOVED

  try {
    const dataSource = await getInitializedDataSource();
    const testRepo = dataSource.getRepository(TestEntity);
    
    const { searchParams } = new URL(request.url);
    const filterKelas = searchParams.get("kelas"); 
    // const currentUserRole = session?.user?.role; // Hypothetical
    // const currentUserId = session?.user?.id; // Hypothetical
    // const currentUserKelas = session?.user?.kelasId; // Hypothetical

    const queryOptions: FindManyOptions<TestEntity> = {
      relations: ["uploader"],
      order: { tanggal: "DESC", createdAt: "DESC" } as any,
      where: {} as any,
    };

    // TODO: Add role-based filtering when Firebase Auth is integrated on backend
    // if (currentUserRole === 'guru') {
    //     queryOptions.where.uploaderId = currentUserId;
    // } else if (currentUserRole === 'siswa') {
    //     if (!currentUserKelas) {
    //         return NextResponse.json({ message: "Informasi kelas siswa tidak ditemukan." }, { status: 400 });
    //     }
    //     queryOptions.where.kelas = currentUserKelas;
    // } else if ((currentUserRole === 'admin' || currentUserRole === 'superadmin') && filterKelas) {
    //     queryOptions.where.kelas = filterKelas;
    // }
    if (filterKelas) { // Simplified filter for now
        queryOptions.where.kelas = filterKelas;
    }

    const testList = await testRepo.find(queryOptions);

    return NextResponse.json(testList.map(t => ({
        ...t,
        tanggal: formatISO(new Date(t.tanggal)), 
        uploader: t.uploader ? { id: t.uploader.id, name: t.uploader.name, fullName: t.uploader.fullName, email: t.uploader.email } : undefined
    })));
  } catch (error) {
    console.error("Error fetching tests:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server.", details: (error as Error).message }, { status: 500 });
  }
}

// POST /api/test - Membuat test baru
export async function POST(request: NextRequest) {
  // TODO: Implement server-side Firebase token verification for guru/superadmin
  // const session = await getServerSession(authOptions); // REMOVED
  // if (!session || !session.user || (session.user.role !== 'guru' && session.user.role !== 'superadmin')) { // REMOVED
  //   return NextResponse.json({ message: "Akses ditolak." }, { status: 403 }); // REMOVED
  // } // REMOVED
  const body = await request.json();
  const uploaderIdFromBody = body.uploaderId; // Attempt to get from body (MOCK/DEMO)
  // const uploaderId = session?.user?.id; // Correct way if session was available
  if (!uploaderIdFromBody) {
      console.warn("Warning: uploaderId not found in request body or session for POST /api/test. Using mock ID. THIS IS NOT SECURE.");
      // return NextResponse.json({ message: "Uploader ID tidak ditemukan. Autentikasi diperlukan." }, { status: 401 });
  }
  const uploaderIdToUse = uploaderIdFromBody || "mock-user-id-for-test"; // MOCK

  try {
    if (body.tanggal) {
        body.tanggal = new Date(body.tanggal);
    }
    const validation = testCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Input tidak valid.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { judul, mapel, kelas, tanggal, durasi, tipe, jumlahSoal, deskripsi, status } = validation.data;

    const dataSource = await getInitializedDataSource();
    const testRepo = dataSource.getRepository(TestEntity);

    const newTest = testRepo.create({
      judul,
      mapel,
      kelas,
      tanggal,
      durasi,
      tipe: tipe as TestTipe,
      status: status as TestStatus,
      jumlahSoal: jumlahSoal ?? undefined,
      deskripsi,
      uploaderId: uploaderIdToUse,
    });

    const savedTest = await testRepo.save(newTest);
    
    const responseTest = await testRepo.findOne({where: {id: savedTest.id}, relations: ["uploader"]});

    return NextResponse.json({
        ...responseTest,
        tanggal: responseTest ? formatISO(new Date(responseTest.tanggal)) : null,
        uploader: responseTest?.uploader ? { id: responseTest.uploader.id, name: responseTest.uploader.name, fullName: responseTest.uploader.fullName, email: responseTest.uploader.email } : undefined
    }, { status: 201 });

  } catch (error: any) {
    console.error("Error creating test:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server.", details: error.message }, { status: 500 });
  }
}
