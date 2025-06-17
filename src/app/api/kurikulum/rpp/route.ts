
import "reflect-metadata"; // Ensure this is the very first import
import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth/next"; // REMOVED
// import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // REMOVED
import { getInitializedDataSource } from "@/lib/data-source";
import { RppEntity } from "@/entities/rpp.entity";
import { MataPelajaranEntity } from "@/entities/mata-pelajaran.entity";
import * as z from "zod";
import { format } from 'date-fns';
import type { User } from '@/types'; // Import User from your types for session user structure

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

// GET /api/kurikulum/rpp - Mendapatkan semua RPP
export async function GET(request: NextRequest) {
  // TODO: Implement server-side Firebase token verification
  // const session = await getServerSession(authOptions); // REMOVED
  // if (!session || !session.user || (session.user.role !== 'admin' && session.user.role !== 'superadmin' && session.user.role !== 'guru')) { // REMOVED
  //   return NextResponse.json({ message: "Akses ditolak." }, { status: 403 }); // REMOVED
  // } // REMOVED

  const { searchParams } = new URL(request.url);
  const mapelIdFilter = searchParams.get("mapelId");
  const kelasFilter = searchParams.get("kelas");
  // const uploaderIdFilter = session?.user?.role === 'guru' ? session.user.id : searchParams.get("uploaderId"); // Hypothetical if session was available

  try {
    const dataSource = await getInitializedDataSource();
    const rppRepo = dataSource.getRepository(RppEntity);
    
    const queryOptions = {
      relations: ["mapel", "uploader"],
      order: { mapel: { nama: "ASC" }, kelas: "ASC", pertemuanKe: "ASC" } as any,
      where: {} as any,
    };

    if (mapelIdFilter) {
      queryOptions.where.mapelId = mapelIdFilter;
    }
    if (kelasFilter) {
      queryOptions.where.kelas = kelasFilter;
    }
    // TODO: Add role-based filtering if session is available.
    // if (uploaderIdFilter) {
    //   queryOptions.where.uploaderId = uploaderIdFilter;
    // }

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

// POST /api/kurikulum/rpp - Membuat RPP baru
export async function POST(request: NextRequest) {
  // TODO: Implement server-side Firebase token verification
  // const session = await getServerSession(authOptions); // REMOVED
  // if (!session || !session.user || (session.user.role !== 'admin' && session.user.role !== 'superadmin' && session.user.role !== 'guru')) { // REMOVED
  //   return NextResponse.json({ message: "Akses ditolak." }, { status: 403 }); // REMOVED
  // } // REMOVED
  const body = await request.json(); // Get body first
  const uploaderId = body.uploaderId || "mock-uploader-id"; // MOCK - REPLACE WITH ACTUAL AUTH
  if(!uploaderId) return NextResponse.json({ message: "Uploader ID tidak ditemukan. Autentikasi diperlukan." }, { status: 401 });

  try {
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
