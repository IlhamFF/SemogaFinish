
import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getInitializedDataSource } from "@/lib/data-source";
import { TestEntity, type TestTipe, type TestStatus } from "@/entities/test.entity";
import * as z from "zod";
import { formatISO } from 'date-fns';

const testCreateSchema = z.object({
  judul: z.string().min(5, { message: "Judul test minimal 5 karakter." }),
  mapel: z.string({ required_error: "Mata pelajaran wajib dipilih." }),
  kelas: z.string({ required_error: "Kelas wajib dipilih." }),
  tanggal: z.date({ required_error: "Tanggal pelaksanaan wajib diisi." }), // Expecting Date from client
  durasi: z.coerce.number().min(5, { message: "Durasi minimal 5 menit." }),
  tipe: z.enum(["Kuis", "Ulangan Harian", "UTS", "UAS", "Lainnya"], { required_error: "Tipe test wajib dipilih."}),
  jumlahSoal: z.coerce.number().min(1, { message: "Jumlah soal minimal 1."}).optional().nullable(),
  deskripsi: z.string().optional().nullable(),
  status: z.enum(["Draf", "Terjadwal", "Berlangsung", "Selesai", "Dinilai"]).optional().default("Draf"),
});

// GET /api/test - Mendapatkan daftar test
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user.role !== 'guru' && session.user.role !== 'superadmin')) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }

  try {
    const dataSource = await getInitializedDataSource();
    const testRepo = dataSource.getRepository(TestEntity);
    
    const queryOptions = {
      where: {} as any,
      relations: ["uploader"],
      order: { tanggal: "DESC", createdAt: "DESC" } as any,
    };

    if (session.user.role === 'guru') {
        queryOptions.where.uploaderId = session.user.id;
    }

    const testList = await testRepo.find(queryOptions);

    return NextResponse.json(testList.map(t => ({
        ...t,
        tanggal: formatISO(new Date(t.tanggal)), 
        uploader: t.uploader ? { id: t.uploader.id, name: t.uploader.name, fullName: t.uploader.fullName } : undefined
    })));
  } catch (error) {
    console.error("Error fetching tests:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server.", details: (error as Error).message }, { status: 500 });
  }
}

// POST /api/test - Membuat test baru
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user.role !== 'guru' && session.user.role !== 'superadmin')) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }

  try {
    const body = await request.json();
    if (body.tanggal) { // Convert ISO string from JSON to Date for Zod
        body.tanggal = new Date(body.tanggal);
    }
    const validation = testCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Input tidak valid.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { judul, mapel, kelas, tanggal, durasi, tipe, jumlahSoal, deskripsi, status } = validation.data;
    const uploaderId = session.user.id;

    const dataSource = await getInitializedDataSource();
    const testRepo = dataSource.getRepository(TestEntity);

    const newTest = testRepo.create({
      judul,
      mapel,
      kelas,
      tanggal, // Store as Date object, TypeORM handles conversion
      durasi,
      tipe: tipe as TestTipe,
      status: status as TestStatus,
      jumlahSoal: jumlahSoal ?? undefined,
      deskripsi,
      uploaderId,
    });

    const savedTest = await testRepo.save(newTest);
    
    const responseTest = await testRepo.findOne({where: {id: savedTest.id}, relations: ["uploader"]});

    return NextResponse.json({
        ...responseTest,
        tanggal: responseTest ? formatISO(new Date(responseTest.tanggal)) : null,
        uploader: responseTest?.uploader ? { id: responseTest.uploader.id, name: responseTest.uploader.name, fullName: responseTest.uploader.fullName } : undefined
    }, { status: 201 });

  } catch (error: any) {
    console.error("Error creating test:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server.", details: error.message }, { status: 500 });
  }
}
