
import "reflect-metadata"; // Ensure this is the very first import
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getInitializedDataSource } from "@/lib/data-source";
import { MateriAjarEntity } from "@/entities/materi-ajar.entity";
import * as z from "zod";
import { JENIS_MATERI_AJAR, type JenisMateriAjarType } from "@/types";

const materiAjarUpdateSchema = z.object({
  judul: z.string().min(3, { message: "Judul minimal 3 karakter." }).max(255).optional(),
  deskripsi: z.string().optional().nullable(),
  mapelNama: z.string().optional(),
  jenisMateri: z.enum(JENIS_MATERI_AJAR).optional(),
  namaFileOriginal: z.string().optional().nullable(),
  fileUrl: z.string().url({ message: "URL tidak valid atau format path salah." }).optional().nullable(),
}).refine(data => Object.keys(data).length > 0, {
  message: "Minimal satu field harus diisi untuk melakukan pembaruan.",
}).refine(data => {
    // Jika jenisMateri diubah menjadi "Link", fileUrl harus ada.
    if (data.jenisMateri === "Link" && (data.fileUrl === undefined || data.fileUrl === null || data.fileUrl === "")) {
        return false;
    }
    // Jika jenisMateri diubah menjadi "File", namaFileOriginal sebaiknya ada.
    // Ini lebih merupakan validasi frontend saat ini karena kita tidak menangani file upload di sini.
    return true;
}, {
    message: "Jika jenis materi adalah 'Link', URL wajib diisi.",
    path: ["fileUrl"],
});


// GET /api/kurikulum/materi-ajar/[id] - Mendapatkan satu materi ajar
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'guru' && session.user.role !== 'superadmin')) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ message: "ID materi tidak valid." }, { status: 400 });
  }

  try {
    const dataSource = await getInitializedDataSource();
    const materiRepo = dataSource.getRepository(MateriAjarEntity);
    const materi = await materiRepo.findOne({
        where: { id },
        relations: ["uploader"]
    });

    if (!materi) {
      return NextResponse.json({ message: "Materi ajar tidak ditemukan." }, { status: 404 });
    }
    return NextResponse.json({
        ...materi,
        uploader: materi.uploader ? { id: materi.uploader.id, name: materi.uploader.name, fullName: materi.uploader.fullName, email: materi.uploader.email } : undefined
    });
  } catch (error) {
    console.error("Error fetching materi ajar:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}

// PUT /api/kurikulum/materi-ajar/[id] - Memperbarui materi ajar
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user.role !== 'admin' && session.user.role !== 'guru' && session.user.role !== 'superadmin')) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ message: "ID materi tidak valid." }, { status: 400 });
  }

  try {
    const body = await request.json();
    const validation = materiAjarUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Input tidak valid.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const updateData: Partial<MateriAjarEntity> = {};
    const validatedData = validation.data;

    if (validatedData.judul !== undefined) updateData.judul = validatedData.judul;
    if (validatedData.deskripsi !== undefined) updateData.deskripsi = validatedData.deskripsi;
    if (validatedData.mapelNama !== undefined) updateData.mapelNama = validatedData.mapelNama;
    if (validatedData.jenisMateri !== undefined) updateData.jenisMateri = validatedData.jenisMateri as JenisMateriAjarType;
    
    // Jika jenis materi diubah atau adalah File, tangani namaFileOriginal dan fileUrl
    if (validatedData.jenisMateri === "File") {
        if (validatedData.namaFileOriginal !== undefined) { // Jika file baru diunggah (disimulasikan)
            updateData.namaFileOriginal = validatedData.namaFileOriginal;
            // Simulasi path penyimpanan file baru jika nama file baru diberikan
            if (validatedData.namaFileOriginal) {
              updateData.fileUrl = `/uploads/materi/${Date.now()}-${validatedData.namaFileOriginal.replace(/\s+/g, '_')}`;
            } else {
              // Jika namaFileOriginal di-set null/kosong tapi jenisnya File, mungkin ini error atau file lama dipertahankan
              // Untuk PUT, jika namaFileOriginal tidak ada di payload, kita tidak mengubah fileUrl kecuali jenisMateri juga berubah ke Link
            }
        }
        // Jika jenis materi berubah ke File, dan fileUrl ada (dari Link sebelumnya), null-kan
        if (updateData.jenisMateri === "File" && validatedData.fileUrl && !validatedData.namaFileOriginal) {
            // This logic is tricky: if changing to "File" and no new file is specified,
            // what happens to old fileUrl if it was a Link? For now, we assume if namaFileOriginal is not updated,
            // then the existing file (if any) is kept.
        }
    } else if (validatedData.jenisMateri === "Link") {
        if (validatedData.fileUrl !== undefined) updateData.fileUrl = validatedData.fileUrl;
        updateData.namaFileOriginal = null; // Hapus nama file jika jenisnya Link
    } else { // Jenis materi tidak berubah
        if (validatedData.namaFileOriginal !== undefined && body.jenisMateri === "File") { // Cek body.jenisMateri karena validatedData.jenisMateri bisa undefined
            updateData.namaFileOriginal = validatedData.namaFileOriginal;
             if (validatedData.namaFileOriginal) {
              updateData.fileUrl = `/uploads/materi/${Date.now()}-${validatedData.namaFileOriginal.replace(/\s+/g, '_')}`;
            }
        }
        if (validatedData.fileUrl !== undefined && body.jenisMateri === "Link") {
            updateData.fileUrl = validatedData.fileUrl;
        }
    }


    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: "Tidak ada data untuk diperbarui." }, { status: 400 });
    }
    
    const dataSource = await getInitializedDataSource();
    const materiRepo = dataSource.getRepository(MateriAjarEntity);

    const existingMateri = await materiRepo.findOneBy({ id });
    if (!existingMateri) {
        return NextResponse.json({ message: "Materi ajar tidak ditemukan." }, { status: 404 });
    }
    // Authorization: Admin/Superadmin bisa edit semua, Guru hanya miliknya
    if (session.user.role === 'guru' && existingMateri.uploaderId !== session.user.id) {
        return NextResponse.json({ message: "Anda tidak berhak memperbarui materi ini." }, { status: 403 });
    }

    const updateResult = await materiRepo.update(id, updateData);

    if (updateResult.affected === 0) {
      return NextResponse.json({ message: "Materi ajar tidak ditemukan untuk diperbarui." }, { status: 404 });
    }

    const updatedMateri = await materiRepo.findOne({ where: {id}, relations: ["uploader"]});
    return NextResponse.json({
        ...updatedMateri,
        uploader: updatedMateri?.uploader ? { id: updatedMateri.uploader.id, name: updatedMateri.uploader.name, fullName: updatedMateri.uploader.fullName, email: updatedMateri.uploader.email } : undefined
    });

  } catch (error) {
    console.error("Error updating materi ajar:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}

// DELETE /api/kurikulum/materi-ajar/[id] - Menghapus materi ajar
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user.role !== 'admin' && session.user.role !== 'guru' && session.user.role !== 'superadmin')) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ message: "ID materi tidak valid." }, { status: 400 });
  }

  try {
    const dataSource = await getInitializedDataSource();
    const materiRepo = dataSource.getRepository(MateriAjarEntity);

    const materiToDelete = await materiRepo.findOneBy({ id });
    if (!materiToDelete) {
        return NextResponse.json({ message: "Materi ajar tidak ditemukan." }, { status: 404 });
    }
    // Authorization: Admin/Superadmin bisa delete semua, Guru hanya miliknya
    if (session.user.role === 'guru' && materiToDelete.uploaderId !== session.user.id) {
        return NextResponse.json({ message: "Anda tidak berhak menghapus materi ini." }, { status: 403 });
    }
    
    // TODO: Di aplikasi nyata, hapus juga file fisik dari storage jika jenisnya "File"

    const deleteResult = await materiRepo.delete(id);

    if (deleteResult.affected === 0) {
      return NextResponse.json({ message: "Materi ajar tidak ditemukan untuk dihapus." }, { status: 404 });
    }
    return NextResponse.json({ message: "Materi ajar berhasil dihapus." });
  } catch (error) {
    console.error("Error deleting materi ajar:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}
