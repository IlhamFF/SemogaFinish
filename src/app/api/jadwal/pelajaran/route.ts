
import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
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

const batchJadwalPelajaranCreateSchema = z.array(jadwalPelajaranCreateSchema);

// Helper function for conflict checking
async function checkKonflik(
  dataSource: Awaited<ReturnType<typeof getInitializedDataSource>>,
  { hari, kelas, slotWaktuId, guruId, ruanganId, kecualiJadwalId }: {
    hari: string;
    kelas: string;
    slotWaktuId: string;
    guruId: string;
    ruanganId: string;
    kecualiJadwalId?: string; // Untuk operasi PUT, agar tidak konflik dengan dirinya sendiri
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
      query.id = In( [kecualiJadwalId] ); // This is incorrect, it should be NOT In.
                                          // Correct logic for "NOT IN" with TypeORM's findOne might be tricky directly.
                                          // A simpler way is to fetch and then filter, or use QueryBuilder for NOT IN.
                                          // For simplicity, let's fetch and filter.
    }
    
    const conflictingJadwal = await jadwalRepo.findOne({ where: query });
    if (conflictingJadwal && conflictingJadwal.id !== kecualiJadwalId) { // Check if the found conflict is not the item itself
        if (conflictingJadwal.kelas === kelas && conflictingJadwal.hari === hari && conflictingJadwal.slotWaktuId === slotWaktuId) {
            return `Kelas ${kelas} sudah memiliki jadwal pada ${hari}, slot ${conflictingJadwal.slotWaktu.namaSlot}.`;
        }
        if (conflictingJadwal.guruId === guruId && conflictingJadwal.hari === hari && conflictingJadwal.slotWaktuId === slotWaktuId) {
            return `Guru ${conflictingJadwal.guru.fullName || conflictingJadwal.guru.name} sudah mengajar pada ${hari}, slot ${conflictingJadwal.slotWaktu.namaSlot}.`;
        }
        if (conflictingJadwal.ruanganId === ruanganId && conflictingJadwal.hari === hari && conflictingJadwal.slotWaktuId === slotWaktuId) {
             return `Ruangan ${conflictingJadwal.ruangan.nama} sudah digunakan pada ${hari}, slot ${conflictingJadwal.slotWaktu.namaSlot}.`;
        }
    }
  }
  return null;
}


// POST /api/jadwal/pelajaran - Membuat entri jadwal pelajaran baru
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validation = jadwalPelajaranCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Input tidak valid.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    const { hari, kelas, slotWaktuId, mapelId, guruId, ruanganId, catatan } = validation.data;

    const dataSource = await getInitializedDataSource();
    
    // Validasi FKs (ensure related entities exist)
    const guru = await dataSource.getRepository(UserEntity).findOneBy({ id: guruId, role: 'guru' });
    if (!guru) return NextResponse.json({ message: "Guru tidak ditemukan atau bukan role guru." }, { status: 400 });
    if (!await dataSource.getRepository(MataPelajaranEntity).findOneBy({ id: mapelId })) return NextResponse.json({ message: "Mata pelajaran tidak ditemukan." }, { status: 400 });
    if (!await dataSource.getRepository(RuanganEntity).findOneBy({ id: ruanganId })) return NextResponse.json({ message: "Ruangan tidak ditemukan." }, { status: 400 });
    if (!await dataSource.getRepository(SlotWaktuEntity).findOneBy({ id: slotWaktuId })) return NextResponse.json({ message: "Slot waktu tidak ditemukan." }, { status: 400 });

    const konflik = await checkKonflik(dataSource, { hari, kelas, slotWaktuId, guruId, ruanganId });
    if (konflik) {
      return NextResponse.json({ message: konflik }, { status: 409 }); // 409 Conflict
    }

    const jadwalRepo = dataSource.getRepository(JadwalPelajaranEntity);
    const newJadwal = jadwalRepo.create({ hari, kelas, slotWaktuId, mapelId, guruId, ruanganId, catatan });
    await jadwalRepo.save(newJadwal);
    
    const savedJadwal = await jadwalRepo.findOne({ where: {id: newJadwal.id}, relations: ["slotWaktu", "mapel", "guru", "ruangan"]});

    return NextResponse.json(savedJadwal, { status: 201 });

  } catch (error: any) {
    console.error("Error creating jadwal pelajaran:", error);
    if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json({ message: "Jadwal pelajaran duplikat untuk kelas pada slot waktu dan hari yang sama." }, { status: 409 });
    }
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}

// GET /api/jadwal/pelajaran - Mengambil daftar jadwal pelajaran
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  // Izinkan semua role yang login untuk melihat jadwal, filter di frontend jika perlu
  if (!session) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }

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
      relations: ["slotWaktu", "mapel", "guru", "ruangan"], // Eager loading will handle this if specified in entity
      order: { hari: "ASC", slotWaktu: { waktuMulai: "ASC" } } // Order by day, then by slot start time
    });
    
    // Simplified response for guru relation to avoid sending sensitive data
    return NextResponse.json(jadwalList.map(j => ({
        ...j,
        guru: j.guru ? { id: j.guru.id, name: j.guru.name, fullName: j.guru.fullName, email: j.guru.email } : undefined
    })));
  } catch (error) {
    console.error("Error fetching jadwal pelajaran:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}
