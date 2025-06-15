
import "reflect-metadata"; // Ensure this is the very first import
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getInitializedDataSource } from "@/lib/data-source";
import { SlotWaktuEntity } from "@/entities/slot-waktu.entity";
import * as z from "zod";

const slotWaktuCreateSchema = z.object({
  namaSlot: z.string().min(3, { message: "Nama slot minimal 3 karakter." }).max(100),
  waktuMulai: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Format waktuMulai HH:MM, contoh: 07:30"}),
  waktuSelesai: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Format waktuSelesai HH:MM, contoh: 09:00"}),
  urutan: z.coerce.number().optional().nullable(),
}).refine(data => data.waktuMulai < data.waktuSelesai, {
  message: "Waktu mulai harus sebelum waktu selesai.",
  path: ["waktuSelesai"],
});

// GET /api/jadwal/slot-waktu - Mendapatkan semua slot waktu
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }

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

// POST /api/jadwal/slot-waktu - Membuat slot waktu baru
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
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
    
    // Cek overlapping time slots with existing ones if needed (more complex logic)

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
    if (error.code === '23505') { // Unique violation
        return NextResponse.json({ message: "Nama slot waktu sudah ada (dari DB)." }, { status: 409 });
    }
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}
