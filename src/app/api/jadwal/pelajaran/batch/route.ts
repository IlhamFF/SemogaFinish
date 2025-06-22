
import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { JadwalPelajaranEntity } from "@/entities/jadwal-pelajaran.entity";
import { UserEntity } from "@/entities/user.entity";
import { MataPelajaranEntity } from "@/entities/mata-pelajaran.entity";
import { RuanganEntity } from "@/entities/ruangan.entity";
import { SlotWaktuEntity } from "@/entities/slot-waktu.entity";
import * as z from "zod";
import { In, Not } from "typeorm"; 
import { getAuthenticatedUser } from "@/lib/auth-utils-node";

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

async function checkKonflikBatch(
  dataSource: Awaited<ReturnType<typeof getInitializedDataSource>>,
  item: z.infer<typeof jadwalPelajaranCreateSchema>,
  existingJadwalForDayAndClass: JadwalPelajaranEntity[]
): Promise<string | null> {
  const { hari, kelas, slotWaktuId, guruId, ruanganId } = item;
  const jadwalRepo = dataSource.getRepository(JadwalPelajaranEntity);

  if (existingJadwalForDayAndClass.some(j => j.slotWaktuId === slotWaktuId)) {
    return `Kelas ${kelas} sudah memiliki jadwal pada ${hari}, slot ${slotWaktuId}.`;
  }

  let konflik = await jadwalRepo.findOne({ where: { hari, guruId, slotWaktuId, kelas: Not(kelas) } });
  if (konflik) return `Guru ${guruId} sudah mengajar pada ${hari}, slot ${slotWaktuId} di kelas ${konflik.kelas}.`;

  konflik = await jadwalRepo.findOne({ where: { hari, ruanganId, slotWaktuId, kelas: Not(kelas) } });
  if (konflik) return `Ruangan ${ruanganId} sudah digunakan pada ${hari}, slot ${slotWaktuId} oleh kelas ${konflik.kelas}.`;
  
  return null;
}

export async function POST(request: NextRequest) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
  }
  if (!['admin', 'superadmin'].includes(authenticatedUser.role)) {
    return NextResponse.json({ message: "Akses ditolak. Hanya admin yang dapat membuat jadwal batch." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validation = batchJadwalPelajaranCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Input tidak valid.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const jadwalItems = validation.data;
    if (jadwalItems.length === 0) {
        return NextResponse.json({ message: "Tidak ada data jadwal untuk disimpan." }, { status: 400 });
    }

    const dataSource = await getInitializedDataSource();
    const jadwalRepo = dataSource.getRepository(JadwalPelajaranEntity);
    
    const results = [];
    const createdIds: string[] = [];

    const allSlotWaktuIds = [...new Set(jadwalItems.map(item => item.slotWaktuId))];
    const allMapelIds = [...new Set(jadwalItems.map(item => item.mapelId))];
    const allGuruIds = [...new Set(jadwalItems.map(item => item.guruId))];
    const allRuanganIds = [...new Set(jadwalItems.map(item => item.ruanganId))];

    const existingSlots = await dataSource.getRepository(SlotWaktuEntity).findBy({ id: In(allSlotWaktuIds) });
    const existingMapels = await dataSource.getRepository(MataPelajaranEntity).findBy({ id: In(allMapelIds) });
    const existingGurus = await dataSource.getRepository(UserEntity).findBy({ id: In(allGuruIds), role: 'guru' });
    const existingRuangans = await dataSource.getRepository(RuanganEntity).findBy({ id: In(allRuanganIds) });

    const validSlotIds = new Set(existingSlots.map(s => s.id));
    const validMapelIds = new Set(existingMapels.map(m => m.id));
    const validGuruIds = new Set(existingGurus.map(g => g.id));
    const validRuanganIds = new Set(existingRuangans.map(r => r.id));

    for (const item of jadwalItems) {
        if (!validSlotIds.has(item.slotWaktuId)) { results.push({ item, success: false, error: `Slot Waktu ID ${item.slotWaktuId} tidak valid.` }); continue; }
        if (!validMapelIds.has(item.mapelId)) { results.push({ item, success: false, error: `Mapel ID ${item.mapelId} tidak valid.` }); continue; }
        if (!validGuruIds.has(item.guruId)) { results.push({ item, success: false, error: `Guru ID ${item.guruId} tidak valid atau bukan guru.` }); continue; }
        if (!validRuanganIds.has(item.ruanganId)) { results.push({ item, success: false, error: `Ruangan ID ${item.ruanganId} tidak valid.` }); continue; }

        // Consider fetching existingJadwalForThisClassDay within the loop if classes/days vary significantly, or pre-fetch if manageable.
        const existingJadwalForThisClassDay = await jadwalRepo.find({ where: { kelas: item.kelas, hari: item.hari }});
        const konflik = await checkKonflikBatch(dataSource, item, existingJadwalForThisClassDay);
        if (konflik) {
            results.push({ item, success: false, error: konflik });
            continue;
        }

        try {
            const newJadwal = jadwalRepo.create(item);
            const saved = await jadwalRepo.save(newJadwal);
            createdIds.push(saved.id);
            results.push({ item: saved, success: true });
        } catch (dbError: any) {
            if (dbError.code === '23505') { 
                results.push({ item, success: false, error: "Jadwal duplikat (kelas, hari, slot)." });
            } else {
                results.push({ item, success: false, error: "Gagal menyimpan ke DB: " + dbError.message });
            }
        }
    }
    
    const createdJadwals = createdIds.length > 0 ? await jadwalRepo.find({
        where: { id: In(createdIds) },
        relations: ["slotWaktu", "mapel", "guru", "ruangan"],
    }) : [];
    
    const finalResults = results.map(res => {
        if (res.success && res.item.id) {
            const fullEntry = createdJadwals.find(cj => cj.id === res.item.id);
            return { ...res, item: { ...fullEntry, guru: fullEntry?.guru ? {id: fullEntry.guru.id, name: fullEntry.guru.name, fullName: fullEntry.guru.fullName} : undefined } };
        }
        return res;
    });

    return NextResponse.json({ results: finalResults }, { status: 207 });

  } catch (error: any) {
    console.error("Error batch creating jadwal pelajaran:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server.", error: error.message }, { status: 500 });
  }
}
