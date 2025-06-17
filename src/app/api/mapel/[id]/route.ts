
import "reflect-metadata"; // Ensure this is the very first import
import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth/next"; // REMOVED
// import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // REMOVED
import { getInitializedDataSource } from "@/lib/data-source";
import { MataPelajaranEntity } from "@/entities/mata-pelajaran.entity";
import * as z from "zod";
import { KATEGORI_MAPEL } from "@/lib/constants";
import type { KategoriMapelType } from "@/entities/mata-pelajaran.entity";

const mataPelajaranUpdateSchema = z.object({
  nama: z.string().min(5, "Nama minimal 5 karakter.").max(255, "Nama maksimal 255 karakter.").optional(),
  deskripsi: z.string().optional().nullable(),
  kategori: z.enum(KATEGORI_MAPEL as [string, ...string[]]).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: "Minimal satu field harus diisi untuk melakukan pembaruan.",
});

// GET /api/mapel/[id] - Mendapatkan satu mata pelajaran
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // TODO: Implement server-side Firebase token verification for admin/superadmin
  // const session = await getServerSession(authOptions); // REMOVED
  // if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) { // REMOVED
  //   return NextResponse.json({ message: "Akses ditolak." }, { status: 403 }); // REMOVED
  // } // REMOVED

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

// PUT /api/mapel/[id] - Memperbarui mata pelajaran
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // TODO: Implement server-side Firebase token verification for admin/superadmin
  // const session = await getServerSession(authOptions); // REMOVED
  // if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) { // REMOVED
  //   return NextResponse.json({ message: "Akses ditolak." }, { status: 403 }); // REMOVED
  // } // REMOVED

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

// DELETE /api/mapel/[id] - Menghapus mata pelajaran
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // TODO: Implement server-side Firebase token verification for admin/superadmin
  // const session = await getServerSession(authOptions); // REMOVED
  // if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) { // REMOVED
  //   return NextResponse.json({ message: "Akses ditolak." }, { status: 403 }); // REMOVED
  // } // REMOVED

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
