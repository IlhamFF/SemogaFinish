
import "reflect-metadata"; // Ensure this is the very first import
import { NextRequest, NextResponse } from "next/server"; // Added NextRequest
// import { getServerSession } from "next-auth/next"; // REMOVED
// import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // REMOVED
import { getInitializedDataSource } from "@/lib/data-source";
import { MataPelajaranEntity } from "@/entities/mata-pelajaran.entity";
import * as z from "zod";
import { KATEGORI_MAPEL } from "@/lib/constants";
import type { KategoriMapelType } from "@/entities/mata-pelajaran.entity";

const mataPelajaranSchema = z.object({
  kode: z.string().min(3, "Kode minimal 3 karakter.").max(50, "Kode maksimal 50 karakter."),
  nama: z.string().min(5, "Nama minimal 5 karakter.").max(255, "Nama maksimal 255 karakter."),
  deskripsi: z.string().optional().nullable(),
  kategori: z.enum(KATEGORI_MAPEL as [string, ...string[]], { required_error: "Kategori wajib diisi." }),
});

// GET /api/mapel - Mendapatkan semua mata pelajaran
export async function GET(request: NextRequest) { // Added request parameter
  // TODO: Implement server-side Firebase token verification for admin/superadmin
  // const session = await getServerSession(authOptions); // REMOVED
  // if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) { // REMOVED
  //   return NextResponse.json({ message: "Akses ditolak." }, { status: 403 }); // REMOVED
  // } // REMOVED

  try {
    const dataSource = await getInitializedDataSource();
    const mapelRepo = dataSource.getRepository(MataPelajaranEntity);
    const mataPelajaranList = await mapelRepo.find({ order: { nama: "ASC" } });
    return NextResponse.json(mataPelajaranList);
  } catch (error) {
    console.error("Error fetching mata pelajaran:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}

// POST /api/mapel - Membuat mata pelajaran baru
export async function POST(request: NextRequest) { // Changed from Request to NextRequest
  // TODO: Implement server-side Firebase token verification for admin/superadmin
  // const session = await getServerSession(authOptions); // REMOVED
  // if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) { // REMOVED
  //   return NextResponse.json({ message: "Akses ditolak." }, { status: 403 }); // REMOVED
  // } // REMOVED

  try {
    const body = await request.json();
    const validation = mataPelajaranSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Input tidak valid.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { kode, nama, deskripsi, kategori } = validation.data;

    const dataSource = await getInitializedDataSource();
    const mapelRepo = dataSource.getRepository(MataPelajaranEntity);

    const existingMapel = await mapelRepo.findOneBy({ kode });
    if (existingMapel) {
      return NextResponse.json({ message: "Kode mata pelajaran sudah ada." }, { status: 409 });
    }

    const newMapel = mapelRepo.create({
      kode,
      nama,
      deskripsi,
      kategori: kategori as KategoriMapelType, 
    });

    await mapelRepo.save(newMapel);
    return NextResponse.json(newMapel, { status: 201 });

  } catch (error: any) {
    console.error("Error creating mata pelajaran:", error);
    if (error.code === '23505') { 
        return NextResponse.json({ message: "Kode mata pelajaran sudah ada (dari DB)." }, { status: 409 });
    }
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}
