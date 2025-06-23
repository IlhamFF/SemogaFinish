
import "reflect-metadata"; 
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { MateriAjarEntity } from "@/entities/materi-ajar.entity";
import * as z from "zod";
import { JENIS_MATERI_AJAR, type JenisMateriAjarType } from "@/types";
import { getAuthenticatedUser } from "@/lib/auth-utils-node";

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
    if (data.jenisMateri === "Link" && (data.fileUrl === undefined || data.fileUrl === null || data.fileUrl === "")) {
        return false;
    }
    return true;
}, {
    message: "Jika jenis materi adalah 'Link', URL wajib diisi.",
    path: ["fileUrl"],
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
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
    
    if (validatedData.jenisMateri === "File") {
        if (validatedData.namaFileOriginal !== undefined) {
            updateData.namaFileOriginal = validatedData.namaFileOriginal;
            if (validatedData.namaFileOriginal) {
              updateData.fileUrl = `/uploads/materi/${Date.now()}-${validatedData.namaFileOriginal.replace(/\s+/g, '_')}`;
            } else {
              updateData.fileUrl = null;
            }
        }
    } else if (validatedData.jenisMateri === "Link") {
        if (validatedData.fileUrl !== undefined) updateData.fileUrl = validatedData.fileUrl;
        updateData.namaFileOriginal = null;
    } else { 
        if (validatedData.namaFileOriginal !== undefined && body.jenisMateri === "File") {
            updateData.namaFileOriginal = validatedData.namaFileOriginal;
             if (validatedData.namaFileOriginal) {
              updateData.fileUrl = `/uploads/materi/${Date.now()}-${validatedData.namaFileOriginal.replace(/\s+/g, '_')}`;
            } else {
              updateData.fileUrl = null;
            }
        }
        if (validatedData.fileUrl !== undefined && body.jenisMateri === "Link") {
            updateData.fileUrl = validatedData.fileUrl;
            if (body.jenisMateri === "Link") updateData.namaFileOriginal = null;
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

    if (authenticatedUser.role !== 'admin' && authenticatedUser.role !== 'superadmin' && existingMateri.uploaderId !== authenticatedUser.id) {
      return NextResponse.json({ message: "Akses ditolak. Anda bukan pemilik materi ini." }, { status: 403 });
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
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
    
    if (authenticatedUser.role !== 'admin' && authenticatedUser.role !== 'superadmin' && materiToDelete.uploaderId !== authenticatedUser.id) {
      return NextResponse.json({ message: "Akses ditolak. Anda bukan pemilik materi ini." }, { status: 403 });
    }
    
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
