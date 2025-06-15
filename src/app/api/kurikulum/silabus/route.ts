
import "reflect-metadata"; // Ensure this is the very first import
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getInitializedDataSource } from "@/lib/data-source";
import { SilabusEntity } from "@/entities/silabus.entity";
import { MataPelajaranEntity } from "@/entities/mata-pelajaran.entity";
import * as z from "zod";
import { format } from 'date-fns';

const silabusCreateSchema = z.object({
  judul: z.string().min(5, { message: "Judul silabus minimal 5 karakter." }).max(255),
  mapelId: z.string().uuid({ message: "ID Mata Pelajaran tidak valid." }),
  kelas: z.string().min(1, { message: "Kelas wajib diisi." }).max(100),
  deskripsiSingkat: z.string().optional().nullable(),
  namaFileOriginal: z.string().optional().nullable(),
  // fileUrl akan disimulasikan/digenerate di backend untuk tipe "File"
});

// GET /api/kurikulum/silabus - Mendapatkan semua silabus
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  // Akses bisa diperluas ke guru jika mereka hanya bisa melihat silabus mapel mereka
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin' && session.user.role !== 'guru')) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const mapelIdFilter = searchParams.get("mapelId");

  try {
    const dataSource = await getInitializedDataSource();
    const silabusRepo = dataSource.getRepository(SilabusEntity);
    
    const queryOptions = {
      relations: ["mapel", "uploader"],
      order: { createdAt: "DESC" } as any, // Type assertion for order
      where: {} as any,
    };

    if (mapelIdFilter) {
      queryOptions.where.mapelId = mapelIdFilter;
    }

    // Jika user adalah guru, filter hanya untuk silabus yang dia upload atau terkait mapelnya
    if (session.user.role === 'guru') {
        // Ini contoh filter sederhana, bisa lebih kompleks
        // queryOptions.where.uploaderId = session.user.id; 
        // atau join dengan mapel yang diajarkan guru
    }

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
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user.role !== 'admin' && session.user.role !== 'superadmin' && session.user.role !== 'guru')) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validation = silabusCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Input tidak valid.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { judul, mapelId, kelas, deskripsiSingkat, namaFileOriginal } = validation.data;
    const uploaderId = session.user.id;

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
