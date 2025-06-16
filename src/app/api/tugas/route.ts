
import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getInitializedDataSource } from "@/lib/data-source";
import { TugasEntity } from "@/entities/tugas.entity";
import * as z from "zod";
import { formatISO } from 'date-fns';
import type { FindManyOptions } from "typeorm";

const tugasCreateSchema = z.object({
  judul: z.string().min(5, { message: "Judul tugas minimal 5 karakter." }),
  mapel: z.string({ required_error: "Mata pelajaran wajib dipilih." }),
  kelas: z.string({ required_error: "Kelas wajib dipilih." }),
  tenggat: z.date({ required_error: "Tanggal tenggat wajib diisi." }), // Expecting Date object from client form
  deskripsi: z.string().optional().nullable(),
  namaFileLampiran: z.string().optional().nullable(),
});

// GET /api/tugas - Mendapatkan daftar tugas
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  // Siswa, Guru, Admin, Superadmin bisa melihat tugas, Pimpinan mungkin tidak perlu endpoint ini.
  if (!session || !session.user || !['siswa', 'guru', 'admin', 'superadmin'].includes(session.user.role)) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }

  try {
    const dataSource = await getInitializedDataSource();
    const tugasRepo = dataSource.getRepository(TugasEntity);
    
    const { searchParams } = new URL(request.url);
    const filterKelas = searchParams.get("kelas"); // Parameter opsional untuk admin/superadmin

    const queryOptions: FindManyOptions<TugasEntity> = {
      relations: ["uploader"],
      order: { tenggat: "ASC", createdAt: "DESC" } as any,
      where: {} as any,
    };

    if (session.user.role === 'guru') {
        queryOptions.where.uploaderId = session.user.id;
    } else if (session.user.role === 'siswa') {
        if (!session.user.kelas) { // Jika siswa tidak punya info kelas di sesi
            return NextResponse.json({ message: "Informasi kelas siswa tidak ditemukan." }, { status: 400 });
        }
        queryOptions.where.kelas = session.user.kelas;
    } else if ((session.user.role === 'admin' || session.user.role === 'superadmin') && filterKelas) {
        queryOptions.where.kelas = filterKelas;
    }
    // Jika superadmin/admin dan tidak ada filterKelas, 'where' tetap kosong, mengembalikan semua.

    const tugasList = await tugasRepo.find(queryOptions);

    return NextResponse.json(tugasList.map(t => ({
        ...t,
        tenggat: formatISO(new Date(t.tenggat)), // Ensure tenggat is ISO string
        uploader: t.uploader ? { id: t.uploader.id, name: t.uploader.name, fullName: t.uploader.fullName, email: t.uploader.email } : undefined
    })));
  } catch (error) {
    console.error("Error fetching tugas:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server.", details: (error as Error).message }, { status: 500 });
  }
}

// POST /api/tugas - Membuat tugas baru
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user.role !== 'guru' && session.user.role !== 'superadmin')) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }

  try {
    const body = await request.json();
    // Convert tenggat string back to Date for Zod validation
    if (body.tenggat) {
        body.tenggat = new Date(body.tenggat);
    }
    const validation = tugasCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Input tidak valid.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { judul, mapel, kelas, tenggat, deskripsi, namaFileLampiran } = validation.data;
    const uploaderId = session.user.id;

    const dataSource = await getInitializedDataSource();
    const tugasRepo = dataSource.getRepository(TugasEntity);

    let fileUrlLampiranSimulasi: string | undefined = undefined;
    if (namaFileLampiran) {
      fileUrlLampiranSimulasi = `/uploads/tugas/${Date.now()}-${namaFileLampiran.replace(/\s+/g, '_')}`;
    }

    const newTugas = tugasRepo.create({
      judul,
      mapel,
      kelas,
      tenggat, // Store as Date object, TypeORM handles conversion
      deskripsi,
      namaFileLampiran,
      fileUrlLampiran: fileUrlLampiranSimulasi,
      uploaderId,
    });

    const savedTugas = await tugasRepo.save(newTugas);
    
    const responseTugas = await tugasRepo.findOne({where: {id: savedTugas.id}, relations: ["uploader"]});

    return NextResponse.json({
        ...responseTugas,
        tenggat: responseTugas ? formatISO(new Date(responseTugas.tenggat)) : null,
        uploader: responseTugas?.uploader ? { id: responseTugas.uploader.id, name: responseTugas.uploader.name, fullName: responseTugas.uploader.fullName } : undefined
    }, { status: 201 });

  } catch (error: any) {
    console.error("Error creating tugas:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server.", details: error.message }, { status: 500 });
  }
}
