
import "reflect-metadata"; // Ensure this is the very first import
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { MateriAjarEntity } from "@/entities/materi-ajar.entity";
import * as z from "zod";
import { JENIS_MATERI_AJAR, type JenisMateriAjarType } from "@/types";
import { format } from 'date-fns';
import { getAuthenticatedUser } from "@/lib/auth-utils"; // Import new auth util

const materiAjarCreateSchema = z.object({
  judul: z.string().min(3, { message: "Judul minimal 3 karakter." }).max(255),
  deskripsi: z.string().optional().nullable(),
  mapelNama: z.string({ required_error: "Mata pelajaran wajib dipilih." }),
  jenisMateri: z.enum(JENIS_MATERI_AJAR, { required_error: "Jenis materi wajib dipilih." }),
  namaFileOriginal: z.string().optional().nullable(),
  fileUrl: z.string().url({ message: "URL tidak valid atau format path salah." }).optional().nullable(),
  // uploaderId is removed from here, will be taken from token
}).refine(data => {
    if (data.jenisMateri === "File" && !data.namaFileOriginal) {
        return true; 
    }
    if (data.jenisMateri === "Link" && !data.fileUrl) {
        return false;
    }
    return true;
}, {
    message: "Jika jenis materi adalah 'Link', URL wajib diisi. Jika 'File', nama file sebaiknya ada.",
    path: ["fileUrl"],
});

// GET /api/kurikulum/materi-ajar - Mendapatkan semua materi ajar
export async function GET(request: NextRequest) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: "Akses ditolak. Tidak terautentikasi." }, { status: 401 });
  }
  // Further role-based access for GET can be added here if needed

  try {
    const dataSource = await getInitializedDataSource();
    const materiRepo = dataSource.getRepository(MateriAjarEntity);
    const materiList = await materiRepo.find({ 
        order: { tanggalUpload: "DESC", createdAt: "DESC" },
        relations: ["uploader"]
    });
    return NextResponse.json(materiList.map(m => ({
        ...m,
        uploader: m.uploader ? { id: m.uploader.id, name: m.uploader.name, fullName: m.uploader.fullName, email: m.uploader.email } : undefined
    })));
  } catch (error) {
    console.error("Error fetching materi ajar:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}

// POST /api/kurikulum/materi-ajar - Membuat materi ajar baru
export async function POST(request: NextRequest) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: "Akses ditolak. Tidak terautentikasi." }, { status: 401 });
  }
  // Check if user role is allowed to create material (e.g., guru, admin, superadmin)
  if (!['guru', 'admin', 'superadmin'].includes(authenticatedUser.role)) {
    return NextResponse.json({ message: "Akses ditolak. Peran tidak diizinkan." }, { status: 403 });
  }
  const uploaderId = authenticatedUser.id;

  try {
    const body = await request.json();
    const validation = materiAjarCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Input tidak valid.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { judul, deskripsi, mapelNama, jenisMateri, namaFileOriginal, fileUrl } = validation.data;
    
    const dataSource = await getInitializedDataSource();
    const materiRepo = dataSource.getRepository(MateriAjarEntity);

    let finalFileUrl = fileUrl;
    if (jenisMateri === "File" && namaFileOriginal) {
      finalFileUrl = `/uploads/materi/${Date.now()}-${namaFileOriginal.replace(/\s+/g, '_')}`;
    }

    const newMateri = materiRepo.create({
      judul,
      deskripsi,
      mapelNama,
      jenisMateri: jenisMateri as JenisMateriAjarType,
      namaFileOriginal: jenisMateri === "File" ? namaFileOriginal : null,
      fileUrl: finalFileUrl,
      tanggalUpload: format(new Date(), "yyyy-MM-dd"),
      uploaderId, // Use uploaderId from authenticated token
    });

    await materiRepo.save(newMateri);
    
    const savedMateriWithUploader = await materiRepo.findOne({
        where: { id: newMateri.id },
        relations: ["uploader"]
    });
    
    return NextResponse.json({
        ...savedMateriWithUploader,
        uploader: savedMateriWithUploader?.uploader ? { id: savedMateriWithUploader.uploader.id, name: savedMateriWithUploader.uploader.name, fullName: savedMateriWithUploader.uploader.fullName, email: savedMateriWithUploader.uploader.email } : undefined
    }, { status: 201 });

  } catch (error: any) {
    console.error("Error creating materi ajar:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server.", error: error.message }, { status: 500 });
  }
}
