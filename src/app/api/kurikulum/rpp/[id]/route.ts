
import "reflect-metadata"; // Ensure this is the very first import
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getInitializedDataSource } from "@/lib/data-source";
import { RppEntity } from "@/entities/rpp.entity";
import { MataPelajaranEntity } from "@/entities/mata-pelajaran.entity";
import * as z from "zod";

const rppUpdateSchema = z.object({
  judul: z.string().min(5, { message: "Judul RPP minimal 5 karakter." }).max(255).optional(),
  mapelId: z.string().uuid({ message: "ID Mata Pelajaran tidak valid." }).optional(),
  kelas: z.string().min(1, { message: "Kelas wajib diisi." }).max(100).optional(),
  pertemuanKe: z.coerce.number().min(1, { message: "Pertemuan ke minimal 1." }).optional(),
  materiPokok: z.string().optional().nullable(),
  kegiatanPembelajaran: z.string().optional().nullable(),
  penilaian: z.string().optional().nullable(),
  namaFileOriginal: z.string().optional().nullable(),
}).refine(data => Object.keys(data).length > 0, {
  message: "Minimal satu field harus diisi untuk melakukan pembaruan.",
});

// GET /api/kurikulum/rpp/[id] - Mendapatkan satu RPP
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user ||(session.user.role !== 'admin' && session.user.role !== 'superadmin' && session.user.role !== 'guru')) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ message: "ID RPP tidak valid." }, { status: 400 });
  }

  try {
    const dataSource = await getInitializedDataSource();
    const rppRepo = dataSource.getRepository(RppEntity);
    const rpp = await rppRepo.findOne({
        where: { id },
        relations: ["mapel", "uploader"]
    });

    if (!rpp) {
      return NextResponse.json({ message: "RPP tidak ditemukan." }, { status: 404 });
    }
    // Otorisasi: Guru hanya bisa melihat RPP yang mereka unggah
    if (session.user.role === 'guru' && rpp.uploaderId !== session.user.id) {
        // Admin/Superadmin bisa lihat semua, guru hanya miliknya.
        // Jika ingin guru bisa lihat RPP mapelnya walau bukan dia yg upload, logikanya beda.
        // Untuk GET ini, kita anggap guru bisa lihat jika itu RPPnya
        return NextResponse.json({ message: "Anda tidak berhak melihat RPP ini." }, { status: 403 });
    }

    return NextResponse.json({
        ...rpp,
        mapel: rpp.mapel ? { id: rpp.mapel.id, nama: rpp.mapel.nama, kode: rpp.mapel.kode } : undefined,
        uploader: rpp.uploader ? { id: rpp.uploader.id, name: rpp.uploader.name, fullName: rpp.uploader.fullName, email: rpp.uploader.email } : undefined
    });
  } catch (error) {
    console.error("Error fetching RPP:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}

// PUT /api/kurikulum/rpp/[id] - Memperbarui RPP
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
    return NextResponse.json({ message: "ID RPP tidak valid." }, { status: 400 });
  }

  try {
    const body = await request.json();
    const validation = rppUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Input tidak valid.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const updateData: Partial<RppEntity> = {};
    const validatedData = validation.data;

    if (validatedData.judul !== undefined) updateData.judul = validatedData.judul;
    if (validatedData.mapelId !== undefined) {
        const dataSource = await getInitializedDataSource(); // Re-get for this scope
        const mapelRepo = dataSource.getRepository(MataPelajaranEntity);
        const mapelExists = await mapelRepo.findOneBy({ id: validatedData.mapelId });
        if (!mapelExists) {
            return NextResponse.json({ message: "Mata pelajaran tidak ditemukan." }, { status: 404 });
        }
        updateData.mapelId = validatedData.mapelId;
    }
    if (validatedData.kelas !== undefined) updateData.kelas = validatedData.kelas;
    if (validatedData.pertemuanKe !== undefined) updateData.pertemuanKe = validatedData.pertemuanKe;
    if (validatedData.materiPokok !== undefined) updateData.materiPokok = validatedData.materiPokok;
    if (validatedData.kegiatanPembelajaran !== undefined) updateData.kegiatanPembelajaran = validatedData.kegiatanPembelajaran;
    if (validatedData.penilaian !== undefined) updateData.penilaian = validatedData.penilaian;
    
    if (validatedData.namaFileOriginal !== undefined) {
        updateData.namaFileOriginal = validatedData.namaFileOriginal;
        if (validatedData.namaFileOriginal) {
             updateData.fileUrl = `/uploads/kurikulum/rpp/${Date.now()}-${validatedData.namaFileOriginal.replace(/\s+/g, '_')}`;
        } else {
            updateData.fileUrl = null;
        }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: "Tidak ada data untuk diperbarui." }, { status: 400 });
    }
    
    const dataSource = await getInitializedDataSource();
    const rppRepo = dataSource.getRepository(RppEntity);

    const existingRpp = await rppRepo.findOneBy({ id });
    if (!existingRpp) {
        return NextResponse.json({ message: "RPP tidak ditemukan." }, { status: 404 });
    }

    if (session.user.role === 'guru' && existingRpp.uploaderId !== session.user.id) {
        return NextResponse.json({ message: "Anda tidak berhak memperbarui RPP ini." }, { status: 403 });
    }

    const updateResult = await rppRepo.update(id, updateData);

    if (updateResult.affected === 0) {
      return NextResponse.json({ message: "RPP tidak ditemukan untuk diperbarui." }, { status: 404 });
    }

    const updatedRpp = await rppRepo.findOne({ where: {id}, relations: ["mapel", "uploader"]});
    return NextResponse.json({
        ...updatedRpp,
        mapel: updatedRpp?.mapel ? { id: updatedRpp.mapel.id, nama: updatedRpp.mapel.nama, kode: updatedRpp.mapel.kode } : undefined,
        uploader: updatedRpp?.uploader ? { id: updatedRpp.uploader.id, name: updatedRpp.uploader.name, fullName: updatedRpp.uploader.fullName, email: updatedRpp.uploader.email } : undefined
    });

  } catch (error) {
    console.error("Error updating RPP:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}

// DELETE /api/kurikulum/rpp/[id] - Menghapus RPP
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
    return NextResponse.json({ message: "ID RPP tidak valid." }, { status: 400 });
  }

  try {
    const dataSource = await getInitializedDataSource();
    const rppRepo = dataSource.getRepository(RppEntity);

    const rppToDelete = await rppRepo.findOneBy({ id });
    if (!rppToDelete) {
        return NextResponse.json({ message: "RPP tidak ditemukan." }, { status: 404 });
    }

    if (session.user.role === 'guru' && rppToDelete.uploaderId !== session.user.id) {
        return NextResponse.json({ message: "Anda tidak berhak menghapus RPP ini." }, { status: 403 });
    }
    
    const deleteResult = await rppRepo.delete(id);

    if (deleteResult.affected === 0) {
      return NextResponse.json({ message: "RPP tidak ditemukan untuk dihapus." }, { status: 404 });
    }
    return NextResponse.json({ message: "RPP berhasil dihapus." });
  } catch (error) {
    console.error("Error deleting RPP:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}

