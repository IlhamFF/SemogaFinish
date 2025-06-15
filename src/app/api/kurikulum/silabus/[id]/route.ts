
import "reflect-metadata"; // Ensure this is the very first import
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getInitializedDataSource } from "@/lib/data-source";
import { SilabusEntity } from "@/entities/silabus.entity";
import { MataPelajaranEntity } from "@/entities/mata-pelajaran.entity";
import * as z from "zod";
import { format } from 'date-fns';

const silabusUpdateSchema = z.object({
  judul: z.string().min(5, { message: "Judul silabus minimal 5 karakter." }).max(255).optional(),
  mapelId: z.string().uuid({ message: "ID Mata Pelajaran tidak valid." }).optional(),
  kelas: z.string().min(1, { message: "Kelas wajib diisi." }).max(100).optional(),
  deskripsiSingkat: z.string().optional().nullable(),
  namaFileOriginal: z.string().optional().nullable(),
  // fileUrl akan di-handle berdasarkan namaFileOriginal jika ada perubahan file
}).refine(data => Object.keys(data).length > 0, {
  message: "Minimal satu field harus diisi untuk melakukan pembaruan.",
});


// GET /api/kurikulum/silabus/[id] - Mendapatkan satu silabus
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin' && session.user.role !== 'guru')) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ message: "ID silabus tidak valid." }, { status: 400 });
  }

  try {
    const dataSource = await getInitializedDataSource();
    const silabusRepo = dataSource.getRepository(SilabusEntity);
    const silabus = await silabusRepo.findOne({
        where: { id },
        relations: ["mapel", "uploader"]
    });

    if (!silabus) {
      return NextResponse.json({ message: "Silabus tidak ditemukan." }, { status: 404 });
    }
    // Guru hanya bisa melihat silabusnya sendiri atau yang terkait mapelnya (tergantung kebijakan, untuk GET bisa lebih longgar)
    // Untuk saat ini, jika dia guru, dia bisa GET, filter lebih ketat di PUT/DELETE

    return NextResponse.json({
        ...silabus,
        mapel: silabus.mapel ? { id: silabus.mapel.id, nama: silabus.mapel.nama, kode: silabus.mapel.kode } : undefined,
        uploader: silabus.uploader ? { id: silabus.uploader.id, name: silabus.uploader.name, fullName: silabus.uploader.fullName, email: silabus.uploader.email } : undefined
    });
  } catch (error) {
    console.error("Error fetching silabus:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}

// PUT /api/kurikulum/silabus/[id] - Memperbarui silabus
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user.role !== 'admin' && session.user.role !== 'superadmin' && session.user.role !== 'guru')) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ message: "ID silabus tidak valid." }, { status: 400 });
  }

  try {
    const body = await request.json();
    const validation = silabusUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Input tidak valid.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const updateData: Partial<SilabusEntity> = {};
    const validatedData = validation.data;

    if (validatedData.judul !== undefined) updateData.judul = validatedData.judul;
    if (validatedData.mapelId !== undefined) {
        const dataSource = await getInitializedDataSource();
        const mapelRepo = dataSource.getRepository(MataPelajaranEntity);
        const mapelExists = await mapelRepo.findOneBy({ id: validatedData.mapelId });
        if (!mapelExists) {
            return NextResponse.json({ message: "Mata pelajaran tidak ditemukan." }, { status: 404 });
        }
        updateData.mapelId = validatedData.mapelId;
    }
    if (validatedData.kelas !== undefined) updateData.kelas = validatedData.kelas;
    if (validatedData.deskripsiSingkat !== undefined) updateData.deskripsiSingkat = validatedData.deskripsiSingkat;
    
    if (validatedData.namaFileOriginal !== undefined) { // Jika ada file baru (disimulasikan dengan nama)
        updateData.namaFileOriginal = validatedData.namaFileOriginal;
        if (validatedData.namaFileOriginal) { // Hanya set fileUrl jika namaFileOriginal ada
             updateData.fileUrl = `/uploads/kurikulum/silabus/${Date.now()}-${validatedData.namaFileOriginal.replace(/\s+/g, '_')}`;
        } else { // Jika namaFileOriginal dikosongkan, hapus juga fileUrl
            updateData.fileUrl = null;
        }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: "Tidak ada data untuk diperbarui." }, { status: 400 });
    }
    
    const dataSource = await getInitializedDataSource();
    const silabusRepo = dataSource.getRepository(SilabusEntity);

    const existingSilabus = await silabusRepo.findOneBy({ id });
    if (!existingSilabus) {
        return NextResponse.json({ message: "Silabus tidak ditemukan." }, { status: 404 });
    }

    // Otorisasi: Guru hanya bisa mengedit silabus yang mereka unggah
    if (session.user.role === 'guru' && existingSilabus.uploaderId !== session.user.id) {
        return NextResponse.json({ message: "Anda tidak berhak memperbarui silabus ini." }, { status: 403 });
    }

    const updateResult = await silabusRepo.update(id, updateData);

    if (updateResult.affected === 0) {
      return NextResponse.json({ message: "Silabus tidak ditemukan untuk diperbarui." }, { status: 404 });
    }

    const updatedSilabus = await silabusRepo.findOne({ where: {id}, relations: ["mapel", "uploader"]});
    return NextResponse.json({
        ...updatedSilabus,
        mapel: updatedSilabus?.mapel ? { id: updatedSilabus.mapel.id, nama: updatedSilabus.mapel.nama, kode: updatedSilabus.mapel.kode } : undefined,
        uploader: updatedSilabus?.uploader ? { id: updatedSilabus.uploader.id, name: updatedSilabus.uploader.name, fullName: updatedSilabus.uploader.fullName, email: updatedSilabus.uploader.email } : undefined
    });

  } catch (error) {
    console.error("Error updating silabus:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}

// DELETE /api/kurikulum/silabus/[id] - Menghapus silabus
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user.role !== 'admin' && session.user.role !== 'superadmin' && session.user.role !== 'guru')) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ message: "ID silabus tidak valid." }, { status: 400 });
  }

  try {
    const dataSource = await getInitializedDataSource();
    const silabusRepo = dataSource.getRepository(SilabusEntity);

    const silabusToDelete = await silabusRepo.findOneBy({ id });
    if (!silabusToDelete) {
        return NextResponse.json({ message: "Silabus tidak ditemukan." }, { status: 404 });
    }

    // Otorisasi: Guru hanya bisa menghapus silabus yang mereka unggah
    if (session.user.role === 'guru' && silabusToDelete.uploaderId !== session.user.id) {
        return NextResponse.json({ message: "Anda tidak berhak menghapus silabus ini." }, { status: 403 });
    }
    
    // TODO: Di aplikasi nyata, hapus juga file fisik dari storage jika ada fileUrl

    const deleteResult = await silabusRepo.delete(id);

    if (deleteResult.affected === 0) {
      return NextResponse.json({ message: "Silabus tidak ditemukan untuk dihapus." }, { status: 404 });
    }
    return NextResponse.json({ message: "Silabus berhasil dihapus." });
  } catch (error) {
    console.error("Error deleting silabus:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}
    
