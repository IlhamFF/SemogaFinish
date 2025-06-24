
import "reflect-metadata"; 
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { SilabusEntity } from "@/entities/silabus.entity";
import { MataPelajaranEntity } from "@/entities/mata-pelajaran.entity";
import * as z from "zod";
import { getAuthenticatedUser } from "@/lib/auth-utils-node";

const silabusCreateSchema = z.object({
  judul: z.string().min(5, { message: "Judul silabus minimal 5 karakter." }).max(255),
  mapelId: z.string().uuid({ message: "ID Mata Pelajaran tidak valid." }),
  kelas: z.string().min(1, { message: "Kelas wajib diisi." }).max(100),
  deskripsiSingkat: z.string().optional().nullable(),
  namaFileOriginal: z.string().optional().nullable(),
  fileUrl: z.string().url().optional().nullable(),
});

export async function GET(request: NextRequest) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const mapelIdFilter = searchParams.get("mapelId");
  const uploaderIdFilter = searchParams.get("uploaderId");

  try {
    const dataSource = await getInitializedDataSource();
    const silabusRepo = dataSource.getRepository(SilabusEntity);
    
    const queryOptions: { relations: string[], order: any, where: any } = {
      relations: ["mapel", "uploader"],
      order: { createdAt: "DESC" },
      where: {},
    };

    if (mapelIdFilter) queryOptions.where.mapelId = mapelIdFilter;
    
    if (authenticatedUser.role === 'guru' && !uploaderIdFilter) { 
      queryOptions.where.uploaderId = authenticatedUser.id;
    } else if (uploaderIdFilter && ['admin', 'superadmin'].includes(authenticatedUser.role)) { 
      queryOptions.where.uploaderId = uploaderIdFilter;
    } else if (uploaderIdFilter && authenticatedUser.role === 'guru' && uploaderIdFilter !== authenticatedUser.id) {
        return NextResponse.json({ message: "Guru hanya dapat melihat silabus sendiri jika tidak ada filter uploader spesifik." }, { status: 403 });
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

export async function POST(request: NextRequest) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
  }
  if (!['admin', 'superadmin', 'guru'].includes(authenticatedUser.role)) {
    return NextResponse.json({ message: "Akses ditolak. Hanya admin atau guru yang dapat membuat silabus." }, { status: 403 });
  }
  const uploaderId = authenticatedUser.id;

  try {
    const body = await request.json();
    const validation = silabusCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Input tidak valid.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { judul, mapelId, kelas, deskripsiSingkat, namaFileOriginal, fileUrl } = validation.data;

    const dataSource = await getInitializedDataSource();
    const silabusRepo = dataSource.getRepository(SilabusEntity);
    const mapelRepo = dataSource.getRepository(MataPelajaranEntity);

    const mapelExists = await mapelRepo.findOneBy({ id: mapelId });
    if (!mapelExists) {
      return NextResponse.json({ message: "Mata pelajaran tidak ditemukan." }, { status: 404 });
    }
    
    const newSilabus = silabusRepo.create({
      judul,
      mapelId,
      kelas,
      deskripsiSingkat,
      namaFileOriginal,
      fileUrl,
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
