
import "reflect-metadata"; 
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { RuanganEntity } from "@/entities/ruangan.entity";
import * as z from "zod";
import { getAuthenticatedUser } from "@/lib/auth-utils-node";

const ruanganUpdateSchema = z.object({
  nama: z.string().min(3, { message: "Nama ruangan minimal 3 karakter." }).max(255).optional(),
  kapasitas: z.coerce.number().min(1, { message: "Kapasitas minimal 1." }).optional(),
  fasilitas: z.string().optional().nullable(),
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
  // Hanya admin/superadmin yang bisa GET by ID, siswa/guru tidak perlu ini
  if (!['admin', 'superadmin'].includes(authenticatedUser.role)) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ message: "ID ruangan tidak valid." }, { status: 400 });
  }

  try {
    const dataSource = await getInitializedDataSource();
    const ruanganRepo = dataSource.getRepository(RuanganEntity);
    const ruangan = await ruanganRepo.findOneBy({ id });

    if (!ruangan) {
      return NextResponse.json({ message: "Ruangan tidak ditemukan." }, { status: 404 });
    }
    return NextResponse.json(ruangan);
  } catch (error) {
    console.error("Error fetching ruangan:", error);
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
    return NextResponse.json({ message: "Akses ditolak. Hanya admin yang dapat mengubah ruangan." }, { status: 403 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ message: "ID ruangan tidak valid." }, { status: 400 });
  }

  try {
    const body = await request.json();
    const validation = ruanganUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Input tidak valid.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const updateData: Partial<RuanganEntity> = {};
    const validatedData = validation.data;

    if (validatedData.nama !== undefined) updateData.nama = validatedData.nama;
    if (validatedData.kapasitas !== undefined) updateData.kapasitas = validatedData.kapasitas;
    if (validatedData.fasilitas !== undefined) updateData.fasilitas = validatedData.fasilitas;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: "Tidak ada data untuk diperbarui." }, { status: 400 });
    }
    
    const dataSource = await getInitializedDataSource();
    const ruanganRepo = dataSource.getRepository(RuanganEntity);

    const updateResult = await ruanganRepo.update(id, updateData);

    if (updateResult.affected === 0) {
      return NextResponse.json({ message: "Ruangan tidak ditemukan untuk diperbarui." }, { status: 404 });
    }

    const updatedRuangan = await ruanganRepo.findOneBy({ id });
    return NextResponse.json(updatedRuangan);

  } catch (error) {
    console.error("Error updating ruangan:", error);
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
    return NextResponse.json({ message: "Akses ditolak. Hanya admin yang dapat menghapus ruangan." }, { status: 403 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ message: "ID ruangan tidak valid." }, { status: 400 });
  }

  try {
    const dataSource = await getInitializedDataSource();
    const ruanganRepo = dataSource.getRepository(RuanganEntity);
    const deleteResult = await ruanganRepo.delete(id);

    if (deleteResult.affected === 0) {
      return NextResponse.json({ message: "Ruangan tidak ditemukan untuk dihapus." }, { status: 404 });
    }
    return NextResponse.json({ message: "Ruangan berhasil dihapus." });
  } catch (error) {
    console.error("Error deleting ruangan:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server atau ruangan masih digunakan dalam jadwal." }, { status: 500 });
  }
}
