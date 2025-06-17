
import "reflect-metadata"; // Ensure this is the very first import
import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth/next"; // REMOVED
// import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // REMOVED
import { getInitializedDataSource } from "@/lib/data-source";
import { MateriAjarEntity } from "@/entities/materi-ajar.entity";
import * as z from "zod";
import { JENIS_MATERI_AJAR, type JenisMateriAjarType } from "@/types";
import { format } from 'date-fns';
import type { User } from '@/types'; // Import User from your types for session user structure

const materiAjarCreateSchema = z.object({
  judul: z.string().min(3, { message: "Judul minimal 3 karakter." }).max(255),
  deskripsi: z.string().optional().nullable(),
  mapelNama: z.string({ required_error: "Mata pelajaran wajib dipilih." }),
  jenisMateri: z.enum(JENIS_MATERI_AJAR, { required_error: "Jenis materi wajib dipilih." }),
  namaFileOriginal: z.string().optional().nullable(),
  fileUrl: z.string().url({ message: "URL tidak valid atau format path salah." }).optional().nullable(),
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
export async function GET(request: NextRequest) { // Added request parameter for future use
  // TODO: Implement server-side Firebase token verification
  // const session = await getServerSession(authOptions); // REMOVED
  // if (!session || (session.user.role !== 'admin' && session.user.role !== 'guru' && session.user.role !== 'superadmin' && session.user.role !== 'siswa')) { // REMOVED
  //   return NextResponse.json({ message: "Akses ditolak." }, { status: 403 }); // REMOVED
  // } // REMOVED

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
  // TODO: Implement server-side Firebase token verification for admin/guru/superadmin
  // const session = await getServerSession(authOptions); // REMOVED
  // For now, we'll assume the uploaderId will be passed in the body or derived from a verified Firebase token.
  // This needs proper auth. For demo, we'll extract uploaderId from a hypothetical, unverified session or body.
  // This is NOT secure for production.
  // if (!session || !session.user || (session.user.role !== 'admin' && session.user.role !== 'guru' && session.user.role !== 'superadmin')) { // REMOVED
  //   return NextResponse.json({ message: "Akses ditolak." }, { status: 403 }); // REMOVED
  // } // REMOVED

  try {
    const body = await request.json();
    // const uploaderId = session?.user?.id; // This would be the correct way if session was available
    const uploaderId = body.uploaderId || "mock-uploader-id"; // MOCK - REPLACE WITH ACTUAL AUTH
    if(!uploaderId) return NextResponse.json({ message: "Uploader ID tidak ditemukan. Autentikasi diperlukan." }, { status: 401 });


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
      uploaderId, // Use extracted/mocked uploaderId
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
