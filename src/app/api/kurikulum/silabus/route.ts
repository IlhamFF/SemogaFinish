
import "reflect-metadata"; // Ensure this is the very first import
import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth/next"; // REMOVED
// import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // REMOVED
import { getInitializedDataSource } from "@/lib/data-source";
import { SilabusEntity } from "@/entities/silabus.entity";
import { MataPelajaranEntity } from "@/entities/mata-pelajaran.entity";
import * as z from "zod";
import { format } from 'date-fns';
import type { User } from '@/types'; // Import User from your types for session user structure

const silabusCreateSchema = z.object({
  judul: z.string().min(5, { message: "Judul silabus minimal 5 karakter." }).max(255),
  mapelId: z.string().uuid({ message: "ID Mata Pelajaran tidak valid." }),
  kelas: z.string().min(1, { message: "Kelas wajib diisi." }).max(100),
  deskripsiSingkat: z.string().optional().nullable(),
  namaFileOriginal: z.string().optional().nullable(),
});

// GET /api/kurikulum/silabus - Mendapatkan semua silabus
export async function GET(request: NextRequest) {
  // TODO: Implement server-side Firebase token verification
  // const session = await getServerSession(authOptions); // REMOVED
  // if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin' && session.user.role !== 'guru')) { // REMOVED
  //   return NextResponse.json({ message: "Akses ditolak." }, { status: 403 }); // REMOVED
  // } // REMOVED

  const { searchParams } = new URL(request.url);
  const mapelIdFilter = searchParams.get("mapelId");

  try {
    const dataSource = await getInitializedDataSource();
    const silabusRepo = dataSource.getRepository(SilabusEntity);
    
    const queryOptions = {
      relations: ["mapel", "uploader"],
      order: { createdAt: "DESC" } as any,
      where: {} as any,
    };

    if (mapelIdFilter) {
      queryOptions.where.mapelId = mapelIdFilter;
    }
    // TODO: Add role-based filtering if session is available. E.g., guru only sees their uploads.

    const silabusList = await silabusRepo.find(queryOptions);

    return NextResponse.json(silabusList.map(s => ({
      ...s,
      mapel: s.mapel ? { id: s.mapel.id, nama: s.mapel.nama, kode: s.mapel.kode } : undefined,
      uploader: s.uploader ? { id: s.uploader.id, name: s.uploader.name, fullName: s.uploader.fullName, email: s.uploader.email } : undefined
    })));
  } catch (error) {
    console.error("Error fetching silabus:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}

// POST /api/kurikulum/silabus - Membuat silabus baru
export async function POST(request: NextRequest) {
  // TODO: Implement server-side Firebase token verification
  // const session = await getServerSession(authOptions); // REMOVED
  // This is NOT secure for production without proper session/token verification.
  // if (!session || !session.user || (session.user.role !== 'admin' && session.user.role !== 'superadmin' && session.user.role !== 'guru')) { // REMOVED
  //   return NextResponse.json({ message: "Akses ditolak." }, { status: 403 }); // REMOVED
  // } // REMOVED
  const body = await request.json(); // Get body first to extract uploaderId if needed
  const uploaderId = body.uploaderId || "mock-uploader-id"; // MOCK - REPLACE WITH ACTUAL AUTH
  if(!uploaderId) return NextResponse.json({ message: "Uploader ID tidak ditemukan. Autentikasi diperlukan." }, { status: 401 });

  try {
    const validation = silabusCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Input tidak valid.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { judul, mapelId, kelas, deskripsiSingkat, namaFileOriginal } = validation.data;

    const dataSource = await getInitializedDataSource();
    const silabusRepo = dataSource.getRepository(SilabusEntity);
    const mapelRepo = dataSource.getRepository(MataPelajaranEntity);

    const mapelExists = await mapelRepo.findOneBy({ id: mapelId });
    if (!mapelExists) {
      return NextResponse.json({ message: "Mata pelajaran tidak ditemukan." }, { status: 404 });
    }

    let fileUrlSimulasi: string | undefined = undefined;
    if (namaFileOriginal) {
      fileUrlSimulasi = `/uploads/kurikulum/silabus/${Date.now()}-${namaFileOriginal.replace(/\s+/g, '_')}`;
    }

    const newSilabus = silabusRepo.create({
      judul,
      mapelId,
      kelas,
      deskripsiSingkat,
      namaFileOriginal,
      fileUrl: fileUrlSimulasi,
      uploaderId,
    });

    await silabusRepo.save(newSilabus);
    
    const savedSilabusWithRelations = await silabusRepo.findOne({
        where: { id: newSilabus.id },
        relations: ["mapel", "uploader"]
    });
    
    return NextResponse.json({
        ...savedSilabusWithRelations,
        mapel: savedSilabusWithRelations?.mapel ? { id: savedSilabusWithRelations.mapel.id, nama: savedSilabusWithRelations.mapel.nama, kode: savedSilabusWithRelations.mapel.kode } : undefined,
        uploader: savedSilabusWithRelations?.uploader ? { id: savedSilabusWithRelations.uploader.id, name: savedSilabusWithRelations.uploader.name, fullName: savedSilabusWithRelations.uploader.fullName, email: savedSilabusWithRelations.uploader.email } : undefined
    }, { status: 201 });

  } catch (error: any) {
    console.error("Error creating silabus:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server.", error: error.message }, { status: 500 });
  }
}
