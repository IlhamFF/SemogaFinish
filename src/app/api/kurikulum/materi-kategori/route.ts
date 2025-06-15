
import "reflect-metadata"; // Ensure this is the very first import
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getInitializedDataSource } from "@/lib/data-source";
import { MateriKategoriEntity } from "@/entities/materi-kategori.entity";
import * as z from "zod";

const kategoriCreateSchema = z.object({
  nama: z.string().min(3, { message: "Nama kategori minimal 3 karakter." }).max(255, { message: "Nama kategori maksimal 255 karakter." }),
});

// GET /api/kurikulum/materi-kategori - Mendapatkan semua kategori materi
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }

  try {
    const dataSource = await getInitializedDataSource();
    const kategoriRepo = dataSource.getRepository(MateriKategoriEntity);
    const kategoriList = await kategoriRepo.find({ order: { nama: "ASC" } });
    return NextResponse.json(kategoriList);
  } catch (error) {
    console.error("Error fetching kategori materi:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}

// POST /api/kurikulum/materi-kategori - Membuat kategori materi baru
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validation = kategoriCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Input tidak valid.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { nama } = validation.data;

    const dataSource = await getInitializedDataSource();
    const kategoriRepo = dataSource.getRepository(MateriKategoriEntity);

    const existingKategori = await kategoriRepo.findOneBy({ nama });
    if (existingKategori) {
      return NextResponse.json({ message: "Nama kategori sudah ada." }, { status: 409 });
    }

    const newKategori = kategoriRepo.create({ nama });
    await kategoriRepo.save(newKategori);
    return NextResponse.json(newKategori, { status: 201 });

  } catch (error: any) {
    console.error("Error creating kategori materi:", error);
    if (error.code === '23505') { // Kode error PostgreSQL untuk unique violation
        return NextResponse.json({ message: "Nama kategori sudah ada (dari DB)." }, { status: 409 });
    }
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}
    