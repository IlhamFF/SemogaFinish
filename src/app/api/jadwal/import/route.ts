
import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-utils-node";
import { getInitializedDataSource } from "@/lib/data-source";
import { promises as fs } from 'fs';
import formidable from 'formidable';
import Papa from 'papaparse';
import { JadwalPelajaranEntity } from "@/entities/jadwal-pelajaran.entity";
import { MataPelajaranEntity } from "@/entities/mata-pelajaran.entity";
import { UserEntity } from "@/entities/user.entity";
import { RuanganEntity } from "@/entities/ruangan.entity";
import { SlotWaktuEntity } from "@/entities/slot-waktu.entity";

export const config = {
  api: {
    bodyParser: false,
  },
};

interface JadwalCsvRow {
  hari: string;
  kelas: string;
  kode_mapel: string;
  email_guru: string;
  kode_ruangan: string;
  nama_slot: string;
  catatan?: string;
}

export async function POST(request: NextRequest) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser || !['admin', 'superadmin'].includes(authenticatedUser.role)) {
    return NextResponse.json({ message: "Akses ditolak. Hanya admin yang dapat melakukan impor." }, { status: 403 });
  }

  try {
    const form = formidable({});
    const [fields, files] = await form.parse(request as any);

    const file = files.file?.[0];
    if (!file) {
      return NextResponse.json({ message: "Tidak ada file yang diunggah." }, { status: 400 });
    }

    const fileContent = await fs.readFile(file.filepath, 'utf8');
    const parseResult = Papa.parse<JadwalCsvRow>(fileContent, {
      header: true,
      skipEmptyLines: true,
    });

    if (parseResult.errors.length > 0) {
      return NextResponse.json({ message: "Gagal mem-parsing file CSV.", errors: parseResult.errors }, { status: 400 });
    }
    
    const dataSource = await getInitializedDataSource();
    const jadwalRepo = dataSource.getRepository(JadwalPelajaranEntity);

    // Fetch all lookup data in advance
    const [allMapel, allGuru, allRuangan, allSlots] = await Promise.all([
        dataSource.getRepository(MataPelajaranEntity).find(),
        dataSource.getRepository(UserEntity).find({ where: { role: 'guru' } }),
        dataSource.getRepository(RuanganEntity).find(),
        dataSource.getRepository(SlotWaktuEntity).find(),
    ]);

    const mapelMap = new Map(allMapel.map(m => [m.kode, m.id]));
    const guruMap = new Map(allGuru.map(g => [g.email, g.id]));
    const ruanganMap = new Map(allRuangan.map(r => [r.kode, r.id]));
    const slotMap = new Map(allSlots.map(s => [s.namaSlot, s.id]));

    const jadwalToCreate: Partial<JadwalPelajaranEntity>[] = [];
    const importErrors: string[] = [];

    for (const [index, row] of parseResult.data.entries()) {
      const { hari, kelas, kode_mapel, email_guru, kode_ruangan, nama_slot, catatan } = row;
      const rowNum = index + 2;

      const mapelId = mapelMap.get(kode_mapel);
      const guruId = guruMap.get(email_guru);
      const ruanganId = ruanganMap.get(kode_ruangan);
      const slotWaktuId = slotMap.get(nama_slot);

      if (!mapelId) { importErrors.push(`Baris ${rowNum}: Kode mapel '${kode_mapel}' tidak ditemukan.`); continue; }
      if (!guruId) { importErrors.push(`Baris ${rowNum}: Email guru '${email_guru}' tidak ditemukan.`); continue; }
      if (!ruanganId) { importErrors.push(`Baris ${rowNum}: Kode ruangan '${kode_ruangan}' tidak ditemukan.`); continue; }
      if (!slotWaktuId) { importErrors.push(`Baris ${rowNum}: Nama slot '${nama_slot}' tidak ditemukan.`); continue; }

      jadwalToCreate.push({ hari, kelas, mapelId, guruId, ruanganId, slotWaktuId, catatan });
    }
    
    if (jadwalToCreate.length === 0 && importErrors.length > 0) {
        return NextResponse.json({ message: "Impor gagal. Semua baris data mengandung error.", errors: importErrors }, { status: 400 });
    }

    let createdCount = 0;
    
    // Deleting existing schedules for the classes in the import to prevent conflicts
    const uniqueKelasInImport = [...new Set(jadwalToCreate.map(j => j.kelas))];
    await jadwalRepo.delete({ kelas: In(uniqueKelasInImport as string[]) });
    
    // Save in chunks to avoid overwhelming the DB, although for a few hundred rows, one go is fine.
    try {
        const savedEntries = await jadwalRepo.save(jadwalToCreate);
        createdCount = savedEntries.length;
    } catch(dbError: any) {
        importErrors.push(`Gagal menyimpan ke database: ${dbError.message}`);
    }

    return NextResponse.json({
      message: `Impor Selesai. ${createdCount} jadwal berhasil dibuat. ${importErrors.length} baris gagal.`,
      errors: importErrors,
      totalProcessed: parseResult.data.length,
      totalSuccess: createdCount,
      totalFailed: parseResult.data.length - createdCount
    }, { status: 207 }); // Multi-Status

  } catch (error: any) {
    console.error("Schedule import error:", error);
    return NextResponse.json({ message: "Gagal memproses file impor.", error: error.message }, { status: 500 });
  }
}
