
import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getInitializedDataSource } from "@/lib/data-source";
import { TugasEntity } from "@/entities/tugas.entity";
import * as z from "zod";
import { formatISO } from 'date-fns';

const tugasUpdateSchema = z.object({
  judul: z.string().min(5, { message: "Judul tugas minimal 5 karakter." }).optional(),
  mapel: z.string().optional(),
  kelas: z.string().optional(),
  tenggat: z.date().optional(), // Expecting Date object from client form
  deskripsi: z.string().optional().nullable(),
  namaFileLampiran: z.string().optional().nullable(),
}).refine(data => Object.keys(data).length > 0, {
  message: "Minimal satu field harus diisi untuk melakukan pembaruan.",
});

// GET /api/tugas/[id] - Mendapatkan detail tugas (jika diperlukan)
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user.role !== 'guru' && session.user.role !== 'superadmin')) {
        return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
    }

    const { id } = params;
    if (!id) {
        return NextResponse.json({ message: "ID tugas tidak valid." }, { status: 400 });
    }

    try {
        const dataSource = await getInitializedDataSource();
        const tugasRepo = dataSource.getRepository(TugasEntity);
        const tugas = await tugasRepo.findOne({ where: { id }, relations: ["uploader"] });

        if (!tugas) {
            return NextResponse.json({ message: "Tugas tidak ditemukan." }, { status: 404 });
        }
        if (session.user.role === 'guru' && tugas.uploaderId !== session.user.id) {
            return NextResponse.json({ message: "Anda tidak berhak melihat tugas ini." }, { status: 403 });
        }
        
        return NextResponse.json({
            ...tugas,
            tenggat: formatISO(new Date(tugas.tenggat)),
            uploader: tugas.uploader ? { id: tugas.uploader.id, name: tugas.uploader.name, fullName: tugas.uploader.fullName } : undefined
        });
    } catch (error) {
        console.error("Error fetching tugas:", error);
        return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
    }
}


// PUT /api/tugas/[id] - Memperbarui tugas
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user.role !== 'guru' && session.user.role !== 'superadmin')) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ message: "ID tugas tidak valid." }, { status: 400 });
  }

  try {
    const body = await request.json();
    if (body.tenggat) {
        body.tenggat = new Date(body.tenggat);
    }
    const validation = tugasUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Input tidak valid.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const updatePayload = validation.data;
    
    const dataSource = await getInitializedDataSource();
    const tugasRepo = dataSource.getRepository(TugasEntity);
    const existingTugas = await tugasRepo.findOneBy({ id });

    if (!existingTugas) {
      return NextResponse.json({ message: "Tugas tidak ditemukan." }, { status: 404 });
    }
    if (session.user.role === 'guru' && existingTugas.uploaderId !== session.user.id) {
        return NextResponse.json({ message: "Anda tidak berhak memperbarui tugas ini." }, { status: 403 });
    }
    
    const updateData: Partial<TugasEntity> = { ...updatePayload };

    if (updatePayload.namaFileLampiran !== undefined) { // Penanganan khusus jika namaFileLampiran berubah
        if (updatePayload.namaFileLampiran) {
            updateData.fileUrlLampiran = `/uploads/tugas/${Date.now()}-${updatePayload.namaFileLampiran.replace(/\s+/g, '_')}`;
        } else { // Jika namaFileLampiran dikosongkan/null
            updateData.fileUrlLampiran = null;
        }
    }


    const updateResult = await tugasRepo.update(id, updateData);

    if (updateResult.affected === 0) {
      return NextResponse.json({ message: "Gagal memperbarui tugas." }, { status: 404 });
    }

    const updatedTugas = await tugasRepo.findOne({ where: { id }, relations: ["uploader"] });
    return NextResponse.json({
        ...updatedTugas,
        tenggat: updatedTugas ? formatISO(new Date(updatedTugas.tenggat)) : null,
        uploader: updatedTugas?.uploader ? { id: updatedTugas.uploader.id, name: updatedTugas.uploader.name, fullName: updatedTugas.uploader.fullName } : undefined
    });

  } catch (error) {
    console.error("Error updating tugas:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}

// DELETE /api/tugas/[id] - Menghapus tugas
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user.role !== 'guru' && session.user.role !== 'superadmin')) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ message: "ID tugas tidak valid." }, { status: 400 });
  }

  try {
    const dataSource = await getInitializedDataSource();
    const tugasRepo = dataSource.getRepository(TugasEntity);
    const tugasToDelete = await tugasRepo.findOneBy({ id });

    if (!tugasToDelete) {
      return NextResponse.json({ message: "Tugas tidak ditemukan." }, { status: 404 });
    }
    if (session.user.role === 'guru' && tugasToDelete.uploaderId !== session.user.id) {
        return NextResponse.json({ message: "Anda tidak berhak menghapus tugas ini." }, { status: 403 });
    }

    const deleteResult = await tugasRepo.delete(id);

    if (deleteResult.affected === 0) {
      return NextResponse.json({ message: "Gagal menghapus tugas." }, { status: 404 });
    }
    return NextResponse.json({ message: "Tugas berhasil dihapus." });
  } catch (error) {
    console.error("Error deleting tugas:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}
