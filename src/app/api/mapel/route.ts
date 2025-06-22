
import "reflect-metadata"; 
import { NextRequest, NextResponse } from "next/server"; 
import { getInitializedDataSource } from "@/lib/data-source";
import { MataPelajaranEntity } from "@/entities/mata-pelajaran.entity";
import * as z from "zod";
import { KATEGORI_MAPEL } from "@/lib/constants";
import type { KategoriMapelType } from "@/entities/mata-pelajaran.entity";
import { getAuthenticatedUser } from "@/lib/auth-utils";

const mataPelajaranSchema = z.object({
  kode: z.string().min(3, "Kode minimal 3 karakter.").max(50, "Kode maksimal 50 karakter."),
  nama: z.string().min(5, "Nama minimal 5 karakter.").max(255, "Nama maksimal 255 karakter."),
  deskripsi: z.string().optional().nullable(),
  kategori: z.enum(KATEGORI_MAPEL as [string, ...string[]], { required_error: "Kategori wajib diisi." }),
});

export async function GET(request: NextRequest) { 
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
  }
  // Semua role terautentikasi bisa GET list mapel
  // if (!['admin', 'superadmin'].includes(authenticatedUser.role)) {
  //   return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  // }

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

export async function POST(request: NextRequest) { 
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
  }
  if (!['admin', 'superadmin'].includes(authenticatedUser.role)) {
    return NextResponse.json({ message: "Akses ditolak. Hanya admin yang dapat membuat mata pelajaran." }, { status: 403 });
  }

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
