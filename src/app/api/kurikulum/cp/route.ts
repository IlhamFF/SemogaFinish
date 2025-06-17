
import "reflect-metadata"; // Ensure this is the very first import
import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth/next"; // REMOVED
// import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // REMOVED
import { getInitializedDataSource } from "@/lib/data-source";
import { CpEntity } from "@/entities/cp.entity";
import * as z from "zod";
import { FASE_CP } from "@/types"; 
import type { FaseCpType } from "@/types";

const cpCreateSchema = z.object({
  kode: z.string().min(2, { message: "Kode CP minimal 2 karakter." }).max(100, { message: "Kode CP maksimal 100 karakter."}),
  deskripsi: z.string().min(10, { message: "Deskripsi CP minimal 10 karakter." }),
  fase: z.enum(FASE_CP, { required_error: "Fase CP wajib dipilih." }),
  elemen: z.string().min(3, { message: "Elemen minimal 3 karakter." }).max(255, { message: "Elemen maksimal 255 karakter."}),
});

// GET /api/kurikulum/cp - Mendapatkan semua CP
export async function GET() {
  // TODO: Implement server-side Firebase token verification for admin/superadmin
  // const session = await getServerSession(authOptions); // REMOVED
  // if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) { // REMOVED
  //   return NextResponse.json({ message: "Akses ditolak." }, { status: 403 }); // REMOVED
  // } // REMOVED

  try {
    const dataSource = await getInitializedDataSource();
    const cpRepo = dataSource.getRepository(CpEntity);
    const cps = await cpRepo.find({ order: { kode: "ASC" } });
    return NextResponse.json(cps);
  } catch (error) {
    console.error("Error fetching CP:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}

// POST /api/kurikulum/cp - Membuat CP baru
export async function POST(request: NextRequest) {
  // TODO: Implement server-side Firebase token verification for admin/superadmin
  // const session = await getServerSession(authOptions); // REMOVED
  // if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) { // REMOVED
  //   return NextResponse.json({ message: "Akses ditolak." }, { status: 403 }); // REMOVED
  // } // REMOVED

  try {
    const body = await request.json();
    const validation = cpCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Input tidak valid.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { kode, deskripsi, fase, elemen } = validation.data;

    const dataSource = await getInitializedDataSource();
    const cpRepo = dataSource.getRepository(CpEntity);

    const existingCp = await cpRepo.findOneBy({ kode });
    if (existingCp) {
      return NextResponse.json({ message: "Kode CP sudah ada." }, { status: 409 });
    }

    const newCp = cpRepo.create({
      kode,
      deskripsi,
      fase: fase as FaseCpType,
      elemen,
    });

    await cpRepo.save(newCp);
    return NextResponse.json(newCp, { status: 201 });

  } catch (error: any) {
    console.error("Error creating CP:", error);
    if (error.code === '23505') { 
        return NextResponse.json({ message: "Kode CP sudah ada (dari DB)." }, { status: 409 });
    }
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}
