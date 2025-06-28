
import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { TestEntity, type TestTipe, type TestStatus } from "@/entities/test.entity";
import * as z from "zod";
import { formatISO } from 'date-fns';
import type { FindManyOptions } from "typeorm";
import { getAuthenticatedUser } from "@/lib/auth-utils-node"; 
import { BankSoalTestEntity } from "@/entities/bank-soal-test.entity";

const testCreateSchema = z.object({
  judul: z.string().min(5, { message: "Judul test minimal 5 karakter." }),
  mapel: z.string({ required_error: "Mata pelajaran wajib dipilih." }),
  kelas: z.string({ required_error: "Kelas wajib dipilih." }),
  tanggal: z.date({ required_error: "Tanggal pelaksanaan wajib diisi." }),
  durasi: z.coerce.number().min(5, { message: "Durasi minimal 5 menit." }),
  tipe: z.enum(["Kuis", "Ulangan Harian", "UTS", "UAS", "Lainnya"], { required_error: "Tipe test wajib dipilih."}),
  deskripsi: z.string().optional().nullable(),
  status: z.enum(["Draf", "Terjadwal", "Berlangsung", "Selesai", "Dinilai"]).optional().default("Draf"),
});

export async function GET(request: NextRequest) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: "Akses ditolak. Tidak terautentikasi." }, { status: 401 });
  }

  try {
    const dataSource = await getInitializedDataSource();
    const testRepo = dataSource.getRepository(TestEntity);
    
    const { searchParams } = new URL(request.url);
    const filterKelas = searchParams.get("kelas"); 
    
    let qb = testRepo.createQueryBuilder("test")
      .leftJoinAndSelect("test.uploader", "uploader")
      .loadRelationCountAndMap("test.soalCount", "test.bankSoalTest")
      .orderBy("test.tanggal", "DESC")
      .addOrderBy("test.createdAt", "DESC");

    if (authenticatedUser.role === 'guru') {
        qb = qb.where("test.uploaderId = :uploaderId", { uploaderId: authenticatedUser.id });
        if (filterKelas) {
            qb = qb.andWhere("test.kelas = :kelas", { kelas: filterKelas });
        }
    } else if (authenticatedUser.role === 'siswa') {
        const siswaKelas = (authenticatedUser as any).kelasId; 
        if (!siswaKelas) {
             return NextResponse.json({ message: "Informasi kelas siswa tidak ditemukan untuk filter test." }, { status: 400 });
        }
        qb = qb.where("test.kelas = :kelas", { kelas: siswaKelas });
        // Siswa hanya boleh melihat test yang statusnya bukan Draf
        const statusFilter = z.enum(["Terjadwal", "Berlangsung", "Selesai", "Dinilai"]).optional().parse(searchParams.get("status"));
        if(statusFilter){
           qb = qb.andWhere("test.status = :status", { status: statusFilter });
        } else {
           qb = qb.andWhere("test.status != 'Draf'");
        }
    } else if (['admin', 'superadmin'].includes(authenticatedUser.role) && filterKelas) {
        qb = qb.where("test.kelas = :kelas", { kelas: filterKelas });
    }
    
    const testList = await qb.getMany();

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
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: "Akses ditolak. Tidak terautentikasi." }, { status: 401 });
  }
  if (!['guru', 'admin', 'superadmin'].includes(authenticatedUser.role)) {
    return NextResponse.json({ message: "Akses ditolak. Peran tidak diizinkan." }, { status: 403 });
  }
  const uploaderId = authenticatedUser.id;

  try {
    const body = await request.json();
    if (body.tanggal) {
        body.tanggal = new Date(body.tanggal);
    }
    const validation = testCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Input tidak valid.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { judul, mapel, kelas, tanggal, durasi, tipe, deskripsi, status } = validation.data;

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
      deskripsi,
      uploaderId,
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
