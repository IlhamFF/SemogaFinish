
import "reflect-metadata"; 
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { RppEntity } from "@/entities/rpp.entity";
import { MataPelajaranEntity } from "@/entities/mata-pelajaran.entity";
import * as z from "zod";
import { getAuthenticatedUser } from "@/lib/auth-utils-node";

const rppCreateSchema = z.object({
  judul: z.string().min(5, { message: "Judul RPP minimal 5 karakter." }).max(255),
  mapelId: z.string().uuid({ message: "ID Mata Pelajaran tidak valid." }),
  kelas: z.string().min(1, { message: "Kelas wajib diisi." }).max(100),
  pertemuanKe: z.coerce.number().min(1, { message: "Pertemuan ke minimal 1." }),
  materiPokok: z.string().optional().nullable(),
  kegiatanPembelajaran: z.string().optional().nullable(),
  penilaian: z.string().optional().nullable(),
  namaFileOriginal: z.string().optional().nullable(),
});

export async function GET(request: NextRequest) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const mapelIdFilter = searchParams.get("mapelId");
  const kelasFilter = searchParams.get("kelas");
  const uploaderIdFilter = searchParams.get("uploaderId");

  try {
    const dataSource = await getInitializedDataSource();
    const rppRepo = dataSource.getRepository(RppEntity);
    
    const queryOptions: { relations: string[], order: any, where: any } = {
      relations: ["mapel", "uploader"],
      order: { mapel: { nama: "ASC" }, kelas: "ASC", pertemuanKe: "ASC" },
      where: {},
    };

    if (mapelIdFilter) queryOptions.where.mapelId = mapelIdFilter;
    if (kelasFilter) queryOptions.where.kelas = kelasFilter;
    
    if (authenticatedUser.role === 'guru' && !uploaderIdFilter) { 
      queryOptions.where.uploaderId = authenticatedUser.id;
    } else if (uploaderIdFilter && ['admin', 'superadmin'].includes(authenticatedUser.role)) { 
      queryOptions.where.uploaderId = uploaderIdFilter;
    } else if (uploaderIdFilter && authenticatedUser.role === 'guru' && uploaderIdFilter !== authenticatedUser.id) {
        return NextResponse.json({ message: "Guru hanya dapat melihat RPP sendiri jika tidak ada filter uploader spesifik." }, { status: 403 });
    }


    const rppList = await rppRepo.find(queryOptions);

    return NextResponse.json(rppList.map(rpp => ({
      ...rpp,
      mapel: rpp.mapel ? { id: rpp.mapel.id, nama: rpp.mapel.nama, kode: rpp.mapel.kode } : undefined,
      uploader: rpp.uploader ? { id: rpp.uploader.id, name: rpp.uploader.name, fullName: rpp.uploader.fullName, email: rpp.uploader.email } : undefined
    })));
  } catch (error) {
    console.error("Error fetching RPP:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
  }
  if (!['admin', 'superadmin', 'guru'].includes(authenticatedUser.role)) {
    return NextResponse.json({ message: "Akses ditolak. Hanya admin atau guru yang dapat membuat RPP." }, { status: 403 });
  }
  const uploaderId = authenticatedUser.id;

  try {
    const body = await request.json();
    const validation = rppCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Input tidak valid.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { judul, mapelId, kelas, pertemuanKe, materiPokok, kegiatanPembelajaran, penilaian, namaFileOriginal } = validation.data;

    const dataSource = await getInitializedDataSource();
    const rppRepo = dataSource.getRepository(RppEntity);
    const mapelRepo = dataSource.getRepository(MataPelajaranEntity);

    const mapelExists = await mapelRepo.findOneBy({ id: mapelId });
    if (!mapelExists) {
      return NextResponse.json({ message: "Mata pelajaran tidak ditemukan." }, { status: 404 });
    }

    let fileUrlSimulasi: string | undefined = undefined;
    if (namaFileOriginal) {
      fileUrlSimulasi = `/uploads/kurikulum/rpp/${Date.now()}-${namaFileOriginal.replace(/\s+/g, '_')}`;
    }

    const newRpp = rppRepo.create({
      judul,
      mapelId,
      kelas,
      pertemuanKe,
      materiPokok,
      kegiatanPembelajaran,
      penilaian,
      namaFileOriginal,
      fileUrl: fileUrlSimulasi,
      uploaderId,
    });

    await rppRepo.save(newRpp);
    
    const savedRppWithRelations = await rppRepo.findOne({
        where: { id: newRpp.id },
        relations: ["mapel", "uploader"]
    });
    
    return NextResponse.json({
        ...savedRppWithRelations,
        mapel: savedRppWithRelations?.mapel ? { id: savedRppWithRelations.mapel.id, nama: savedRppWithRelations.mapel.nama, kode: savedRppWithRelations.mapel.kode } : undefined,
        uploader: savedRppWithRelations?.uploader ? { id: savedRppWithRelations.uploader.id, name: savedRppWithRelations.uploader.name, fullName: savedRppWithRelations.uploader.fullName, email: savedRppWithRelations.uploader.email } : undefined
    }, { status: 201 });

  } catch (error: any) {
    console.error("Error creating RPP:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server.", error: error.message }, { status: 500 });
  }
}
