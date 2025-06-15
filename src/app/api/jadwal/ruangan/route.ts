
import "reflect-metadata"; // Ensure this is the very first import
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getInitializedDataSource } from "@/lib/data-source";
import { RuanganEntity } from "@/entities/ruangan.entity";
import * as z from "zod";

const ruanganCreateSchema = z.object({
  nama: z.string().min(3, { message: "Nama ruangan minimal 3 karakter." }).max(255),
  kode: z.string().min(2, { message: "Kode ruangan minimal 2 karakter." }).max(50),
  kapasitas: z.coerce.number().min(1, { message: "Kapasitas minimal 1." }),
  fasilitas: z.string().optional().nullable(),
});

// GET /api/jadwal/ruangan - Mendapatkan semua ruangan
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }

  try {
    const dataSource = await getInitializedDataSource();
    const ruanganRepo = dataSource.getRepository(RuanganEntity);
    const ruanganList = await ruanganRepo.find({ order: { nama: "ASC" } });
    return NextResponse.json(ruanganList);
  } catch (error) {
    console.error("Error fetching ruangan:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}

// POST /api/jadwal/ruangan - Membuat ruangan baru
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validation = ruanganCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Input tidak valid.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { nama, kode, kapasitas, fasilitas } = validation.data;

    const dataSource = await getInitializedDataSource();
    const ruanganRepo = dataSource.getRepository(RuanganEntity);

    const existingRuangan = await ruanganRepo.findOneBy({ kode });
    if (existingRuangan) {
      return NextResponse.json({ message: "Kode ruangan sudah ada." }, { status: 409 });
    }

    const newRuangan = ruanganRepo.create({
      nama,
      kode,
      kapasitas,
      fasilitas,
    });

    await ruanganRepo.save(newRuangan);
    return NextResponse.json(newRuangan, { status: 201 });

  } catch (error: any) {
    console.error("Error creating ruangan:", error);
    if (error.code === '23505') { // Unique violation
        return NextResponse.json({ message: "Kode ruangan sudah ada (dari DB)." }, { status: 409 });
    }
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}
