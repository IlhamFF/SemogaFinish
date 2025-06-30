import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { AbsensiSiswaEntity, type StatusKehadiran } from "@/entities/absensi-siswa.entity";
import { JadwalPelajaranEntity } from "@/entities/jadwal-pelajaran.entity";
import { UserEntity } from "@/entities/user.entity";
import * as z from "zod";
import { getAuthenticatedUser } from "@/lib/auth-utils-node";
import { In } from "typeorm";

const absensiEntrySchema = z.object({
  siswaId: z.string().uuid("ID Siswa tidak valid."),
  statusKehadiran: z.enum(["Hadir", "Izin", "Sakit", "Alpha"], { required_error: "Status kehadiran wajib diisi." }),
  catatan: z.string().optional().nullable(),
});

const batchAbsensiSchema = z.object({
  jadwalPelajaranId: z.string().uuid("ID Jadwal Pelajaran tidak valid."),
  tanggalAbsensi: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal YYYY-MM-DD."),
  dataAbsensi: z.array(absensiEntrySchema).min(1, "Minimal ada satu data absensi."),
});

export async function POST(request: NextRequest) {
  const authenticatedUser = getAuthenticatedUser();
  if (!authenticatedUser) {
    return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = batchAbsensiSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Input tidak valid.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { jadwalPelajaranId, tanggalAbsensi, dataAbsensi } = validation.data;

    const dataSource = await getInitializedDataSource();
    const jadwalPelajaran = await dataSource.getRepository(JadwalPelajaranEntity).findOneBy({ id: jadwalPelajaranId });

    if (!jadwalPelajaran) {
      return NextResponse.json({ message: "Jadwal pelajaran tidak ditemukan." }, { status: 404 });
    }

    if (authenticatedUser.role !== 'admin' && authenticatedUser.role !== 'superadmin' && jadwalPelajaran.guruId !== authenticatedUser.id) {
      return NextResponse.json({ message: "Akses ditolak. Anda tidak mengajar sesi ini." }, { status: 403 });
    }

    const siswaIdsInData = dataAbsensi.map(d => d.siswaId);
    const validSiswa = await dataSource.getRepository(UserEntity).find({
        where: { id: In(siswaIdsInData), role: 'siswa', kelasId: jadwalPelajaran.kelas }
    });
    const validSiswaIds = new Set(validSiswa.map(s => s.id));

    const absensiToSave: Partial<AbsensiSiswaEntity>[] = [];
    const results = [];

    for (const absenData of dataAbsensi) {
      if (!validSiswaIds.has(absenData.siswaId)) {
        results.push({ siswaId: absenData.siswaId, success: false, error: "Siswa tidak valid atau bukan dari kelas ini." });
        continue;
      }
      absensiToSave.push({
        siswaId: absenData.siswaId,
        jadwalPelajaranId: jadwalPelajaranId,
        tanggalAbsensi: tanggalAbsensi,
        statusKehadiran: absenData.statusKehadiran as StatusKehadiran,
        catatan: absenData.catatan,
      });
    }
    
    if (absensiToSave.length === 0 && results.length > 0) {
         return NextResponse.json({ message: "Tidak ada data absensi valid untuk disimpan.", results }, { status: 400 });
    }
    if (absensiToSave.length === 0) {
         return NextResponse.json({ message: "Tidak ada data absensi untuk disimpan." }, { status: 400 });
    }

    const absensiRepo = dataSource.getRepository(AbsensiSiswaEntity);
    try {
      await dataSource.transaction(async (transactionalEntityManager) => {
        for (const record of absensiToSave) {
          await transactionalEntityManager.upsert(AbsensiSiswaEntity, record, ["siswaId", "jadwalPelajaranId", "tanggalAbsensi"]);
        }
      });

      const savedRecords = await absensiRepo.find({
          where: {
              jadwalPelajaranId,
              tanggalAbsensi,
              siswaId: In(absensiToSave.map(a => a.siswaId!))
          },
          relations: ["siswa"]
      });
      results.push(...savedRecords.map(sr => ({
          siswaId: sr.siswaId,
          siswaNama: sr.siswa?.fullName || sr.siswa?.name,
          statusKehadiran: sr.statusKehadiran,
          success: true
      })));

    } catch (dbError: any) {
        console.error("DB Error saving batch absensi:", dbError);
        return NextResponse.json({ message: "Gagal menyimpan sebagian atau semua data absensi ke database.", error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Data absensi berhasil disimpan.", results }, { status: 200 });

  } catch (error: any) {
    console.error("Error processing batch absensi:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server.", details: error.message }, { status: 500 });
  }
}
