
import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { TugasEntity } from "@/entities/tugas.entity";
import * as z from "zod";
import { formatISO } from 'date-fns';
import type { FindManyOptions } from "typeorm";
import { getAuthenticatedUser } from "@/lib/auth-utils-node"; // Import new auth util

const tugasCreateSchema = z.object({
  judul: z.string().min(5, { message: "Judul tugas minimal 5 karakter." }),
  mapel: z.string({ required_error: "Mata pelajaran wajib dipilih." }),
  kelas: z.string({ required_error: "Kelas wajib dipilih." }),
  tenggat: z.date({ required_error: "Tanggal tenggat wajib diisi." }),
  deskripsi: z.string().optional().nullable(),
  namaFileLampiran: z.string().optional().nullable(),
  // uploaderId is removed, will be taken from token
});

export async function GET(request: NextRequest) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: "Akses ditolak. Tidak terautentikasi." }, { status: 401 });
  }
  
  try {
    const dataSource = await getInitializedDataSource();
    const tugasRepo = dataSource.getRepository(TugasEntity);
    
    const { searchParams } = new URL(request.url);
    const filterKelas = searchParams.get("kelas"); 
    
    const queryOptions: FindManyOptions<TugasEntity> = {
      relations: ["uploader"],
      order: { tenggat: "ASC", createdAt: "DESC" } as any,
      where: {} as any,
    };

    if (authenticatedUser.role === 'guru') {
        queryOptions.where.uploaderId = authenticatedUser.id;
        // Optionally, if a guru also wants to filter by class they teach for their own tasks
        if (filterKelas) {
             queryOptions.where.kelas = filterKelas;
        }
    } else if (authenticatedUser.role === 'siswa') {
        // For siswa, they should only see tasks for their class
        // This logic should ideally be derived from the user's profile (e.g., user.kelasId)
        // For now, we assume the client might send a 'kelas' filter or we'd need to enhance `authenticatedUser` payload
        const siswaKelas = searchParams.get("kelas_siswa") || (authenticatedUser as any).kelasId; // Or get from user object
        if (!siswaKelas) {
             return NextResponse.json({ message: "Informasi kelas siswa tidak ditemukan untuk filter tugas." }, { status: 400 });
        }
        queryOptions.where.kelas = siswaKelas;
    } else if (['admin', 'superadmin'].includes(authenticatedUser.role) && filterKelas) {
        queryOptions.where.kelas = filterKelas;
    }
    // If no specific role logic for filtering, it might fetch all, or based on other query params.

    const tugasList = await tugasRepo.find(queryOptions);

    return NextResponse.json(tugasList.map(t => ({
        ...t,
        tenggat: formatISO(new Date(t.tenggat)),
        uploader: t.uploader ? { id: t.uploader.id, name: t.uploader.name, fullName: t.uploader.fullName, email: t.uploader.email } : undefined
    })));
  } catch (error) {
    console.error("Error fetching tugas:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server.", details: (error as Error).message }, { status: 500 });
  }
}

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
    if (body.tenggat) {
        body.tenggat = new Date(body.tenggat);
    }
    const validation = tugasCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Input tidak valid.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { judul, mapel, kelas, tenggat, deskripsi, namaFileLampiran } = validation.data;

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
      tenggat,
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
