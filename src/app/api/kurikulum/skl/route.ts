
import "reflect-metadata"; // Ensure this is the very first import
import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth/next"; // REMOVED
// import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // REMOVED
import { getInitializedDataSource } from "@/lib/data-source";
import { SklEntity } from "@/entities/skl.entity";
import * as z from "zod";
import { KATEGORI_SKL } from "@/types"; 
import type { KategoriSklType } from "@/types";

const sklCreateSchema = z.object({
  kode: z.string().min(2, { message: "Kode SKL minimal 2 karakter." }).max(50, { message: "Kode SKL maksimal 50 karakter."}),
  deskripsi: z.string().min(10, { message: "Deskripsi SKL minimal 10 karakter." }),
  kategori: z.enum(KATEGORI_SKL, { required_error: "Kategori SKL wajib dipilih." }),
});

// GET /api/kurikulum/skl - Mendapatkan semua SKL
export async function GET() {
  // TODO: Implement server-side Firebase token verification for admin/superadmin
  // const session = await getServerSession(authOptions); // REMOVED
  // if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) { // REMOVED
  //   return NextResponse.json({ message: "Akses ditolak." }, { status: 403 }); // REMOVED
  // } // REMOVED

  try {
    const dataSource = await getInitializedDataSource();
    const sklRepo = dataSource.getRepository(SklEntity);
    const skls = await sklRepo.find({ order: { kode: "ASC" } });
    return NextResponse.json(skls);
  } catch (error) {
    console.error("Error fetching SKL:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}

// POST /api/kurikulum/skl - Membuat SKL baru
export async function POST(request: NextRequest) {
  // TODO: Implement server-side Firebase token verification for admin/superadmin
  // const session = await getServerSession(authOptions); // REMOVED
  // if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) { // REMOVED
  //   return NextResponse.json({ message: "Akses ditolak." }, { status: 403 }); // REMOVED
  // } // REMOVED

  try {
    const body = await request.json();
    const validation = sklCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Input tidak valid.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { kode, deskripsi, kategori } = validation.data;

    const dataSource = await getInitializedDataSource();
    const sklRepo = dataSource.getRepository(SklEntity);

    const existingSkl = await sklRepo.findOneBy({ kode });
    if (existingSkl) {
      return NextResponse.json({ message: "Kode SKL sudah ada." }, { status: 409 });
    }

    const newSkl = sklRepo.create({
      kode,
      deskripsi,
      kategori: kategori as KategoriSklType,
    });

    await sklRepo.save(newSkl);
    return NextResponse.json(newSkl, { status: 201 });

  } catch (error: any) {
    console.error("Error creating SKL:", error);
    if (error.code === '23505') {
        return NextResponse.json({ message: "Kode SKL sudah ada (dari DB)." }, { status: 409 });
    }
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}
