
import "reflect-metadata"; 
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { MateriKategoriEntity } from "@/entities/materi-kategori.entity";
import * as z from "zod";
import { getAuthenticatedUser } from "@/lib/auth-utils-node";

const kategoriUpdateSchema = z.object({
  nama: z.string().min(3, { message: "Nama kategori minimal 3 karakter." }).max(255, { message: "Nama kategori maksimal 255 karakter." }).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: "Minimal satu field (nama) harus diisi untuk melakukan pembaruan.",
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
  }
  if (!['admin', 'superadmin'].includes(authenticatedUser.role)) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ message: "ID kategori tidak valid." }, { status: 400 });
  }

  try {
    const dataSource = await getInitializedDataSource();
    const kategoriRepo = dataSource.getRepository(MateriKategoriEntity);
    const kategori = await kategoriRepo.findOneBy({ id });

    if (!kategori) {
      return NextResponse.json({ message: "Kategori materi tidak ditemukan." }, { status: 404 });
    }
    return NextResponse.json(kategori);
  } catch (error) {
    console.error("Error fetching kategori materi:", error);
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
    return NextResponse.json({ message: "Akses ditolak. Hanya admin yang dapat mengubah kategori." }, { status: 403 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ message: "ID kategori tidak valid." }, { status: 400 });
  }

  try {
    const body = await request.json();
    const validation = kategoriUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Input tidak valid.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const updateData: Partial<MateriKategoriEntity> = {};
    if (validation.data.nama !== undefined) {
      updateData.nama = validation.data.nama;
    }
    
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: "Tidak ada data untuk diperbarui." }, { status: 400 });
    }
    
    const dataSource = await getInitializedDataSource();
    const kategoriRepo = dataSource.getRepository(MateriKategoriEntity);

    if (updateData.nama) {
        const existingKategori = await kategoriRepo.findOne({ where: { nama: updateData.nama }});
        if (existingKategori && existingKategori.id !== id) {
            return NextResponse.json({ message: "Nama kategori sudah ada." }, { status: 409 });
        }
    }

    const updateResult = await kategoriRepo.update(id, updateData);

    if (updateResult.affected === 0) {
      return NextResponse.json({ message: "Kategori materi tidak ditemukan untuk diperbarui." }, { status: 404 });
    }

    const updatedKategori = await kategoriRepo.findOneBy({ id });
    return NextResponse.json(updatedKategori);

  } catch (error: any) {
    console.error("Error updating kategori materi:", error);
     if (error.code === '23505') {
        return NextResponse.json({ message: "Nama kategori sudah ada (dari DB)." }, { status: 409 });
    }
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
    return NextResponse.json({ message: "Akses ditolak. Hanya admin yang dapat menghapus kategori." }, { status: 403 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ message: "ID kategori tidak valid." }, { status: 400 });
  }

  try {
    const dataSource = await getInitializedDataSource();
    const kategoriRepo = dataSource.getRepository(MateriKategoriEntity);
    const deleteResult = await kategoriRepo.delete(id);

    if (deleteResult.affected === 0) {
      return NextResponse.json({ message: "Kategori materi tidak ditemukan untuk dihapus." }, { status: 404 });
    }
    return NextResponse.json({ message: "Kategori materi berhasil dihapus." });
  } catch (error) {
    console.error("Error deleting kategori materi:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server atau kategori terkait dengan data lain." }, { status: 500 });
  }
}
