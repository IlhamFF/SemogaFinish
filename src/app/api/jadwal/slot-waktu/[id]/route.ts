
import "reflect-metadata"; 
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { SlotWaktuEntity } from "@/entities/slot-waktu.entity";
import * as z from "zod";
import { getAuthenticatedUser } from "@/lib/auth-utils-node";

const slotWaktuUpdateSchema = z.object({
  namaSlot: z.string().min(3, { message: "Nama slot minimal 3 karakter." }).max(100).optional(),
  waktuMulai: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Format waktuMulai HH:MM"}).optional(),
  waktuSelesai: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Format waktuSelesai HH:MM"}).optional(),
  urutan: z.coerce.number().optional().nullable(),
}).refine(data => Object.keys(data).length > 0, {
  message: "Minimal satu field harus diisi untuk melakukan pembaruan.",
}).refine(data => {
    if (data.waktuMulai && data.waktuSelesai) {
        return data.waktuMulai < data.waktuSelesai;
    }
    return true;
}, {
  message: "Waktu mulai harus sebelum waktu selesai.",
  path: ["waktuSelesai"],
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
    return NextResponse.json({ message: "ID slot waktu tidak valid." }, { status: 400 });
  }

  try {
    const dataSource = await getInitializedDataSource();
    const slotWaktuRepo = dataSource.getRepository(SlotWaktuEntity);
    const slotWaktu = await slotWaktuRepo.findOneBy({ id });

    if (!slotWaktu) {
      return NextResponse.json({ message: "Slot waktu tidak ditemukan." }, { status: 404 });
    }
    return NextResponse.json(slotWaktu);
  } catch (error) {
    console.error("Error fetching slot waktu:", error);
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
    return NextResponse.json({ message: "Akses ditolak. Hanya admin yang dapat mengubah slot waktu." }, { status: 403 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ message: "ID slot waktu tidak valid." }, { status: 400 });
  }

  try {
    const body = await request.json();
    const validation = slotWaktuUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Input tidak valid.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const updateData: Partial<SlotWaktuEntity> = {};
    const validatedData = validation.data;

    if (validatedData.namaSlot !== undefined) updateData.namaSlot = validatedData.namaSlot;
    if (validatedData.waktuMulai !== undefined) updateData.waktuMulai = validatedData.waktuMulai;
    if (validatedData.waktuSelesai !== undefined) updateData.waktuSelesai = validatedData.waktuSelesai;
    if (validatedData.urutan !== undefined) updateData.urutan = validatedData.urutan;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: "Tidak ada data untuk diperbarui." }, { status: 400 });
    }
    
    const dataSource = await getInitializedDataSource();
    const slotWaktuRepo = dataSource.getRepository(SlotWaktuEntity);

    const existingSlot = await slotWaktuRepo.findOneBy({ id });
    if (!existingSlot) {
        return NextResponse.json({ message: "Slot waktu tidak ditemukan." }, { status: 404 });
    }

    const finalWaktuMulai = updateData.waktuMulai ?? existingSlot.waktuMulai;
    const finalWaktuSelesai = updateData.waktuSelesai ?? existingSlot.waktuSelesai;
    if (finalWaktuMulai >= finalWaktuSelesai) {
        return NextResponse.json({ message: "Waktu mulai harus sebelum waktu selesai." }, { status: 400 });
    }

    if (updateData.namaSlot && updateData.namaSlot !== existingSlot.namaSlot) {
        const duplicateSlot = await slotWaktuRepo.findOneBy({ namaSlot: updateData.namaSlot });
        if (duplicateSlot) {
            return NextResponse.json({ message: "Nama slot waktu sudah ada." }, { status: 409 });
        }
    }

    const updateResult = await slotWaktuRepo.update(id, updateData);

    if (updateResult.affected === 0) {
      return NextResponse.json({ message: "Slot waktu tidak ditemukan untuk diperbarui." }, { status: 404 });
    }

    const updatedSlotWaktu = await slotWaktuRepo.findOneBy({ id });
    return NextResponse.json(updatedSlotWaktu);

  } catch (error: any) {
    console.error("Error updating slot waktu:", error);
    if (error.code === '23505') { 
        return NextResponse.json({ message: "Nama slot waktu sudah ada (dari DB)." }, { status: 409 });
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
    return NextResponse.json({ message: "Akses ditolak. Hanya admin yang dapat menghapus slot waktu." }, { status: 403 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ message: "ID slot waktu tidak valid." }, { status: 400 });
  }

  try {
    const dataSource = await getInitializedDataSource();
    const slotWaktuRepo = dataSource.getRepository(SlotWaktuEntity);
    const deleteResult = await slotWaktuRepo.delete(id);

    if (deleteResult.affected === 0) {
      return NextResponse.json({ message: "Slot waktu tidak ditemukan untuk dihapus." }, { status: 404 });
    }
    return NextResponse.json({ message: "Slot waktu berhasil dihapus." });
  } catch (error) {
    console.error("Error deleting slot waktu:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server atau slot waktu masih digunakan dalam jadwal." }, { status: 500 });
  }
}
