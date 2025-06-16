
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
import { In, Not } from "typeorm";


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
async function checkKonflikBatch(
  dataSource: Awaited<ReturnType<typeof getInitializedDataSource>>,
  item: z.infer<typeof jadwalPelajaranCreateSchema>,
  existingJadwalForDayAndClass: JadwalPelajaranEntity[]
): Promise<string | null> {
  const { hari, kelas, slotWaktuId, guruId, ruanganId } = item;
  const jadwalRepo = dataSource.getRepository(JadwalPelajaranEntity);

  // Check against existing DB entries (excluding those being processed in the current batch for the same class/day)
  // This is a simplified check; a more robust solution might involve pre-fetching all potentially conflicting
  // schedules for the teachers and rooms involved in the batch.

  // Kelas conflict (using pre-fetched data for this class/day for better batch performance)
  if (existingJadwalForDayAndClass.some(j => j.slotWaktuId === slotWaktuId)) {
    return `Kelas ${kelas} sudah memiliki jadwal pada ${hari}, slot ${slotWaktuId}.`;
  }

  // Guru conflict (query DB for other classes)
  let konflik = await jadwalRepo.findOne({ where: { hari, guruId, slotWaktuId, kelas: Not(kelas) } });
  if (konflik) return `Guru ${guruId} sudah mengajar pada ${hari}, slot ${slotWaktuId} di kelas ${konflik.kelas}.`;

  // Ruangan conflict (query DB for other classes)
  konflik = await jadwalRepo.findOne({ where: { hari, ruanganId, slotWaktuId, kelas: Not(kelas) } });
  if (konflik) return `Ruangan ${ruanganId} sudah digunakan pada ${hari}, slot ${slotWaktuId} oleh kelas ${konflik.kelas}.`;
  
  return null;
}


// POST /api/jadwal/pelajaran/batch - Membuat beberapa entri jadwal sekaligus
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
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

    // Pre-validate all FKs once to minimize DB calls
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

    // For batch conflict checking within the same class and day
    // Group items by class and day to pre-fetch existing schedules
    const groupedItems: Record<string, Record<string, typeof jadwalItems>> = {};
    for (const item of jadwalItems) {
        if (!groupedItems[item.kelas]) groupedItems[item.kelas] = {};
        if (!groupedItems[item.kelas][item.hari]) groupedItems[item.kelas][item.hari] = [];
        groupedItems[item.kelas][item.hari].push(item);
    }

    for (const item of jadwalItems) {
        // FK Validation
        if (!validSlotIds.has(item.slotWaktuId)) { results.push({ item, success: false, error: `Slot Waktu ID ${item.slotWaktuId} tidak valid.` }); continue; }
        if (!validMapelIds.has(item.mapelId)) { results.push({ item, success: false, error: `Mapel ID ${item.mapelId} tidak valid.` }); continue; }
        if (!validGuruIds.has(item.guruId)) { results.push({ item, success: false, error: `Guru ID ${item.guruId} tidak valid atau bukan guru.` }); continue; }
        if (!validRuanganIds.has(item.ruanganId)) { results.push({ item, success: false, error: `Ruangan ID ${item.ruanganId} tidak valid.` }); continue; }

        // Simplified conflict check for batch: assumes no conflicts *within* the batch items themselves for now.
        // A more robust check would consider items already processed in *this* batch.
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
            if (dbError.code === '23505') { // Unique constraint violation
                results.push({ item, success: false, error: "Jadwal duplikat (kelas, hari, slot)." });
            } else {
                results.push({ item, success: false, error: "Gagal menyimpan ke DB: " + dbError.message });
            }
        }
    }
    
    // Fetch created entries with relations for response
    const createdJadwals = createdIds.length > 0 ? await jadwalRepo.find({
        where: { id: In(createdIds) },
        relations: ["slotWaktu", "mapel", "guru", "ruangan"],
    }) : [];
    
    // Map createdJadwals back to results
    const finalResults = results.map(res => {
        if (res.success && res.item.id) {
            const fullEntry = createdJadwals.find(cj => cj.id === res.item.id);
            return { ...res, item: { ...fullEntry, guru: fullEntry?.guru ? {id: fullEntry.guru.id, name: fullEntry.guru.name, fullName: fullEntry.guru.fullName} : undefined } };
        }
        return res;
    });


    return NextResponse.json({ results: finalResults }, { status: 207 }); // 207 Multi-Status

  } catch (error: any) {
    console.error("Error batch creating jadwal pelajaran:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server.", error: error.message }, { status: 500 });
  }
}

