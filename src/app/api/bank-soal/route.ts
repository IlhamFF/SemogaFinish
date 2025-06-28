import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { SoalEntity } from "@/entities/soal.entity";
import { MataPelajaranEntity } from "@/entities/mata-pelajaran.entity";
import { getAuthenticatedUser } from "@/lib/auth-utils-node";
import * as z from "zod";
import type { TingkatKesulitanEntity, PilihanJawabanEntity } from "@/entities/soal.entity";
import type { TipeSoal } from "@/types";

const pilihanJawabanSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
});

const soalCreateSchema = z.object({
  paketSoal: z.string().min(3),
  tipeSoal: z.enum(["Pilihan Ganda", "Esai"]),
  pertanyaan: z.string().min(10),
  mapelId: z.string().uuid(),
  tingkatKesulitan: z.enum(["Mudah", "Sedang", "Sulit"]),
  pilihanJawaban: z.array(pilihanJawabanSchema).optional().nullable(),
  kunciJawaban: z.string().optional().nullable(),
});

export async function GET(request: NextRequest) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser || !['guru', 'admin', 'superadmin'].includes(authenticatedUser.role)) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }

  try {
    const dataSource = await getInitializedDataSource();
    const soalRepo = dataSource.getRepository(SoalEntity);

    const whereCondition = authenticatedUser.role === 'guru' 
      ? { pembuatId: authenticatedUser.id } 
      : {};

    const soalList = await soalRepo.find({
      where: whereCondition,
      relations: ["mapel", "pembuat"],
      order: { paketSoal: "ASC", createdAt: "ASC" },
    });

    return NextResponse.json(soalList.map(s => ({
        ...s,
        pembuat: s.pembuat ? { fullName: s.pembuat.fullName, email: s.pembuat.email } : null,
    })));
  } catch (error: any) {
    console.error("Error fetching bank soal:", error);
    return NextResponse.json({ message: "Gagal mengambil data bank soal.", error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser || !['guru', 'admin', 'superadmin'].includes(authenticatedUser.role)) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validation = soalCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Input tidak valid.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { paketSoal, tipeSoal, pertanyaan, mapelId, tingkatKesulitan, pilihanJawaban, kunciJawaban } = validation.data;
    
    const dataSource = await getInitializedDataSource();
    const soalRepo = dataSource.getRepository(SoalEntity);

    const newSoal = soalRepo.create({
      paketSoal,
      tipeSoal: tipeSoal as TipeSoal,
      pertanyaan,
      mapelId,
      tingkatKesulitan: tingkatKesulitan as TingkatKesulitanEntity,
      pilihanJawaban: tipeSoal === 'Pilihan Ganda' ? (pilihanJawaban as PilihanJawabanEntity[] | undefined) : null,
      kunciJawaban: tipeSoal === 'Pilihan Ganda' ? kunciJawaban : null,
      pembuatId: authenticatedUser.id,
    });
    
    const savedSoal = await soalRepo.save(newSoal);
    return NextResponse.json(savedSoal, { status: 201 });

  } catch (error: any) {
    console.error("Error creating soal:", error);
    return NextResponse.json({ message: "Gagal membuat soal baru.", error: error.message }, { status: 500 });
  }
}
