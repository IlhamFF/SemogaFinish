
import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth/next"; // REMOVED
// import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // REMOVED
import { getInitializedDataSource } from "@/lib/data-source";
import { TugasEntity } from "@/entities/tugas.entity";
import * as z from "zod";
import { formatISO } from 'date-fns';
import type { FindManyOptions } from "typeorm";
import type { User } from '@/types'; // Import User from your types for session user structure

const tugasCreateSchema = z.object({
  judul: z.string().min(5, { message: "Judul tugas minimal 5 karakter." }),
  mapel: z.string({ required_error: "Mata pelajaran wajib dipilih." }),
  kelas: z.string({ required_error: "Kelas wajib dipilih." }),
  tenggat: z.date({ required_error: "Tanggal tenggat wajib diisi." }),
  deskripsi: z.string().optional().nullable(),
  namaFileLampiran: z.string().optional().nullable(),
  // This field is not directly provided by client on create, but needed for type consistency
  // It will be populated by uploaderId from session/token
  uploaderId: z.string().uuid().optional(), 
});

export async function GET(request: NextRequest) {
  // TODO: Implement server-side Firebase token verification (e.g., all authenticated users can GET)
  // const session = await getServerSession(authOptions); // REMOVED
  // For demo, we'll simulate session or require an uploaderId from query if not using session
  // This is NOT secure for production.
  // if (!session || !session.user || !['siswa', 'guru', 'admin', 'superadmin'].includes(session.user.role)) { // REMOVED
  //   return NextResponse.json({ message: "Akses ditolak." }, { status: 403 }); // REMOVED
  // } // REMOVED

  try {
    const dataSource = await getInitializedDataSource();
    const tugasRepo = dataSource.getRepository(TugasEntity);
    
    const { searchParams } = new URL(request.url);
    const filterKelas = searchParams.get("kelas"); 
    // const currentUserRole = session?.user?.role; // Hypothetical if session was available
    // const currentUserId = session?.user?.id; // Hypothetical
    // const currentUserKelas = session?.user?.kelasId; // Hypothetical

    const queryOptions: FindManyOptions<TugasEntity> = {
      relations: ["uploader"],
      order: { tenggat: "ASC", createdAt: "DESC" } as any,
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
  // TODO: Implement server-side Firebase token verification for guru/superadmin
  // const session = await getServerSession(authOptions); // REMOVED
  // if (!session || !session.user || (session.user.role !== 'guru' && session.user.role !== 'superadmin')) { // REMOVED
  //   return NextResponse.json({ message: "Akses ditolak." }, { status: 403 }); // REMOVED
  // } // REMOVED
  
  const body = await request.json();
  const uploaderIdFromBody = body.uploaderId; // Attempt to get uploaderId from body (MOCK/DEMO)
  // const uploaderId = session?.user?.id; // This would be the correct way if session was available
  if (!uploaderIdFromBody) { // MOCK: Fallback for demo if not passed in body
      console.warn("Warning: uploaderId not found in request body or session for POST /api/tugas. Using mock ID. THIS IS NOT SECURE.");
      // For a real app, this should fail if uploaderId cannot be determined securely.
      // return NextResponse.json({ message: "Uploader ID tidak ditemukan. Autentikasi diperlukan." }, { status: 401 });
  }
  const uploaderIdToUse = uploaderIdFromBody || "mock-user-id-for-tugas"; // MOCK

  try {
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
      uploaderId: uploaderIdToUse, // Use the determined uploaderId
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
