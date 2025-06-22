
import "reflect-metadata"; 
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { CpEntity } from "@/entities/cp.entity";
import * as z from "zod";
import { FASE_CP } from "@/types"; 
import type { FaseCpType } from "@/types";
import { getAuthenticatedUser } from "@/lib/auth-utils";

const cpCreateSchema = z.object({
  kode: z.string().min(2, { message: "Kode CP minimal 2 karakter." }).max(100, { message: "Kode CP maksimal 100 karakter."}),
  deskripsi: z.string().min(10, { message: "Deskripsi CP minimal 10 karakter." }),
  fase: z.enum(FASE_CP, { required_error: "Fase CP wajib dipilih." }),
  elemen: z.string().min(3, { message: "Elemen minimal 3 karakter." }).max(255, { message: "Elemen maksimal 255 karakter."}),
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
    const cpRepo = dataSource.getRepository(CpEntity);
    const cps = await cpRepo.find({ order: { kode: "ASC" } });
    return NextResponse.json(cps);
  } catch (error) {
    console.error("Error fetching CP:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
  }
  if (!['admin', 'superadmin'].includes(authenticatedUser.role)) {
    return NextResponse.json({ message: "Akses ditolak. Hanya admin yang dapat membuat CP." }, { status: 403 });
  }

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
