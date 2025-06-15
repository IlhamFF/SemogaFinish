
import "reflect-metadata"; // Ensure this is the very first import
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getInitializedDataSource } from "@/lib/data-source";
import { StrukturKurikulumEntity } from "@/entities/struktur-kurikulum.entity";
import { MataPelajaranEntity } from "@/entities/mata-pelajaran.entity";
import { UserEntity } from "@/entities/user.entity";
import * as z from "zod";
import { SCHOOL_GRADE_LEVELS, SCHOOL_MAJORS } from "@/lib/constants";

const strukturKurikulumCreateSchema = z.object({
  tingkat: z.enum(SCHOOL_GRADE_LEVELS as [string, ...string[]], { // Cast to satisfy Zod enum
    required_error: "Tingkat wajib diisi.",
    invalid_type_error: "Tingkat tidak valid.",
  }),
  jurusan: z.enum(SCHOOL_MAJORS as [string, ...string[]], { // Cast to satisfy Zod enum
    required_error: "Jurusan wajib diisi.",
    invalid_type_error: "Jurusan tidak valid.",
  }),
  mapelId: z.string().uuid({ message: "ID Mata Pelajaran tidak valid." }),
  alokasiJam: z.coerce.number().min(1, { message: "Alokasi jam minimal 1." }),
  guruPengampuId: z.string().uuid({ message: "ID Guru Pengampu tidak valid." }).optional().nullable(),
});

const strukturKurikulumGetSchema = z.object({
  tingkat: z.enum(SCHOOL_GRADE_LEVELS as [string, ...string[]], { 
    required_error: "Parameter tingkat wajib diisi.",
    invalid_type_error: "Parameter tingkat tidak valid.",
  }),
  jurusan: z.enum(SCHOOL_MAJORS as [string, ...string[]], {
    required_error: "Parameter jurusan wajib diisi.",
    invalid_type_error: "Parameter jurusan tidak valid.",
  }),
});


// GET /api/kurikulum/struktur?tingkat=X&jurusan=IPA - Mendapatkan struktur kurikulum
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const queryParams = {
    tingkat: searchParams.get("tingkat"),
    jurusan: searchParams.get("jurusan"),
  };
  
  const validation = strukturKurikulumGetSchema.safeParse(queryParams);
  if (!validation.success) {
    return NextResponse.json({ message: "Parameter query tidak valid.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
  }
  
  const { tingkat, jurusan } = validation.data;

  try {
    const dataSource = await getInitializedDataSource();
    const strukturRepo = dataSource.getRepository(StrukturKurikulumEntity);
    
    const strukturList = await strukturRepo.find({
      where: { tingkat, jurusan },
      relations: ["mapel", "guruPengampu"], // Memuat relasi mapel dan guruPengampu
      order: { mapel: { nama: "ASC" } }, // Urutkan berdasarkan nama mapel
    });

    // Format respons agar sesuai dengan StrukturKurikulumItem di frontend
    const formattedStrukturList = strukturList.map(item => ({
      id: item.id,
      tingkat: item.tingkat,
      jurusan: item.jurusan,
      mapelId: item.mapelId,
      namaMapel: item.mapel.nama, // Ambil nama mapel dari relasi
      alokasiJam: item.alokasiJam,
      guruPengampuId: item.guruPengampuId,
      guruPengampuNama: item.guruPengampu ? (item.guruPengampu.fullName || item.guruPengampu.name) : null, // Ambil nama guru dari relasi
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    return NextResponse.json(formattedStrukturList);
  } catch (error) {
    console.error("Error fetching struktur kurikulum:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}

// POST /api/kurikulum/struktur - Membuat item struktur kurikulum baru
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validation = strukturKurikulumCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Input tidak valid.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { tingkat, jurusan, mapelId, alokasiJam, guruPengampuId } = validation.data;

    const dataSource = await getInitializedDataSource();
    const strukturRepo = dataSource.getRepository(StrukturKurikulumEntity);
    const mapelRepo = dataSource.getRepository(MataPelajaranEntity);
    const userRepo = dataSource.getRepository(UserEntity);

    // Cek apakah mata pelajaran ada
    const mapelExists = await mapelRepo.findOneBy({ id: mapelId });
    if (!mapelExists) {
      return NextResponse.json({ message: "Mata pelajaran tidak ditemukan." }, { status: 404 });
    }

    // Jika guruPengampuId ada, cek apakah user ada dan merupakan guru
    if (guruPengampuId) {
      const guruExists = await userRepo.findOneBy({ id: guruPengampuId });
      if (!guruExists) {
        return NextResponse.json({ message: "Guru pengampu tidak ditemukan." }, { status: 404 });
      }
      if (guruExists.role !== 'guru') {
        return NextResponse.json({ message: "Pengguna yang dipilih bukan guru." }, { status: 400 });
      }
    }

    // Cek duplikasi (mapel yang sama tidak boleh ada dua kali dalam tingkat & jurusan yang sama)
    const existingEntry = await strukturRepo.findOne({
      where: { tingkat, jurusan, mapelId }
    });
    if (existingEntry) {
      return NextResponse.json({ message: "Mata pelajaran ini sudah ada dalam struktur kurikulum untuk tingkat dan jurusan tersebut." }, { status: 409 });
    }

    const newStrukturEntry = strukturRepo.create({
      tingkat,
      jurusan,
      mapelId,
      alokasiJam,
      guruPengampuId: guruPengampuId || null, // Simpan null jika tidak ada
    });

    await strukturRepo.save(newStrukturEntry);
    
    // Ambil data yang baru disimpan beserta relasinya untuk respons
    const savedEntryWithRelations = await strukturRepo.findOne({
        where: { id: newStrukturEntry.id },
        relations: ["mapel", "guruPengampu"],
    });
    
    if (!savedEntryWithRelations) { // Seharusnya tidak terjadi jika save berhasil
        return NextResponse.json({ message: "Gagal mengambil data setelah penyimpanan." }, { status: 500 });
    }

    const responseData = {
        id: savedEntryWithRelations.id,
        tingkat: savedEntryWithRelations.tingkat,
        jurusan: savedEntryWithRelations.jurusan,
        mapelId: savedEntryWithRelations.mapelId,
        namaMapel: savedEntryWithRelations.mapel.nama,
        alokasiJam: savedEntryWithRelations.alokasiJam,
        guruPengampuId: savedEntryWithRelations.guruPengampuId,
        guruPengampuNama: savedEntryWithRelations.guruPengampu ? (savedEntryWithRelations.guruPengampu.fullName || savedEntryWithRelations.guruPengampu.name) : null,
        createdAt: savedEntryWithRelations.createdAt,
        updatedAt: savedEntryWithRelations.updatedAt,
    };


    return NextResponse.json(responseData, { status: 201 });

  } catch (error: any) {
    console.error("Error creating struktur kurikulum entry:", error);
     if (error.code === '23505') { // Kode error PostgreSQL untuk unique violation
        return NextResponse.json({ message: "Kombinasi tingkat, jurusan, dan mapel sudah ada (dari DB)." }, { status: 409 });
    }
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}

// TODO: Implement PUT /api/kurikulum/struktur/[id] - Update specific entry
// TODO: Implement DELETE /api/kurikulum/struktur/[id] - Delete specific entry
// Pertimbangkan apakah frontend akan mengelola ini per item, atau me-rebuild seluruh struktur per tingkat/jurusan.
// Untuk saat ini, kita akan mengandalkan frontend untuk mengelola ini (hapus semua lalu tambah ulang, atau filter di client).
// Jika diperlukan, kita bisa buat route [id] nanti.
    

    