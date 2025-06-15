
import "reflect-metadata"; // Ensure this is the very first import
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getInitializedDataSource } from "@/lib/data-source";
import { CpEntity } from "@/entities/cp.entity";
import * as z from "zod";
import { FASE_CP } from "@/types";
import type { FaseCpType } from "@/types";

const cpUpdateSchema = z.object({
  // Kode tidak boleh diubah
  deskripsi: z.string().min(10, { message: "Deskripsi CP minimal 10 karakter." }).optional(),
  fase: z.enum(FASE_CP).optional(),
  elemen: z.string().min(3, { message: "Elemen minimal 3 karakter." }).max(255, { message: "Elemen maksimal 255 karakter."}).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: "Minimal satu field harus diisi untuk melakukan pembaruan.",
});


// GET /api/kurikulum/cp/[id] - Mendapatkan satu CP
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
    return NextResponse.json({ message: "ID CP tidak valid." }, { status: 400 });
  }

  try {
    const dataSource = await getInitializedDataSource();
    const cpRepo = dataSource.getRepository(CpEntity);
    const cp = await cpRepo.findOneBy({ id });

    if (!cp) {
      return NextResponse.json({ message: "CP tidak ditemukan." }, { status: 404 });
    }
    return NextResponse.json(cp);
  } catch (error) {
    console.error("Error fetching CP:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}

// PUT /api/kurikulum/cp/[id] - Memperbarui CP
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
    return NextResponse.json({ message: "ID CP tidak valid." }, { status: 400 });
  }

  try {
    const body = await request.json();
    const validation = cpUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Input tidak valid.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const updateData: Partial<CpEntity> = {};
    if (validation.data.deskripsi !== undefined) {
      updateData.deskripsi = validation.data.deskripsi;
    }
    if (validation.data.fase !== undefined) {
      updateData.fase = validation.data.fase as FaseCpType;
    }
    if (validation.data.elemen !== undefined) {
      updateData.elemen = validation.data.elemen;
    }
    
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: "Tidak ada data untuk diperbarui." }, { status: 400 });
    }
    
    const dataSource = await getInitializedDataSource();
    const cpRepo = dataSource.getRepository(CpEntity);

    const updateResult = await cpRepo.update(id, updateData);

    if (updateResult.affected === 0) {
      return NextResponse.json({ message: "CP tidak ditemukan untuk diperbarui." }, { status: 404 });
    }

    const updatedCp = await cpRepo.findOneBy({ id });
    return NextResponse.json(updatedCp);

  } catch (error) {
    console.error("Error updating CP:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}

// DELETE /api/kurikulum/cp/[id] - Menghapus CP
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
    return NextResponse.json({ message: "ID CP tidak valid." }, { status: 400 });
  }

  try {
    const dataSource = await getInitializedDataSource();
    const cpRepo = dataSource.getRepository(CpEntity);
    const deleteResult = await cpRepo.delete(id);

    if (deleteResult.affected === 0) {
      return NextResponse.json({ message: "CP tidak ditemukan untuk dihapus." }, { status: 404 });
    }
    return NextResponse.json({ message: "CP berhasil dihapus." });
  } catch (error) {
    console.error("Error deleting CP:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server atau CP terkait dengan data lain." }, { status: 500 });
  }
}
    