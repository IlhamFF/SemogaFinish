
import "reflect-metadata"; 
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { SklEntity } from "@/entities/skl.entity";
import * as z from "zod";
import { KATEGORI_SKL } from "@/types"; 
import type { KategoriSklType } from "@/types";
import { getAuthenticatedUser } from "@/lib/auth-utils";

const sklCreateSchema = z.object({
  kode: z.string().min(2, { message: "Kode SKL minimal 2 karakter." }).max(50, { message: "Kode SKL maksimal 50 karakter."}),
  deskripsi: z.string().min(10, { message: "Deskripsi SKL minimal 10 karakter." }),
  kategori: z.enum(KATEGORI_SKL, { required_error: "Kategori SKL wajib dipilih." }),
});

export async function GET(request: NextRequest) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
  }
  if (!['admin', 'superadmin'].includes(authenticatedUser.role)) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }

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

export async function POST(request: NextRequest) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
  }
  if (!['admin', 'superadmin'].includes(authenticatedUser.role)) {
    return NextResponse.json({ message: "Akses ditolak. Hanya admin yang dapat membuat SKL." }, { status: 403 });
  }

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
