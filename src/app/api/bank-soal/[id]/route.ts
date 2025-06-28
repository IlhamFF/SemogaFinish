
import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { SoalEntity, type TingkatKesulitanEntity } from "@/entities/soal.entity";
import { getAuthenticatedUser } from "@/lib/auth-utils-node";
import * as z from "zod";

const pilihanJawabanSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
});

const soalUpdateSchema = z.object({
  pertanyaan: z.string().min(10).optional(),
  mapelId: z.string().uuid().optional(),
  tingkatKesulitan: z.enum(["Mudah", "Sedang", "Sulit"]).optional(),
  pilihanJawaban: z.array(pilihanJawabanSchema).min(2).optional(),
  kunciJawaban: z.string().min(1).optional(),
});


export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser || !['guru', 'admin', 'superadmin'].includes(authenticatedUser.role)) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }
  
  const { id } = params;

  try {
    const body = await request.json();
    const validation = soalUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Input tidak valid.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const dataSource = await getInitializedDataSource();
    const soalRepo = dataSource.getRepository(SoalEntity);
    const soalToUpdate = await soalRepo.findOneBy({ id });

    if (!soalToUpdate) {
        return NextResponse.json({ message: "Soal tidak ditemukan." }, { status: 404 });
    }

    if (authenticatedUser.role === 'guru' && soalToUpdate.pembuatId !== authenticatedUser.id) {
        return NextResponse.json({ message: "Anda tidak berhak mengubah soal ini." }, { status: 403 });
    }
    
    const updatePayload = validation.data;
    const finalPayload: Partial<SoalEntity> = {};

    if (updatePayload.pertanyaan !== undefined) finalPayload.pertanyaan = updatePayload.pertanyaan;
    if (updatePayload.mapelId !== undefined) finalPayload.mapelId = updatePayload.mapelId;
    if (updatePayload.tingkatKesulitan !== undefined) finalPayload.tingkatKesulitan = updatePayload.tingkatKesulitan as TingkatKesulitanEntity;
    if (updatePayload.pilihanJawaban !== undefined) finalPayload.pilihanJawaban = updatePayload.pilihanJawaban;
    if (updatePayload.kunciJawaban !== undefined) finalPayload.kunciJawaban = updatePayload.kunciJawaban;

    const updatedSoal = await soalRepo.save({
        ...soalToUpdate,
        ...finalPayload,
    });
    
    return NextResponse.json(updatedSoal);

  } catch (error: any) {
    console.error(`Error updating soal ${id}:`, error);
    return NextResponse.json({ message: "Gagal memperbarui soal.", error: error.message }, { status: 500 });
  }
}


export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser || !['guru', 'admin', 'superadmin'].includes(authenticatedUser.role)) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }

  const { id } = params;

  try {
    const dataSource = await getInitializedDataSource();
    const soalRepo = dataSource.getRepository(SoalEntity);
    const soalToDelete = await soalRepo.findOneBy({ id });
    
    if (!soalToDelete) {
      return NextResponse.json({ message: "Soal tidak ditemukan." }, { status: 404 });
    }
    
    if (authenticatedUser.role === 'guru' && soalToDelete.pembuatId !== authenticatedUser.id) {
      return NextResponse.json({ message: "Anda tidak berhak menghapus soal ini." }, { status: 403 });
    }

    await soalRepo.remove(soalToDelete);

    return NextResponse.json({ message: "Soal berhasil dihapus." });
  } catch (error: any) {
    console.error(`Error deleting soal ${id}:`, error);
    if (error.code === '23503') {
        return NextResponse.json({ message: "Gagal menghapus soal karena masih digunakan dalam satu atau lebih test.", error: error.message }, { status: 409 });
    }
    return NextResponse.json({ message: "Gagal menghapus soal.", error: error.message }, { status: 500 });
  }
}
