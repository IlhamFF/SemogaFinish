
import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth/next"; // REMOVED
// import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // REMOVED
import { getInitializedDataSource } from "@/lib/data-source";
import { JadwalPelajaranEntity } from "@/entities/jadwal-pelajaran.entity";
import { UserEntity } from "@/entities/user.entity";
import { MataPelajaranEntity } from "@/entities/mata-pelajaran.entity";
import { RuanganEntity } from "@/entities/ruangan.entity";
import { SlotWaktuEntity } from "@/entities/slot-waktu.entity";
import * as z from "zod";
import { FindOptionsWhere, In } from "typeorm";

const jadwalPelajaranCreateSchema = z.object({
  hari: z.string().min(1, "Hari wajib diisi."),
  kelas: z.string().min(1, "Kelas wajib diisi."),
  slotWaktuId: z.string().uuid("ID Slot Waktu tidak valid."),
  mapelId: z.string().uuid("ID Mata Pelajaran tidak valid."),
  guruId: z.string().uuid("ID Guru tidak valid."),
  ruanganId: z.string().uuid("ID Ruangan tidak valid."),
  catatan: z.string().optional().nullable(),
});

async function checkKonflik(
  dataSource: Awaited<ReturnType<typeof getInitializedDataSource>>,
  { hari, kelas, slotWaktuId, guruId, ruanganId, kecualiJadwalId }: {
    hari: string;
    kelas: string;
    slotWaktuId: string;
    guruId: string;
    ruanganId: string;
    kecualiJadwalId?: string;
  }
): Promise<string | null> {
  const jadwalRepo = dataSource.getRepository(JadwalPelajaranEntity);
  
  const baseConditions: FindOptionsWhere<JadwalPelajaranEntity>[] = [
    { hari, slotWaktuId, kelas },
    { hari, slotWaktuId, guruId },
    { hari, slotWaktuId, ruanganId },
  ];

  for (const condition of baseConditions) {
    const query = { ...condition } as FindOptionsWhere<JadwalPelajaranEntity>;
    if (kecualiJadwalId) {
      // This logic needs to be "id IS NOT kecualiJadwalId"
      // TypeORM's findOne with Not(kecualiJadwalId) on id is the correct way if `Not` is imported from typeorm
      // For now, manual check after fetch if simple findOne is used.
      // If using `Not` from typeorm: query.id = Not(kecualiJadwalId);
    }
    
    const conflictingJadwalArray = await jadwalRepo.find({ where: query, relations: ["slotWaktu", "guru", "ruangan"] });
    for (const conflictingJadwal of conflictingJadwalArray) {
        if (conflictingJadwal.id !== kecualiJadwalId) {
            if (conflictingJadwal.kelas === kelas && conflictingJadwal.hari === hari && conflictingJadwal.slotWaktuId === slotWaktuId) {
                return `Kelas ${kelas} sudah memiliki jadwal pada ${hari}, slot ${conflictingJadwal.slotWaktu?.namaSlot || 'ini'}.`;
            }
            if (conflictingJadwal.guruId === guruId && conflictingJadwal.hari === hari && conflictingJadwal.slotWaktuId === slotWaktuId) {
                return `Guru ${conflictingJadwal.guru?.fullName || conflictingJadwal.guru?.name || 'tersebut'} sudah mengajar pada ${hari}, slot ${conflictingJadwal.slotWaktu?.namaSlot || 'ini'}.`;
            }
            if (conflictingJadwal.ruanganId === ruanganId && conflictingJadwal.hari === hari && conflictingJadwal.slotWaktuId === slotWaktuId) {
                 return `Ruangan ${conflictingJadwal.ruangan?.nama || 'tersebut'} sudah digunakan pada ${hari}, slot ${conflictingJadwal.slotWaktu?.namaSlot || 'ini'}.`;
            }
        }
    }
  }
  return null;
}

export async function POST(request: NextRequest) {
  // TODO: Implement server-side Firebase token verification for admin/superadmin
  // const session = await getServerSession(authOptions); // REMOVED
  // if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) { // REMOVED
  //   return NextResponse.json({ message: "Akses ditolak." }, { status: 403 }); // REMOVED
  // } // REMOVED

  try {
    const body = await request.json();
    const validation = jadwalPelajaranCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Input tidak valid.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    const { hari, kelas, slotWaktuId, mapelId, guruId, ruanganId, catatan } = validation.data;

    const dataSource = await getInitializedDataSource();
    
    const guru = await dataSource.getRepository(UserEntity).findOneBy({ id: guruId, role: 'guru' });
    if (!guru) return NextResponse.json({ message: "Guru tidak ditemukan atau bukan role guru." }, { status: 400 });
    if (!await dataSource.getRepository(MataPelajaranEntity).findOneBy({ id: mapelId })) return NextResponse.json({ message: "Mata pelajaran tidak ditemukan." }, { status: 400 });
    if (!await dataSource.getRepository(RuanganEntity).findOneBy({ id: ruanganId })) return NextResponse.json({ message: "Ruangan tidak ditemukan." }, { status: 400 });
    if (!await dataSource.getRepository(SlotWaktuEntity).findOneBy({ id: slotWaktuId })) return NextResponse.json({ message: "Slot waktu tidak ditemukan." }, { status: 400 });

    const konflik = await checkKonflik(dataSource, { hari, kelas, slotWaktuId, guruId, ruanganId });
    if (konflik) {
      return NextResponse.json({ message: konflik }, { status: 409 });
    }

    const jadwalRepo = dataSource.getRepository(JadwalPelajaranEntity);
    const newJadwal = jadwalRepo.create({ hari, kelas, slotWaktuId, mapelId, guruId, ruanganId, catatan });
    await jadwalRepo.save(newJadwal);
    
    const savedJadwal = await jadwalRepo.findOne({ where: {id: newJadwal.id}, relations: ["slotWaktu", "mapel", "guru", "ruangan"]});

    return NextResponse.json({
        ...savedJadwal,
        guru: savedJadwal?.guru ? { id: savedJadwal.guru.id, name: savedJadwal.guru.name, fullName: savedJadwal.guru.fullName, email: savedJadwal.guru.email } : undefined
    }, { status: 201 });

  } catch (error: any) {
    console.error("Error creating jadwal pelajaran:", error);
    if (error.code === '23505') {
        return NextResponse.json({ message: "Jadwal pelajaran duplikat untuk kelas pada slot waktu dan hari yang sama." }, { status: 409 });
    }
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // TODO: Implement server-side Firebase token verification (e.g., all authenticated users can GET)
  // const session = await getServerSession(authOptions); // REMOVED
  // if (!session) { // REMOVED
  //   return NextResponse.json({ message: "Akses ditolak." }, { status: 403 }); // REMOVED
  // } // REMOVED

  const { searchParams } = new URL(request.url);
  const filters: FindOptionsWhere<JadwalPelajaranEntity> = {};
  if (searchParams.get("kelas")) filters.kelas = searchParams.get("kelas")!;
  if (searchParams.get("guruId")) filters.guruId = searchParams.get("guruId")!;
  if (searchParams.get("ruanganId")) filters.ruanganId = searchParams.get("ruanganId")!;
  if (searchParams.get("hari")) filters.hari = searchParams.get("hari")!;
  if (searchParams.get("mapelId")) filters.mapelId = searchParams.get("mapelId")!;
  if (searchParams.get("slotWaktuId")) filters.slotWaktuId = searchParams.get("slotWaktuId")!;

  try {
    const dataSource = await getInitializedDataSource();
    const jadwalRepo = dataSource.getRepository(JadwalPelajaranEntity);
    const jadwalList = await jadwalRepo.find({
      where: filters,
      relations: ["slotWaktu", "mapel", "guru", "ruangan"],
      order: { hari: "ASC", slotWaktu: { waktuMulai: "ASC" } }
    });
    
    return NextResponse.json(jadwalList.map(j => ({
        ...j,
        guru: j.guru ? { id: j.guru.id, name: j.guru.name, fullName: j.guru.fullName, email: j.guru.email } : undefined
    })));
  } catch (error) {
    console.error("Error fetching jadwal pelajaran:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}
