
import "reflect-metadata"; 
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { MataPelajaranEntity } from "@/entities/mata-pelajaran.entity";
import * as z from "zod";
import { KATEGORI_MAPEL } from "@/lib/constants";
import type { KategoriMapelType } from "@/entities/mata-pelajaran.entity";
import { getAuthenticatedUser } from "@/lib/auth-utils-node";

const mataPelajaranUpdateSchema = z.object({
  nama: z.string().min(5, "Nama minimal 5 karakter.").max(255, "Nama maksimal 255 karakter.").optional(),
  deskripsi: z.string().optional().nullable(),
  kategori: z.enum(KATEGORI_MAPEL as [string, ...string[]]).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: "Minimal satu field harus diisi untuk melakukan pembaruan.",
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
  }
  // Semua role terautentikasi bisa GET by ID
  // if (!['admin', 'superadmin'].includes(authenticatedUser.role)) {
  //   return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  // }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ message: "ID mata pelajaran tidak valid." }, { status: 400 });
  }

  try {
    const dataSource = await getInitializedDataSource();
    const mapelRepo = dataSource.getRepository(MataPelajaranEntity);
    const mapel = await mapelRepo.findOneBy({ id });

    if (!mapel) {
      return NextResponse.json({ message: "Mata pelajaran tidak ditemukan." }, { status: 404 });
    }
    return NextResponse.json(mapel);
  } catch (error) {
    console.error("Error fetching mata pelajaran:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
  }
  if (!['admin', 'superadmin'].includes(authenticatedUser.role)) {
    return NextResponse.json({ message: "Akses ditolak. Hanya admin yang dapat mengubah mata pelajaran." }, { status: 403 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ message: "ID mata pelajaran tidak valid." }, { status: 400 });
  }

  try {
    const body = await request.json();
    const validation = mataPelajaranUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Input tidak valid.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const { nama, deskripsi, kategori } = validation.data;
    const updateData: Partial<MataPelajaranEntity> = {};
    if (nama !== undefined) updateData.nama = nama;
    if (deskripsi !== undefined) updateData.deskripsi = deskripsi; 
    if (kategori !== undefined) updateData.kategori = kategori as KategoriMapelType;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: "Tidak ada data untuk diperbarui." }, { status: 400 });
    }

    const dataSource = await getInitializedDataSource();
    const mapelRepo = dataSource.getRepository(MataPelajaranEntity);

    const updateResult = await mapelRepo.update(id, updateData);

    if (updateResult.affected === 0) {
      return NextResponse.json({ message: "Mata pelajaran tidak ditemukan untuk diperbarui." }, { status: 404 });
    }

    const updatedMapel = await mapelRepo.findOneBy({ id });
    return NextResponse.json(updatedMapel);

  } catch (error) {
    console.error("Error updating mata pelajaran:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
  }
  if (!['admin', 'superadmin'].includes(authenticatedUser.role)) {
    return NextResponse.json({ message: "Akses ditolak. Hanya admin yang dapat menghapus mata pelajaran." }, { status: 403 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ message: "ID mata pelajaran tidak valid." }, { status: 400 });
  }

  try {
    const dataSource = await getInitializedDataSource();
    const mapelRepo = dataSource.getRepository(MataPelajaranEntity);
    const deleteResult = await mapelRepo.delete(id);

    if (deleteResult.affected === 0) {
      return NextResponse.json({ message: "Mata pelajaran tidak ditemukan untuk dihapus." }, { status: 404 });
    }
    return NextResponse.json({ message: "Mata pelajaran berhasil dihapus." }, { status: 200 }); 
  } catch (error) {
    console.error("Error deleting mata pelajaran:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server atau mapel terkait dengan data lain." }, { status: 500 });
  }
}
