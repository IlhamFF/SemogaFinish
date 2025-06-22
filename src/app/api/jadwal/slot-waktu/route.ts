
import "reflect-metadata"; 
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { SlotWaktuEntity } from "@/entities/slot-waktu.entity";
import * as z from "zod";
import { getAuthenticatedUser } from "@/lib/auth-utils-node";

const slotWaktuCreateSchema = z.object({
  namaSlot: z.string().min(3, { message: "Nama slot minimal 3 karakter." }).max(100),
  waktuMulai: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Format waktuMulai HH:MM, contoh: 07:30"}),
  waktuSelesai: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Format waktuSelesai HH:MM, contoh: 09:00"}),
  urutan: z.coerce.number().optional().nullable(),
}).refine(data => data.waktuMulai < data.waktuSelesai, {
  message: "Waktu mulai harus sebelum waktu selesai.",
  path: ["waktuSelesai"],
});

export async function GET(request: NextRequest) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
  }
  // Semua user terautentikasi bisa melihat daftar slot waktu
  // if (!['admin', 'superadmin'].includes(authenticatedUser.role)) {
  //   return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  // }

  try {
    const dataSource = await getInitializedDataSource();
    const slotWaktuRepo = dataSource.getRepository(SlotWaktuEntity);
    const slotWaktuList = await slotWaktuRepo.find({ order: { urutan: "ASC", waktuMulai: "ASC" } });
    return NextResponse.json(slotWaktuList);
  } catch (error) {
    console.error("Error fetching slot waktu:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
  }
  if (!['admin', 'superadmin'].includes(authenticatedUser.role)) {
    return NextResponse.json({ message: "Akses ditolak. Hanya admin yang dapat membuat slot waktu." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validation = slotWaktuCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Input tidak valid.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { namaSlot, waktuMulai, waktuSelesai, urutan } = validation.data;

    const dataSource = await getInitializedDataSource();
    const slotWaktuRepo = dataSource.getRepository(SlotWaktuEntity);

    const existingSlot = await slotWaktuRepo.findOneBy({ namaSlot });
    if (existingSlot) {
      return NextResponse.json({ message: "Nama slot waktu sudah ada." }, { status: 409 });
    }
    
    const newSlotWaktu = slotWaktuRepo.create({
      namaSlot,
      waktuMulai,
      waktuSelesai,
      urutan,
    });

    await slotWaktuRepo.save(newSlotWaktu);
    return NextResponse.json(newSlotWaktu, { status: 201 });

  } catch (error: any) {
    console.error("Error creating slot waktu:", error);
    if (error.code === '23505') { 
        return NextResponse.json({ message: "Nama slot waktu sudah ada (dari DB)." }, { status: 409 });
    }
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}
