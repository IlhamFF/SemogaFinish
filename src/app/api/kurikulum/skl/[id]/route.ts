
import "reflect-metadata"; // Ensure this is the very first import
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getInitializedDataSource } from "@/lib/data-source";
import { SklEntity } from "@/entities/skl.entity";
import * as z from "zod";
import { KATEGORI_SKL } from "@/types";
import type { KategoriSklType } from "@/types";

const sklUpdateSchema = z.object({
  // Kode tidak boleh diubah
  deskripsi: z.string().min(10, { message: "Deskripsi SKL minimal 10 karakter." }).optional(),
  kategori: z.enum(KATEGORI_SKL).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: "Minimal satu field harus diisi untuk melakukan pembaruan.",
});


// GET /api/kurikulum/skl/[id] - Mendapatkan satu SKL
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ message: "ID SKL tidak valid." }, { status: 400 });
  }

  try {
    const dataSource = await getInitializedDataSource();
    const sklRepo = dataSource.getRepository(SklEntity);
    const skl = await sklRepo.findOneBy({ id });

    if (!skl) {
      return NextResponse.json({ message: "SKL tidak ditemukan." }, { status: 404 });
    }
    return NextResponse.json(skl);
  } catch (error) {
    console.error("Error fetching SKL:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}

// PUT /api/kurikulum/skl/[id] - Memperbarui SKL
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ message: "ID SKL tidak valid." }, { status: 400 });
  }

  try {
    const body = await request.json();
    const validation = sklUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Input tidak valid.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const updateData: Partial<SklEntity> = {};
    if (validation.data.deskripsi !== undefined) {
      updateData.deskripsi = validation.data.deskripsi;
    }
    if (validation.data.kategori !== undefined) {
      updateData.kategori = validation.data.kategori as KategoriSklType;
    }

    // Pastikan ada sesuatu untuk diupdate
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: "Tidak ada data untuk diperbarui." }, { status: 400 });
    }
    
    const dataSource = await getInitializedDataSource();
    const sklRepo = dataSource.getRepository(SklEntity);

    const updateResult = await sklRepo.update(id, updateData);

    if (updateResult.affected === 0) {
      return NextResponse.json({ message: "SKL tidak ditemukan untuk diperbarui." }, { status: 404 });
    }

    const updatedSkl = await sklRepo.findOneBy({ id });
    return NextResponse.json(updatedSkl);

  } catch (error) {
    console.error("Error updating SKL:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}

// DELETE /api/kurikulum/skl/[id] - Menghapus SKL
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ message: "ID SKL tidak valid." }, { status: 400 });
  }

  try {
    const dataSource = await getInitializedDataSource();
    const sklRepo = dataSource.getRepository(SklEntity);
    const deleteResult = await sklRepo.delete(id);

    if (deleteResult.affected === 0) {
      return NextResponse.json({ message: "SKL tidak ditemukan untuk dihapus." }, { status: 404 });
    }
    return NextResponse.json({ message: "SKL berhasil dihapus." });
  } catch (error) {
    console.error("Error deleting SKL:", error);
    // TODO: Handle error jika SKL masih terhubung ke entitas lain
    return NextResponse.json({ message: "Terjadi kesalahan internal server atau SKL terkait dengan data lain." }, { status: 500 });
  }
}
