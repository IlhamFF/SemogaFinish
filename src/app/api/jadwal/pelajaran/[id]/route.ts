
import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { JadwalPelajaranEntity } from "@/entities/jadwal-pelajaran.entity";
import { UserEntity } from "@/entities/user.entity";
import { MataPelajaranEntity } from "@/entities/mata-pelajaran.entity";
import { RuanganEntity } from "@/entities/ruangan.entity";
import { SlotWaktuEntity } from "@/entities/slot-waktu.entity";
import * as z from "zod";
import { FindOptionsWhere, In, Not } from "typeorm"; 
import { getAuthenticatedUser } from "@/lib/auth-utils";

const jadwalPelajaranUpdateSchema = z.object({
  hari: z.string().min(1, "Hari wajib diisi.").optional(),
  kelas: z.string().min(1, "Kelas wajib diisi.").optional(),
  slotWaktuId: z.string().uuid("ID Slot Waktu tidak valid.").optional(),
  mapelId: z.string().uuid("ID Mata Pelajaran tidak valid.").optional(),
  guruId: z.string().uuid("ID Guru tidak valid.").optional(),
  ruanganId: z.string().uuid("ID Ruangan tidak valid.").optional(),
  catatan: z.string().optional().nullable(),
}).refine(data => Object.keys(data).length > 0, {
  message: "Minimal satu field harus diisi untuk melakukan pembaruan.",
});

async function checkKonflikUpdate(
  dataSource: Awaited<ReturnType<typeof getInitializedDataSource>>,
  jadwalId: string,
  data: { hari: string; kelas: string; slotWaktuId: string; guruId: string; ruanganId: string; }
): Promise<string | null> {
  const jadwalRepo = dataSource.getRepository(JadwalPelajaranEntity);

  const { hari, kelas, slotWaktuId, guruId, ruanganId } = data;

  let konflik = await jadwalRepo.findOne({ where: { hari, kelas, slotWaktuId, id: Not(jadwalId) } });
  if (konflik) return `Kelas ${kelas} sudah memiliki jadwal lain pada ${hari}, slot waktu tersebut.`;

  konflik = await jadwalRepo.findOne({ where: { hari, guruId, slotWaktuId, id: Not(jadwalId) } });
  if (konflik) return `Guru tersebut sudah mengajar di kelas lain (${konflik.kelas}) pada ${hari}, slot waktu tersebut.`;
  
  konflik = await jadwalRepo.findOne({ where: { hari, ruanganId, slotWaktuId, id: Not(jadwalId) } });
  if (konflik) return `Ruangan tersebut sudah digunakan kelas lain (${konflik.kelas}) pada ${hari}, slot waktu tersebut.`;

  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ message: "ID jadwal tidak valid." }, { status: 400 });
  }

  try {
    const dataSource = await getInitializedDataSource();
    const jadwalRepo = dataSource.getRepository(JadwalPelajaranEntity);
    const jadwal = await jadwalRepo.findOne({
      where: { id },
      relations: ["slotWaktu", "mapel", "guru", "ruangan"],
    });

    if (!jadwal) {
      return NextResponse.json({ message: "Jadwal pelajaran tidak ditemukan." }, { status: 404 });
    }
    // Additional check if non-admin should only see their relevant schedule
    if (authenticatedUser.role === 'siswa' && jadwal.kelas !== authenticatedUser.kelasId) {
        return NextResponse.json({ message: "Akses ditolak untuk jadwal kelas ini." }, { status: 403 });
    }
    if (authenticatedUser.role === 'guru' && jadwal.guruId !== authenticatedUser.id) {
         return NextResponse.json({ message: "Akses ditolak untuk jadwal guru lain." }, { status: 403 });
    }

     return NextResponse.json({
        ...jadwal,
        guru: jadwal.guru ? { id: jadwal.guru.id, name: jadwal.guru.name, fullName: jadwal.guru.fullName, email: jadwal.guru.email } : undefined
    });
  } catch (error) {
    console.error("Error fetching jadwal pelajaran:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
  }
  if (!['admin', 'superadmin'].includes(authenticatedUser.role)) {
    return NextResponse.json({ message: "Akses ditolak. Hanya admin yang dapat mengubah jadwal." }, { status: 403 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ message: "ID jadwal tidak valid." }, { status: 400 });
  }

  try {
    const body = await request.json();
    const validation = jadwalPelajaranUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Input tidak valid.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const updatePayload = validation.data;
    const dataSource = await getInitializedDataSource();
    const jadwalRepo = dataSource.getRepository(JadwalPelajaranEntity);
    const existingJadwal = await jadwalRepo.findOneBy({ id });

    if (!existingJadwal) {
      return NextResponse.json({ message: "Jadwal pelajaran tidak ditemukan." }, { status: 404 });
    }

    const conflictCheckData = {
      hari: updatePayload.hari ?? existingJadwal.hari,
      kelas: updatePayload.kelas ?? existingJadwal.kelas,
      slotWaktuId: updatePayload.slotWaktuId ?? existingJadwal.slotWaktuId,
      guruId: updatePayload.guruId ?? existingJadwal.guruId,
      ruanganId: updatePayload.ruanganId ?? existingJadwal.ruanganId,
      mapelId: updatePayload.mapelId ?? existingJadwal.mapelId,
    };

    if (updatePayload.guruId && updatePayload.guruId !== existingJadwal.guruId) {
        const guru = await dataSource.getRepository(UserEntity).findOneBy({ id: updatePayload.guruId, role: 'guru' });
        if (!guru) return NextResponse.json({ message: "Guru baru tidak ditemukan atau bukan role guru." }, { status: 400 });
    }
    if (updatePayload.mapelId && updatePayload.mapelId !== existingJadwal.mapelId) {
        if (!await dataSource.getRepository(MataPelajaranEntity).findOneBy({ id: updatePayload.mapelId })) return NextResponse.json({ message: "Mata pelajaran baru tidak ditemukan." }, { status: 400 });
    }
    if (updatePayload.ruanganId && updatePayload.ruanganId !== existingJadwal.ruanganId) {
        if (!await dataSource.getRepository(RuanganEntity).findOneBy({ id: updatePayload.ruanganId })) return NextResponse.json({ message: "Ruangan baru tidak ditemukan." }, { status: 400 });
    }
    if (updatePayload.slotWaktuId && updatePayload.slotWaktuId !== existingJadwal.slotWaktuId) {
        if (!await dataSource.getRepository(SlotWaktuEntity).findOneBy({ id: updatePayload.slotWaktuId })) return NextResponse.json({ message: "Slot waktu baru tidak ditemukan." }, { status: 400 });
    }

    const konflik = await checkKonflikUpdate(dataSource, id, conflictCheckData);
    if (konflik) {
      return NextResponse.json({ message: konflik }, { status: 409 });
    }

    await jadwalRepo.update(id, updatePayload);
    const updatedJadwal = await jadwalRepo.findOne({ where: {id}, relations: ["slotWaktu", "mapel", "guru", "ruangan"]});
    
    return NextResponse.json({
        ...updatedJadwal,
        guru: updatedJadwal?.guru ? { id: updatedJadwal.guru.id, name: updatedJadwal.guru.name, fullName: updatedJadwal.guru.fullName, email: updatedJadwal.guru.email } : undefined
    });

  } catch (error: any) {
    console.error("Error updating jadwal pelajaran:", error);
    if (error.code === '23505') {
        return NextResponse.json({ message: "Jadwal pelajaran duplikat untuk kelas pada slot waktu dan hari yang sama setelah update." }, { status: 409 });
    }
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
  }
  if (!['admin', 'superadmin'].includes(authenticatedUser.role)) {
    return NextResponse.json({ message: "Akses ditolak. Hanya admin yang dapat menghapus jadwal." }, { status: 403 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ message: "ID jadwal tidak valid." }, { status: 400 });
  }

  try {
    const dataSource = await getInitializedDataSource();
    const jadwalRepo = dataSource.getRepository(JadwalPelajaranEntity);
    const deleteResult = await jadwalRepo.delete(id);

    if (deleteResult.affected === 0) {
      return NextResponse.json({ message: "Jadwal pelajaran tidak ditemukan untuk dihapus." }, { status: 404 });
    }
    return NextResponse.json({ message: "Jadwal pelajaran berhasil dihapus." });
  } catch (error) {
    console.error("Error deleting jadwal pelajaran:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}
