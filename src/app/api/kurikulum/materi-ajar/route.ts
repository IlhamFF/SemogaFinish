
import "reflect-metadata"; // Ensure this is the very first import
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getInitializedDataSource } from "@/lib/data-source";
import { MateriAjarEntity } from "@/entities/materi-ajar.entity";
import * as z from "zod";
import { JENIS_MATERI_AJAR, type JenisMateriAjarType } from "@/types";
import { format } from 'date-fns';

const materiAjarCreateSchema = z.object({
  judul: z.string().min(3, { message: "Judul minimal 3 karakter." }).max(255),
  deskripsi: z.string().optional().nullable(),
  mapelNama: z.string({ required_error: "Mata pelajaran wajib dipilih." }),
  jenisMateri: z.enum(JENIS_MATERI_AJAR, { required_error: "Jenis materi wajib dipilih." }),
  namaFileOriginal: z.string().optional().nullable(),
  fileUrl: z.string().url({ message: "URL tidak valid atau format path salah." }).optional().nullable(),
}).refine(data => {
    if (data.jenisMateri === "File" && !data.namaFileOriginal) {
        // Untuk tipe File, namaFileOriginal idealnya ada. fileUrl akan diset ke path internal (simulasi)
        // Dalam implementasi nyata, fileUrl bisa diisi setelah upload berhasil.
        // Untuk saat ini, kita akan membuat fileUrl menjadi opsional jika jenisMateri "File" dan namaFileOriginal ada.
        return true; 
    }
    if (data.jenisMateri === "Link" && !data.fileUrl) {
        return false; // Jika jenis Link, fileUrl (URL eksternal) wajib ada
    }
    return true;
}, {
    message: "Jika jenis materi adalah 'Link', URL wajib diisi. Jika 'File', nama file sebaiknya ada.",
    path: ["fileUrl"], // Atau path yang lebih sesuai
});


// GET /api/kurikulum/materi-ajar - Mendapatkan semua materi ajar
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'guru' && session.user.role !== 'superadmin')) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }

  try {
    const dataSource = await getInitializedDataSource();
    const materiRepo = dataSource.getRepository(MateriAjarEntity);
    const materiList = await materiRepo.find({ 
        order: { tanggalUpload: "DESC", createdAt: "DESC" },
        relations: ["uploader"] // Memuat relasi uploader
    });
    // Map uploader to exclude sensitive data if needed, or ensure UserEntity select is configured
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
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user.role !== 'admin' && session.user.role !== 'guru' && session.user.role !== 'superadmin')) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }

  try {
    // Untuk saat ini, kita tidak menangani upload file multipart/form-data.
    // Frontend akan mengirimkan metadata termasuk nama file (jika ada) dan URL (jika link).
    const body = await request.json();
    const validation = materiAjarCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Input tidak valid.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { judul, deskripsi, mapelNama, jenisMateri, namaFileOriginal, fileUrl } = validation.data;
    const uploaderId = session.user.id;

    const dataSource = await getInitializedDataSource();
    const materiRepo = dataSource.getRepository(MateriAjarEntity);

    let finalFileUrl = fileUrl;
    if (jenisMateri === "File" && namaFileOriginal) {
      // Simulasi path penyimpanan file. Di aplikasi nyata, ini akan dari hasil upload.
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
      uploaderId,
    });

    await materiRepo.save(newMateri);
    
    // Muat ulang dengan relasi untuk respons
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
