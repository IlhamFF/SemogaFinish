
import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { UserEntity } from "@/entities/user.entity";
import { NilaiSemesterSiswaEntity, type SemesterTypeEntity } from "@/entities/nilai-semester-siswa.entity";
import { MataPelajaranEntity } from "@/entities/mata-pelajaran.entity";
import * as z from "zod";
import { getAuthenticatedUser } from "@/lib/auth-utils-node";
import { FindOptionsWhere, In } from "typeorm";

const getNilaiSemesterSchema = z.object({
  kelasId: z.string().min(1, "ID Kelas wajib diisi."),
  mapelId: z.string().uuid("ID Mata Pelajaran tidak valid."),
  semester: z.enum(["Ganjil", "Genap"], { required_error: "Semester wajib dipilih." }),
  tahunAjaran: z.string().regex(/^\d{4}\/\d{4}$/, "Format tahun ajaran YYYY/YYYY."),
});

export async function GET(request: NextRequest) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
  }
  // Memastikan hanya guru, admin, atau superadmin yang bisa mengakses
  if (!['guru', 'admin', 'superadmin'].includes(authenticatedUser.role)) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const queryValidation = getNilaiSemesterSchema.safeParse({
    kelasId: searchParams.get("kelasId"),
    mapelId: searchParams.get("mapelId"),
    semester: searchParams.get("semester"),
    tahunAjaran: searchParams.get("tahunAjaran"),
  });

  if (!queryValidation.success) {
    return NextResponse.json({ message: "Parameter query tidak valid.", errors: queryValidation.error.flatten().fieldErrors }, { status: 400 });
  }
  const { kelasId, mapelId, semester, tahunAjaran } = queryValidation.data;

  try {
    const dataSource = await getInitializedDataSource();
    const userRepo = dataSource.getRepository(UserEntity);
    const nilaiRepo = dataSource.getRepository(NilaiSemesterSiswaEntity);

    // 1. Ambil semua siswa di kelas tersebut
    const siswaDiKelas = await userRepo.find({
      where: { kelasId: kelasId, role: "siswa", isVerified: true }, // Hanya siswa terverifikasi
      select: ["id", "fullName", "name", "nis", "email"],
      order: { fullName: "ASC" }
    });

    if (siswaDiKelas.length === 0) {
      return NextResponse.json([]); // Kembalikan array kosong jika tidak ada siswa di kelas
    }

    // 2. Ambil data nilai yang sudah ada untuk siswa-siswa tersebut, mapel, semester, dan tahun ajaran
    const siswaIds = siswaDiKelas.map(s => s.id);
    const existingNilai = await nilaiRepo.find({
      where: {
        siswaId: In(siswaIds),
        mapelId,
        kelasId, // pastikan kelasId juga cocok, penting jika siswa pindah kelas
        semester: semester as SemesterTypeEntity,
        tahunAjaran,
      },
      relations: ["siswa", "mapel", "dicatatOlehGuru"]
    });

    const nilaiMap = new Map<string, NilaiSemesterSiswaEntity>();
    existingNilai.forEach(n => nilaiMap.set(n.siswaId, n));

    // 3. Gabungkan data siswa dengan data nilai mereka
    const responseData = siswaDiKelas.map(siswa => {
      const nilaiSiswa = nilaiMap.get(siswa.id);
      return {
        siswa: {
          id: siswa.id,
          fullName: siswa.fullName,
          name: siswa.name,
          nis: siswa.nis,
          email: siswa.email,
        },
        nilaiSemester: nilaiSiswa ? {
          id: nilaiSiswa.id,
          mapelId: nilaiSiswa.mapelId,
          mapel: nilaiSiswa.mapel ? { id: nilaiSiswa.mapel.id, nama: nilaiSiswa.mapel.nama, kode: nilaiSiswa.mapel.kode } : undefined,
          kelasId: nilaiSiswa.kelasId,
          semester: nilaiSiswa.semester,
          tahunAjaran: nilaiSiswa.tahunAjaran,
          nilaiTugas: nilaiSiswa.nilaiTugas,
          nilaiUTS: nilaiSiswa.nilaiUTS,
          nilaiUAS: nilaiSiswa.nilaiUAS,
          nilaiHarian: nilaiSiswa.nilaiHarian,
          nilaiAkhir: nilaiSiswa.nilaiAkhir,
          predikat: nilaiSiswa.predikat,
          catatanGuru: nilaiSiswa.catatanGuru,
          dicatatOlehGuruId: nilaiSiswa.dicatatOlehGuruId,
          dicatatOlehGuru: nilaiSiswa.dicatatOlehGuru ? { fullName: nilaiSiswa.dicatatOlehGuru.fullName } : undefined,
          createdAt: nilaiSiswa.createdAt,
          updatedAt: nilaiSiswa.updatedAt,
        } : null, // Kirim null jika belum ada entri nilai
      };
    });

    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error("Error fetching nilai semester siswa:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server.", details: error.message }, { status: 500 });
  }
}
