
import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { NilaiSemesterSiswaEntity, type SemesterTypeEntity } from "@/entities/nilai-semester-siswa.entity";
import { UserEntity } from "@/entities/user.entity";
import { MataPelajaranEntity } from "@/entities/mata-pelajaran.entity";
import * as z from "zod";
import { getAuthenticatedUser } from "@/lib/auth-utils-node";

const nilaiSemesterEntrySchema = z.object({
  siswaId: z.string().uuid("ID Siswa tidak valid."),
  mapelId: z.string().uuid("ID Mata Pelajaran tidak valid."),
  kelasId: z.string().min(1, "ID Kelas wajib diisi."),
  semester: z.enum(["Ganjil", "Genap"], { required_error: "Semester wajib dipilih." }),
  tahunAjaran: z.string().regex(/^\d{4}\/\d{4}$/, "Format tahun ajaran YYYY/YYYY."),
  nilaiTugas: z.coerce.number().min(0).max(100).optional().nullable(),
  nilaiUTS: z.coerce.number().min(0).max(100).optional().nullable(),
  nilaiUAS: z.coerce.number().min(0).max(100).optional().nullable(),
  nilaiHarian: z.coerce.number().min(0).max(100).optional().nullable(),
  nilaiAkhir: z.coerce.number().min(0).max(100).optional().nullable(), // Akan dihitung jika tidak disediakan
  predikat: z.string().max(5).optional().nullable(), // Akan dihitung jika tidak disediakan
  catatanGuru: z.string().optional().nullable(),
});

const batchNilaiSemesterSchema = z.array(nilaiSemesterEntrySchema);

// Fungsi untuk menghitung nilai akhir (contoh)
function calculateNilaiAkhir(data: { nilaiTugas?: number | null, nilaiUTS?: number | null, nilaiUAS?: number | null, nilaiHarian?: number | null }): number | null {
  const { nilaiTugas, nilaiUTS, nilaiUAS, nilaiHarian } = data;
  // Implementasi bobot, contoh:
  const bobotTugas = 0.20;
  const bobotUTS = 0.30;
  const bobotUAS = 0.40;
  const bobotHarian = 0.10;

  let totalNilai = 0;
  let totalBobot = 0;

  if (typeof nilaiTugas === 'number') { totalNilai += nilaiTugas * bobotTugas; totalBobot += bobotTugas; }
  if (typeof nilaiUTS === 'number') { totalNilai += nilaiUTS * bobotUTS; totalBobot += bobotUTS; }
  if (typeof nilaiUAS === 'number') { totalNilai += nilaiUAS * bobotUAS; totalBobot += bobotUAS; }
  if (typeof nilaiHarian === 'number') { totalNilai += nilaiHarian * bobotHarian; totalBobot += bobotHarian; }

  if (totalBobot === 0) return null; // Tidak ada nilai komponen
  return parseFloat((totalNilai / totalBobot).toFixed(2));
}

// Fungsi untuk menentukan predikat (contoh)
function determinePredikat(nilaiAkhir: number | null): string | null {
  if (nilaiAkhir === null) return null;
  if (nilaiAkhir >= 90) return "A";
  if (nilaiAkhir >= 80) return "B";
  if (nilaiAkhir >= 70) return "C";
  if (nilaiAkhir >= 60) return "D";
  return "E";
}

export async function POST(request: NextRequest) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
  }
  if (!['guru', 'admin', 'superadmin'].includes(authenticatedUser.role)) {
    return NextResponse.json({ message: "Akses ditolak. Hanya guru atau admin yang dapat menyimpan nilai." }, { status: 403 });
  }
  const dicatatOlehGuruId = authenticatedUser.id;

  try {
    const body = await request.json();
    const validation = batchNilaiSemesterSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Input tidak valid.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const dataNilaiBatch = validation.data;
    if (dataNilaiBatch.length === 0) {
      return NextResponse.json({ message: "Tidak ada data nilai untuk disimpan." }, { status: 400 });
    }

    const dataSource = await getInitializedDataSource();
    const nilaiRepo = dataSource.getRepository(NilaiSemesterSiswaEntity);

    const results = [];
    const entitiesToSave: Partial<NilaiSemesterSiswaEntity>[] = [];

    // Validasi siswa dan mapel
    const siswaIds = [...new Set(dataNilaiBatch.map(d => d.siswaId))];
    const mapelIds = [...new Set(dataNilaiBatch.map(d => d.mapelId))];
    const existingSiswa = await dataSource.getRepository(UserEntity).find({ where: { id: In(siswaIds), role: 'siswa' } });
    const existingMapel = await dataSource.getRepository(MataPelajaranEntity).find({ where: { id: In(mapelIds) } });
    const validSiswaIds = new Set(existingSiswa.map(s => s.id));
    const validMapelIds = new Set(existingMapel.map(m => m.id));

    for (const dataNilai of dataNilaiBatch) {
      if (!validSiswaIds.has(dataNilai.siswaId)) {
        results.push({ siswaId: dataNilai.siswaId, mapelId: dataNilai.mapelId, success: false, error: `Siswa ID ${dataNilai.siswaId} tidak valid.` });
        continue;
      }
      if (!validMapelIds.has(dataNilai.mapelId)) {
        results.push({ siswaId: dataNilai.siswaId, mapelId: dataNilai.mapelId, success: false, error: `Mapel ID ${dataNilai.mapelId} tidak valid.` });
        continue;
      }

      let nilaiAkhir = dataNilai.nilaiAkhir;
      if (nilaiAkhir === undefined || nilaiAkhir === null) {
        nilaiAkhir = calculateNilaiAkhir(dataNilai);
      }

      let predikat = dataNilai.predikat;
      if ((predikat === undefined || predikat === null) && typeof nilaiAkhir === 'number') {
        predikat = determinePredikat(nilaiAkhir);
      }
      
      const payload: Partial<NilaiSemesterSiswaEntity> = {
        ...dataNilai,
        semester: dataNilai.semester as SemesterTypeEntity,
        nilaiAkhir: nilaiAkhir,
        predikat: predikat,
        dicatatOlehGuruId,
      };
      entitiesToSave.push(payload);
    }
    
    if (entitiesToSave.length === 0) {
        return NextResponse.json({ message: "Tidak ada data nilai valid untuk disimpan.", results }, { status: 400 });
    }

    // Upsert logic: TypeORM's save will update if entity with primary key exists, or insert if not.
    // However, our PK is 'id'. We need to find existing records based on the unique constraint.
    try {
      await dataSource.transaction(async transactionalEntityManager => {
        for (const entityData of entitiesToSave) {
          const existingRecord = await transactionalEntityManager.findOne(NilaiSemesterSiswaEntity, {
            where: {
              siswaId: entityData.siswaId!,
              mapelId: entityData.mapelId!,
              kelasId: entityData.kelasId!,
              semester: entityData.semester!,
              tahunAjaran: entityData.tahunAjaran!,
            }
          });

          if (existingRecord) {
            // Update
            await transactionalEntityManager.update(NilaiSemesterSiswaEntity, existingRecord.id, entityData);
            results.push({ siswaId: entityData.siswaId, mapelId: entityData.mapelId, success: true, operation: 'updated', id: existingRecord.id });
          } else {
            // Insert
            const newRecord = transactionalEntityManager.create(NilaiSemesterSiswaEntity, entityData);
            const saved = await transactionalEntityManager.save(newRecord);
            results.push({ siswaId: entityData.siswaId, mapelId: entityData.mapelId, success: true, operation: 'created', id: saved.id });
          }
        }
      });
    } catch (dbError: any) {
        console.error("DB Error saving batch nilai:", dbError);
        return NextResponse.json({ message: "Gagal menyimpan sebagian atau semua data nilai ke database.", error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Data nilai berhasil diproses.", results }, { status: 207 }); // Multi-Status

  } catch (error: any) {
    console.error("Error processing batch nilai:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server.", details: error.message }, { status: 500 });
  }
}
